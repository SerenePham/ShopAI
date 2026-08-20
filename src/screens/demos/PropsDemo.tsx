import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ProductCardProps = {
  title: string;
  price: string;
  isDiscount: boolean;
};

/** Component CON — chỉ nhận Props, không tự đổi title/price */
function ProductCard({ title, price, isDiscount }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.price, isDiscount && styles.priceSale]}>
        {price} VNĐ
      </Text>
    </View>
  );
}

/** Component CHA — truyền Props xuống */
export default function PropsDemo() {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Danh sách sản phẩm</Text>
      <ProductCard title="iPhone 15 Pro" price="30.000.000" isDiscount={false} />
      <ProductCard title="Ốp lưng trong suốt" price="150.000" isDiscount={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#2C3E50' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#2C3E50' },
  price: { marginTop: 6, fontSize: 16, color: '#2C3E50' },
  priceSale: { color: '#FF4D4F', fontWeight: '700' },
});