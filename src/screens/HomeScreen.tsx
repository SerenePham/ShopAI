import React, { useState, useCallback } from "react";
import { useReducer } from "react";
import { View, StyleSheet } from "react-native";
import ShopButton from "@components/ui/ShopButton";
import Typography from "@components/ui/Typography";
import ShopInput from "@components/ui/ShopInput";
import { useCountdown } from "@hooks/useCountdown";
import { COLORS, SIZES } from "@constants/theme";
import { useTheme } from "@contexts/ThemeContext";

// Đặt cạnh các import khác trong HomeScreen
type QtyAction = { type: "ADD" } | { type: "REMOVE" };

function qtyReducer(state: number, action: QtyAction): number {
  switch (action.type) {
    case "ADD":
      return state + 1;
    case "REMOVE":
      return Math.max(1, state - 1); // Không cho xuống dưới 1
    default:
      return state;
  }
}

const HomeScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [quantity, dispatchQty] = useReducer(qtyReducer, 1);
  const { timeLeft, isFinished } = useCountdown(60);

  const handleCheckout = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Thanh toán thành công!", coupon);
    }, 2000);
  }, [coupon]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Typography variant="h1" color={colors.text} style={styles.title}>
        ShopAI UI Kit
      </Typography>

      <ShopButton
        title={isDark ? "Chuyển sang Sáng" : "Chuyển sang Tối"}
        onPress={toggleTheme}
        style={{ backgroundColor: colors.primary, marginBottom: 16 }}
      />

      <Typography
        variant="body2"
        color={colors.textLight}
        style={{ textAlign: "center", marginBottom: 16 }}
      >
        {isFinished
          ? "Đã hết hạn khuyến mãi!"
          : `Flash sale kết thúc sau: ${timeLeft}s`}
      </Typography>

      <View style={styles.card}>
        <Typography variant="h2" color={COLORS.primary} style={styles.price}>
          Tổng tiền: 15.000.000đ
        </Typography>

        <ShopInput
          label="Mã giảm giá"
          placeholder="Nhập mã (VD: SHOPAI10)"
          value={coupon}
          onChangeText={setCoupon}
          autoCapitalize="characters"
        />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <ShopButton
          title="-"
          onPress={() => dispatchQty({ type: "REMOVE" })}
          style={{ width: 44, height: 44 }}
        />
        <Typography variant="h3" style={{ marginHorizontal: 20 }}>
          {quantity}
        </Typography>
        <ShopButton
          title="+"
          onPress={() => dispatchQty({ type: "ADD" })}
          style={{ width: 44, height: 44 }}
        />
      </View>

        <ShopButton
          title="Xác nhận thanh toán"
          onPress={handleCheckout}
          isLoading={loading}
          disabled={isFinished}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: SIZES.padding,
  },
  title: { textAlign: "center", marginBottom: 12 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: SIZES.radius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  price: { marginBottom: 20, textAlign: "center" },
});

export default HomeScreen;