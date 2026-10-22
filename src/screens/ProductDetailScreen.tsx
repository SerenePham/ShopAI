import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@store/useCartStore';
import { API_BASE_URL } from '@constants/api';
import { Product, ProductSchema } from '../types/product.schema';
import { formatCurrency } from '@utils/formatCurrency';
import { COLORS, SIZES } from '@constants/theme';
import { HomeStackParamList } from '@navigation/HomeStackNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { getProductImageSource } from '@data/productImages';
import AddToCartModal from '@components/ui/AddToCartModal';
import axiosClient from '@api/axiosClient';

const fetchProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosClient.get<Product>(`/api/products/${id}`, {
      timeout: 5000,
    });
    const result = ProductSchema.safeParse(response.data);
    if (!result.success) {
      throw new Error('Dữ liệu chi tiết sản phẩm không hợp lệ (Zod)');
    }
    return result.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      throw new Error('Sản phẩm này không còn tồn tại trên hệ thống');
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error('Kết nối quá thời gian chờ (Timeout). Vui lòng thử lại!');
    }
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!');
  }
};

const getProductDescription = (product: Product): string => {
  if (product.description) return product.description;
  const cat = (product.category ?? '').toLowerCase();
  const name = product.name.toLowerCase();

  if (cat.includes('smart') || cat.includes('điện thoại') || name.includes('iphone') || name.includes('galaxy') || name.includes('pixel')) {
    return `${product.name} là siêu phẩm công nghệ được trang bị vi xử lý thế hệ mới, tối ưu hiệu năng mượt mà, màn hình hiển thị sắc nét cùng hệ thống camera AI chụp ảnh chuyên nghiệp. Thiết kế sang trọng, pin dung lượng lớn đáp ứng trọn vẹn cả ngày dài học tập, làm việc và giải trí đỉnh cao.`;
  }
  if (cat.includes('laptop') || name.includes('macbook') || name.includes('thinkpad')) {
    return `${product.name} sở hữu ngoại hình mỏng nhẹ tinh tế, khung viền kim loại cao cấp cùng hiệu năng mạnh mẽ xử lý mượt mà mọi tác vụ từ văn phòng, lập trình cho đến đồ họa. Bàn phím hành trình sâu êm ái, màn hình chống chói bảo vệ mắt và thời lượng pin vượt trội.`;
  }
  if (cat.includes('audio') || cat.includes('tai nghe') || cat.includes('loa') || name.includes('airpods') || name.includes('jbl') || name.includes('sony')) {
    return `${product.name} mang đến chất âm sống động với dải bass uy lực, mid ngọt ngào và treble trong trẻo. Tích hợp công nghệ chống ồn chủ động (ANC) tiên tiến, kết nối Bluetooth độ trễ thấp và kháng nước bụi giúp bạn thoải mái thưởng thức âm nhạc mọi lúc mọi nơi.`;
  }
  return `${product.name} là sản phẩm công nghệ chính hãng chất lượng cao tại ShopAI. Sản phẩm sở hữu độ hoàn thiện tinh xảo, độ bền vượt bậc cùng các tính năng thông minh giúp nâng tầm trải nghiệm sống hiện đại của bạn.`;
};

const ProductDetailScreen = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'ProductDetail'>>();
  const navigation = useNavigation<any>();
  const { productId } = route.params;
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const { colors, isDark } = useTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: product, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
    retry: 1,
    placeholderData: () =>
      queryClient
        .getQueryData<Product[]>(['productsList'])
        ?.find((p) => p.id === productId),
  });

  if (isLoading && !product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF5733" />
        <Text style={{ color: colors.textLight, marginTop: 12 }}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📡</Text>
        <Text style={[styles.errorText, { color: COLORS.danger, marginBottom: 16 }]}>
          {(error as Error)?.message ?? 'Không tìm thấy sản phẩm hoặc mất kết nối'}
        </Text>
        <Pressable
          style={[styles.backBtnFallback, { backgroundColor: '#FF5733', marginBottom: 12 }]}
          onPress={() => refetch()}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
            {isRefetching ? 'Đang thử lại...' : '🔄 Thử kết nối lại'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.backBtnFallback, { backgroundColor: isDark ? '#333333' : '#E5E7EB' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>← Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const stockCount = product.stock ?? 50;
  const ratingValue = product.rating ?? 4.9;
  const cleanId = product.id.replace('backend_prod_', '');

  const handleConfirmAddToCart = (prod: Product, qty: number) => {
    addItem(prod, qty);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 1. Header Navigation Bar */}
      <View style={[styles.navHeader, { backgroundColor: colors.surface, borderBottomColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBackBtn} hitSlop={10}>
          <Text style={[styles.navBackText, { color: colors.text }]}>← Quay lại</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          Chi tiết sản phẩm
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Cart')}
          style={styles.navCartBtn}
          hitSlop={10}
        >
          <Text style={{ fontSize: 18 }}>🛒</Text>
          {totalQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Ảnh sản phẩm lớn */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}>
          <Image
            source={getProductImageSource(product)}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* 3. Badges: ID sản phẩm, Danh mục, Tồn kho */}
        <View style={styles.badgesRow}>
          {/* ID món hàng */}
          <View style={[styles.badge, styles.idBadge, { backgroundColor: isDark ? '#262626' : '#EFF6FF', borderColor: isDark ? '#3B82F6' : '#BFDBFE' }]}>
            <Text style={[styles.badgeText, { color: isDark ? '#60A5FA' : '#1D4ED8' }]}>
              Mã SP: #{cleanId}
            </Text>
          </View>

          {/* Danh mục */}
          {product.category && (
            <View style={[styles.badge, { backgroundColor: isDark ? '#262626' : '#F3F4F6' }]}>
              <Text style={[styles.badgeText, { color: colors.textLight }]}>
                📁 {product.category}
              </Text>
            </View>
          )}

          {/* Số lượng tồn kho */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: stockCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: stockCount > 0 ? '#10B981' : '#EF4444', fontWeight: '700' },
              ]}
            >
              {stockCount > 0 ? `🟢 Còn ${stockCount} sản phẩm` : '🔴 Hết hàng'}
            </Text>
          </View>
        </View>

        {/* 4. Tên sản phẩm */}
        <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>

        {/* 5. Đánh giá & Giá bán */}
        <View style={styles.ratingPriceRow}>
          <View>
            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
            <Text style={[styles.installmentText, { color: colors.textLight }]}>
              Hỗ trợ trả góp 0% qua thẻ tín dụng
            </Text>
          </View>

          <View style={[styles.ratingBox, { backgroundColor: isDark ? '#262626' : '#FEF3C7' }]}>
            <Text style={styles.ratingText}>⭐ {ratingValue.toFixed(1)}</Text>
            <Text style={styles.reviewsCount}>(128+ đánh giá)</Text>
          </View>
        </View>

        {/* 6. Phần giới thiệu sản phẩm */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            📝 Giới thiệu món hàng
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textLight }]}>
            {getProductDescription(product)}
          </Text>

          {/* Cam kết bán hàng */}
          <View style={[styles.guaranteeBox, { backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB', borderTopColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeIcon}>🛡️</Text>
              <Text style={[styles.guaranteeText, { color: colors.text }]}>Cam kết chính hãng 100%</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeIcon}>🔄</Text>
              <Text style={[styles.guaranteeText, { color: colors.text }]}>Lỗi 1 đổi 1 trong 30 ngày</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeIcon}>🚚</Text>
              <Text style={[styles.guaranteeText, { color: colors.text }]}>Miễn phí vận chuyển toàn quốc</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeIcon}>🛠️</Text>
              <Text style={[styles.guaranteeText, { color: colors.text }]}>Bảo hành chính hãng 12 tháng</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7. Bottom Fixed Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: isDark ? '#2D2D2D' : '#E5E7EB' }]}>
        <Pressable
          style={[styles.outlineBtn, { borderColor: '#FF5733' }]}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.outlineBtnText}>🛒 Thêm vào giỏ</Text>
        </Pressable>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.primaryBtnText}>Mua ngay</Text>
        </Pressable>
      </View>

      {/* Pop-up chọn số lượng món hàng */}
      <AddToCartModal
        visible={isModalVisible}
        product={product}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleConfirmAddToCart}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backBtnFallback: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBackBtn: {
    paddingVertical: 4,
  },
  navBackText: {
    fontSize: 15,
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  navCartBtn: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  idBadge: {
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 12,
  },
  ratingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF5733',
  },
  installmentText: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  reviewsCount: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  guaranteeBox: {
    borderTopWidth: 1,
    paddingTop: 14,
    borderRadius: 10,
    gap: 10,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guaranteeIcon: {
    fontSize: 16,
  },
  guaranteeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    borderTopWidth: 1,
  },
  outlineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#FF5733',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;