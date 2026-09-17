export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  lock: number;
}

export const MOCK_PRODUCTS: Product[] = [
  // Tai nghe & Âm thanh
  {
    id: 'prod_1',
    name: 'Tai nghe Apple AirPods 4',
    price: 3490000,
    image: '/images/AirPods4.png',
    lock: 1,
  },
  {
    id: 'prod_2',
    name: 'Tai nghe Chùm Đầu Sennheiser',
    price: 4290000,
    image: '/images/download (13).png',
    lock: 2,
  },
  {
    id: 'prod_3',
    name: 'Tai nghe Gaming Dareu Over-Ear',
    price: 650000,
    image: '/images/download (14).png',
    lock: 3,
  },
  {
    id: 'prod_4',
    name: 'Tai nghe Samsung Galaxy Buds4',
    price: 2990000,
    image: '/images/Galaxy_Buds4.png',
    lock: 4,
  },
  {
    id: 'prod_5',
    name: 'Tai nghe In-ear HiFi Dual Dynamic',
    price: 890000,
    image: '/images/download (12).png',
    lock: 5,
  },

  // Bàn phím Cơ
  {
    id: 'prod_6',
    name: 'Bàn phím cơ Asus ROG Azoth X',
    price: 6200000,
    image: '/images/Asus_ROG_AzothX.png',
    lock: 6,
  },
  {
    id: 'prod_7',
    name: 'Bàn phím cơ Aula F108 Pink',
    price: 1350000,
    image: '/images/Aula_F108_Pink.png',
    lock: 7,
  },
  {
    id: 'prod_8',
    name: 'Bàn phím cơ MCHOSE Full-size RGB',
    price: 1850000,
    image: '/images/download (3).png',
    lock: 8,
  },
  {
    id: 'prod_9',
    name: 'Bàn phím cơ Rapoo Tenkeyless RGB',
    price: 990000,
    image: '/images/download (4).png',
    lock: 9,
  },
  {
    id: 'prod_10',
    name: 'Bàn phím cơ AULA Mini-size 61 phím',
    price: 750000,
    image: '/images/download (5).png',
    lock: 10,
  },
  {
    id: 'prod_11',
    name: 'Bàn phím cơ Logitech Tenkeyless LED RGB',
    price: 2100000,
    image: '/images/download (6).png',
    lock: 11,
  },

  // Chuột Máy Tính
  {
    id: 'prod_12',
    name: 'Chuột không dây Logitech MX Master 3S',
    price: 2490000,
    image: '/images/download (1).png',
    lock: 12,
  },
  {
    id: 'prod_13',
    name: 'Chuột Gaming Logitech G502 Hero RGB',
    price: 1290000,
    image: '/images/download (2).png',
    lock: 13,
  },
  {
    id: 'prod_14',
    name: 'Chuột không dây E-Dra Wireless 3200 DPI',
    price: 350000,
    image: '/images/download (17).png',
    lock: 14,
  },
  {
    id: 'prod_15',
    name: 'Chuột Gaming Logitech Pro X Superlight 2',
    price: 3390000,
    image: '/images/Logitech_ProX2.png',
    lock: 15,
  },

  // Laptop & Máy tính bảng
  {
    id: 'prod_16',
    name: 'Laptop Apple MacBook Air M3 13.0" 2.4K',
    price: 24990000,
    image: '/images/download (7).png',
    lock: 16,
  },
  {
    id: 'prod_17',
    name: 'Laptop Gaming MSI i7-13620H RTX 3050',
    price: 19890000,
    image: '/images/download (8).png',
    lock: 17,
  },
  {
    id: 'prod_18',
    name: 'Laptop Apple iPad Pro M5 13.6" 2.5K',
    price: 28990000,
    image: '/images/download (9).png',
    lock: 18,
  },
  {
    id: 'prod_19',
    name: 'Máy tính bảng iPad Mini 6',
    price: 11990000,
    image: '/images/download (10).png',
    lock: 19,
  },
  {
    id: 'prod_20',
    name: 'Máy tính bảng Samsung Galaxy Tab S Series',
    price: 15490000,
    image: '/images/download (11).png',
    lock: 20,
  },

  // Màn hình & Tivi
  {
    id: 'prod_21',
    name: 'Smart TV Xiaomi 65 inch HDR10+ 4K 60Hz',
    price: 10990000,
    image: '/images/download (15).png',
    lock: 21,
  },
  {
    id: 'prod_22',
    name: 'Smart TV Samsung QLED 65 inch 4K 50Hz',
    price: 14500000,
    image: '/images/download (16).png',
    lock: 22,
  },
  {
    id: 'prod_23',
    name: 'Màn hình Gaming LG UltraGear 27 inch 144Hz',
    price: 5490000,
    image: '/images/download.png',
    lock: 23,
  },
  {
    id: 'prod_24',
    name: 'Màn hình Cong ROG Strix 34 inch 240Hz UWQHD',
    price: 18900000,
    image: '/images/download (18).png',
    lock: 24,
  },

  // Điện thoại & Đồng hồ
  {
    id: 'prod_25',
    name: 'Điện thoại Samsung Galaxy Fold 8 Ultra',
    price: 41990000,
    image: '/images/Galaxy_Fold8_Ultra.png',
    lock: 25,
  },
  {
    id: 'prod_26',
    name: 'Điện thoại Samsung Galaxy Fold 8',
    price: 36990000,
    image: '/images/Galaxy_Fold8.png',
    lock: 26,
  },
  {
    id: 'prod_27',
    name: 'Điện thoại Apple iPhone 17 Pro',
    price: 29990000,
    image: '/images/Iphone_17.png',
    lock: 27,
  },
  {
    id: 'prod_28',
    name: 'Điện thoại Samsung Galaxy S25 Ultra AI',
    price: 27990000,
    image: '/images/S25_Ultra.png',
    lock: 28,
  },
  {
    id: 'prod_29',
    name: 'Đồng hồ thông minh Apple Watch Series 11',
    price: 9990000,
    image: '/images/Iphone_Watch11.png',
    lock: 29,
  },
  {
    id: 'prod_30',
    name: 'Đồng hồ thông minh Samsung Galaxy Watch 9',
    price: 7490000,
    image: '/images/Galaxy_Watch9.png',
    lock: 30,
  },
];