import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

/**
 * Đọc file này cùng bản vẽ ASCII ở mục B.
 * Mỗi key trong `styles` tương ứng một phần nhìn thấy trên máy.
 */
export default function StyleSheetWalkthrough() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ShopAI</Text>
      <Text style={styles.caption}>StyleSheet = bản vẽ giao diện bằng Object JS</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Thêm vào giỏ</Text>
      </Pressable>

      {/* Hai lớp style: nền + trạng thái nhấn (demo tĩnh) */}
      <Pressable style={[styles.button, styles.buttonOutline]}>
        <Text style={[styles.buttonText, styles.buttonOutlineText]}>Xem chi tiết</Text>
      </Pressable>
    </View>
  );
}

// ĐẶT NGOÀI Component — tạo 1 lần, không tạo lại mỗi lần vẽ màn hình
const styles = StyleSheet.create({
  screen: {
    flex: 1, // chiếm hết chiều cao cha (thường = cả màn)
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', // xếp con theo trục dọc, đẩy vào giữa
    alignItems: 'center', // căn giữa theo ngang
    padding: 24, // khoảng cách mép trong của screen
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF4D4F',
  },
  caption: {
    marginTop: 8, // cách title 8 đơn vị
    marginBottom: 24,
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF4D4F',
  },
  buttonOutlineText: {
    color: '#FF4D4F',
  },
});