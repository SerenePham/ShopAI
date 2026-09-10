export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  lock: number;
}

const PRODUCT_NAMES = [
  'Tai nghe Bluetooth Pro',
  'Tai nghe Wireless Bass+',
  'Tai nghe Gaming RGB',
  'Tai nghe Noise Cancelling',
  'Tai nghe AirSound Mini',
  'Tai nghe Sport Bluetooth',
  'Tai nghe Premium ANC',
  'Tai nghe Earbuds Pro',
  'Tai nghe Stereo Max',
  'Tai nghe Bluetooth Lite',
];

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=400&h=400&fit=crop',
];

export const MOCK_PRODUCTS: Product[] = Array.from(
  { length: 50 },
  (_, index) => ({
    id: `prod_${index + 1}`,
    name: `${PRODUCT_NAMES[index % PRODUCT_NAMES.length]} ${index + 1}`,
    price: 399000 + (index % 10) * 100000,
    image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
    lock: index + 1,
  }),
);