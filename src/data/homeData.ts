import { Easing } from 'react-native';

export const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

export const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export interface ProductItem {
  id: number | string;
  brand: string;
  name: string;
  price: number;
  old: number;
  rating: string;
  category: string;
  wear: string;
  image: string;
  fulfillmentType?: 'DARK_STORE' | 'MARKETPLACE';
  tryAndBuyEligible?: boolean;
  fabric?: string;
  description?: string;
}

export const SEARCH_PLACEHOLDERS = [
  'Handloom Silk Sarees',
  'Embroidered Anarkali Sets',
  'Varanasi Looms',
  'Chanderi Silk Tunics',
  'Raw Silk Kurta for Men',
  'Tiered Floral Maxi Dresses',
  'Structured Cotton Shirts',
  'Raw Selvedge Denim',
  'Luxe Festive Kurtis',
  'Wide Leg Tailored Trousers',
];

export interface GenderCategoryItem {
  id: 'All' | 'Men' | 'Women' | 'Kids';
  name: string;
  image: string;
}

export const GENDER_CATEGORIES: GenderCategoryItem[] = [
  {
    id: 'All',
    name: 'All',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'Men',
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'Women',
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'Kids',
    name: 'Kids',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&auto=format&fit=crop&q=80',
  },
];

export interface WearCategoryItem {
  id: string;
  name: string;
  badge?: string;
  images: Record<'All' | 'Men' | 'Women' | 'Kids', string>;
}

export const WEAR_CATEGORIES: WearCategoryItem[] = [
  {
    id: 'Beauty',
    name: 'Beauty',
    badge: 'NEW',
    images: {
      All: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
  {
    id: 'Footwear',
    name: 'Footwear',
    images: {
      All: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
  {
    id: 'Accessories',
    name: 'Accessories',
    images: {
      All: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
  {
    id: 'Ethnic',
    name: 'Ethnic wear',
    badge: 'HOT',
    images: {
      All: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
  {
    id: 'Western',
    name: 'Westernwear',
    images: {
      All: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
  {
    id: 'Tops',
    name: 'Topwear',
    images: {
      All: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
  {
    id: 'Bottoms',
    name: 'Bottomwear',
    images: {
      All: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&h=200&q=80',
      Men: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=200&h=200&q=80',
      Women: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=200&h=200&q=80',
      Kids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=200&h=200&q=80',
    },
  },
];

export interface HeroBannerItem {
  id: string;
  tag: string;
  title1: string;
  title2: string;
  image: string;
  categoryTarget: 'All' | 'Men' | 'Women' | 'Kids';
  wearTarget?: string;
}

export const HERO_BANNERS: HeroBannerItem[] = [
  {
    id: 'banner-fashion-now',
    tag: 'DROP_04 • 00:28',
    title1: 'Fashion,',
    title2: 'now.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90',
    categoryTarget: 'Women',
    wearTarget: 'Western',
  },
  {
    id: 'banner-style-today',
    tag: "TODAY'S LOOK. TODAY.",
    title1: 'Style today,',
    title2: 'delivered now.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
    categoryTarget: 'Women',
    wearTarget: 'Ethnic',
  },
  {
    id: 'banner-urban-drop',
    tag: 'NEW DROP.',
    title1: 'Order. Change.',
    title2: 'go.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
    categoryTarget: 'Men',
    wearTarget: 'Tops',
  },
  {
    id: 'banner-metropolis',
    tag: 'URBAN EDITORIAL.',
    title1: "Fashion doesn't",
    title2: 'wait.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90',
    categoryTarget: 'All',
    wearTarget: 'Western',
  },
  {
    id: 'banner-timeless',
    tag: 'YOU ORDERED. WE MOVED.',
    title1: 'Timeless',
    title2: 'silhouettes.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90',
    categoryTarget: 'Women',
    wearTarget: 'Western',
  },
];

export interface BankOffer {
  id: string;
  bankName: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  code: string;
  details: string;
  discount: string;
  minSpend: string;
}

export const BANK_OFFERS: BankOffer[] = [
  {
    id: 'axis',
    bankName: 'AXIS BANK',
    badgeBg: '#861F41',
    title: '10% INSTANT DISCOUNT*',
    subtitle: 'On Axis Bank Credit Cards • Min Spend ₹2,499',
    code: 'AXIS10',
    details: 'Get 10% instant discount up to ₹1,000 on Axis Bank Credit Cards.',
    discount: '10% OFF up to ₹1,000',
    minSpend: '₹2,499',
  },
  {
    id: 'hdfc',
    bankName: 'HDFC BANK',
    badgeBg: '#004C8F',
    title: 'FLAT ₹500 OFF*',
    subtitle: 'On HDFC Credit & Debit Cards • Min ₹2,999',
    code: 'HDFC500',
    details: 'Flat ₹500 instant discount on all HDFC Bank Credit & Debit Cards.',
    discount: 'Flat ₹500 OFF',
    minSpend: '₹2,999',
  },
  {
    id: 'icici',
    bankName: 'ICICI BANK',
    badgeBg: '#B02A30',
    title: 'UP TO ₹1,500 DISCOUNT*',
    subtitle: 'On ICICI Net Banking & Cards • No Min Spend',
    code: 'ICICIMAX',
    details: 'Get 15% instant discount up to ₹1,500 on all ICICI Bank Netbanking and Cards.',
    discount: '15% OFF up to ₹1,500',
    minSpend: '₹1,999',
  },
  {
    id: 'sbi',
    bankName: 'SBI CARD',
    badgeBg: '#138808',
    title: '10% CASHBACK*',
    subtitle: 'On SBI Credit Cards • Code: SBISPECIAL',
    code: 'SBISPECIAL',
    details: '10% additional cashback credited directly to your SBI Card statement.',
    discount: '10% Cashback',
    minSpend: '₹3,000',
  },
  {
    id: 'onecard',
    bankName: 'ONECARD',
    badgeBg: '#18181b',
    title: 'FLAT ₹750 REBATE*',
    subtitle: 'On OneCard Metal Cards • Instant Apply',
    code: 'ONECART',
    details: 'Instant ₹750 instant rebate when checking out with OneCard metal credit cards.',
    discount: 'Flat ₹750 OFF',
    minSpend: '₹3,499',
  },
];

export interface VendorBrandTile {
  id: string;
  brand: string;
  subBrand?: string;
  discount: string;
  extraDiscount?: string;
  image: string;
  category: string;
}

export const VENDOR_BRAND_TILES: VendorBrandTile[] = [
  {
    id: 'buda-jeans',
    brand: 'BUDA',
    subBrand: 'JEANS CO',
    discount: 'Min. 75% Off*',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=85',
    category: 'Men',
  },
  {
    id: 'steve-madden',
    brand: 'STEVE MADDEN',
    discount: 'Min. 50% Off*',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85',
    category: 'Women',
  },
  {
    id: 'armani-exchange',
    brand: 'A | X',
    subBrand: 'ARMANI EXCHANGE',
    discount: 'Flat 40%',
    extraDiscount: '+ Extra 10% Off*',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85',
    category: 'Men',
  },
  {
    id: 'superdry',
    brand: 'SUPERDRY®',
    discount: 'Flat 50%',
    extraDiscount: '+ Extra 15% Off*',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=85',
    category: 'Men',
  },
  {
    id: 'adidas',
    brand: 'ADIDAS',
    discount: 'Min. 55%',
    extraDiscount: '+ Extra 5% Off*',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=85',
    category: 'All',
  },
  {
    id: 'shein',
    brand: 'SHEIN',
    discount: 'Min. 50% Off*',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85',
    category: 'Women',
  },
  {
    id: 'wrogn',
    brand: 'WROGN',
    discount: 'Min. 50%',
    extraDiscount: '+ Extra 10% Off*',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=85',
    category: 'Men',
  },
  {
    id: 'tommy-hilfiger',
    brand: 'TOMMY HILFIGER',
    discount: 'Flat 40%',
    extraDiscount: '+ Extra 10% Off*',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=85',
    category: 'All',
  },
  {
    id: 'new-balance',
    brand: 'NEW BALANCE',
    discount: 'Min. 50% Off*',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=85',
    category: 'All',
  },
];

export interface LuxeDealItem {
  id: string;
  brand: string;
  title: string;
  discount: string;
  image: string;
}

export const LUXE_WEEKEND_DEALS: LuxeDealItem[] = [
  {
    id: 'luxe-1',
    brand: 'MICHAEL KORS',
    title: 'Designer Leather Bags',
    discount: 'FLAT 35% OFF',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'luxe-2',
    brand: 'HUGO BOSS',
    title: 'Modern Tailored Suits',
    discount: 'UP TO 45% OFF',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'luxe-3',
    brand: 'VERSACE JEANS',
    title: 'Runway Atelier Tops',
    discount: 'MIN. 40% OFF',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'luxe-4',
    brand: 'COACH NEW YORK',
    title: 'Heritage Satchels',
    discount: 'FLAT 30% OFF',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=85',
  },
];

export interface TrendingCityItem {
  id: string;
  label: string;
  genderTarget: 'Men' | 'Women' | 'Kids' | 'All';
  wearTarget?: string;
  searchQuery?: string;
  image: string;
}

export const TRENDING_CITY_ITEMS: TrendingCityItem[] = [
  {
    id: 'city-1',
    label: 'Men - T-shirts',
    genderTarget: 'Men',
    wearTarget: 'Tops',
    searchQuery: 'T-Shirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'city-2',
    label: 'Women - Kurtas',
    genderTarget: 'Women',
    wearTarget: 'Ethnic',
    searchQuery: 'Kurta',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'city-3',
    label: 'Women - T-shirts',
    genderTarget: 'Women',
    wearTarget: 'Tops',
    searchQuery: 'T-Shirt',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'city-4',
    label: 'Men - Shirts',
    genderTarget: 'Men',
    wearTarget: 'Tops',
    searchQuery: 'Shirt',
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'city-5',
    label: 'Women - Dresses',
    genderTarget: 'Women',
    wearTarget: 'Western',
    searchQuery: 'Dress',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'city-6',
    label: 'Sneakers & Kicks',
    genderTarget: 'All',
    wearTarget: 'Footwear',
    searchQuery: 'Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=85',
  },
];

export interface CuratedBrandBadge {
  text: string;
  isItalic?: boolean;
  isBadge?: boolean;
}

export interface CuratedDealCard {
  id: string;
  brandBadges: CuratedBrandBadge[];
  tierTag: string;
  image: string;
  gender: 'Men' | 'Women';
  wear?: string;
  searchQuery?: string;
}

export const FOR_HIM_DEALS: CuratedDealCard[] = [
  {
    id: 'him-1',
    brandBadges: [
      { text: 'asian', isItalic: true },
      { text: 'Bata', isItalic: true },
    ],
    tierTag: 'UNDER ₹999*',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85',
    gender: 'Men',
    wear: 'Footwear',
    searchQuery: 'Shoes',
  },
  {
    id: 'him-2',
    brandBadges: [
      { text: 'ALPHA TRIBE', isBadge: true },
      { text: 'NEO Nomad' },
    ],
    tierTag: 'UNDER ₹649*',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85',
    gender: 'Men',
    wear: 'Tops',
    searchQuery: 'Co-ord',
  },
  {
    id: 'him-3',
    brandBadges: [
      { text: 'popmantra' },
    ],
    tierTag: 'UNDER ₹499*',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=85',
    gender: 'Men',
    wear: 'Tops',
    searchQuery: 'T-Shirt',
  },
];

export const FOR_HER_DEALS: CuratedDealCard[] = [
  {
    id: 'her-1',
    brandBadges: [
      { text: 'Zade & Jude', isItalic: true },
      { text: 'EMERALDA' },
    ],
    tierTag: 'MIN. 80% OFF*',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85',
    gender: 'Women',
    wear: 'Tops',
    searchQuery: 'Tunic',
  },
  {
    id: 'her-2',
    brandBadges: [
      { text: 'asics', isItalic: true },
      { text: 'UNDER ARMOUR' },
    ],
    tierTag: 'MIN. 45% OFF*',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=85',
    gender: 'Women',
    wear: 'Activewear',
    searchQuery: 'Activewear',
  },
  {
    id: 'her-3',
    brandBadges: [
      { text: 'SVARA' },
      { text: 'RAWASTRAM' },
    ],
    tierTag: 'MIN. 70% OFF*',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
    gender: 'Women',
    wear: 'Ethnic',
    searchQuery: 'Saree',
  },
];

export interface BudgetStoreItem {
  id: string;
  tier: string;
  tagline: string;
  maxPrice: number;
  badge: string;
  image: string;
}

export const BUDGET_STORE_ITEMS: BudgetStoreItem[] = [
  {
    id: 'budget-499',
    tier: 'UNDER ₹499',
    tagline: 'Tees, Camis & Daily Staples',
    maxPrice: 499,
    badge: 'STEAL DEALS',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'budget-799',
    tier: 'UNDER ₹799',
    tagline: 'Casual Shirts, Kurtas & Crops',
    maxPrice: 799,
    badge: 'DAILY HEROES',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'budget-1299',
    tier: 'UNDER ₹1,299',
    tagline: 'Co-ords, Denim & Evening Wear',
    maxPrice: 1299,
    badge: 'POPULAR PICKS',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'budget-1999',
    tier: 'UNDER ₹1,999',
    tagline: 'Handloom Silks, Blazers & Kicks',
    maxPrice: 1999,
    badge: 'PREMIUM FINDS',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=85',
  },
];

export interface TrendRadarItem {
  id: string;
  aesthetic: string;
  description: string;
  tag: string;
  searchQuery: string;
  image: string;
}

export const TREND_RADAR_ITEMS: TrendRadarItem[] = [
  {
    id: 'trend-old-money',
    aesthetic: 'OLD MONEY',
    description: 'Linen trousers, polo knits & timeless neutrals',
    tag: 'QUIET LUXURY',
    searchQuery: 'Linen',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'trend-streetwear',
    aesthetic: 'STREET REBEL',
    description: 'Heavyweight tees, baggy cargos & retro sneakers',
    tag: 'FWD_DROP',
    searchQuery: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'trend-handloom',
    aesthetic: 'HERITAGE WEAVE',
    description: 'Pure zari borders, Chanderi & royal festive drapes',
    tag: 'ROYAL ATELIER',
    searchQuery: 'Silk Saree',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'trend-resort',
    aesthetic: 'RESORT CHIC',
    description: 'Breezy camp-collar sets & sun-drenched palettes',
    tag: 'SUMMER_26',
    searchQuery: 'Co-ord',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=85',
  },
];
