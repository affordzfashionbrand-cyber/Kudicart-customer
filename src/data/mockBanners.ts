export interface HeroBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  accentColor: string;
  theme: 'dark' | 'light' | 'berry';
}

export const HERO_BANNERS: HeroBanner[] = [
  {
    id: 'hb-1',
    badge: 'AFFORDZ BEAUTY EDIT',
    title: 'Discover Your Everyday Glow',
    subtitle: 'Artisan fragrances, pure botanical skin elixirs & premium care',
    ctaText: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#111111',
    theme: 'berry',
  },
  {
    id: 'hb-2',
    badge: 'NEW SEASON ARRIVALS',
    title: 'Contemporary Weaves & Silhouettes',
    subtitle: 'Fresh handloom cuts designed for modern festive & workwear wardrobes',
    ctaText: 'EXPLORE',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#D97706',
    theme: 'light',
  },
  {
    id: 'hb-3',
    badge: 'GRAND FESTIVE EDIT',
    title: 'Style Every Celebration',
    subtitle: 'Varanasi Zari sarees, Chanderi tunics & rich Anarkali sets',
    ctaText: 'SHOP COLLECTION',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#7A0023',
    theme: 'dark',
  },
  {
    id: 'hb-4',
    badge: 'MEGA EXPRESS SALE',
    title: 'UP TO 60% OFF',
    subtitle: '15-35 Min doorstep express drop with 10-min trial guarantee',
    ctaText: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#E11D48',
    theme: 'berry',
  },
];

export interface PromoOffer {
  bankName: string;
  offerText: string;
  subText: string;
  code?: string;
}

export const PAYMENT_OFFERS: PromoOffer[] = [
  {
    bankName: 'HDFC BANK',
    offerText: '10% INSTANT DISCOUNT*',
    subText: 'On Credit Cards & EasyEMI • Min spend ₹1,999',
    code: 'HDFC10',
  },
  {
    bankName: 'UPI EXPRESS',
    offerText: 'FLAT ₹150 CASHBACK',
    subText: 'Instant refund guarantee on UPI payments',
    code: 'AFFORDZUPI',
  },
];
