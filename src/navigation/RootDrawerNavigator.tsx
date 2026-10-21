// src/navigation/RootDrawerNavigator.tsx — ví dụ minh hoạ, KHÔNG bắt buộc thay MainTabNavigator
import React from "react";
import { View, Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigator from "@navigation/MainTabNavigator";

const Drawer = createDrawerNavigator();

const DummyProfile = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Hồ sơ người dùng</Text>
  </View>
);

const RootDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#FF4D4F", // Trùng COLORS.primary trong theme.ts
      }}
    >
      {/* Toàn bộ MainTabNavigator (Home + Cart) được nhồi vào làm 1 "trang" của Drawer */}
      <Drawer.Screen name="MainApp" component={MainTabNavigator} options={{ title: "ShopAI" }} />
      <Drawer.Screen
        name="Profile"
        component={DummyProfile}
        options={{ title: "Hồ sơ của tôi" }}
      />
    </Drawer.Navigator>
  );
};

export default RootDrawerNavigator;