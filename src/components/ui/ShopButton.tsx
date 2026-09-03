// src/components/ShopButton.tsx
import React, { memo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import Typography from "@components/ui/Typography";
import { COLORS, SIZES } from "@constants/theme";

interface ShopButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "outline"; // ➕ MỚI — không truyền thì mặc định 'primary'
    style?: ViewStyle;
    textStyle?: TextStyle;
    accessibilityLabel?: string;
  }
  
  const ShopButton: React.FC<ShopButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    variant = "primary", // ➕ MỚI
    style,
    textStyle,
    accessibilityLabel,
  }) => {
    // ➕ MỚI: tra đúng style nền + màu chữ theo variant
    const variantStyle = styles[variant];
    const textColor = variant === "outline" ? COLORS.primary : COLORS.surface;
  
    return (
      <TouchableOpacity
        // Thứ tự mảng style CHỦ ĐÍCH: layout chung -> màu theo variant -> khoá (disabled) -> style riêng của nơi gọi (ưu tiên cao nhất vì đứng cuối)
        style={[
          styles.button,
          variantStyle,
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityRole="button"
      >
        {isLoading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Typography
            variant="body1"
            color={textColor}
            style={[{ fontWeight: "600" }, textStyle]}
          >
            {title}
          </Typography>
        )}
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    button: {
      height: 50,
      borderRadius: SIZES.radius,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SIZES.padding,
    },
    disabledButton: {
      opacity: 0.5,
    },
  
    // ➕ MỚI: ba biến thể — chỉ đổi màu nền/viền, KHÔNG lặp lại layout đã có ở `button`
    primary: { backgroundColor: COLORS.primary }, // Hành động chính: Thanh toán, Đăng nhập, Xác nhận
    secondary: { backgroundColor: COLORS.secondary, shadowOpacity: 0 }, // Hành động phụ: Giỏ hàng, Quét mã (Ch.7)
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      shadowOpacity: 0, // Nút viền rỗng không cần đổ bóng, nhìn đỡ "nặng" hơn nút đặc màu
    },
  });

export default memo(ShopButton);