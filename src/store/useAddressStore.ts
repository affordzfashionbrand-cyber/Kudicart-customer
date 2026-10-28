import { create } from 'zustand';
import { addressApi, AddressModel } from '@/services/api';

export interface ServiceabilityResult {
  isServiceable: boolean;
  distanceKm: number;
  nearestHubName: string;
  maxRadiusKm: number;
  statusText: string;
  reason?: string;
  locality?: string;
}

export const DARK_STORE_HUB = {
  name: 'Indiranagar Express Hub',
  latitude: 12.9784,
  longitude: 77.6408,
  maxRadiusKm: 8.0,
};

export const KNOWN_PINCODES: Record<string, { distanceKm: number; locality: string }> = {
  '560038': { distanceKm: 1.2, locality: 'Indiranagar' },
  '560008': { distanceKm: 2.1, locality: 'Ulsoor / Halasuru' },
  '560071': { distanceKm: 2.8, locality: 'Domlur' },
  '560017': { distanceKm: 3.2, locality: 'Vimanapura / HAL' },
  '560095': { distanceKm: 3.6, locality: 'Koramangala 4th Block' },
  '560034': { distanceKm: 4.0, locality: 'Koramangala 1st Block' },
  '560001': { distanceKm: 3.9, locality: 'MG Road / Brigade Road' },
  '560025': { distanceKm: 4.2, locality: 'Richmond Town' },
  '560047': { distanceKm: 4.6, locality: 'Austin Town' },
  '560042': { distanceKm: 5.2, locality: 'Frazer Town' },
  '560052': { distanceKm: 5.8, locality: 'Vasanth Nagar' },
  '560027': { distanceKm: 5.0, locality: 'Shanti Nagar' },
  '560020': { distanceKm: 6.8, locality: 'Seshadripuram' },
  '560002': { distanceKm: 6.2, locality: 'City Market / Kalasipalya' },
  // Non-serviceable pincodes (> 8.0 km)
  '560103': { distanceKm: 12.4, locality: 'Kadubeesanahalli / Bellandur' },
  '560066': { distanceKm: 16.5, locality: 'Whitefield' },
  '560100': { distanceKm: 19.2, locality: 'Electronic City' },
  '560064': { distanceKm: 21.0, locality: 'Yelahanka' },
  '560068': { distanceKm: 14.8, locality: 'Bommanahalli' },
  '560078': { distanceKm: 15.5, locality: 'JP Nagar 7th Phase' },
  '560076': { distanceKm: 13.9, locality: 'Bannerghatta Road' },
};

export function checkAddressServiceability(address: AddressModel | null): ServiceabilityResult {
  if (!address) {
    return {
      isServiceable: false,
      distanceKm: 0,
      nearestHubName: DARK_STORE_HUB.name,
      maxRadiusKm: DARK_STORE_HUB.maxRadiusKm,
      statusText: 'LOCATION NOT SELECTED',
      reason: 'Please choose or enter your delivery location to check instant availability.',
    };
  }

  const pin = (address.pincode || '').replace(/\D/g, '');
  const city = (address.city || '').toLowerCase();

  // If coordinates are provided
  if ((address as any).latitude && (address as any).longitude) {
    const lat1 = (address as any).latitude;
    const lon1 = (address as any).longitude;
    const lat2 = DARK_STORE_HUB.latitude;
    const lon2 = DARK_STORE_HUB.longitude;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Number((R * c).toFixed(1));

    const isServ = dist <= DARK_STORE_HUB.maxRadiusKm;
    return {
      isServiceable: isServ,
      distanceKm: dist,
      nearestHubName: DARK_STORE_HUB.name,
      maxRadiusKm: DARK_STORE_HUB.maxRadiusKm,
      statusText: isServ ? 'AVAILABLE (18-MIN DROP)' : 'NOT AVAILABLE FOR THIS PLACE',
      reason: isServ
        ? undefined
        : `Distance is ${dist} km from ${DARK_STORE_HUB.name} (exceeds our ${DARK_STORE_HUB.maxRadiusKm} km instant drop radius).`,
      locality: address.locality,
    };
  }

  // Lookup in known quick-commerce catalog
  if (pin && KNOWN_PINCODES[pin]) {
    const known = KNOWN_PINCODES[pin];
    const isServ = known.distanceKm <= DARK_STORE_HUB.maxRadiusKm;
    return {
      isServiceable: isServ,
      distanceKm: known.distanceKm,
      nearestHubName: DARK_STORE_HUB.name,
      maxRadiusKm: DARK_STORE_HUB.maxRadiusKm,
      statusText: isServ ? 'AVAILABLE (18-MIN DROP)' : 'NOT AVAILABLE FOR THIS PLACE',
      reason: isServ
        ? undefined
        : `Distance is ${known.distanceKm} km from ${DARK_STORE_HUB.name} (exceeds our ${DARK_STORE_HUB.maxRadiusKm} km instant drop radius).`,
      locality: known.locality,
    };
  }

  // Check by city & prefix
  const isBengaluru = city.includes('bengaluru') || city.includes('bangalore') || pin.startsWith('560');
  if (!isBengaluru) {
    return {
      isServiceable: false,
      distanceKm: 350.0,
      nearestHubName: DARK_STORE_HUB.name,
      maxRadiusKm: DARK_STORE_HUB.maxRadiusKm,
      statusText: 'NOT AVAILABLE FOR THIS PLACE',
      reason: 'Instant 18-minute delivery is currently operational only within Bengaluru dark store hubs.',
      locality: address.locality || address.city,
    };
  }

  // Default fallback for Bangalore unknown pincodes:
  const isCentralBangalore = /^(56000|56001|56002|56003|56004|56007)/.test(pin);
  const estimatedDist = isCentralBangalore ? 4.5 : 14.5;
  const isServ = estimatedDist <= DARK_STORE_HUB.maxRadiusKm;

  return {
    isServiceable: isServ,
    distanceKm: estimatedDist,
    nearestHubName: DARK_STORE_HUB.name,
    maxRadiusKm: DARK_STORE_HUB.maxRadiusKm,
    statusText: isServ ? 'AVAILABLE (18-MIN DROP)' : 'NOT AVAILABLE FOR THIS PLACE',
    reason: isServ
      ? undefined
      : `Distance is ~${estimatedDist} km from ${DARK_STORE_HUB.name} (exceeds our ${DARK_STORE_HUB.maxRadiusKm} km instant drop radius).`,
    locality: address.locality || 'Bengaluru',
  };
}

interface AddressState {
  addresses: AddressModel[];
  selectedAddressId: string;
  hasLocationConfirmed: boolean;
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  addAddress: (data: Omit<AddressModel, 'id' | 'userId'>) => Promise<AddressModel>;
  updateAddress: (id: string, data: Partial<AddressModel>) => Promise<AddressModel>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setSelectedAddressId: (id: string) => void;
  setHasLocationConfirmed: (val: boolean) => void;
  getSelectedAddress: () => AddressModel | null;
  getServiceability: () => ServiceabilityResult;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [
    {
      id: 'addr-1',
      userId: 'usr-1',
      label: 'Home Sanctuary',
      line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      isDefault: true,
    },
    {
      id: 'addr-2',
      userId: 'usr-1',
      label: 'Design Studio',
      line1: 'Suite 802, Prestige Tech Cloud, Outer Ring Road',
      locality: 'Kadubeesanahalli',
      city: 'Bengaluru',
      pincode: '560103',
      isDefault: false,
    },
  ],
  selectedAddressId: 'addr-1',
  hasLocationConfirmed: false,
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    try {
      const addresses = await addressApi.getAddresses();
      if (addresses && addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        set({ addresses, selectedAddressId: defaultAddr.id });
      }
    } catch (err: any) {
      console.warn('Could not fetch addresses:', err);
    }
  },

  addAddress: async (data) => {
    set({ isLoading: true });
    try {
      const newAddr = await addressApi.addAddress(data);
      const updated = [...get().addresses, newAddr];
      set({
        addresses: updated,
        selectedAddressId: newAddr.id,
        hasLocationConfirmed: true,
        isLoading: false,
      });
      return newAddr;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to add address' });
      const fallback: AddressModel = {
        id: `addr-${Date.now()}`,
        userId: 'usr-1',
        ...data,
      };
      set({
        addresses: [...get().addresses, fallback],
        selectedAddressId: fallback.id,
        hasLocationConfirmed: true,
      });
      return fallback;
    }
  },

  updateAddress: async (id: string, data: Partial<AddressModel>) => {
    set({ isLoading: true });
    try {
      const updatedAddr = await addressApi.updateAddress(id, data);
      const updatedList = get().addresses.map((a) => (a.id === id ? updatedAddr : a));
      set({ addresses: updatedList, isLoading: false });
      return updatedAddr;
    } catch (err: any) {
      const updatedList = get().addresses.map((a) => (a.id === id ? { ...a, ...data } : a));
      set({ addresses: updatedList, isLoading: false });
      const found = updatedList.find((a) => a.id === id);
      return found || get().addresses[0];
    }
  },

  deleteAddress: async (id: string) => {
    set({ isLoading: true });
    try {
      await addressApi.deleteAddress(id);
    } catch {
      // offline fallback
    }
    const filtered = get().addresses.filter((a) => a.id !== id);
    const newSelectedId =
      get().selectedAddressId === id ? filtered[0]?.id || '' : get().selectedAddressId;
    set({
      addresses: filtered,
      selectedAddressId: newSelectedId,
      isLoading: false,
    });
  },

  setDefaultAddress: async (id: string) => {
    try {
      await addressApi.setDefault(id);
    } catch {
      // offline
    }
    const updated = get().addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    set({ addresses: updated, selectedAddressId: id });
  },

  setSelectedAddressId: (id: string) => {
    set({ selectedAddressId: id, hasLocationConfirmed: true });
  },

  setHasLocationConfirmed: (val: boolean) => {
    set({ hasLocationConfirmed: val });
  },

  getSelectedAddress: () => {
    const { addresses, selectedAddressId } = get();
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  },

  getServiceability: () => {
    const addr = get().getSelectedAddress();
    return checkAddressServiceability(addr);
  },
}));
