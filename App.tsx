import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@store/useAuthStore";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@contexts/ThemeContext";
import LoginScreen from "@screens/LoginScreen";
import RegisterScreen from "@screens/RegisterScreen";
import RootStackNavigator from "@navigation/RootStackNavigator";
import BiometricGateScreen from "@screens/BiometricGateScreen";
import { useAppLock } from "@hooks/useAppLock";

// Stack cho luồng Auth — luồng Main do RootStackNavigator (bọc MainTabNavigator + Modal Checkout) đảm nhiệm
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
const linking: LinkingOptions<any> = {
  prefixes: ["shopai://"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              ProductDetail: "product/:productId",
            },
          },
        },
      },
    },
  },
};

function App(): React.JSX.Element {
  // Dùng Selector RIÊNG cho từng trường thay vì gọi useAuthStore() trống
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkLocalToken = useAuthStore((state) => state.checkLocalToken);

  // Cổng sinh trắc học: false = đang khoá, true = đã mở
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    checkLocalToken(); // Móc vào ổ cứng SecureStore ngay khi App vừa khởi chạy
  }, [checkLocalToken]);

  // Khi user đăng xuất (token về null), phải KHOÁ LẠI cổng
  useEffect(() => {
    if (token == null) setIsUnlocked(false);
  }, [token]);

  // Canh gác App Lock — tự đặt lại isUnlocked = false nếu App ở nền quá lâu (Phần 8.12, Bước 5b)
  useAppLock({ isUnlocked, setIsUnlocked });

  // Nếu đang lục ổ cứng thì hiện vòng xoay Loading tràn màn hình
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF4D4F" />
      </View>
    );
  }

  // Có token (đã đăng nhập từ trước) NHƯNG chưa vượt cổng -> chặn ở đây
  if (token != null && !isUnlocked) {
    return <BiometricGateScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NavigationContainer linking={linking}>
            {token == null ? (
              // LUỒNG 1: CHƯA ĐĂNG NHẬP — AuthStack: Login + Register
              <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                <AuthStack.Screen name="Login" component={LoginScreen} />
                <AuthStack.Screen name="Register" component={RegisterScreen} />
              </AuthStack.Navigator>
            ) : (
              // LUỒNG 2: ĐÃ ĐĂNG NHẬP — RootStackNavigator (MainTabNavigator + Checkout Modal + OrderDetail)
              <RootStackNavigator />
            )}
          </NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;