// 1. IMPORT ĐỒ NGHỀ TỪ BÊN NGOÀI
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import hàm tải dữ liệu nhờ Path Alias @services
import { fetchSamplePosts, PostItem } from '@services/productApi';

// 2. TẠO COMPONENT HOMESCREEN
const HomeScreen = () => {
  // STATE: Quản lý biến nội bộ của màn hình
  const [keyword, setKeyword] = useState(''); // Chữ đang gõ
  const [posts, setPosts] = useState<PostItem[]>([]); // Danh sách bài viết
  const [loading, setLoading] = useState(true); // Vòng xoay chờ tải
  const [error, setError] = useState<string | null>(null); // Báo lỗi
  
  // Cờ "còn sống" tránh Memory Leak (Phần 2.5)
  const aliveRef = useRef(true);

  // HÀM: Chịu trách nhiệm gọi API
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSamplePosts(); // Gọi sang file productApi.ts
      if (aliveRef.current) setPosts(data); // Cập nhật danh sách
    } catch (e) {
      if (aliveRef.current) setError('Không tải được dữ liệu.');
    } finally {
      if (aliveRef.current) setLoading(false); // Tắt vòng xoay
    }
  }, []);

  // USE EFFECT: Gọi hàm load() ngay lần đầu màn hình xuất hiện (Mount)
  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false; // Cleanup khi thoát màn hình
    };
  }, [load]);

  // LOGIC: Lọc bài viết theo từ khóa (Không phân biệt hoa thường)
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(keyword.toLowerCase()),
  );

  // 3. GIAO DIỆN (JSX)
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>ShopAI</Text>
        <Text style={styles.caption}>Sprint 2 — Core Components + Fetch</Text>
      </View>

      {/* Ảnh Banner tĩnh */}
      <Image
        source={{ uri: 'https://picsum.photos/800/200' }}
        style={styles.banner}
        resizeMode="cover"
      />

      {/* Ô tìm kiếm */}
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Tìm theo tiêu đề..."
        placeholderTextColor="#95A5A6"
        style={styles.input}
        autoCapitalize="none"
      />

      {/* Nút bấm tải lại danh sách */}
      <Pressable
        onPress={load}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.btnText}>Làm mới danh sách</Text>
      </Pressable>

      {/* Vòng xoay Loading (Chỉ hiện khi loading = true) */}
      {loading && <ActivityIndicator style={{ marginTop: 24 }} color="#FF4D4F" />}
      
      {/* Báo lỗi đỏ (Chỉ hiện khi error có dữ liệu) */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Danh sách FlatList mượt mà */}
      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có kết quả cho từ khóa này</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardBody} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

// 4. BẢN VẼ GIAO DIỆN (STYLESHEET)
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 16, backgroundColor: '#fff' },
  brand: { fontSize: 28, fontWeight: '800', color: '#FF4D4F' },
  caption: { color: '#7F8C8D', marginTop: 4 },
  banner: { width: '100%', height: 120, marginTop: 8 },
  input: {
    margin: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  btn: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FF4D4F',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  card: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  cardTitle: { fontWeight: '700', color: '#2C3E50', marginBottom: 6 },
  cardBody: { color: '#7F8C8D' },
  error: { color: '#FF0000', textAlign: 'center', marginTop: 16 },
  empty: { textAlign: 'center', color: '#95A5A6', marginTop: 24 },
});

// 5. XUẤT KHẨU COMPONENT (BẮT BUỘC)
export default HomeScreen;