import { Alert } from 'react-native';

Alert.alert('ShopAI', 'Đã thêm vào giỏ', [
  { text: 'Ở lại', style: 'cancel' },
  { text: 'Xem giỏ', onPress: () => {} },
]);