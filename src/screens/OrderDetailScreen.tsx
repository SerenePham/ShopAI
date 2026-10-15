import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ShopButton from '@components/ui/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { RootStackParamList } from '@navigation/RootStackNavigator';
import { formatCurrency } from '@utils/formatCurrency';
import axiosClient from '@api/axiosClient';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen = ({ route }: Props) => {
  const { orderId } = route.params;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => (await axiosClient.get(`/api/orders/${orderId}`)).data,
  });

  const queryClient = useQueryClient();
  const payMutation = useMutation({
    mutationFn: async () => (await axiosClient.post(`/api/orders/${orderId}/pay`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Không tìm thấy đơn {orderId}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Hóa đơn</Text>
        <Text style={styles.row}>Mã: {order.id}</Text>
        <Text style={styles.row}>Trạng thái: {order.status}</Text>
        <Text style={styles.row}>Ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}</Text>

        <Text style={[styles.heading, { marginTop: 20 }]}>Chi tiết</Text>
        {order.items?.map((it: any) => (
          <View key={it.id} style={styles.itemRow}>
            <Text style={{ flex: 1 }}>{it.name ?? it.productId} × {it.quantity}</Text>
            <Text>{formatCurrency(it.price * it.quantity)}</Text>
          </View>
        ))}

        <Text style={styles.total}>Tổng: {formatCurrency(order.total)}</Text>

        {order.status === 'PENDING' ? (
          <ShopButton
            title="Thanh toán giả lập (→ PAID)"
            onPress={() => payMutation.mutate()}
            isLoading={payMutation.isPending}
            style={{ marginTop: 24 }}
          />
        ) : (
          <Text style={styles.paidNote}>Đã thanh toán ✓</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: SIZES.padding },
  heading: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  row: { marginBottom: 4, color: COLORS.text },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  total: { marginTop: 16, fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  paidNote: { marginTop: 24, color: 'green', fontWeight: '700', textAlign: 'center' },
  missing: { padding: 24, color: COLORS.textLight },
});

export default OrderDetailScreen;