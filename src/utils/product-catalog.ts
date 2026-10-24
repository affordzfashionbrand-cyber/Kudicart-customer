import { DEFAULT_PRODUCTS, ALGO_PRODUCTS, ProductItem } from '@/data/homeData';
import { MOCK_PRODUCTS, MockProduct } from '@/data/mockProducts';

export function getEnrichedProductCatalog(apiProducts: any[] = []): ProductItem[] {
  const map = new Map<string, ProductItem>();

  // 1. Default products
  DEFAULT_PRODUCTS.forEach((p) => {
    map.set(String(p.id), {
      id: String(p.id),
      brand: p.brand,
      name: p.name,
      price: p.price,
      old: p.old,
      rating: String(p.rating || '4.8'),
      category: p.category,
      wear: p.wear,
      image: p.image,
    });
  });

  // 2. Algo products
  ALGO_PRODUCTS.forEach((p) => {
    if (!map.has(String(p.id))) {
      map.set(String(p.id), {
        id: String(p.id),
        brand: p.brand,
        name: p.name,
        price: p.price,
        old: p.old,
        rating: String(p.rating || '4.8'),
        category: p.category,
        wear: p.wear,
        image: p.image,
      });
    }
  });

  // 3. Mock products
  MOCK_PRODUCTS.forEach((mp: MockProduct) => {
    if (!map.has(String(mp.id))) {
      let mappedWear = 'Tops';
      if (mp.category === 'kurtas') mappedWear = 'Ethnic';
      else if (mp.category === 'jeans') mappedWear = 'Bottoms';
      else if (mp.category === 'shoes') mappedWear = 'Footwear';
      else if (mp.category === 'dresses') mappedWear = 'Western';
      else if (mp.category === 'beauty') mappedWear = 'Beauty';
      else if (mp.category === 'accessories' || mp.category === 'watches') mappedWear = 'Accessories';

      let mappedGender = 'Women';
      if (mp.gender === 'men') mappedGender = 'Men';
      else if (mp.gender === 'kids') mappedGender = 'Kids';

      map.set(String(mp.id), {
        id: mp.id,
        brand: mp.brand,
        name: mp.name,
        price: mp.price,
        old: mp.originalPrice,
        rating: String(mp.rating),
        category: mappedGender,
        wear: mappedWear,
        image: mp.image,
      });
    }
  });

  // 4. API Catalog Store Products
  if (apiProducts && apiProducts.length > 0) {
    apiProducts.forEach((sp) => {
      if (!map.has(String(sp.id))) {
        map.set(String(sp.id), {
          id: sp.id,
          brand: sp.brand,
          name: sp.title || sp.name,
          price: sp.price,
          old: sp.originalPrice || Math.round(sp.price * 1.3),
          rating: String(sp.rating || '4.8'),
          category: sp.category || 'Women',
          wear: sp.wear || 'Tops',
          image: sp.image || (sp.galleryImages && sp.galleryImages[0]) || '',
        });
      }
    });
  }

  return Array.from(map.values());
}

export function sortProductList(products: ProductItem[], sort: string): ProductItem[] {
  const list = [...products];
  switch (sort) {
    case 'price_asc':
    case 'PRICE_LOW_HIGH':
      return list.sort((a, b) => a.price - b.price);
    case 'price_desc':
    case 'PRICE_HIGH_LOW':
      return list.sort((a, b) => b.price - a.price);
    case 'rating':
    case 'RATING':
      return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    case 'DISCOUNT':
      return list.sort((a, b) => {
        const discA = a.old ? a.old - a.price : 0;
        const discB = b.old ? b.old - b.price : 0;
        return discB - discA;
      });
    case 'featured':
    case 'FEATURED':
    default:
      return list;
  }
}
