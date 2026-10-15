import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import ShopButton from '@components/ui/ShopButton';
import { useCartStore, CartItem } from '@store/useCartStore';
import { COLORS, SIZES } from '@constants/theme';
import { formatCurrency } from '@utils/formatCurrency';
import axiosClient from '@api/axiosClient';

type CreateOrderResponse = { id: string; status: string; total: number; createdAt: string };

const placeOrderAPI = async (items: CartItem[], total: number): Promise<CreateOrderResponse> => {
  const response = await axiosClient.post('/api/orders', {
    items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    total,
  });
  return response.data;
};

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  const [isPlacing, setIsPlacing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsPlacing(true);
    setErrorMessage(null);
    try {
      const order = await placeOrderAPI(items, totalPrice);
      setOrderId(order.id);
      setIsDone(true);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      const message = Array.isArray(serverMessage)
        ? serverMessage.join(', ')
        : serverMessage ?? 'Đặt hàng thất bại, vui lòng thử lại';
      setErrorMessage(message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (isDone) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>Đặt hàng thành công!</Text>
          <Text style={styles.orderIdText}>Mã đơn: {orderId}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Xác nhận đơn hàng</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Số lượng sản phẩm</Text>
          <Text style={styles.value}>{totalQuantity}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
        </View>

        {errorMessage && <Text style={styles.errorText}>⚠️ {errorMessage}</Text>}

        {isPlacing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          <ShopButton
            title="Xác nhận đặt hàng"
            onPress={handleConfirm}
            disabled={totalQuantity === 0}
            style={styles.confirmBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.padding },
  title: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: SIZES.body1, color: COLORS.textLight },
  value: { fontSize: SIZES.body1, color: COLORS.text, fontWeight: '600' },
  totalValue: { fontSize: SIZES.h2, color: COLORS.primary, fontWeight: 'bold' },
  confirmBtn: { marginTop: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 60, marginBottom: 12 },
  successText: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.success },
  orderIdText: { marginTop: 8, fontSize: SIZES.body2, color: COLORS.textLight },
  errorText: { marginTop: 16, color: COLORS.danger, fontSize: SIZES.body2, textAlign: 'center' },
});

export default CheckoutScreen;