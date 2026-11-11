import { ShieldCheck, Zap, Ruler, RotateCcw } from 'lucide-react-native';

export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const SIZE_CHART = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"', length: '44"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"', length: '44.5"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"', length: '45"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"', length: '45.5"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"', length: '46"' },
];

export interface AtelierOffer {
  code: string;
  title: string;
  desc: string;
  tag: string;
}

export const ATELIER_OFFERS: AtelierOffer[] = [];

export const POPULAR_PINCODES = [
  { pin: '560038', locality: 'Indiranagar' },
  { pin: '560034', locality: 'Koramangala' },
  { pin: '560001', locality: 'MG Road' },
  { pin: '560043', locality: 'Kalyan Nagar' },
];

export const PRODUCT_SPECIFICATIONS: { label: string; value: string }[] = [];

export const CUSTOMER_LOOKS: {
  id: string;
  author: string;
  locality: string;
  height: string;
  size: string;
  rating: number;
  image: string;
  comment: string;
}[] = [];

export const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Authenticity Verified',
    desc: '100% Genuine Designer Wear',
    color: '#10B981',
  },
  {
    icon: Zap,
    title: '18-Min Try & Buy',
    desc: 'Test drape before paying',
    color: '#FF5A1F',
  },
  {
    icon: Ruler,
    title: 'Dual-Size Trial',
    desc: '2 sizes at zero extra fee',
    color: '#111111',
  },
  {
    icon: RotateCcw,
    title: 'Instant Handback',
    desc: 'Concierge takes return on spot',
    color: '#8B5CF6',
  },
];

export const COLOR_VARIANTS = [
  { name: 'Raw Honey Silk', hex: '#D4AF37' },
  { name: 'Royal Berry Red', hex: '#881337' },
  { name: 'Emerald Forest', hex: '#064E3B' },
];
