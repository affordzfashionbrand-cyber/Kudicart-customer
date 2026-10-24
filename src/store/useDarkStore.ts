import { create } from 'zustand';

export interface DarkStore {
  id: string;
  name: string;
  shortName: string;
  code: string;
  locality: string;
  distanceKm: number;
  deliveryMinutes: number;
  stockCount: number;
  badge?: string;
  isPopular?: boolean;
  isOpen: boolean;
  prepTimeMinutes: number;
  address: string;
  features: string[];
}

export const DARK_STORES: DarkStore[] = [
  {
    id: 'ds-indiranagar',
    name: 'Indiranagar Atelier Hub',
    shortName: 'Indiranagar Hub',
    code: 'DS-01',
    locality: '100ft Road, Indiranagar',
    distanceKm: 1.2,
    deliveryMinutes: 18,
    stockCount: 4850,
    badge: 'FASTEST DISPATCH',
    isPopular: true,
    isOpen: true,
    prepTimeMinutes: 3,
    address: 'Plot 418, 100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
    features: ['Instant Try & Buy', 'Steam Pressed Drops', 'Live Wardrobe Fitting'],
  },
  {
    id: 'ds-koramangala',
    name: 'Koramangala Atelier Depot',
    shortName: 'Koramangala Depot',
    code: 'DS-02',
    locality: '5th Block, Koramangala',
    distanceKm: 2.4,
    deliveryMinutes: 22,
    stockCount: 5420,
    badge: 'EXPANDED WARDROBE',
    isPopular: false,
    isOpen: true,
    prepTimeMinutes: 4,
    address: '80ft Road, Sony World Signal, 5th Block, Koramangala, Bengaluru',
    features: ['Luxury Evening Wear', 'Doorstep Stylist', 'Instant Exchanges'],
  },
  {
    id: 'ds-lavelle',
    name: 'Lavelle Road Private Vault',
    shortName: 'CBD Vault',
    code: 'DS-03',
    locality: 'Lavelle Road, Central Bengaluru',
    distanceKm: 3.8,
    deliveryMinutes: 26,
    stockCount: 3940,
    badge: 'HAUTE LUXE SUITE',
    isPopular: false,
    isOpen: true,
    prepTimeMinutes: 5,
    address: '22 Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru',
    features: ['Couture Exclusives', 'White-Glove Courier', 'VIP Fitting Rooms'],
  },
  {
    id: 'ds-whitefield',
    name: 'Whitefield Fashion Fulfillment Center',
    shortName: 'Whitefield Hub',
    code: 'DS-04',
    locality: 'EPIP Zone, Whitefield',
    distanceKm: 7.1,
    deliveryMinutes: 34,
    stockCount: 6180,
    badge: 'MEGA INVENTORY',
    isPopular: false,
    isOpen: true,
    prepTimeMinutes: 6,
    address: 'Plot 12, EPIP Industrial Area, Whitefield, Bengaluru',
    features: ['Complete Runway Catalog', 'Express Dispatch', 'Next-Day Tailoring'],
  },
];

interface DarkStoreState {
  darkStores: DarkStore[];
  selectedDarkStore: DarkStore | null;
  isDarkStoreModalOpen: boolean;

  setSelectedDarkStore: (store: DarkStore | null) => void;
  openDarkStoreModal: () => void;
  closeDarkStoreModal: () => void;
  toggleDarkStoreModal: () => void;
}

export const useDarkStore = create<DarkStoreState>((set) => ({
  darkStores: DARK_STORES,
  // Start with null so that "Select dark store" prompt is prominently shown initially,
  // or user can pick one immediately
  selectedDarkStore: null,
  isDarkStoreModalOpen: false,

  setSelectedDarkStore: (store) => set({ selectedDarkStore: store }),
  openDarkStoreModal: () => set({ isDarkStoreModalOpen: true }),
  closeDarkStoreModal: () => set({ isDarkStoreModalOpen: false }),
  toggleDarkStoreModal: () => set((state) => ({ isDarkStoreModalOpen: !state.isDarkStoreModalOpen })),
}));
