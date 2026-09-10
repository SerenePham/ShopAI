import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStackNavigator from "@navigation/HomeStackNavigator";
import CartScreen from "@screens/CartScreen";
import { COLORS } from "@constants/theme";

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
  // Số lượng hiện trên chấm đỏ (badge) của Tab Giỏ hàng.
  // Sprint 5 (chưa có Zustand) chỉ nhận giá trị tĩnh qua Props từ App.tsx.
  // Sau Chương 6, giá trị này sẽ đọc trực tiếp từ useCartStore().totalQuantity() ngay
  // BÊN TRONG component này — xoá hẳn tầng Prop Drilling cartBadgeCount này.
  cartBadgeCount?: number;
}

const MainTabNavigator = ({ onLogout, cartBadgeCount = 0 }: Props) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          title: "Trang chủ",
          // tabBarIcon nhận sẵn { focused, color, size } từ React Navigation —
          // color/size đã tự động khớp với tabBarActiveTintColor/InactiveTintColor ở trên
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-variant-outline" color={color} size={size} />
          ),
        }}
      >
        {/* Truyền onLogout xuyên qua Tab -> Stack -> Home (đây chính là Prop Drilling
            mà Chương 6 sẽ giải quyết triệt để bằng Zustand) */}
        {() => <HomeStackNavigator onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-outline" color={color} size={size} />
          ),
          // tabBarBadge: chấm đỏ số lượng hiện trên góc icon.
          // Truyền `undefined` (KHÔNG phải 0) để React Navigation tự ẩn hẳn chấm badge khi giỏ hàng trống.
          tabBarBadge: cartBadgeCount > 0 ? cartBadgeCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;