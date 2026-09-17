import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@store/useAuthStore";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@contexts/ThemeContext";
import LoginScreen from "@screens/LoginScreen";
import RegisterScreen from "@screens/RegisterScreen";
import MainTabNavigator from "@navigation/MainTabNavigator";
import RootStackNavigator from '@navigation/RootStackNavigator';
import { Provider } from 'react-redux';

// Chỉ còn 1 Stack cho luồng Auth — luồng Main giờ do MainTabNavigator (Bottom Tab) đảm nhiệm
const AuthStack = createNativeStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dữ liệu còn "Tươi" trong 5 phút
      retry: 2,
    },
  },
});

// Cấu hình Deep Linking tối giản: shopai://product/123 -> tự navigate vào ProductDetail
// (Phần khai báo URL Scheme Native đầy đủ cho iOS/Android sẽ hoàn thiện ở giai đoạn xuất bản App)
const linking: LinkingOptions<any> = {
  prefixes: ["shopai://"],
  config: {
    screens: {
      HomeTab: {
        screens: {
          ProductDetail: "product/:productId",
        },
      },
    },
  },
};

function App(): React.JSX.Element {
  // State quản lý Token (Chương sau sẽ đưa cái này vào Zustand)
  const token = useAuthStore(state => state.token);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* ThemeProvider giữ nguyên từ Sprint 3 (Chương 3) — lồng bên trong SafeAreaProvider,
            bên ngoài NavigationContainer, để mọi màn hình (Auth lẫn Main) đều dùng được useTheme() */}
        <ThemeProvider>
          {/* Bọc toàn bộ app bằng NavigationContainer, gắn thêm prop linking */}
          <NavigationContainer linking={linking}>
            {token == null ? (
              // LUỒNG 1: CHƯA ĐĂNG NHẬP — AuthStack: Login + Register (không Back lén vào Tab)
              <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                <AuthStack.Screen name="Login" component={LoginScreen} />
                <AuthStack.Screen name="Register" component={RegisterScreen} />
              </AuthStack.Navigator>
            ) : (
              // LUỒNG 2: ĐÃ ĐĂNG NHẬP — cấp thẳng Bottom Tab Navigator (Home + Cart)
              // cartBadgeCount={2}: giá trị DEMO tĩnh để thấy tabBarBadge chạy đúng (xem Bước 5 + Phần 5.1).
              // Chương 6 sẽ xoá dòng này, MainTabNavigator tự đọc số lượng thật từ useCartStore.
              <RootStackNavigator />
            )}
          </NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;