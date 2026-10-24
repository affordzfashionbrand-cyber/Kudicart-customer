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

export const ATELIER_OFFERS: AtelierOffer[] = [
  {
    code: 'KUDI100',
    title: 'Flat ₹100 Off',
    desc: 'On your first Doorstep Try & Buy fitting (Min order ₹1,499)',
    tag: 'FIRST TRY',
  },
  {
    code: 'LUXE15',
    title: '15% Instant Off',
    desc: 'On HDFC / ICICI Credit & Debit cards (Up to ₹500 discount)',
    tag: 'BANK OFFER',
  },
  {
    code: 'RUNWAYPASS',
    title: 'Free Concierge Pass',
    desc: 'Zero doorstep trial fee on all runway pieces',
    tag: 'TRIAL PASS',
  },
];

export const POPULAR_PINCODES = [
  { pin: '560038', locality: 'Indiranagar' },
  { pin: '560034', locality: 'Koramangala' },
  { pin: '560001', locality: 'MG Road' },
  { pin: '560043', locality: 'Kalyan Nagar' },
];

export const PRODUCT_SPECIFICATIONS = [
  { label: 'Fabric Composition', value: '100% Pure Handloom Chanderi' },
  { label: 'Weave Technique', value: 'Banarasi Zari Kadwa Weft' },
  { label: 'Silhouette & Fit', value: 'Straight Couture Regular Fit' },
  { label: 'Neckline', value: 'Mandarin Collar with V-Placket' },
  { label: 'Sleeve Length', value: 'Three-Quarter Churidar Sleeves' },
  { label: 'Lining Material', value: 'Pure Mulmul Cotton (Breathable)' },
  { label: 'Transparency', value: 'Opaque (Fully Pre-Lined)' },
  { label: 'Ornamentation', value: 'Hand Zari Work & Zardozi Placket' },
  { label: 'Occasion', value: 'Festive, Sangeet & Intimate Weddings' },
  { label: 'Care Protocol', value: 'Dry Clean Recommended' },
];

export const CUSTOMER_LOOKS = [
  {
    id: 'look-1',
    author: 'Pooja Kashyap',
    locality: 'Indiranagar, Bangalore',
    height: "5'7\"",
    size: 'S',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80',
    comment: 'The Chanderi drape is unimaginably light. Concierge rider waited 10 mins; kept size S with zero drama.',
  },
  {
    id: 'look-2',
    author: 'Meera Raghavan',
    locality: 'Koramangala, Bangalore',
    height: "5'5\"",
    size: 'M',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
    comment: 'Genuine zari sheen without feeling gaudy. Arrived fresh on a wooden hanger inside a dust bag!',
  },
  {
    id: 'look-3',
    author: 'Aparna Sengupta',
    locality: 'Lavelle Road, Bangalore',
    height: "5'8\"",
    size: 'S',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80',
    comment: 'Pure mulmul cotton lining makes it completely breathable in humid weather. A true atelier piece.',
  },
];

export const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Silk Mark Certified',
    desc: '100% Genuine Handloom',
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
