import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
// ĐÚNG: SafeAreaView phải lấy từ 'react-native-safe-area-context', KHÔNG lấy từ 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import ProductCard from "@components/ui/ProductCard";
import { MOCK_PRODUCTS } from "@data/mockProducts";
import { COLORS, SIZES } from "@constants/theme";

const HomeScreen = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Giả lập gọi lại API mất 1.5 giây — Chương 6 sẽ thay bằng refetch() thật của React Query
    setTimeout(() => {
      // Xáo ngẫu nhiên mảng để người dùng THẤY RÕ danh sách vừa "làm mới", không chỉ là loading suông
      setProducts([...MOCK_PRODUCTS].sort(() => Math.random() - 0.5));
      setRefreshing(false);
    }, 1500);
  }, []);
  
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Khám phá</Text>
        </View>

        <FlashList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          estimatedItemSize={260}
          refreshing={refreshing} // FlashList tự vẽ vòng xoay loading khi true
          onRefresh={handleRefresh} // Gọi tự động khi người dùng kéo tay xuống đầu danh sách
          contentContainerStyle={{ padding: SIZES.padding / 2 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Màu nền vùng tai thỏ
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
  },
});

export default HomeScreen;