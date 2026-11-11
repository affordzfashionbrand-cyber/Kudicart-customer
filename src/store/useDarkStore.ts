import { create } from 'zustand';
import { useCatalogStore } from '@/store/useCatalogStore';
import { registerAuthLogoutReset } from './useAuthStore';

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
  latitude?: number;
  longitude?: number;
  maxRadiusKm?: number;
}

export function mapCatalogHubToDarkStore(raw: any, index = 0): DarkStore {
  const name = raw?.name || 'Affordz Express Hub';
  const locality = raw?.locality || raw?.city || 'Service Area';
  return {
    id: String(raw?.id || `hub-${index + 1}`),
    name,
    shortName: raw?.shortName || locality,
    code: raw?.code || `HUB-${String(index + 1).padStart(2, '0')}`,
    locality,
    distanceKm: typeof raw?.distanceKm === 'number' ? raw.distanceKm : 2.0,
    deliveryMinutes: typeof raw?.deliveryMinutes === 'number' ? raw.deliveryMinutes : 18,
    stockCount: typeof raw?.stockCount === 'number' ? raw.stockCount : 0,
    badge: raw?.badge || (raw?.isActive !== false ? 'EXPRESS HUB' : undefined),
    isPopular: index === 0,
    isOpen: raw?.isActive !== false,
    prepTimeMinutes: typeof raw?.prepTimeMinutes === 'number' ? raw.prepTimeMinutes : 3,
    address: raw?.address || locality,
    features: Array.isArray(raw?.features) && raw.features.length > 0
      ? raw.features
      : ['Instant Try & Buy', 'Steam Pressed Drops'],
    latitude: typeof raw?.latitude === 'number' ? raw.latitude : undefined,
    longitude: typeof raw?.longitude === 'number' ? raw.longitude : undefined,
    maxRadiusKm: typeof raw?.maxRadiusKm === 'number' ? raw.maxRadiusKm : undefined,
  };
}

interface DarkStoreState {
  darkStores: DarkStore[];
  selectedDarkStore: DarkStore | null;
  isDarkStoreModalOpen: boolean;

  setDarkStores: (stores: DarkStore[]) => void;
  syncFromCatalog: () => Promise<DarkStore[]>;
  setSelectedDarkStore: (store: DarkStore | null) => void;
  openDarkStoreModal: () => void;
  closeDarkStoreModal: () => void;
  toggleDarkStoreModal: () => void;
  resetDarkStore: () => void;
}

export const useDarkStore = create<DarkStoreState>((set, get) => ({
  darkStores: [],
  selectedDarkStore: null,
  isDarkStoreModalOpen: false,

  setDarkStores: (darkStores) => set((state) => ({
    darkStores,
    selectedDarkStore: state.selectedDarkStore
      ? darkStores.find((s) => s.id === state.selectedDarkStore?.id) || darkStores[0] || null
      : state.selectedDarkStore,
  })),

  syncFromCatalog: async () => {
    const catalog = useCatalogStore.getState();
    if (catalog.darkStores.length === 0) {
      await catalog.fetchDarkStores();
    }
    const rawHubs = useCatalogStore.getState().darkStores || [];
    const mapped = rawHubs.map((hub, idx) => mapCatalogHubToDarkStore(hub, idx));
    get().setDarkStores(mapped);
    return mapped;
  },

  setSelectedDarkStore: (store) => set({ selectedDarkStore: store }),
  openDarkStoreModal: () => {
    set({ isDarkStoreModalOpen: true });
    if (get().darkStores.length === 0) {
      get().syncFromCatalog().catch(() => {});
    }
  },
  closeDarkStoreModal: () => set({ isDarkStoreModalOpen: false }),
  toggleDarkStoreModal: () => {
    const next = !get().isDarkStoreModalOpen;
    set({ isDarkStoreModalOpen: next });
    if (next && get().darkStores.length === 0) {
      get().syncFromCatalog().catch(() => {});
    }
  },
  resetDarkStore: () => {
    set({ darkStores: [], selectedDarkStore: null, isDarkStoreModalOpen: false });
  },
}));

registerAuthLogoutReset(() => {
  useDarkStore.getState().resetDarkStore();
});
