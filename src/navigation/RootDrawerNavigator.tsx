// src/navigation/RootDrawerNavigator.tsx — ví dụ minh hoạ, KHÔNG bắt buộc thay MainTabNavigator
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigator from "@navigation/MainTabNavigator";
import ProfileScreen from "@screens/ProfileScreen";

const Drawer = createDrawerNavigator();

interface Props {
  onLogout: () => void;
}

const RootDrawerNavigator = ({ onLogout }: Props) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#FF4D4F", // Trùng COLORS.primary trong theme.ts
      }}
    >
      {/* Toàn bộ MainTabNavigator (Home + Cart) được nhồi vào làm 1 "trang" của Drawer */}
      <Drawer.Screen name="MainApp" options={{ title: "ShopAI" }}>
        {() => <MainTabNavigator onLogout={onLogout} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Hồ sơ của tôi" }}
      />
    </Drawer.Navigator>
  );
};

export default RootDrawerNavigator;