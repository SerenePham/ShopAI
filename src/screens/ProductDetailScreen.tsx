import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import ShopButton from "@components/ui/ShopButton";
import { MOCK_PRODUCTS } from "@data/mockProducts";
import { COLORS, SIZES } from "@constants/theme";
import type { HomeStackParamList } from "@navigation/HomeStackNavigator";

type ProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params; // Chỉ nhận đúng 1 chuỗi ID, KHÔNG nhận Object

  // Từ ID, tự tra cứu lại dữ liệu đầy đủ (Ở Chương 6 sẽ đổi thành gọi API/Global State)
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFound}>
          Không tìm thấy sản phẩm với ID: {productId}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(product.price)}
        </Text>
        <Text style={styles.idNote}>Mã sản phẩm: {product.id}</Text>
        <ShopButton
          title="Thêm vào giỏ hàng"
          onPress={() => {}}
          style={styles.buyBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.padding },
  image: {
    width: "100%",
    height: 320,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  name: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  price: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  idNote: { fontSize: SIZES.body2, color: COLORS.textLight, marginBottom: 24 },
  buyBtn: { marginTop: 8 },
  notFound: {
    padding: SIZES.padding,
    fontSize: SIZES.body1,
    color: COLORS.error,
    textAlign: "center",
  },
});

export default ProductDetailScreen;