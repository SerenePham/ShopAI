// src/constants/env.ts
export type AppEnv = 'development' | 'staging' | 'production';

// __DEV__ là biến toàn cục của React Native: true khi chạy qua Metro, false ở bản build Release.
// Nhờ nó, chỉ một dòng này đã tự phân biệt được máy dev với máy người dùng thật.
export const APP_ENV: AppEnv = __DEV__ ? 'development' : 'production';

// Bảng địa chỉ Server cho từng môi trường — thay cho việc hardcode IP LAN ở Chương 9
const API_URLS: Record<AppEnv, string> = {
  // IP LAN máy tính hiện tại đang chạy NestJS backend
  development: 'http://192.168.1.81:3000',
  staging: 'http://192.168.1.81:3000',
  production: 'http://192.168.1.81:3000', // Trỏ IP LAN máy tính để bản Release cài trên máy thật kết nối được Server
};

export const API_BASE_URL = API_URLS[APP_ENV];

// Cờ bật/tắt tính năng theo môi trường — tránh làm nhiễu dữ liệu thật bằng log lúc đang code
export const ENABLE_CRASHLYTICS = APP_ENV !== 'development';
export const ENABLE_OTA_UPDATE = APP_ENV !== 'development';

// Hiển thị ở màn hình Giới thiệu / góc dưới HomeScreen (xem Phần 10.10)
export const APP_VERSION = '1.0.0';
