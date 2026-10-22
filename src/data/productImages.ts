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
 * Ánh xạ tên và danh mục sản phẩm tới file ảnh gần đúng nhất
 */
export function resolveProductImageFilename(name?: string, category?: string): string {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // 1. Điện thoại gập
  if (n.includes('fold') || n.includes('flip')) {
    if (n.includes('ultra')) return 'Galaxy_Fold8_Ultra.png';
    return 'Galaxy_Fold8.png';
  }

  // 2. iPhone
  if (n.includes('iphone')) {
    return 'Iphone_17.png';
  }

  // 3. Samsung Galaxy / Smartphone Android
  if (n.includes('galaxy s') || n.includes('s24') || n.includes('s23') || n.includes('s25')) {
    return 'S25_Ultra.png';
  }
  if (
    c.includes('smartphone') ||
    n.includes('xiaomi') ||
    n.includes('redmi') ||
    n.includes('poco') ||
    n.includes('oppo') ||
    n.includes('vivo') ||
    n.includes('realme') ||
    n.includes('pixel') ||
    n.includes('rog phone') ||
    n.includes('galaxy a')
  ) {
    return 'S25_Ultra.png';
  }

  // 4. Laptop
  if (n.includes('macbook')) {
    return 'download (7).png';
  }
  if (
    n.includes('legion') ||
    n.includes('tuf') ||
    n.includes('zephyrus') ||
    n.includes('nitro') ||
    n.includes('msi') ||
    n.includes('gaming')
  ) {
    return 'download (8).png';
  }
  if (
    c.includes('laptop') ||
    n.includes('xps') ||
    n.includes('inspiron') ||
    n.includes('envy') ||
    n.includes('zenbook') ||
    n.includes('vivobook') ||
    n.includes('thinkpad') ||
    n.includes('swift')
  ) {
    return 'download (7).png';
  }

  // 5. Tablet
  if (n.includes('ipad mini')) {
    return 'download (10).png';
  }
  if (n.includes('ipad')) {
    return 'download (9).png';
  }
  if (n.includes('galaxy tab') || c.includes('tablet') || n.includes('xiaomi pad')) {
    return 'download (11).png';
  }

  // 6. Smartwatch
  if (n.includes('apple watch') || (c.includes('smartwatch') && n.includes('apple'))) {
    return 'Iphone_Watch11.png';
  }
  if (
    c.includes('smartwatch') ||
    n.includes('galaxy watch') ||
    n.includes('garmin') ||
    n.includes('huawei watch') ||
    n.includes('amazfit') ||
    n.includes('watch')
  ) {
    return 'Galaxy_Watch9.png';
  }

  // 7. Tai nghe / Audio
  if (n.includes('airpods')) {
    return 'AirPods4.png';
  }
  if (n.includes('galaxy buds')) {
    return 'Galaxy_Buds4.png';
  }
  if (n.includes('sennheiser') || n.includes('wh-1000xm') || n.includes('chụp tai') || n.includes('over-ear')) {
    return 'download (13).png';
  }
  if (n.includes('headset') || n.includes('dareu') || (c.includes('audio') && n.includes('gaming'))) {
    return 'download (14).png';
  }
  if (
    c.includes('audio') ||
    n.includes('tai nghe') ||
    n.includes('buds') ||
    n.includes('freebuds') ||
    n.includes('loa') ||
    n.includes('soundbar')
  ) {
    return 'download (12).png';
  }

  // 8. Chuột
  if (n.includes('mx master') || n.includes('vertical')) {
    return 'download (1).png';
  }
  if (n.includes('pro x') || n.includes('superlight') || n.includes('viper') || n.includes('deathadder')) {
    return 'Logitech_ProX2.png';
  }
  if (n.includes('g502') || n.includes('basilisk') || (c.includes('chuột') && n.includes('gaming'))) {
    return 'download (2).png';
  }
  if (c.includes('mouse') || c.includes('chuột') || n.includes('chuột') || n.includes('mouse')) {
    return 'download (17).png';
  }

  // 9. Bàn phím
  if (n.includes('azoth') || n.includes('rog')) {
    return 'Asus_ROG_AzothX.png';
  }
  if (n.includes('aula f108') || n.includes('pink') || n.includes('hồng')) {
    return 'Aula_F108_Pink.png';
  }
  if (n.includes('aula')) {
    return 'download (5).png';
  }
  if (n.includes('mchose') || n.includes('full-size') || n.includes('fullsize') || n.includes('108')) {
    return 'download (3).png';
  }
  if (n.includes('rapoo') || n.includes('akko') || n.includes('keychron') || n.includes('tkl')) {
    return 'download (4).png';
  }
  if (
    n.includes('logitech') &&
    (c.includes('keyboard') || n.includes('phím') || n.includes('g512') || n.includes('g913'))
  ) {
    return 'download (6).png';
  }
  if (c.includes('keyboard') || c.includes('bàn phím') || n.includes('bàn phím') || n.includes('keyboard')) {
    return 'download (3).png';
  }

  // 10. Màn hình & TV
  if (n.includes('cong') || n.includes('curved') || n.includes('34') || n.includes('ultrawide') || n.includes('strix')) {
    return 'download (18).png';
  }
  if (n.includes('tv') || n.includes('tivi') || c.includes('tv')) {
    if (n.includes('samsung') || n.includes('qled') || n.includes('oled')) return 'download (16).png';
    return 'download (15).png';
  }
  if (
    c.includes('monitor') ||
    c.includes('màn hình') ||
    n.includes('màn hình') ||
    n.includes('ultragear') ||
    n.includes('asus') ||
    n.includes('dell')
  ) {
    return 'download.png';
  }

  return 'download (7).png';
}

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
 * Resolver an toàn: Trả về React Native ImageSource hợp lệ, không bao giờ bị vỡ ảnh.
 * Ưu tiên nhận dạng đúng hình ảnh tĩnh theo tên sản phẩm.
 */
export function getProductImageSource(
  product: { id?: string | number; name?: string; category?: string; image?: any; imageUrl?: any } | null | undefined,
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

  // 3. Nếu có tên sản phẩm, suy luận hình ảnh gần đúng nhất dựa trên tên
  if (product.name) {
    const inferredFilename = resolveProductImageFilename(product.name, product.category);
    if (inferredFilename && PRODUCT_IMAGE_BY_FILENAME[inferredFilename]) {
      return PRODUCT_IMAGE_BY_FILENAME[inferredFilename];
    }
  }

  // 4. Fallback: cycle theo ID hoặc fallbackIndex qua 30 ảnh local
  return getLocalProductImage(product.id ?? fallbackIndex);
}
