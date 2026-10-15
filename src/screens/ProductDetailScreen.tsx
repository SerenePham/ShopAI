import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ShopButton from '@components/ui/ShopButton';
import { useCartStore } from '@store/useCartStore';
import { API_BASE_URL } from '@constants/api';
import { Product, ProductSchema } from '../types/product.schema';
import { formatCurrency } from '@utils/formatCurrency';
import { COLORS, SIZES } from '@constants/theme';
import { HomeStackParamList } from '@navigation/HomeStackNavigator';

const fetchProductById = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  // Bắt đúng mã 404 mà NestJS ném ra ở Bước 7c — hai đầu ăn khớp nhau
  if (response.status === 404) {
    throw new Error('Sản phẩm này không còn tồn tại trên hệ thống');
  }
  if (!response.ok) {
    throw new Error('Lỗi mạng khi tải chi tiết sản phẩm');
  }
  const raw = await response.json();
  const result = ProductSchema.safeParse(raw); // Vẫn giữ trạm kiểm soát Zod từ Chương 6
  if (!result.success) {
    throw new Error('Dữ liệu chi tiết sản phẩm không hợp lệ (Zod)');
  }
  return result.data;
};

const ProductDetailScreen = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', productId], // Mỗi sản phẩm có ô cache riêng
    queryFn: () => fetchProductById(productId),
    // Mẹo hay: lấy tạm dữ liệu từ cache danh sách mà HomeScreen đã tải, hiển thị NGAY
    // trong lúc request chi tiết đang bay. Người dùng không thấy màn hình Loading chớp nháy.
    placeholderData: () =>
      queryClient
        .getQueryData<Product[]>(['productsList'])
        ?.find((p) => p.id === productId),
  });

  if (isLoading && !product) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />;
  }

  if (isError || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{(error as Error)?.message ?? 'Không tìm thấy sản phẩm'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      <ShopButton title="Thêm vào giỏ hàng" onPress={() => addItem(product)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SIZES.padding, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300, borderRadius: SIZES.radius, marginBottom: 16 },
  name: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  price: { fontSize: SIZES.h2, color: COLORS.primary, fontWeight: 'bold', marginBottom: 24 },
  errorText: { color: COLORS.danger, fontSize: SIZES.body1, textAlign: 'center' },
});

export default ProductDetailScreen;