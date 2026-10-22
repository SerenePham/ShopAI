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
  onBuyPress?: (product: Product) => void;
}

const ProductCard = ({ product, onBuyPress }: Props) => {
  const addItem = useCartStore((state) => state.addItem);
  const { colors, isDark } = useTheme();
  const imageSource = getProductImageSource(product);
  const cleanId = String(product.id).replace('backend_prod_', '');

  const handleBuy = () => {
    if (onBuyPress) {
      onBuyPress(product);
    } else {
      addItem(product);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? '#333333' : '#E5E7EB' }]}>
      <View style={[styles.imageContainer, { backgroundColor: isDark ? '#262626' : '#F9FAFB' }]}>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>#{cleanId}</Text>
        </View>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
        </Text>

        <ShopButton
          title="Mua ngay"
          onPress={handleBuy}
          style={styles.button}
          textStyle={{ fontSize: 12, fontWeight: '700' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  imageContainer: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },

  idBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },

  idBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  image: {
    width: '100%',
    height: '100%',
  },

  infoContainer: {
    padding: 10,
  },

  name: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    height: 36,
    lineHeight: 18,
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