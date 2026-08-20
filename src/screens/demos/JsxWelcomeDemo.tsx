import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * JsxWelcomeDemo — bài đầu: nhìn mô hình → viết JSX
 * Tạm gắn vào App: return <JsxWelcomeDemo />
 */
function JsxWelcomeDemo() {
  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>ShopAI</Text>
      <Text style={styles.subtitle}>Môi trường đã sẵn sàng</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brand: { fontSize: 36, fontWeight: '800', color: '#FF4D4F' },
  subtitle: { marginTop: 8, fontSize: 16, color: '#7F8C8D' },
});

export default JsxWelcomeDemo;