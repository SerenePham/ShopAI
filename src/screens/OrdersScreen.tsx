import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@api/axiosClient';
import { COLORS, SIZES } from '@constants/theme';
import { formatCurrency } from '@utils/formatCurrency';
import { useTheme } from '@contexts/ThemeContext';

export type OrderItem = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
};

const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const { data: orders = [], isLoading, isError, refetch, isRefetching } = useQuery<OrderItem[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/orders');
      return res.data;
    },
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Đơn hàng của tôi</Text>
      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: COLORS.danger }]}>
            Không thể tải danh sách đơn hàng. Kéo xuống để thử lại.
          </Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>Chưa có đơn nào. Hãy đặt hàng từ Giỏ.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SIZES.padding }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? '#333333' : '#E5E7EB',
                  borderWidth: 1,
                },
              ]}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            >
              <Text style={[styles.orderId, { color: colors.text }]}>{item.id}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {formatCurrency(item.total)}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'PAID' && styles.statusPaid,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'PAID' && styles.statusPaidText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString('vi-VN')}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.primary,
    padding: SIZES.padding,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: COLORS.textLight, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white ?? '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderId: { fontWeight: '700', fontSize: SIZES.body1, color: COLORS.text },
  meta: { marginTop: 4, color: COLORS.primary, fontWeight: '600' },
  date: { marginTop: 4, color: COLORS.textLight, fontSize: SIZES.body2 },

  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },

  statusPaid: {
    backgroundColor: '#DCFCE7',
  },

  statusPaidText: {
    color: '#16A34A',
  },
});

export default OrdersScreen;