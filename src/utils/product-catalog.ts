import { ProductItem } from '@/data/homeData';

export function getEnrichedProductCatalog(apiProducts: any[] = []): ProductItem[] {
  const map = new Map<string, ProductItem>();

  if (apiProducts && apiProducts.length > 0) {
    apiProducts.forEach((sp) => {
      if (!map.has(String(sp.id))) {
        map.set(String(sp.id), {
          id: sp.id,
          brand: sp.brand || 'Affordz',
          name: sp.title || sp.name || 'Curated Garment',
          price: Number(sp.price) || 0,
          old: sp.originalPrice || sp.old || Math.round((Number(sp.price) || 0) * 1.3),
          rating: String(sp.rating || '4.8'),
          category: sp.category || 'Women',
          wear: sp.wear || 'Tops',
          image: sp.image || (sp.galleryImages && sp.galleryImages[0]) || '',
          fulfillmentType: sp.fulfillmentType,
          tryAndBuyEligible: sp.tryAndBuyEligible,
          fabric: sp.fabric,
          description: sp.description,
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
