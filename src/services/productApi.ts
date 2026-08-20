// export type PostItem = {
//     id: number;
//     title: string;
//     body: string;
//   };
  
//   export async function fetchSamplePosts(): Promise<PostItem[]> {
//     const res = await fetch(
//       'https://jsonplaceholder.typicode.com/posts?_limit=10',
//     );
//     if (!res.ok) {
//       throw new Error(`HTTP ${res.status}`);
//     }
//     return res.json();
//   }

import {products, Product} from '@data/products';

export async function fetchProducts(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  return products;
}

export async function fetchProductById(
  id: number,
): Promise<Product | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return products.find(product => product.id === id);
}