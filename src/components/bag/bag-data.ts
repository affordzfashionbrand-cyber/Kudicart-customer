export interface BagProductItem {
  id: string | number;
  brand: string;
  name: string;
  price: number;
  image: string;
}

export const VAULT_EXCLUSIVE_DEALS = [
  {
    id: 'vault-deal-1',
    productId: 'v-deal-1',
    brand: 'MAISON ÉCLAT',
    title: 'Santal 33 Artisan Travel Decant (10ml)',
    price: 99,
    originalPrice: 799,
    discountBadge: '88% OFF',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    category: 'Fragrance',
  },
  {
    id: 'vault-deal-2',
    productId: 'v-deal-2',
    brand: 'ATELIER KUDI',
    title: 'Pure Mulberry Silk Pocket Square',
    price: 49,
    originalPrice: 499,
    discountBadge: '90% OFF',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    category: 'Accessories',
  },
  {
    id: 'vault-deal-3',
    productId: 'v-deal-3',
    brand: 'VINTAGE FLORENTINE',
    title: 'Hand-Finished Minimalist Leather Cardholder',
    price: 149,
    originalPrice: 999,
    discountBadge: '85% OFF',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80',
    category: 'Leather',
  },
];

export const ENSEMBLE_ADDONS = [
  {
    id: 'addon-1',
    brand: 'KUDI EYEWEAR',
    title: 'Midnight Square Acetate Sunglasses',
    price: 1290,
    originalPrice: 2490,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'addon-2',
    brand: 'AUREL',
    title: 'Hammered Brass Statement Cuff',
    price: 890,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1611591475870-761a10ebf118?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'addon-3',
    brand: 'STUDIO 04',
    title: 'Organic Pima Cotton Ribbed Socks (Set of 2)',
    price: 390,
    originalPrice: 790,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=400&q=80',
  },
];

export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  KUDI100: { discount: 100, label: '₹100 Atelier Welcome Voucher Applied' },
  VAULT200: { discount: 200, label: '₹200 Vault Member Special Applied' },
  FIRSTTRY: { discount: 150, label: '₹150 First Doorstep Try-On Offer' },
};
