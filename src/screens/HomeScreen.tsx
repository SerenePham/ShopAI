import React, { useState, useMemo  } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput,  ScrollView} from "react-native";
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
import { ProductListSchema } from '../types/product.schema';
import products, { Product } from '../data/products';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "Home">,
  BottomTabScreenProps<MainTabParamList>
>;

const PAGE_SIZE = 10;
const TOTAL_MOCK_PRODUCTS = products.length;

interface ProductPage {
  items: Product[];
  nextPage: number | null;
}

class ZodValidationError extends Error {}
class NetworkError extends Error {}

// Hàm giả lập gọi API PHÂN TRANG — mỗi lần chỉ trả về đúng PAGE_SIZE sản phẩm, không tải hết 1 lượt
const fetchProductsPage = async ({
  pageParam,
}: {
  pageParam: number;
}): Promise<ProductPage> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Giả lập lỗi mạng
      if (Math.random() < 0.1) {
        reject(
          new NetworkError(
            "Mất kết nối mạng, vui lòng thử lại!"
          )
        );
        return;
      }

      const start = (pageParam - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      // Lấy đúng PAGE_SIZE sản phẩm từ MOCK_PRODUCTS
      const rawItems = products.slice(start, end);

      // Kiểm tra dữ liệu bằng Zod
      const result = ProductListSchema.safeParse(rawItems);

      if (!result.success) {
        console.error(
          "❌ Zod chặn dữ liệu:",
          result.error.format()
        );

        reject(
          new ZodValidationError(
            "Dữ liệu sản phẩm không hợp lệ!"
          )
        );

        return;
      }

      const hasMore = end < products.length;

      resolve({
        items: result.data,
        nextPage: hasMore ? pageParam + 1 : null,
      });
    }, 800);
  });
};

const HomeScreen = ({ navigation }: Props) => {
  const logout = useAuthStore(state => state.logout); // Gọi Hàm thoát từ Đám mây
  const totalQuantity = useCartStore(state => state.totalQuantity()); // Số lượng hàng trong giỏ
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

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
  // BÙM! useInfiniteQuery = toàn bộ sức mạnh Cache/StaleTime (Phần 6.5) CỘNG THÊM Pagination tự động (Phần 6.8)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,     // Gọi hàm này để tải thêm trang kế tiếp
    hasNextPage,       // Server còn trang để tải hay không
    isFetchingNextPage, // Đang tải trang kế tiếp (khác isLoading — đã có data cũ hiển thị)
  } = useInfiniteQuery({
    queryKey: ['productsInfinite'], // Mã định danh Cache — đổi tên so với 'productsList' vì cấu trúc data đã khác (nhiều trang)
    queryFn: fetchProductsPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // data.pages là mảng CÁC TRANG — "làm phẳng" (flatten) lại thành 1 mảng sản phẩm duy nhất cho FlashList
  const allProducts = data?.pages.flatMap((page) => page.items) ?? [];

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

  // Phân biệt rõ 2 thông báo lỗi khác nhau bằng instanceof — đúng yêu cầu UX (không gộp chung 1 câu mơ hồ)
  const errorMessage =
    error instanceof ZodValidationError
      ? '⚠️ Dữ liệu sản phẩm không hợp lệ (lỗi kiểm tra Zod) — báo kỹ thuật viên!'
      : '📡 Lỗi mạng — vui lòng kiểm tra kết nối và kéo xuống thử lại!';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Khám phá</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <ShopButton
              title={`Giỏ hàng (${totalQuantity})`}
              onPress={() => navigation.navigate("Cart")}
              style={{
                width: 120,
                height: 32,
                backgroundColor: COLORS.secondary,
              }}
              textStyle={{ fontSize: 12 }}
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

        {/* Lỗi Zod và lỗi Mạng dùng CHUNG 1 cờ isError nhưng hiện 2 THÔNG ĐIỆP khác nhau (errorMessage ở trên) */}
        {isError && <Text style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>{errorMessage}</Text>}

        {allProducts.length > 0 && (
          <FlashList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              // Bọc Pressable để bấm vào Card mở ProductDetail — chỉ gửi productId (Route Params),
              // KHÔNG gửi nguyên Object sản phẩm (đúng nguyên tắc Chương 5, Phần 5.3).
              // Nút "Mua ngay" nằm bên TRONG ProductCard (Bước 7) vẫn hoạt động độc lập —
              // nó tự bắt Touch trước, không bị Pressable ngoài này "cướp" sự kiện.
              <Pressable onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
                <ProductCard product={item} />
              </Pressable>
            )}
            numColumns={2}
            estimatedItemSize={260} // Tuỳ chọn ở FlashList v2 — vẫn nên khai báo để layout ổn định hơn ở v1
            contentContainerStyle={{ padding: SIZES.padding }}
            refreshing={isRefetching} // Không cần tự quản lý useState nữa — React Query có sẵn cờ này
            onRefresh={refetch}       // Kéo tay xuống -> gọi lại trang 1, tự động cập nhật Cache
            // PHÂN TRANG THẬT: cuộn gần tới cuối danh sách -> tự động tải thêm trang kế tiếp
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5} // Kích hoạt khi còn cách đáy 50% chiều cao màn hình
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
              ) : null
            }
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