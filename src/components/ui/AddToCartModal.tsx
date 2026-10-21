import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Product } from '../../types/product.schema';
import { useTheme } from '@contexts/ThemeContext';
import { formatCurrency } from '@utils/formatCurrency';
import { getProductImageSource } from '@data/productImages';
import { hapticSuccess } from '@utils/haptics';

interface AddToCartModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
}

const { width } = Dimensions.get('window');

const AddToCartModal = ({
  visible,
  product,
  onClose,
  onConfirm,
}: AddToCartModalProps) => {
  const { colors, isDark } = useTheme();
  const [quantity, setQuantity] = useState(1);

  // Reset quantity khi mở modal với sản phẩm mới
  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible, product]);

  if (!product) return null;

  const maxStock = product.stock ?? 99;
  const imageSource = getProductImageSource(product);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleConfirm = () => {
    hapticSuccess();
    onConfirm(product, quantity);
    onClose();
  };

  const totalPrice = product.price * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? '#333333' : '#E5E7EB',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header với nút đóng */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Chọn số lượng mua
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={{ color: colors.textLight, fontSize: 18, fontWeight: '700' }}>
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Thông tin món hàng */}
          <View style={styles.productRow}>
            <Image
              source={imageSource}
              style={[
                styles.productImage,
                { backgroundColor: isDark ? '#262626' : '#F3F4F6' },
              ]}
              resizeMode="cover"
            />
            <View style={styles.productDetails}>
              <Text
                style={[styles.productName, { color: colors.text }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <Text style={styles.productPrice}>
                {formatCurrency(product.price)}
              </Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>
                  📦 Tồn kho: {maxStock} sản phẩm
                </Text>
              </View>
            </View>
          </View>

          {/* Bộ điều chỉnh số lượng */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>
              Số lượng:
            </Text>
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={handleDecrease}
                style={[
                  styles.stepperBtn,
                  {
                    backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                    opacity: quantity <= 1 ? 0.4 : 1,
                  },
                ]}
                disabled={quantity <= 1}
              >
                <Text style={[styles.stepperBtnText, { color: colors.text }]}>−</Text>
              </Pressable>

              <View
                style={[
                  styles.quantityDisplay,
                  {
                    backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    borderColor: isDark ? '#333' : '#E5E7EB',
                  },
                ]}
              >
                <Text style={[styles.quantityValue, { color: colors.text }]}>
                  {quantity}
                </Text>
              </View>

              <Pressable
                onPress={handleIncrease}
                style={[
                  styles.stepperBtn,
                  {
                    backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                    opacity: quantity >= maxStock ? 0.4 : 1,
                  },
                ]}
                disabled={quantity >= maxStock}
              >
                <Text style={[styles.stepperBtnText, { color: colors.text }]}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Tạm tính */}
          <View
            style={[
              styles.totalRow,
              { borderTopColor: isDark ? '#2A2A2A' : '#F3F4F6' },
            ]}
          >
            <Text style={[styles.totalLabel, { color: colors.textLight }]}>
              Tạm tính:
            </Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          {/* Nút hành động */}
          <View style={styles.actionRow}>
            <Pressable
              style={[
                styles.cancelBtn,
                { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                Hủy
              </Text>
            </Pressable>

            <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>🛒 Xác nhận mua</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5733',
    marginBottom: 6,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  quantityDisplay: {
    width: 48,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5733',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AddToCartModal;
