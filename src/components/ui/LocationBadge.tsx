import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCurrentLocation } from '@hooks/useCurrentLocation';
import {
  DEFAULT_SHIPPING_FEE,
  WAREHOUSE_COORDS,
  getDistanceKm,
  getShippingTier,
} from '@constants/shipping';
import { SIZES } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';

const formatVnd = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

const LocationBadge = () => {
  const { coords, loading, error, refresh } = useCurrentLocation();
  const { isDark } = useTheme();

  // --- Trạng thái 1: Đang dò GPS ---
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.leftContent}>
          <ActivityIndicator size="small" color="#D97706" />
          <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
            {' '}Đang dò tín hiệu GPS...
          </Text>
        </View>
      </View>
    );
  }

  // --- Trạng thái 2: Lỗi / Chưa bắt được GPS -> Hiển thị đúng câu lệnh yêu cầu ---
  if (error || !coords) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.leftContent}>
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={[styles.statusText, isDark && styles.statusTextDark]} numberOfLines={1}>
            Không bắt được tín hiệu GPS — tạm tính ship {formatVnd(DEFAULT_SHIPPING_FEE)}
          </Text>
        </View>
        <Pressable onPress={refresh} hitSlop={8} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  // --- Trạng thái 3: Đã bắt được GPS ---
  const distanceKm = getDistanceKm(
    coords.latitude,
    coords.longitude,
    WAREHOUSE_COORDS.latitude,
    WAREHOUSE_COORDS.longitude,
  );
  const tier = getShippingTier(distanceKm);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.leftContent}>
        <Text style={styles.pinIcon}>📍</Text>
        <Text style={[styles.statusText, isDark && styles.statusTextDark]} numberOfLines={1}>
          Cách kho {distanceKm.toFixed(1)} km — Phí ship: {formatVnd(tier.fee)}
        </Text>
      </View>
      <Pressable onPress={refresh} hitSlop={8} style={styles.actionBtn}>
        <Text style={styles.actionBtnText}>Thử lại</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF9C3', // Light yellow alert container
    borderColor: '#FDE047',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: SIZES.padding,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  containerDark: {
    backgroundColor: '#2D2813',
    borderColor: '#605018',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#854D0E', // Dark yellow/amber text
    flex: 1,
    fontWeight: '500',
  },
  statusTextDark: {
    color: '#FDE68A',
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FDE047',
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#713F12',
  },
});

export default LocationBadge;