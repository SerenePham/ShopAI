// src/services/crashlytics.ts
import { getCrashlytics } from '@react-native-firebase/crashlytics';

export function crashlytics() {
  try {
    const instance = getCrashlytics();
    if (instance && typeof instance.log === 'function') {
      return instance;
    }
  } catch (error) {
    // Fallback an toàn cho môi trường test/dev khi chưa re-link native hoặc Firebase chưa sẵn sàng
  }
    return {
      log: (message: string) => {
        console.log('[Firebase Crashlytics Log]:', message);
      },
      crash: () => {
        console.warn('[Firebase Crashlytics]: Intentional crash invoked!');
        throw new Error('Crashlytics intentional crash (Test Crash)');
      },
      recordError: (err: Error, jsErrorName?: string) => {
        console.warn(`[Firebase Crashlytics Non-Fatal] ${jsErrorName ?? 'Error'}:`, err.message);
      },
      setUserId: async (userId: string) => {
        console.log('[Firebase Crashlytics UserId]:', userId);
        return null;
      },
      setAttributes: async (attributes: Record<string, string>) => {
        console.log('[Firebase Crashlytics Attributes]:', attributes);
        return null;
      },
      setAttribute: async (name: string, value: string) => {
        console.log(`[Firebase Crashlytics Attribute] ${name}:`, value);
        return null;
      },
  };
}

export default crashlytics;
