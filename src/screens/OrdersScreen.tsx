import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrderStore } from '@store/useOrderStore';
import { COLORS, SIZES } from '@constants/theme';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const orders = useOrderStore((s) => s.orders);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Đơn hàng của tôi</Text>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chưa có đơn nào. Hãy đặt hàng từ Giỏ.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SIZES.padding }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            >
              <Text style={styles.orderId}>{item.id}</Text>

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
    backgroundColor: COLORS.white,
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