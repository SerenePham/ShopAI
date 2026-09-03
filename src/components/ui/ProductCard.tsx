import React, { memo, useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { COLORS, SIZES } from "@constants/theme";
import ShopButton from "@components/ui/ShopButton";
import { Product } from "@data/mockProducts";

// Lấy chiều rộng màn hình để tính kích thước cột (Grid 2 cột, có khe hở đều 2 bên)
const { width } = Dimensions.get("window");
const GAP = SIZES.padding;
const CARD_WIDTH = (width - GAP * 3) / 2;

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  // Reanimated: Shared Value sống trên UI Thread, không phải state React thông thường
  const opacity = useSharedValue(0);

  useEffect(() => {
    // withTiming đẩy toàn bộ phép tính animation sang chạy Native (Worklet),
    // JS Thread không cần bận tâm gì tới quá trình mờ dần hiện ra này.
    opacity.value = withTiming(1, { duration: 400 });
  }, [opacity]);

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, fadeInStyle]}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(product.price)}
        </Text>

        {/* Tái sử dụng Nút bấm từ Sprint 3 */}
        <ShopButton
          title="Mua ngay"
          onPress={() => {}}
          style={styles.button}
          textStyle={{ fontSize: 12 }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginHorizontal: GAP / 2, // Khe hở đều giữa 2 cột và ở 2 mép màn hình
    marginBottom: GAP,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    // Đổ bóng
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH, // Ảnh hình vuông
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: "500",
    height: 40, // Cố định chiều cao 2 dòng
  },
  price: {
    fontSize: SIZES.body1,
    color: COLORS.primary,
    fontWeight: "bold",
    marginVertical: 8,
  },
  button: {
    height: 36,
  },
});

export default memo(ProductCard);