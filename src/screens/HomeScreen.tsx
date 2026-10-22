import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
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
import crashlytics from "@services/crashlytics";
import { useTheme } from "@contexts/ThemeContext";
import { products as localFallbackProducts } from "@data/products";
import AddToCartModal from "@components/ui/AddToCartModal";

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
    crashlytics().recordError(err as Error);
    console.log("Server NestJS offline, dùng fallback 100 sản phẩm:", (err as Error).message);
  }
  return localFallbackProducts;
};

const FlashSaleCountdown = memo(() => {
  const [timeLeft, setTimeLeft] = useState(3 * 60 + 36); // Countdown 03:36

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

  return <Text style={styles.flashSaleTimerText}>{formattedCountdown}</Text>;
});

const HomeScreen = ({ navigation, route }: Props) => {
  const logout = useAuthStore((state) => state.logout);
  const addItem = useCartStore((state) => state.addItem);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const { colors, isDark, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);

  const scannedCode = route.params?.scannedCode;

  // Kiểm tra sức khỏe Server NestJS
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

  // Xử lý khi quét mã QR/Barcode:
  // Nếu có ID chính xác -> mở thẳng màn hình chi tiết món hàng.
  // Nếu không -> đưa thẳng mã quét được vào thanh tìm kiếm.
  useEffect(() => {
    if (scannedCode) {
      const codeStr = String(scannedCode).trim();
      const matched = allProducts.find(
        (p) =>
          String(p.id) === codeStr ||
          String(p.id).replace("backend_prod_", "") === codeStr.replace("backend_prod_", "")
      );

      if (matched) {
        navigation.navigate("ProductDetail", {
          productId: String(matched.id),
        });
      } else {
        setSearch(codeStr);
      }

      // Xóa param scannedCode để tránh lặp lại khi user back về HomeScreen
      navigation.setParams({ scannedCode: undefined } as any);
    }
  }, [scannedCode, allProducts, navigation]);

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

  const handleProductPress = useCallback((productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  }, [navigation]);

  const handleBuyPress = useCallback((prod: Product) => {
    setSelectedProductForBuy(prod);
  }, []);

  const renderProductItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <View
        style={{
          flex: 1,
          paddingLeft: index % 2 === 0 ? SIZES.padding : 6,
          paddingRight: index % 2 === 0 ? 6 : SIZES.padding,
        }}
      >
        <Pressable onPress={() => handleProductPress(String(item.id))}>
          <ProductCard product={item} onBuyPress={handleBuyPress} />
        </Pressable>
      </View>
    ),
    [handleProductPress, handleBuyPress]
  );

  const handleTestCrash = useCallback(() => {
    Alert.alert(
      "⚡ Test Firebase Crashlytics",
      "Chọn hành vi bạn muốn kiểm tra trên Firebase Console:",
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Gửi lỗi Non-Fatal",
          onPress: () => {
            crashlytics().log("Dev test ghi nhận lỗi Non-Fatal từ HomeScreen");
            crashlytics().setUserId("dev_tester_999");
            crashlytics().recordError(
              new Error("Lỗi thử nghiệm Non-Fatal (Manual Test Error)"),
              "ManualTestError"
            );
            Alert.alert(
              "✅ Đã ghi nhận",
              "Báo cáo lỗi Non-Fatal đã được gửi về Firebase Crashlytics!"
            );
          },
        },
        {
          text: "💥 Sập App (Crash)",
          style: "destructive",
          onPress: () => {
            crashlytics().log("Dev nhấn giữ vào version text để test crash...");
            crashlytics().setUserId("dev_tester_999");
            try {
              crashlytics().crash();
            } catch (e) {
              console.warn("Native crash failed:", e);
            }
            setTimeout(() => {
              throw new Error("Crashlytics Intentional Crash Test");
            }, 50);
          },
        },
      ]
    );
  }, []);

  // Header cuộn tự nhiên: Flash Sale, Search, Quick Actions, Categories
  // Khi người dùng vuốt xem hàng hóa, toàn bộ phần này sẽ trượt ẩn đi mượt mà!
  const renderListHeader = () => (
    <View>
      {/* Location / Shipping Banner */}
      <LocationBadge />

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        {/* Cart Button */}
        <Pressable
          style={[styles.quickBtn, styles.cartBtn]}
          onPress={() => navigation.navigate("Cart")}
        >
          <View style={styles.quickBtnRow}>
            <Text style={styles.quickBtnEmoji}>🛒</Text>
            <Text style={styles.cartBtnText} numberOfLines={1}>
              Giỏ ({totalQuantity})
            </Text>
          </View>
        </Pressable>

        {/* AI Assistant Button */}
        <Pressable
          style={[styles.quickBtn, styles.aiBtn]}
          onPress={() => navigation.navigate("AIChat")}
        >
          <View style={styles.quickBtnRow}>
            <Text style={styles.quickBtnEmoji}>🤖</Text>
            <Text style={styles.aiBtnText} numberOfLines={1}>
              Hỏi AI
            </Text>
          </View>
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
          <View style={styles.quickBtnRow}>
            <Text style={styles.quickBtnEmoji}>📷</Text>
            <Text
              style={[
                styles.outlineBtnText,
                isDark && { color: "#FFFFFF" },
              ]}
              numberOfLines={1}
            >
              Quét mã
            </Text>
          </View>
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
          <View style={styles.quickBtnRow}>
            <Text style={styles.quickBtnEmoji}>🚚</Text>
            <Text
              style={[
                styles.outlineBtnText,
                isDark && { color: "#FFFFFF" },
              ]}
              numberOfLines={1}
            >
              Đơn hàng
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Search Bar */}
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

      {/* Flash Sale Banner - bây giờ sẽ cuộn trượt ẩn đi khi lướt xem hàng hóa */}
      <View style={styles.flashSaleBanner}>
        <View style={styles.flashSaleLeft}>
          <Text style={styles.flashSaleHeading}>⚡ FLASH SALE HÔM NAY</Text>
          <Text style={styles.flashSaleSubtitle}>
            Giảm đến 50% khi thanh toán qua ShopAI
          </Text>
        </View>
        <View style={styles.flashSaleTimerCard}>
          <Text style={styles.flashSaleTimerLabel}>Kết thúc trong</Text>
          <FlashSaleCountdown />
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

      {/* Tiêu đề danh mục hàng hóa */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitleText, { color: colors.text }]}>
          {selectedCategory === "Tất cả" ? "🔥 Tất cả sản phẩm" : `📱 ${selectedCategory}`}
        </Text>
        <Text style={[styles.sectionCountText, { color: colors.textLight }]}>
          ({filteredProducts.length} món)
        </Text>
      </View>

      {/* Loading / Error states */}
      {isLoading && allProducts.length === 0 && (
        <ActivityIndicator
          size="large"
          color="#FF5733"
          style={{ marginVertical: 30 }}
        />
      )}

      {isError && allProducts.length === 0 && (
        <Text style={{ textAlign: "center", marginVertical: 30, color: "red" }}>
          {(error as Error)?.message ?? "Lỗi kết nối máy chủ"}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* 1. Header Section - Khóa ở trên đỉnh */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: isDark ? '#2D2D2D' : '#E5E7EB', borderBottomWidth: 1 }]}>
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
              <Text style={{ fontSize: 13, marginRight: 4 }}>
                {isDark ? "☀️" : "🌙"}
              </Text>
              <Text
                style={[
                  styles.pillBtnText,
                  { color: isDark ? "#FFFFFF" : "#374151" },
                ]}
                numberOfLines={1}
              >
                {isDark ? "Sáng" : "Tối"}
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
              <Text style={{ fontSize: 13, marginRight: 4 }}>🚪</Text>
              <Text
                style={[
                  styles.pillBtnText,
                  { color: "#EF4444" },
                ]}
                numberOfLines={1}
              >
                Thoát
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Danh sách sản phẩm cuộn tự nhiên: Flash Sale & Search sẽ trượt ẩn đi khi cuộn xuống */}
        <FlashList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderListHeader}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListFooterComponent={
            __DEV__ ? (
              <Pressable
                onPress={handleTestCrash}
                onLongPress={handleTestCrash}
                style={{ padding: 16, alignItems: "center" }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                    color: isDark ? "#777777" : "#999999",
                  }}
                >
                  ShopAI v1.0.0 (Dev: nhấn vào để test Crashlytics)
                </Text>
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: colors.textLight, fontSize: 14 }}>
                Không tìm thấy sản phẩm phù hợp
              </Text>
            </View>
          }
        />

        {/* Popup chọn số lượng khi bấm Mua */}
        <AddToCartModal
          visible={Boolean(selectedProductForBuy)}
          product={selectedProductForBuy}
          onClose={() => setSelectedProductForBuy(null)}
          onConfirm={(prod, qty) => {
            addItem(prod, qty);
          }}
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
    flexShrink: 0,
  },
  pillBtn: {
    flexDirection: "row",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: "700",
    includeFontPadding: false,
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
    gap: 6,
  },
  quickBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  quickBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  quickBtnEmoji: {
    fontSize: 12,
  },
  cartBtn: {
    backgroundColor: "#FF5733",
  },
  cartBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  aiBtn: {
    backgroundColor: "#7C3AED",
  },
  aiBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
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
    fontSize: 11,
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    marginTop: 10,
    marginBottom: 6,
    gap: 6,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCountText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default HomeScreen;