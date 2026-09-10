import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@constants/theme";

// Placeholder: Logic Giỏ hàng thật (thêm/xóa/tính tổng tiền) sẽ làm ở Chương 6 với Zustand
const CartScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🛒</Text>
        <Text style={styles.title}>Giỏ hàng trống</Text>
        <Text style={styles.subtitle}>Sẽ làm ở Chương 6</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: SIZES.h2, fontWeight: "bold", color: COLORS.text },
  subtitle: { fontSize: SIZES.body2, color: COLORS.textLight, marginTop: 4 },
});

export default CartScreen;