import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import ProductCard from "@components/ui/ProductCard";
import { SIZES } from "@constants/theme";
import type { HomeStackParamList } from "@navigation/HomeStackNavigator";
import type { MainTabParamList } from "@navigation/MainTabNavigator";
import { useAuthStore } from "@store/useAuthStore";
import { useCartStore } from "@store/useCartStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import { Product, ProductListSchema } from "../types/product.schema";
import LocationBadge from "@components/ui/LocationBadge";
import { API_BASE_URL } from "@constants/api";
import { useTheme } from "@contexts/ThemeContext";
import { products as localFallbackProducts } from "@data/products";

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "Home">,
  BottomTabScreenProps<MainTabParamList>
>;

const API_URL = `${API_BASE_URL}/api/products`;

const fetchProductsAPI = async (): Promise<Product[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Lỗi mạng từ Server NestJS");
    }
    const rawData = await response.json();
    const result = ProductListSchema.safeParse(rawData);
    if (!result.success) {
      console.error(
        "❌ Zod kiểm tra dữ liệu Server NestJS:",
        result.error.format()
      );
      throw new Error("Dữ liệu sản phẩm không đúng schema!");
    }
    if (result.data.length > 0) {
      return result.data;
    }
  } catch (err) {
    console.log("Server NestJS offline, dùng fallback 100 sản phẩm:", (err as Error).message);
  }
  return localFallbackProducts;
};

const HomeScreen = ({ navigation, route }: Props) => {
  const logout = useAuthStore((state) => state.logout);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const { colors, isDark, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(3 * 60 + 36); // Countdown 03:36

  const scannedCode = route.params?.scannedCode;

  // Kiểm tra sức khỏe Server NestJS
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => setIsServerOnline(res.ok))
      .catch(() => setIsServerOnline(false));
  }, []);

  // Đếm ngược Flash Sale 03:36
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 3 * 60 + 36));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

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
    data: allProducts = localFallbackProducts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["productsList"],
    queryFn: fetchProductsAPI,
    initialData: localFallbackProducts,
  });

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Tìm kiếm từ khóa
    if (search.trim()) {
      const keyword = search.toLowerCase().trim();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(keyword)
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== "Tất cả") {
      const categoryMap: Record<string, string[]> = {
        "Tai nghe": [
          "tai nghe",
          "audio",
          "airpods",
          "wh-",
          "wf-",
          "buds",
          "headphone",
          "earphone",
          "loa",
        ],
        "Bàn phím": ["bàn phím", "keyboard"],
        "Chuột": ["chuột", "mouse"],
        "Laptop": [
          "laptop",
          "macbook",
          "xps",
          "thinkpad",
          "zenbook",
          "gram",
          "surface",
          "rog",
        ],
        "Tablet": ["ipad", "tablet", "máy tính bảng", "tab"],
        "Màn hình": ["màn hình", "monitor"],
        "TV": ["tv"],
        "Điện thoại": [
          "điện thoại",
          "smartphone",
          "iphone",
          "galaxy",
          "xiaomi",
          "redmi",
          "poco",
          "oppo",
          "vivo",
          "realme",
          "pixel",
        ],
        "Đồng hồ": [
          "đồng hồ",
          "smartwatch",
          "watch",
          "band",
          "forerunner",
          "garmin",
        ],
      };

      const keywords = categoryMap[selectedCategory] ?? [];
      result = result.filter((product) => {
        const name = product.name.toLowerCase();
        const cat = (product.category ?? "").toLowerCase();
        return keywords.some(
          (k) => name.includes(k) || cat.includes(k)
        );
      });
    }

    return result;
  }, [allProducts, search, selectedCategory]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* 1. Header Section */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerBranding}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.appTitle}>Binh Pham Store</Text>
              {isServerOnline !== null && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isServerOnline ? "#10B981" : "#EF4444",
                    marginLeft: 6,
                  }}
                />
              )}
            </View>
            <Text
              style={[styles.appSubtitle, { color: colors.textLight }]}
              numberOfLines={1}
            >
              Chào mừng đến với thế giới công nghệ
            </Text>
          </View>

          <View style={styles.headerControls}>
            {/* Theme Toggle Button */}
            <Pressable
              onPress={toggleTheme}
              style={[
                styles.pillBtn,
                { backgroundColor: isDark ? "#333333" : "#F3F4F6" },
              ]}
            >
              <Text
                style={[
                  styles.pillBtnText,
                  { color: isDark ? "#FFFFFF" : "#374151" },
                ]}
              >
                {isDark ? "☀️ Sáng" : "🌙 Tối"}
              </Text>
            </Pressable>

            {/* Logout Button */}
            <Pressable
              onPress={logout}
              style={[
                styles.pillBtn,
                {
                  backgroundColor: isDark ? "#2D1A1A" : "#FEF2F2",
                  borderColor: "#F87171",
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.pillBtnText, { color: "#EF4444" }]}>
                🚪 Thoát
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Location / Shipping Banner */}
        <LocationBadge />

        {/* Thông báo quét mã QR nếu có */}
        {scannedCode && (
          <View style={styles.scannedCodeBanner}>
            <Text style={styles.scannedCodeText}>
              📷 Mã vừa quét: {scannedCode}
            </Text>
          </View>
        )}

        {/* 3. Quick Action Buttons (Row of 4 items) */}
        <View style={styles.quickActionsContainer}>
          {/* Cart Button */}
          <Pressable
            style={[styles.quickBtn, styles.cartBtn]}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartBtnText}>🛒 Giỏ ({totalQuantity})</Text>
          </Pressable>

          {/* AI Assistant Button */}
          <Pressable
            style={[styles.quickBtn, styles.aiBtn]}
            onPress={() => navigation.navigate("AIChat")}
          >
            <Text style={styles.aiBtnText}>🤖 Hỏi AI</Text>
          </Pressable>

          {/* Scan Button */}
          <Pressable
            style={[
              styles.quickBtn,
              styles.outlineBtn,
              isDark && styles.outlineBtnDark,
            ]}
            onPress={() => navigation.navigate("Scanner")}
          >
            <Text style={styles.outlineBtnText}>📷 Quét</Text>
          </Pressable>

          {/* Order Tracking Button */}
          <Pressable
            style={[
              styles.quickBtn,
              styles.outlineBtn,
              isDark && styles.outlineBtnDark,
            ]}
            onPress={() => navigation.navigate("Orders")}
          >
            <Text style={styles.outlineBtnText}>Đơn hàng</Text>
          </Pressable>
        </View>

        {/* 4. Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark ? "#262626" : "#F3F4F6",
                borderColor: isDark ? "#404040" : "#E5E7EB",
              },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm điện thoại, tai nghe, đồng hồ..."
              placeholderTextColor={isDark ? "#888888" : "#9CA3AF"}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} hitSlop={10}>
                <Text style={{ color: "#9CA3AF", fontSize: 16, paddingHorizontal: 4 }}>
                  ✕
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* 5. Flash Sale Banner */}
        <View style={styles.flashSaleBanner}>
          <View style={styles.flashSaleLeft}>
            <Text style={styles.flashSaleHeading}>⚡ FLASH SALE HÔM NAY</Text>
            <Text style={styles.flashSaleSubtitle}>
              Giảm đến 50% khi thanh toán qua ShopAI
            </Text>
          </View>
          <View style={styles.flashSaleTimerCard}>
            <Text style={styles.flashSaleTimerLabel}>Kết thúc trong</Text>
            <Text style={styles.flashSaleTimerText}>{formattedCountdown}</Text>
          </View>
        </View>

        {/* Categories Horizontal Bar */}
        <View
          style={[styles.categoryWrapper, { backgroundColor: colors.background }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: active
                        ? "#FF5733"
                        : isDark
                        ? "#262626"
                        : "#EEEEEE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: active
                          ? "#FFFFFF"
                          : isDark
                          ? "#CCCCCC"
                          : "#555555",
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Loading / Error states */}
        {isLoading && allProducts.length === 0 && (
          <ActivityIndicator
            size="large"
            color="#FF5733"
            style={{ marginTop: 40 }}
          />
        )}

        {isError && allProducts.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 40, color: "red" }}>
            {(error as Error)?.message ?? "Lỗi kết nối máy chủ"}
          </Text>
        )}

        {/* 6. Product List */}
        <FlashList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: String(item.id),
                })
              }
            >
              <ProductCard product={item} />
            </Pressable>
          )}
          numColumns={2}
          contentContainerStyle={{ padding: SIZES.padding }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: colors.textLight, fontSize: 14 }}>
                Không tìm thấy sản phẩm phù hợp
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // 1. Header styles
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBranding: {
    flex: 1,
    paddingRight: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF5733",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  headerControls: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pillBtn: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Scanned Code Banner
  scannedCodeBanner: {
    backgroundColor: "#FEF08A",
    padding: 8,
    marginHorizontal: SIZES.padding,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: "center",
  },
  scannedCodeText: {
    fontWeight: "700",
    color: "#854D0E",
    fontSize: 12,
  },

  // 3. Quick Action Buttons
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    marginVertical: 6,
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBtn: {
    backgroundColor: "#FF5733",
  },
  cartBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  aiBtn: {
    backgroundColor: "#7C3AED",
  },
  aiBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  outlineBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FF5733",
  },
  outlineBtnDark: {
    backgroundColor: "#1E1E1E",
  },
  outlineBtnText: {
    color: "#FF5733",
    fontSize: 12,
    fontWeight: "700",
  },

  // 4. Search Bar
  searchSection: {
    paddingHorizontal: SIZES.padding,
    marginVertical: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    paddingVertical: 0,
  },

  // 5. Flash Sale Banner
  flashSaleBanner: {
    backgroundColor: "#FF5733",
    borderRadius: 14,
    marginHorizontal: SIZES.padding,
    marginVertical: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#FF5733",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  flashSaleLeft: {
    flex: 1,
    paddingRight: 10,
  },
  flashSaleHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  flashSaleSubtitle: {
    color: "#FFF2F0",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  flashSaleTimerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 92,
  },
  flashSaleTimerLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 2,
  },
  flashSaleTimerText: {
    fontSize: 16,
    color: "#FF5733",
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  // Categories
  categoryWrapper: {
    height: 48,
    flexGrow: 0,
    flexShrink: 0,
    marginVertical: 4,
  },
  categoryContainer: {
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
  },
});

export default HomeScreen;