import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from './ShopButton';
import { Product } from '../types/product.schema'; // Đổi nguồn Type sang Zod Schema
import { useCartStore } from '@store/useCartStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - (SIZES.padding * 1.5);

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((state) => state.addItem); // Lấy hàm bắn lên Đám mây Giỏ hàng

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
        </Text>

        <ShopButton
          title="Mua ngay"
          onPress={() => addItem(product)} // Bắn thẳng sản phẩm lên Giỏ hàng!
          style={styles.button}
          textStyle={{ fontSize: 12 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: CARD_WIDTH,
  },

  infoContainer: {
    padding: SIZES.padding,
  },

  name: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },

  price: {
    fontSize: SIZES.body3,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },

  button: {
    marginTop: 4,
  },
});
export default memo(ProductCard);