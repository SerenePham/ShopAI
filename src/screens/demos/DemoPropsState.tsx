import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type CardProps = {
  name: string;
  price: number;
  quantity: number;
  onInc: () => void;
  onDec: () => void;
};

function ProductCard({ name, price, quantity, onInc, onDec }: CardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>{price.toLocaleString('vi-VN')} VNĐ</Text>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={onDec}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.qty}>{quantity}</Text>
        <Pressable style={styles.btn} onPress={onInc}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DemoPropsState() {
  const price = 30000000;
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={styles.screen}>
      <ProductCard
        name="iPhone 15 Pro"
        price={price}
        quantity={quantity}
        onInc={() => setQuantity(q => q + 1)}
        onDec={() => setQuantity(q => Math.max(1, q - 1))}
      />
      <Text style={styles.total}>
        Tạm tính: {(price * quantity).toLocaleString('vi-VN')} VNĐ
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#F5F5F5' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  name: { fontSize: 20, fontWeight: '800', color: '#2C3E50' },
  price: { marginTop: 6, color: '#7F8C8D' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  qty: { fontSize: 18, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  total: { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#FF4D4F' },
});