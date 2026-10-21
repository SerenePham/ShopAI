import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from './ShopButton';
import { Product } from '../../types/product.schema';
import { useCartStore } from '@store/useCartStore';
import { useTheme } from '@contexts/ThemeContext';
import { getProductImageSource } from '@data/productImages';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.padding * 3) / 2;

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((state) => state.addItem);
  const { colors, isDark } = useTheme();
  const imageSource = getProductImageSource(product);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? '#333' : '#EFEFEF' }]}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
        </Text>

        <ShopButton
          title="Mua ngay"
          onPress={() => addItem(product)}
          style={styles.button}
          textStyle={{ fontSize: 12, fontWeight: '700' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  image: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#F0F0F0',
  },

  infoContainer: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1,
  },

  name: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    minHeight: 36,
  },

  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5733',
    marginBottom: 8,
  },

  button: {
    marginTop: 2,
    height: 32,
    backgroundColor: '#FF5733',
    borderRadius: 8,
  },
});

export default memo(ProductCard);