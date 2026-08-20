import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Nhận thông báo đơn hàng</Text>
      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{ false: '#E5E5E5', true: '#FFB4B4' }}
        thumbColor={enabled ? '#FF4D4F' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  label: { fontSize: 16, color: '#2C3E50', flex: 1, paddingRight: 12 },
});