import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@screens/HomeScreen";
import ProductDetailScreen from "@screens/ProductDetailScreen";

// Khai báo kiểu dữ liệu Route Params cho toàn bộ Stack này — TypeScript sẽ tự
// báo lỗi nếu bạn quên gửi productId hoặc gửi sai kiểu khi gọi navigate()
export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  // Scanner: undefined; // Sẽ bổ sung Scanner mã vạch ở chương sau
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Chi tiết sản phẩm" }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;