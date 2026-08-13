/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {View,Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.brand}>ShopAI</Text>
        <Text style={styles.subtitle}>Môi trường đã sẵn sàng</Text>
        <Text style={styles.hint}>
          Thử sửa chữ bên trên → lưu file → màn hình tự cập nhật (Fast Refresh)
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FF4D4F',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 8,
  },
  hint: {
    marginTop: 24,
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
});

export default App;
