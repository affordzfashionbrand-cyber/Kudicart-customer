export interface BrandItem {
  id: string;
  name: string;
  tagline: string;
  discountOffer: string;
  logoInitial: string;
  bgColor: string;
  textColor: string;
}

export const MOCK_BRANDS: BrandItem[] = [
  {
    id: 'b-1',
    name: 'UrbanEdge',
    tagline: 'Modern Everyday Essentials',
    discountOffer: 'MIN. 40% OFF',
    logoInitial: 'UE',
    bgColor: '#1E293B',
    textColor: '#FFFFFF',
  },
  {
    id: 'b-2',
    name: 'ModeCraft',
    tagline: 'Tailored Streetwear & Denim',
    discountOffer: 'UP TO 50% OFF',
    logoInitial: 'MC',
    bgColor: '#111111',
    textColor: '#FFFFFF',
  },
  {
    id: 'b-3',
    name: 'StreetLab',
    tagline: 'Oversized & Graphic Cuts',
    discountOffer: 'FLAT 45% OFF',
    logoInitial: 'SL',
    bgColor: '#0F172A',
    textColor: '#38BDF8',
  },
  {
    id: 'b-4',
    name: 'Aura Luxe',
    tagline: 'Refined Accessories & Timepieces',
    discountOffer: 'MIN. 50% OFF',
    logoInitial: 'AL',
    bgColor: '#78350F',
    textColor: '#FDE68A',
  },
  {
    id: 'b-5',
    name: 'Trendify',
    tagline: 'Fast Fashion & Athleisure',
    discountOffer: 'BUY 1 GET 1 50%',
    logoInitial: 'TF',
    bgColor: '#831843',
    textColor: '#FBCFE8',
  },
  {
    id: 'b-6',
    name: 'NorthStyle',
    tagline: 'Heritage Outdoor & Outerwear',
    discountOffer: 'UP TO 60% OFF',
    logoInitial: 'NS',
    bgColor: '#14532D',
    textColor: '#BBF7D0',
  },
  {
    id: 'b-7',
    name: 'Rawastram',
    tagline: 'Handspun Handlooms of India',
    discountOffer: 'ARTISAN DIRECT',
    logoInitial: 'RW',
    bgColor: '#701A75',
    textColor: '#F5D0FE',
  },
  {
    id: 'b-8',
    name: 'Avanya',
    tagline: 'Chikankari & Silk Kurtis',
    discountOffer: 'FLAT 40% OFF',
    logoInitial: 'AV',
    bgColor: '#9F1239',
    textColor: '#FFE4E6',
  },
];
