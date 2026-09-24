import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ShopButton from '@components/ui/ShopButton';
import { useCartStore, CartItem } from '@store/useCartStore';
import { useOrderStore } from '@store/useOrderStore';
import { COLORS, SIZES } from '@constants/theme';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

interface CreateOrderPayload {
  items: CartItem[];
  totalPrice: number;
}

interface CreateOrderResponse {
    orderId: string;
    status: 'PENDING';
  }

// Hàm GHI dữ liệu lên Server qua axiosClient (Interceptor tự gắn Token — Phần 6.6).
// URL vẫn là Mock cho tới khi có Backend NestJS thật ở Chương 9, nhưng CẤU TRÚC gọi API
// đã đúng chuẩn Production ngay từ bây giờ — Chương 9 chỉ cần đổi baseURL, KHÔNG sửa gì ở đây.
const createOrderLocal = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    // Ch.6: giả lập Server. Ch.9 Bước 9c: đổi thành axiosClient.post('/orders', { items, total })
    await new Promise((r) => setTimeout(r, 1200));
    return { orderId: `ORD-${Date.now()}`, status: 'PENDING' };
  };

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((s) => s.addOrder);

  // useMutation: hành động GHI dữ liệu (POST /orders) — CHỈ chạy khi ta gọi mutate(), không tự động như useQuery
  const { mutate, isPending, isError, isSuccess, data } = useMutation({
    mutationFn: createOrderLocal,
    onSuccess: (res) => {
      addOrder({
        id: res.orderId,
        items: [...items],
        total: totalPrice,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['productsInfinite'] });
      setTimeout(() => navigation.goBack(), 1500);
    },
    onError: (err) => console.error('❌ Đặt hàng thất bại:', err),
  });

  const handleConfirm = () => {
    mutate({ items, totalPrice }); // Chỉ khi bấm nút, request thật sự mới bay đi
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Đặt hàng thành công!</Text>
            <Text>Mã đơn: {data?.orderId}</Text>
            <Text>Trạng thái: PENDING (chờ thanh toán)</Text>
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

        {/* isError: hiện khi mutation thất bại (mất mạng, Server lỗi...) — KHÔNG rời màn hình, cho thử lại */}
        {isError && (
          <Text style={styles.errorText}>Đặt hàng thất bại — vui lòng kiểm tra mạng và bấm thử lại!</Text>
        )}

        {isPending ? (
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
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 60, marginBottom: 12 },
  successText: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.success },
});

export default CheckoutScreen;