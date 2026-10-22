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
import axiosClient from "@api/axiosClient";
import crashlytics from "@services/crashlytics";
import { useTheme } from "@contexts/ThemeContext";
import { products as localFallbackProducts } from "@data/products";
import AddToCartModal from "@components/ui/AddToCartModal";
import { hapticSuccess } from "@utils/haptics";

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "Home">,
  BottomTabScreenProps<MainTabParamList>
>;

const CATEGORIES = [
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

const fetchProductsAPI = async (): Promise<Product[]> => {
  try {
    const response = await axiosClient.get<Product[]>("/api/products", {
      timeout: 5000, // Timeout 5 giây để phát hiện mất mạng/server tắt nhanh chóng
    });
    const result = ProductListSchema.safeParse(response.data);
    if (!result.success) {
      console.error(
        "❌ Zod kiểm tra dữ liệu Server NestJS:",
        result.error.format()
      );
      throw new Error("Dữ liệu sản phẩm trả về từ máy chủ không đúng định dạng!");
    }
    return result.data;
  } catch (err: any) {
    crashlytics().recordError(err);
    if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
      throw new Error("Kết nối quá thời gian chờ (Timeout). Vui lòng kiểm tra lại mạng!");
    }
    if (err.response) {
      throw new Error(`Máy chủ phản hồi lỗi: HTTP ${err.response.status}`);
    }
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra Wi-Fi/4G hoặc Server!");
  }
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

// Component Header của danh sách được tách ra ngoài độc lập và bọc memo
// Đảm bảo không bị unmount khi gõ phím -> Sửa triệt để lỗi bàn phím tự thụt xuống!
interface HomeListHeaderProps {
  search: string;
  onSearchChange: (text: string) => void;
  onSubmitSearch?: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalQuantity: number;
  filteredCount: number;
  navigation: any;
  colors: any;
  isDark: boolean;
  isOfflineFallback: boolean;
  onRetryServer: () => void;
}

const HomeListHeader = memo(
  ({
    search,
    onSearchChange,
    onSubmitSearch,
    selectedCategory,
    onSelectCategory,
    totalQuantity,
    filteredCount,
    navigation,
    colors,
    isDark,
    isOfflineFallback,
    onRetryServer,
  }: HomeListHeaderProps) => {
    return (
      <View>
        {/* Banner cảnh báo đang ở chế độ ngoại tuyến */}
        {isOfflineFallback && (
          <Pressable
            style={[
              styles.offlineBanner,
              { backgroundColor: isDark ? "#451A03" : "#FEF3C7", borderColor: "#F59E0B" },
            ]}
            onPress={onRetryServer}
          >
            <Text style={{ fontSize: 13, marginRight: 6 }}>📦</Text>
            <Text
              style={[
                styles.offlineBannerText,
                { color: isDark ? "#FCD34D" : "#B45309" },
              ]}
              numberOfLines={1}
            >
              Đang xem danh mục ngoại tuyến. Nhấn để kết nối lại server.
            </Text>
          </Pressable>
        )}

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

        {/* Search Bar - Giữ focus ổn định tuyệt đối */}
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
            <Pressable onPress={onSubmitSearch} hitSlop={8}>
              <Text style={styles.searchIcon}>🔍</Text>
            </Pressable>
            <TextInput
              value={search}
              onChangeText={onSearchChange}
              onSubmitEditing={onSubmitSearch}
              placeholder="Tìm tên hoặc mã chính xác (vd: #3%, #3!)..."
              placeholderTextColor={isDark ? "#888888" : "#9CA3AF"}
              style={[styles.searchInput, { color: colors.text }]}
              autoCorrect={false}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => onSearchChange("")} hitSlop={10}>
                <Text style={{ color: "#9CA3AF", fontSize: 16, paddingHorizontal: 4 }}>
                  ✕
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Flash Sale Banner */}
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
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => onSelectCategory(category)}
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
            ({filteredCount} món)
          </Text>
        </View>
      </View>
    );
  }
);

const HomeScreen = ({ navigation, route }: Props) => {
  const logout = useAuthStore((state) => state.logout);
  const addItem = useCartStore((state) => state.addItem);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const { colors, isDark, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);
  const [useOfflineFallback, setUseOfflineFallback] = useState(false);

  const scannedCode = route.params?.scannedCode;

  // Kiểm tra sức khỏe Server NestJS
  useEffect(() => {
    axiosClient
      .get("/api/health", { timeout: 3000 })
      .then((res) => setIsServerOnline(res.status === 200))
      .catch(() => setIsServerOnline(false));
  }, []);

  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["productsList"],
    queryFn: fetchProductsAPI,
    retry: 1, // Chỉ thử lại 1 lần để báo lỗi nhanh chóng (dưới 5s) khi mất mạng
  });

  // Nếu người dùng chọn dùng offline fallback hoặc có dữ liệu server
  const allProducts = useOfflineFallback
    ? localFallbackProducts
    : productsData ?? [];

  // Hàm xử lý tìm kiếm chính xác và mở chi tiết sản phẩm lập tức
  const navigateToProductById = useCallback(
    (targetId: string) => {
      const cleanTarget = targetId.toLowerCase().trim();
      const matched = allProducts.find((p) => {
        const prodId = String(p.id).toLowerCase();
        const cleanProdId = prodId.replace("backend_prod_", "");
        return prodId === cleanTarget || cleanProdId === cleanTarget;
      });

      hapticSuccess();
      setSearch("");
      navigation.navigate("ProductDetail", {
        productId: String(matched ? matched.id : targetId),
      });
    },
    [allProducts, navigation]
  );

  // Xử lý khi quét mã QR/Barcode: nếu quét ra mã chính xác dạng #3% hoặc #3! thì vào thẳng chi tiết
  useEffect(() => {
    if (scannedCode) {
      const codeStr = String(scannedCode).trim();
      const exactMatch = codeStr.match(/^#([a-zA-Z0-9_-]+)[%!]?$/i);
      const urlMatch = codeStr.match(/product\/([a-zA-Z0-9_-]+)/i);

      if (exactMatch) {
        navigateToProductById(exactMatch[1]);
      } else if (urlMatch) {
        navigateToProductById(urlMatch[1]);
      } else {
        const matched = allProducts.find(
          (p) =>
            String(p.id) === codeStr ||
            String(p.id).replace("backend_prod_", "") === codeStr.replace("backend_prod_", "")
        );

        if (matched) {
          navigateToProductById(String(matched.id));
        } else {
          setSearch(codeStr);
        }
      }

      navigation.setParams({ scannedCode: undefined } as any);
    }
  }, [scannedCode, allProducts, navigation, navigateToProductById]);

  // Xử lý khi gõ trên thanh tìm kiếm: nếu gõ đúng cú pháp chính xác dạng #3% hoặc #3! thì mở chi tiết luôn
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearch(text);

      const trimmed = text.trim();
      const exactMatch = trimmed.match(/^#([a-zA-Z0-9_-]+)[%!]$/i);
      if (exactMatch) {
        navigateToProductById(exactMatch[1]);
      }
    },
    [navigateToProductById]
  );

  // Xử lý khi nhấn Enter trên bàn phím hoặc nhấn icon kính lúp
  const handleSearchSubmit = useCallback(() => {
    const trimmed = search.trim();
    if (!trimmed) return;

    const match = trimmed.match(/^#([a-zA-Z0-9_-]+)[%!]?$/i);
    if (match) {
      navigateToProductById(match[1]);
    }
  }, [search, navigateToProductById]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (search.trim()) {
      const trimmed = search.trim();
      const isIdSearch = trimmed.startsWith("#");
      const cleanSearch = trimmed.toLowerCase();

      if (isIdSearch) {
        // Tìm kiếm chính xác / theo đầu mã ID khi có tiền tố '#' (ví dụ: #2, #34, #100)
        const rawId = trimmed.replace(/^#\s*/, "").toLowerCase();

        result = result
          .filter((product) => {
            const prodId = String(product.id).toLowerCase();
            const cleanProdId = prodId.replace("backend_prod_", "");
            return (
              prodId === rawId ||
              cleanProdId === rawId ||
              cleanProdId.startsWith(rawId) ||
              prodId.includes(rawId)
            );
          })
          .sort((a, b) => {
            // Đưa sản phẩm khớp ID chính xác nhất lên đầu danh sách
            const aClean = String(a.id).toLowerCase().replace("backend_prod_", "");
            const bClean = String(b.id).toLowerCase().replace("backend_prod_", "");
            if (aClean === rawId) return -1;
            if (bClean === rawId) return 1;
            return 0;
          });
      } else {
        // Tìm kiếm thông thường: khớp theo Tên HOẶC khớp trực tiếp theo ID sản phẩm
        result = result.filter((product) => {
          const nameMatch = product.name.toLowerCase().includes(cleanSearch);
          const prodId = String(product.id).toLowerCase();
          const cleanProdId = prodId.replace("backend_prod_", "");
          const idMatch =
            prodId === cleanSearch ||
            cleanProdId === cleanSearch;

          return nameMatch || idMatch;
        });
      }
    }

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

  // Header trên cùng (luôn cố định để không bị kẹt khi mất mạng)
  const renderHeaderTop = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: isDark ? "#2D2D2D" : "#E5E7EB",
          borderBottomWidth: 1,
        },
      ]}
    >
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
          <Text style={[styles.pillBtnText, { color: "#EF4444" }]} numberOfLines={1}>
            Thoát
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // ListHeaderComponent được memoize truyền dưới dạng React Element
  // Giúp FlashList không unmount TextInput khi re-render
  const listHeaderElement = useMemo(
    () => (
      <HomeListHeader
        search={search}
        onSearchChange={handleSearchChange}
        onSubmitSearch={handleSearchSubmit}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalQuantity={totalQuantity}
        filteredCount={filteredProducts.length}
        navigation={navigation}
        colors={colors}
        isDark={isDark}
        isOfflineFallback={useOfflineFallback}
        onRetryServer={() => {
          setUseOfflineFallback(false);
          refetch();
        }}
      />
    ),
    [
      search,
      handleSearchChange,
      handleSearchSubmit,
      selectedCategory,
      totalQuantity,
      filteredProducts.length,
      navigation,
      colors,
      isDark,
      useOfflineFallback,
      refetch,
    ]
  );

  // 1. Màn hình BÁO LỖI MẠNG khi mất mạng/server tắt (không quay loading hoài)
  if (isError && allProducts.length === 0 && !useOfflineFallback) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {renderHeaderTop()}

          <View style={styles.errorContainer}>
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? "#404040" : "#FEE2E2",
                },
              ]}
            >
              <Text style={{ fontSize: 52, marginBottom: 16 }}>📡</Text>
              <Text style={[styles.errorTitle, { color: colors.text }]}>
                Không thể kết nối máy chủ
              </Text>
              <Text style={[styles.errorSubtitle, { color: colors.textLight }]}>
                {error instanceof Error
                  ? error.message
                  : "Vui lòng kiểm tra lại kết nối Wi-Fi/4G hoặc đảm bảo Server NestJS đang hoạt động."}
              </Text>

              {/* Nút Thử lại */}
              <Pressable
                style={[styles.retryBtn, { opacity: isRefetching ? 0.7 : 1 }]}
                onPress={() => refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Text style={{ fontSize: 16, marginRight: 6 }}>🔄</Text>
                )}
                <Text style={styles.retryBtnText}>
                  {isRefetching ? "Đang kết nối lại..." : "Thử kết nối lại"}
                </Text>
              </Pressable>

              {/* Nút Xem dữ liệu mẫu ngoại tuyến */}
              <Pressable
                style={[
                  styles.offlineBtn,
                  { borderColor: isDark ? "#404040" : "#D1D5DB" },
                ]}
                onPress={() => setUseOfflineFallback(true)}
              >
                <Text style={[styles.offlineBtnText, { color: colors.text }]}>
                  📦 Xem danh mục mẫu ngoại tuyến
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Màn hình Loading lần đầu kết nối (tối đa 5s là có phản hồi, không treo vô tận)
  if (isLoading && allProducts.length === 0 && !useOfflineFallback) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {renderHeaderTop()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5733" />
            <Text style={[styles.loadingText, { color: colors.textLight }]}>
              Đang kết nối máy chủ và tải sản phẩm...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Màn hình danh sách chính
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeaderTop()}

        {/* Danh sách sản phẩm: ListHeaderComponent truyền ReactElement không bị unmount */}
        <FlashList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeaderElement}
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

  // Offline banner
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: SIZES.padding,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  offlineBannerText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  // Error screen styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorCard: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  retryBtn: {
    flexDirection: "row",
    backgroundColor: "#FF5733",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  offlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  offlineBtnText: {
    fontWeight: "600",
    fontSize: 13,
  },

  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default HomeScreen;