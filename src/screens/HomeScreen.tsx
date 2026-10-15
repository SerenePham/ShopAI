import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import ShopButton from "@components/ui/ShopButton";
import ProductCard from "@components/ui/ProductCard";
import { COLORS, SIZES } from "@constants/theme";
import type { HomeStackParamList } from "@navigation/HomeStackNavigator";
import type { MainTabParamList } from "@navigation/MainTabNavigator";
import { useAuthStore } from '@store/useAuthStore';
import { useCartStore } from '@store/useCartStore';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import { Product, ProductListSchema } from '../types/product.schema';
import LocationBadge from "@components/ui/LocationBadge";
import { API_BASE_URL } from '@constants/api';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "Home">,
  BottomTabScreenProps<MainTabParamList>
>;

const API_URL = `${API_BASE_URL}/api/products`;

const fetchProductsAPI = async (): Promise<Product[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Lỗi mạng từ Server NestJS');
  }
  const rawData = await response.json();

  const result = ProductListSchema.safeParse(rawData);
  if (!result.success) {
    console.error('❌ Zod chặn dữ liệu bẩn từ Server NestJS:', result.error.format());
    throw new Error('Dữ liệu sản phẩm từ Server không hợp lệ (Zod validation failed)!');
  }
  return result.data;
};

const HomeScreen = ({ navigation, route }: Props) => {
  const logout = useAuthStore(state => state.logout);
  const totalQuantity = useCartStore(state => state.totalQuantity());
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const scannedCode = route.params?.scannedCode;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => setIsServerOnline(res.ok))
      .catch(() => setIsServerOnline(false));
  }, []);

  const categories = [
    "Tất cả",
    "Tai nghe",
    "Bàn phím",
    "Chuột",
    "Laptop",
    "Tablet",
    "Màn hình",
    "TV",
    "Điện thoại",
    "Đồng hồ",
  ];

  const {
    data: allProducts = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['productsList'],
    queryFn: fetchProductsAPI,
  });

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Tìm kiếm
    if (search.trim()) {
      const keyword = search.toLowerCase().trim();

      result = result.filter((product) =>
        product.name.toLowerCase().includes(keyword)
      );
    }

    // Lọc danh mục
    if (selectedCategory !== "Tất cả") {
      const categoryMap: Record<string, string[]> = {
        "Tai nghe": ["tai nghe"],
        "Bàn phím": ["bàn phím"],
        "Chuột": ["chuột"],
        "Laptop": ["laptop"],
        "Tablet": ["ipad", "tablet", "máy tính bảng"],
        "Màn hình": ["màn hình"],
        "TV": ["tv"],
        "Điện thoại": ["điện thoại", "iphone", "galaxy"],
        "Đồng hồ": ["đồng hồ", "watch"],
      };

      const keywords = categoryMap[selectedCategory] ?? [];

      result = result.filter((product) => {
        const name = product.name.toLowerCase();

        return keywords.some((keyword) =>
          name.includes(keyword)
        );
      });
    }

    return result;
  }, [allProducts, search, selectedCategory]);

  const errorMessage = (error as Error)?.message ?? '📡 Lỗi mạng — vui lòng kiểm tra kết nối và kéo xuống thử lại!';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Khám phá</Text>
            {isServerOnline !== null && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isServerOnline ? '#4CD964' : '#FF3B30',
                  marginLeft: 6,
                }}
              />
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <ShopButton
              title="Hỏi AI"
              onPress={() => navigation.navigate('AIChat')}
              style={{ width: 90, height: 32, backgroundColor: COLORS.primary }}
            />
            <ShopButton
              title="Quét Mã"
              onPress={() => navigation.navigate('Scanner')}
              style={{ width: 100, height: 32, backgroundColor: COLORS.secondary }}
            />
            <ShopButton
              title="Thoát"
              onPress={logout}
              style={{
                width: 80,
                height: 32,
              }}
            />
          </View>
        </View>

        
        <LocationBadge />

        {/* Báo cáo nếu quét thành công (đã thêm ở Bước 6) */}
        {scannedCode && (
          <View style={{ backgroundColor: 'yellow', padding: 10, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>Mã vừa quét: {scannedCode}</Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.categoryWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category &&
                    styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        

        {/* Xử lý UI 3 trạng thái cực thanh lịch */}
        {isLoading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />}

        {isError && <Text style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>{errorMessage}</Text>}

        {allProducts.length > 0 && (
          <FlashList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
                <ProductCard product={item} />
              </Pressable>
            )}
            numColumns={2}
            estimatedItemSize={260}
            contentContainerStyle={{ padding: SIZES.padding }}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
  },
  
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },

  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    color: COLORS.text,
  },

  categoryWrapper: {
    height: 52,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: COLORS.surface,
  },


  categoryContainer: {
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
    gap: 8,
  },

  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 13,
    color: "#555",
  },

  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HomeScreen;