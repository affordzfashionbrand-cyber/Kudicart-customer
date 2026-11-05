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
  addresses: [],
  selectedAddressId: '',
  hasLocationConfirmed: false,
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await addressApi.getAddresses();
      if (addresses && addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        set({
          addresses,
          selectedAddressId: get().selectedAddressId || defaultAddr.id,
          isLoading: false,
        });
      } else {
        set({ addresses: [], selectedAddressId: '', isLoading: false });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to load addresses' });
    }
  },

  addAddress: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newAddr = await addressApi.addAddress(data);
      const existing = get().addresses.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a));
      const updated = [...existing, newAddr];
      set({
        addresses: updated,
        selectedAddressId: newAddr.id,
        hasLocationConfirmed: true,
        isLoading: false,
      });
      return newAddr;
    } catch (err: any) {
      const fallbackAddr: AddressModel = {
        id: `addr-local-${Date.now()}`,
        userId: 'guest',
        label: data.label || 'Delivery Location',
        recipientName: data.recipientName || 'Guest User',
        recipientPhone: data.recipientPhone || '',
        line1: data.line1 || '',
        line2: data.line2 || '',
        locality: data.locality || '',
        city: data.city || 'Bengaluru',
        state: data.state || 'Karnataka',
        pincode: data.pincode || '',
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: true,
      };
      const existing = get().addresses.map((a) => ({ ...a, isDefault: false }));
      const updated = [...existing, fallbackAddr];
      set({
        addresses: updated,
        selectedAddressId: fallbackAddr.id,
        hasLocationConfirmed: true,
        isLoading: false,
      });
      return fallbackAddr;
    }
  },

  updateAddress: async (id: string, data: Partial<AddressModel>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAddr = await addressApi.updateAddress(id, data);
      const updatedList = get().addresses.map((a) => {
        if (a.id === id) return updatedAddr;
        if (updatedAddr.isDefault) return { ...a, isDefault: false };
        return a;
      });
      set({ addresses: updatedList, isLoading: false });
      return updatedAddr;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to update address' });
      throw err;
    }
  },

  deleteAddress: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await addressApi.deleteAddress(id);
      const refreshed = await addressApi.getAddresses();
      const newSelected = refreshed.find((a) => a.isDefault) || refreshed[0];
      set({
        addresses: refreshed,
        selectedAddressId: newSelected ? newSelected.id : '',
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to delete address' });
      throw err;
    }
  },

  setDefaultAddress: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await addressApi.setDefault(id);
      const updated = get().addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      set({ addresses: updated, selectedAddressId: id, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to set default address' });
      throw err;
    }
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
