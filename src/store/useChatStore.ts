import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_GREETING } from '@constants/aiPrompt';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  status?: 'sent' | 'error';
  createdAt?: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'createdAt'> & { createdAt?: number }) => void;
  clearHistory: () => void;
  removeErrorMessages: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'greeting', text: AI_GREETING, isBot: true, status: 'sent', createdAt: Date.now() },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: INITIAL_MESSAGES,

      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          createdAt: msg.createdAt ?? Date.now(),
        };
        // Giữ 60 tin nhắn gần nhất để đảm bảo hiệu năng và bộ nhớ
        set((state) => {
          const next = [...state.messages, newMsg];
          return { messages: next.length > 60 ? next.slice(-60) : next };
        });
      },

      clearHistory: () =>
        set({
          messages: [
            {
              id: `greeting-${Date.now()}`,
              text: AI_GREETING,
              isBot: true,
              status: 'sent',
              createdAt: Date.now(),
            },
          ],
        }),

      removeErrorMessages: () =>
        set((state) => ({
          messages: state.messages.filter((m) => m.status !== 'error'),
        })),
    }),
    {
      name: 'shopai-chat-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
