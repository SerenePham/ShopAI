// C:\1_ShopMobile\ShopAI\src\data\productImages.ts

export const LOCAL_PRODUCT_IMAGES: any[] = [
  require('./ProductImages/AirPods4.png'),              // 0: Tai nghe AirPods 4
  require('./ProductImages/download (13).png'),         // 1: Tai nghe chùm đầu Sennheiser
  require('./ProductImages/download (14).png'),         // 2: Tai nghe Gaming Dareu Over-Ear
  require('./ProductImages/Galaxy_Buds4.png'),          // 3: Tai nghe Galaxy Buds4
  require('./ProductImages/download (12).png'),         // 4: Tai nghe In-ear HiFi Dual Dynamic
  require('./ProductImages/Asus_ROG_AzothX.png'),       // 5: Bàn phím cơ Asus ROG Azoth X
  require('./ProductImages/Aula_F108_Pink.png'),        // 6: Bàn phím cơ Aula F108 Pink
  require('./ProductImages/download (3).png'),          // 7: Bàn phím cơ MCHOSE Full-size
  require('./ProductImages/download (4).png'),          // 8: Bàn phím cơ Rapoo Tenkeyless
  require('./ProductImages/download (5).png'),          // 9: Bàn phím cơ AULA Mini-size 61 phím
  require('./ProductImages/download (6).png'),          // 10: Bàn phím cơ Logitech Tenkeyless
  require('./ProductImages/download (1).png'),          // 11: Chuột không dây Logitech MX Master 3S
  require('./ProductImages/download (2).png'),          // 12: Chuột Gaming Logitech G502 Hero
  require('./ProductImages/download (17).png'),         // 13: Chuột không dây E-Dra Wireless
  require('./ProductImages/Logitech_ProX2.png'),        // 14: Chuột Logitech Pro X Superlight 2
  require('./ProductImages/download (7).png'),          // 15: MacBook Air M3
  require('./ProductImages/download (8).png'),          // 16: Laptop Gaming MSI
  require('./ProductImages/download (9).png'),          // 17: iPad Pro M5 / Laptop
  require('./ProductImages/download (10).png'),         // 18: iPad Mini 6
  require('./ProductImages/download (11).png'),         // 19: Galaxy Tab S Series
  require('./ProductImages/download (15).png'),         // 20: Smart TV Xiaomi 65 inch
  require('./ProductImages/download (16).png'),         // 21: Smart TV Samsung QLED 65 inch
  require('./ProductImages/download.png'),              // 22: Màn hình Gaming LG UltraGear
  require('./ProductImages/download (18).png'),         // 23: Màn hình Cong ROG Strix 34 inch
  require('./ProductImages/Galaxy_Fold8_Ultra.png'),    // 24: Galaxy Fold 8 Ultra
  require('./ProductImages/Galaxy_Fold8.png'),          // 25: Galaxy Fold 8
  require('./ProductImages/Iphone_17.png'),             // 26: iPhone 17 Pro
  require('./ProductImages/S25_Ultra.png'),             // 27: Galaxy S25 Ultra AI
  require('./ProductImages/Iphone_Watch11.png'),        // 28: Apple Watch Series 11
  require('./ProductImages/Galaxy_Watch9.png'),         // 29: Galaxy Watch 9
];

export const PRODUCT_IMAGE_BY_FILENAME: Record<string, any> = {
  'AirPods4.png': require('./ProductImages/AirPods4.png'),
  'Asus_ROG_AzothX.png': require('./ProductImages/Asus_ROG_AzothX.png'),
  'Aula_F108_Pink.png': require('./ProductImages/Aula_F108_Pink.png'),
  'Galaxy_Buds4.png': require('./ProductImages/Galaxy_Buds4.png'),
  'Galaxy_Fold8.png': require('./ProductImages/Galaxy_Fold8.png'),
  'Galaxy_Fold8_Ultra.png': require('./ProductImages/Galaxy_Fold8_Ultra.png'),
  'Galaxy_Watch9.png': require('./ProductImages/Galaxy_Watch9.png'),
  'Iphone_17.png': require('./ProductImages/Iphone_17.png'),
  'Iphone_Watch11.png': require('./ProductImages/Iphone_Watch11.png'),
  'Logitech_ProX2.png': require('./ProductImages/Logitech_ProX2.png'),
  'S25_Ultra.png': require('./ProductImages/S25_Ultra.png'),
  'download.png': require('./ProductImages/download.png'),
  'download (1).png': require('./ProductImages/download (1).png'),
  'download (2).png': require('./ProductImages/download (2).png'),
  'download (3).png': require('./ProductImages/download (3).png'),
  'download (4).png': require('./ProductImages/download (4).png'),
  'download (5).png': require('./ProductImages/download (5).png'),
  'download (6).png': require('./ProductImages/download (6).png'),
  'download (7).png': require('./ProductImages/download (7).png'),
  'download (8).png': require('./ProductImages/download (8).png'),
  'download (9).png': require('./ProductImages/download (9).png'),
  'download (10).png': require('./ProductImages/download (10).png'),
  'download (11).png': require('./ProductImages/download (11).png'),
  'download (12).png': require('./ProductImages/download (12).png'),
  'download (13).png': require('./ProductImages/download (13).png'),
  'download (14).png': require('./ProductImages/download (14).png'),
  'download (15).png': require('./ProductImages/download (15).png'),
  'download (16).png': require('./ProductImages/download (16).png'),
  'download (17).png': require('./ProductImages/download (17).png'),
  'download (18).png': require('./ProductImages/download (18).png'),
};

/**
 * Trả về ảnh local tương ứng theo index hoặc id (vòng lặp tuần hoàn 30 ảnh)
 */
export function getLocalProductImage(idOrIndex: string | number): any {
  let num = 0;
  if (typeof idOrIndex === 'number') {
    num = idOrIndex;
  } else if (typeof idOrIndex === 'string') {
    const digits = idOrIndex.replace(/\D/g, '');
    num = digits ? parseInt(digits, 10) : 0;
  }
  // Id 1 -> index 0, Id 2 -> index 1...
  const targetIndex = num > 0 ? (num - 1) % LOCAL_PRODUCT_IMAGES.length : 0;
  return LOCAL_PRODUCT_IMAGES[targetIndex];
}

/**
 * Resolver an toàn: Trả về React Native ImageSource hợp lệ, không bao giờ bị vỡ ảnh
 */
export function getProductImageSource(
  product: { id?: string | number; image?: any; imageUrl?: any } | null | undefined,
  fallbackIndex: number = 0
): any {
  if (!product) {
    return LOCAL_PRODUCT_IMAGES[fallbackIndex % LOCAL_PRODUCT_IMAGES.length];
  }

  // 1. Nếu image đã là number (require static)
  if (typeof product.image === 'number') {
    return product.image;
  }

  // 2. Nếu image là tên file hoặc đường dẫn /images/...
  if (typeof product.image === 'string') {
    const filename = product.image.split('/').pop()?.trim() || '';
    if (filename && PRODUCT_IMAGE_BY_FILENAME[filename]) {
      return PRODUCT_IMAGE_BY_FILENAME[filename];
    }
  }

  // 3. Fallback: cycle theo ID hoặc fallbackIndex qua 30 ảnh local
  return getLocalProductImage(product.id ?? fallbackIndex);
}
