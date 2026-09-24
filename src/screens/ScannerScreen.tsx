import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native'; // Biết màn hình có đang hiển thị hay không
import ShopButton from '@components/ui/ShopButton';
import { COLORS } from '@constants/theme';
import { hapticSuccess } from '@utils/haptics'; // Tiện ích rung vừa viết ở Bước 3

// Ba trạng thái của "cánh cổng quyền" — thay cho biến boolean cụt ngủn ban đầu.
// 'checking' = đang hỏi OS | 'granted' = được phép | 'denied' = bị chặn
type PermissionState = 'checking' | 'granted' | 'denied';

// Nhận tham số navigation từ React Navigation V7
const ScannerScreen = ({ navigation }: any) => {
  const [permission, setPermission] = useState<PermissionState>('checking');
  const device = useCameraDevice('back'); // Chọn ống kính mặt lưng
  const isFocused = useIsFocused(); // true nếu màn hình này đang ở trên cùng

  // "CÁI KHÓA" chống quét lặp — dùng useRef vì đổi giá trị không cần re-render lại UI
  const isScanning = useRef(false);

  // 1. Hàm xin/kiểm tra quyền — tách riêng để AppState gọi lại được
  const requestPermission = useCallback(async () => {
    // getCameraPermissionStatus() đọc trạng thái HIỆN TẠI mà không bung Pop-up.
    // Gọi nó trước để tránh làm phiền user nếu quyền đã được cấp từ trước.
    const current = Camera.getCameraPermissionStatus();
    if (current === 'granted') {
      setPermission('granted');
      return;
    }

    // Chưa có quyền -> gọi thẳng xuống C++/Native OS để bung Pop-up
    const status = await Camera.requestCameraPermission();
    setPermission(status === 'granted' ? 'granted' : 'denied');
  }, []);

  // 2. Xin quyền ở Runtime khi màn hình vừa Mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // 3. Khi user rời app sang Settings bật quyền rồi quay lại -> dò lại quyền
  //    Thiếu đoạn này, app sẽ vẫn hiện màn hình lỗi dù quyền đã được bật (Phần 7.5).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') requestPermission();
    });
    return () => sub.remove(); // Dọn listener khi rời màn hình, tránh rò rỉ bộ nhớ
  }, [requestPermission]);

  // 4. Mở thẳng trang Cài đặt của chính app ShopAI trong Settings hệ thống
  const openAppSettings = () => {
    Alert.alert(
      'Cần quyền Camera',
      'Bạn đã từ chối quyền Camera nên ShopAI không thể quét mã vạch. Hãy vào Cài đặt > ShopAI và bật lại quyền Camera nhé.',
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
      ],
    );
  };

  // 5. Logic Máy Quét (Vision Scanner JSI) — có khóa Debounce + rung phản hồi
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'], // QR, mã vạch siêu thị, mã vạch kho hàng
    onCodeScanned: (codes) => {
      // Nếu đã xử lý 1 lần rồi thì bỏ qua toàn bộ các lần quét dồn dập tiếp theo
      if (isScanning.current) return;
      if (codes.length === 0) return;

      const value = codes[0].value;
      if (!value) return; // Vision Camera có thể trả về mã rỗng khi ảnh mờ

      isScanning.current = true; // Đóng khóa lại NGAY LẬP TỨC
      console.log('Phát hiện mã:', value);

      // 📳 RUNG PHẢN HỒI: user biết đã quét trúng mà không cần nhìn màn hình.
      // Đặt NGAY SAU khi đóng khóa, TRƯỚC khi navigate — để cảm giác tức thời nhất.
      hapticSuccess();

      // Quét xong, bắn dữ liệu về HomeScreen (navigate sẽ tự unmount màn hình này)
      navigation.navigate('Home', { scannedCode: value });
    },
  });

  // ---------- Các trạng thái giao diện ----------

  // A. Đang hỏi hệ điều hành
  if (permission === 'checking') {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Đang kiểm tra quyền Camera...</Text>
      </View>
    );
  }

  // B. Bị từ chối -> KHÔNG để user kẹt ở màn hình trắng, phải cho lối thoát rõ ràng
  if (permission === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.deniedTitle}>Chưa có quyền Camera</Text>
        <Text style={styles.deniedDesc}>
          ShopAI cần Camera để quét mã vạch sản phẩm. Ảnh chỉ được xử lý ngay trên máy
          của bạn và không bao giờ được gửi đi đâu cả.
        </Text>
        <ShopButton
          title="Mở Cài đặt"
          onPress={openAppSettings}
          style={{ width: 200, marginBottom: 12 }}
        />
        <ShopButton
          title="Quay lại"
          onPress={() => navigation.goBack()}
          style={{ width: 200, backgroundColor: COLORS.secondary }}
        />
      </View>
    );
  }

  // C. Có quyền nhưng máy không có ống kính sau (rất hiếm, nhưng Simulator hay dính)
  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Thiết bị không có Camera sau!</Text>
        <Text style={styles.deniedDesc}>
          Bạn có đang chạy trên máy ảo (Simulator/Emulator) không? Camera bắt buộc phải
          chạy trên điện thoại thật.
        </Text>
        <ShopButton title="Quay lại" onPress={() => navigation.goBack()} style={{ width: 200 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 6. Component C++ vẽ luồng Video 60FPS thẳng lên màn hình */}
      <Camera
        style={StyleSheet.absoluteFill} // Bọc kín toàn màn hình
        device={device}
        // isActive gắn với useIsFocused: Rời màn hình (chuyển Tab/Back) -> Camera TẮT NGAY
        // Tiết kiệm Pin và RAM, tránh giữ Camera mở ngầm không cần thiết
        isActive={isFocused}
        codeScanner={codeScanner} // Gắn cỗ máy quét vào ống kính
      />

      {/* 7. Khung ngắm giúp user biết đưa mã vào đâu — thuần UI, không ảnh hưởng logic quét */}
      <View style={styles.frameWrapper} pointerEvents="none">
        <View style={styles.frame} />
      </View>

      <View style={styles.bottomControls}>
        <Text style={styles.instruction}>
          Đưa mã vạch vào khung hình
        </Text>

        <ShopButton
          title="Hủy bỏ"
          onPress={() => navigation.goBack()}
          style={{
            width: 150,
            backgroundColor: COLORS.error,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  stateText: { fontSize: 16, marginBottom: 12, textAlign: 'center' },
  deniedTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: COLORS.error },
  deniedDesc: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  frameWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginTop: -125,
    marginLeft: -125,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },
  bottomControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    alignItems: 'center',
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
});

export default ScannerScreen;