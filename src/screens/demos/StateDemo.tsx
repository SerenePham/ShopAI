import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function StateDemo() {
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Số lượng: {quantity}</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.btn}
          onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => setQuantity(prev => prev + 1)}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 20, marginBottom: 16, color: '#2C3E50' },
  row: { flexDirection: 'row', gap: 16 },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 22, fontWeight: '700' },
});