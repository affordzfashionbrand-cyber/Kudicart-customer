import { ProductItem } from '@/data/homeData';

export interface CategoryItemDef {
  id: string;
  name: string;
  subtitle: string;
  gender: 'All' | 'Women' | 'Men' | 'Kids';
  wear: string;
  image: string;
  subcategories: string[];
}

export const CATEGORY_COLLECTIONS: CategoryItemDef[] = [
  {
    id: 'ethnic',
    name: 'Ethnic Wear',
    subtitle: 'Handloom Sarees & Kurta Sets',
    gender: 'Women',
    wear: 'Ethnic',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Ethnic', 'Sarees', 'Kurta Sets', 'Anarkali Suits', 'Raw Silk'],
  },
  {
    id: 'western',
    name: 'Western Wear',
    subtitle: 'Coats, Trousers & Maxi Dresses',
    gender: 'Women',
    wear: 'Western',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Western', 'Tailored Coats', 'Maxi Dresses', 'Trousers', 'Knits'],
  },
  {
    id: 'men',
    name: 'Men',
    subtitle: 'Linen Shirts, Denim & Kurtas',
    gender: 'Men',
    wear: 'All',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Men', 'Cotton Shirts', 'Selvedge Denim', 'Raw Silk Kurtas', 'Overshirts'],
  },
  {
    id: 'women',
    name: 'Women',
    subtitle: 'Chanderi Silks & Contemporary Cuts',
    gender: 'Women',
    wear: 'All',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Women', 'Handloom Sarees', 'Anarkali Suits', 'Wool Coats', 'Trousers'],
  },
  {
    id: 'topwear',
    name: 'Topwear',
    subtitle: 'Structured Shirts & Organic Tees',
    gender: 'All',
    wear: 'Tops',
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Tops', 'Structured Shirts', 'Overshirts', 'Breton Tees', 'Linen'],
  },
  {
    id: 'bottomwear',
    name: 'Bottom Wear',
    subtitle: 'Raw Selvedge Denim & Trousers',
    gender: 'All',
    wear: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Bottoms', 'Selvedge Denim', 'Wide-Leg Trousers', 'Linen Pants'],
  },
  {
    id: 'footwear',
    name: 'Footwear',
    subtitle: 'Court Leather Sneakers & Runners',
    gender: 'All',
    wear: 'Footwear',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Footwear', 'Leather Sneakers', 'Canvas Runners', 'Casual Loafers'],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    subtitle: 'Minimal Leather Totes & Belts',
    gender: 'All',
    wear: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Accessories', 'Leather Totes', 'Belts', 'Wallets'],
  },
  {
    id: 'kids',
    name: 'Kids',
    subtitle: 'Organic Cotton & Playful Linen',
    gender: 'Kids',
    wear: 'All',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Kids', 'Organic Tees', 'Linen Trousers', 'Canvas Runners'],
  },
  {
    id: 'beauty',
    name: 'Affordz Beauty',
    subtitle: 'Botanical Hydrating Serums',
    gender: 'Women',
    wear: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=85',
    subcategories: ['All Beauty', 'Hydrating Serums', 'Botanical Care'],
  },
];

export const GENDER_TABS: { id: 'All' | 'Women' | 'Men' | 'Kids'; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Women', label: 'Women' },
  { id: 'Men', label: 'Men' },
  { id: 'Kids', label: 'Kids' },
];

export interface AtelierStoreDef {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  type: 'DARK_STORE' | 'BRAND_BOUTIQUE';
  code: string;
  locality: string;
  distanceKm: number;
  deliveryMinutes: number;
  stockCount: number;
  badge: string;
  rating: string;
  image: string;
  features: string[];
  brands: string[];
  filterFn: (p: ProductItem) => boolean;
}

export const ATELIER_STORES: AtelierStoreDef[] = [
  {
    id: 'ds-indiranagar',
    name: 'Indiranagar Atelier Hub',
    shortName: 'Indiranagar Hub',
    tagline: 'Instant 18-minute doorstep try & buy',
    type: 'DARK_STORE',
    code: 'DS-01',
    locality: '100ft Road, Indiranagar',
    distanceKm: 1.2,
    deliveryMinutes: 18,
    stockCount: 4850,
    badge: '⚡ 18M FASTEST DROP',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=85',
    features: ['Instant Try & Buy', 'Steam Pressed Drops', 'Curated Runway Vault'],
    brands: ['AUREL', 'STUDIO 04', 'FORME', 'VARANASI LOOMS', 'GULABI STUDIO'],
    filterFn: (p: ProductItem) => {
      const b = (p.brand || '').toUpperCase();
      return ['AUREL', 'STUDIO 04', 'FORME', 'VARANASI LOOMS', 'GULABI STUDIO'].includes(b) || p.price < 8000;
    },
  },
  {
    id: 'ds-koramangala',
    name: 'Koramangala Atelier Depot',
    shortName: 'Koramangala Depot',
    tagline: 'Expanded festive, ethnic & evening wear',
    type: 'DARK_STORE',
    code: 'DS-02',
    locality: '5th Block, Koramangala',
    distanceKm: 2.4,
    deliveryMinutes: 22,
    stockCount: 5420,
    badge: '⚡ 22M EXPANDED VAULT',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=85',
    features: ['Festive Vault', 'Personal Stylist on Call', 'Express Exchange'],
    brands: ['VARANASI LOOMS', 'GULABI STUDIO', 'CHANDERI WEAVES', 'AUREL'],
    filterFn: (p: ProductItem) => {
      const cat = (p.category || '').toLowerCase();
      const wear = (p.wear || '').toLowerCase();
      return wear === 'ethnic' || cat === 'women' || Boolean(p.old && p.old > p.price);
    },
  },
  {
    id: 'ds-mgroad',
    name: 'MG Road Central Vault',
    shortName: 'Central Vault',
    tagline: 'Runway archive, western tailoring & shoes',
    type: 'DARK_STORE',
    code: 'DS-03',
    locality: 'Church Street, MG Road',
    distanceKm: 3.1,
    deliveryMinutes: 25,
    stockCount: 6200,
    badge: '⚡ 25M LUXURY SUITE',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=85',
    features: ['Full Silhouettes Archive', 'VIP Fitting Rider', 'Artisan Packaging'],
    brands: ['STUDIO 04', 'FORME', 'AUREL', 'SELVEDGE 88', 'MONK LEATHERS'],
    filterFn: (p: ProductItem) => {
      const wear = (p.wear || '').toLowerCase();
      return wear === 'western' || wear === 'tops' || wear === 'footwear' || p.price >= 3000;
    },
  },
  {
    id: 'boutique-varanasi',
    name: 'Varanasi Looms Atelier Flagship',
    shortName: 'Varanasi Looms',
    tagline: 'Zari weaves, organza silks & handlooms',
    type: 'BRAND_BOUTIQUE',
    code: 'BB-01',
    locality: 'Lavelle Road',
    distanceKm: 3.8,
    deliveryMinutes: 30,
    stockCount: 1250,
    badge: 'HERITAGE HANDLOOM',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    features: ['Direct Master Weavers', 'Numbered Limited Edition', 'Silk Mark Verified'],
    brands: ['VARANASI LOOMS', 'CHANDERI WEAVES'],
    filterFn: (p: ProductItem) => {
      const b = (p.brand || '').toUpperCase();
      return b.includes('VARANASI') || b.includes('LOOM') || b.includes('CHANDERI');
    },
  },
  {
    id: 'boutique-studio04',
    name: 'Studio 04 Contemporary Boutique',
    shortName: 'Studio 04 Boutique',
    tagline: 'Modern relaxed tailoring & raw denims',
    type: 'BRAND_BOUTIQUE',
    code: 'BB-02',
    locality: 'Jayanagar 4th Block',
    distanceKm: 4.5,
    deliveryMinutes: 35,
    stockCount: 980,
    badge: 'ARCHITECTURAL CUTS',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=85',
    features: ['Minimalist Silhouettes', 'Organic Japanese Twill', 'Unisex Essentials'],
    brands: ['STUDIO 04', 'SELVEDGE 88'],
    filterFn: (p: ProductItem) => {
      const b = (p.brand || '').toUpperCase();
      return b.includes('STUDIO') || b.includes('SELVEDGE');
    },
  },
  {
    id: 'boutique-aurel',
    name: 'Aurel Haute Prêt Flagship',
    shortName: 'Aurel Flagship',
    tagline: 'Curated couture, silk slips & fluid wool',
    type: 'BRAND_BOUTIQUE',
    code: 'BB-03',
    locality: 'UB City, Vittal Mallya Road',
    distanceKm: 2.9,
    deliveryMinutes: 28,
    stockCount: 840,
    badge: 'TAILORED LUXE',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
    features: ['Relaxed Wool Tailoring', 'Limited Drops', 'Doorstep Fitting'],
    brands: ['AUREL', 'FORME', 'GULABI STUDIO'],
    filterFn: (p: ProductItem) => {
      const b = (p.brand || '').toUpperCase();
      return b.includes('AUREL') || b.includes('FORME') || b.includes('GULABI');
    },
  },
];
