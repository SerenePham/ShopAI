import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { AI_SUGGESTIONS } from '@constants/aiPrompt';
import { askShopAI, toFriendlyError, type ChatTurn } from '@services/geminiService';
import { useChatStore, type ChatMessage } from '@store/useChatStore';

export default function AIChatScreen() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearHistory = useChatStore((state) => state.clearHistory);
  const removeErrorMessages = useChatStore((state) => state.removeErrorMessages);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  // Lưu lại câu hỏi vừa lỗi để nút "Thử lại" biết phải gửi lại cái gì
  const lastQuestionRef = useRef<string>('');

  const scrollToEnd = useCallback(() => {
    // Hoãn một nhịp để FlatList kịp render item mới rồi mới cuộn
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // Tự động cuộn xuống cuối khi vừa mở màn hình để thấy tin nhắn gần nhất
  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  /** Dựng lịch sử hội thoại theo đúng định dạng Gemini yêu cầu, lấy 10 lượt gần nhất để giữ context */
  const buildHistory = useCallback((list: ChatMessage[]): ChatTurn[] => {
    return list
      .filter((m) => m.id !== 'greeting' && !m.id.startsWith('greeting-') && m.status !== 'error')
      .slice(-10)
      .map((m) => ({
        role: m.isBot ? ('model' as const) : ('user' as const),
        parts: [{ text: m.text }],
      }));
  }, []);

  /** Lõi gửi tin — dùng chung cho cả nút Gửi lẫn nút Thử lại. */
  const send = useCallback(
    async (question: string, historySource: ChatMessage[]) => {
      lastQuestionRef.current = question;
      setIsTyping(true);
      scrollToEnd();

      try {
        const reply = await askShopAI(question, buildHistory(historySource));
        addMessage({
          id: `bot-${Date.now()}`,
          text: reply,
          isBot: true,
          status: 'sent',
          createdAt: Date.now(),
        });
      } catch (error) {
        addMessage({
          id: `err-${Date.now()}`,
          text: toFriendlyError(error),
          isBot: true,
          status: 'error',
          createdAt: Date.now(),
        });
      } finally {
        setIsTyping(false);
        scrollToEnd();
      }
    },
    [buildHistory, addMessage, scrollToEnd],
  );

  const handleSend = useCallback(
    (overrideText?: string) => {
      const text = (overrideText ?? inputText).trim();
      if (!text || isTyping) return; // Chống spam: đang chờ AI thì không cho gửi tiếp

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        text,
        isBot: false,
        status: 'sent',
        createdAt: Date.now(),
      };

      addMessage(userMsg);
      setInputText(''); // Xoá ô nhập NGAY LẬP TỨC để user cảm thấy phản hồi tức thì
      const nextHistory = [...messages, userMsg];
      send(text, nextHistory);
    },
    [inputText, isTyping, messages, addMessage, send],
  );

  /** Nút Thử lại: xoá bong bóng lỗi cuối cùng rồi gửi lại đúng câu hỏi cũ. */
  const handleRetry = useCallback(() => {
    if (isTyping || !lastQuestionRef.current) return;
    removeErrorMessages();
    const cleaned = messages.filter((m) => m.status !== 'error');
    send(lastQuestionRef.current, cleaned);
  }, [isTyping, messages, removeErrorMessages, send]);

  /** Nút Xoá lịch sử hội thoại */
  const handleConfirmClear = useCallback(() => {
    Alert.alert(
      'Xóa lịch sử trò chuyện',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử tư vấn này và bắt đầu cuộc trò chuyện mới?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa lịch sử',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  }, [clearHistory]);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const timeStr = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <View style={{ marginBottom: 6 }}>
        <View
          style={[
            styles.bubble,
            item.isBot ? styles.botBubble : styles.userBubble,
            item.status === 'error' && styles.errorBubble,
          ]}>
          <Text
            selectable
            style={{
              color: item.isBot ? '#1F2937' : '#FFFFFF',
              fontSize: 14,
              lineHeight: 20,
            }}>
            {item.text}
          </Text>

          {Boolean(timeStr) && (
            <Text
              style={[
                styles.timeText,
                {
                  color: item.isBot ? '#9CA3AF' : 'rgba(255,255,255,0.7)',
                  textAlign: item.isBot ? 'left' : 'right',
                },
              ]}>
              {timeStr}
            </Text>
          )}
        </View>

        {item.status === 'error' && (
          <Pressable onPress={handleRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>🔄 Thử lại</Text>
          </Pressable>
        )}
      </View>
    );
  };

  /** Trạng thái rỗng: gợi ý sẵn câu hỏi để user biết hỏi gì (Phần 8.10). */
  const renderSuggestions = () => (
    <View style={styles.suggestBox}>
      <Text style={styles.suggestTitle}>Gợi ý câu hỏi:</Text>
      <View style={styles.chipRow}>
        {AI_SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => handleSend(s)} disabled={isTyping}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const canSend = inputText.trim().length > 0 && !isTyping;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Header với trạng thái hoạt động và nút Xoá lịch sử */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Nhân viên AI (Gemini)</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isTyping ? '#F59E0B' : '#10B981' }]} />
              <Text style={styles.headerSub}>{isTyping ? 'Đang soạn tin...' : 'Đang hoạt động'}</Text>
            </View>
          </View>

          {messages.length > 1 && (
            <Pressable onPress={handleConfirmClear} hitSlop={8} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>🗑️ Xóa lịch sử</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: SIZES.padding, flexGrow: 1 }}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <>
              {messages.length <= 1 && renderSuggestions()}
              {isTyping && (
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#FF5733" />
                  <Text style={styles.typingText}> Trợ lý AI đang suy nghĩ...</Text>
                </View>
              )}
            </>
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi về sản phẩm, giá, cấu hình..."
            placeholderTextColor="#9CA3AF"
            maxLength={500}
            editable={!isTyping}
            multiline
            onSubmitEditing={() => handleSend()}
          />
          <ShopButton
            title="Gửi"
            onPress={() => handleSend()}
            isLoading={isTyping}
            disabled={!canSend}
            style={{ width: 75, height: 42, opacity: canSend ? 1 : 0.5 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  headerSub: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubble: {
    backgroundColor: '#FF5733',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 3,
  },
  errorBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '400',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 10,
  },
  typingText: { color: '#4B5563', fontSize: 13, fontStyle: 'italic' },

  retryBtn: { alignSelf: 'flex-start', marginTop: 4, marginBottom: 8, paddingHorizontal: 4 },
  retryText: { color: '#FF5733', fontWeight: 'bold', fontSize: 12 },

  suggestBox: { marginTop: 12, marginBottom: 16 },
  suggestTitle: { fontSize: 12, color: '#6B7280', marginBottom: 8, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#FF5733',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFF5F3',
  },
  chipText: { color: '#FF5733', fontSize: 12, fontWeight: '500' },

  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    color: '#111827',
  },
});
