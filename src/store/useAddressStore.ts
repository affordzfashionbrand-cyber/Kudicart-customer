import { create } from 'zustand';
import { addressApi, AddressModel, getAuthToken } from '@/services/api';
import { useCatalogStore } from '@/store/useCatalogStore';
import { registerAuthLogoutReset, registerAuthLoginCallback } from '@/store/useAuthStore';

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
  id: 'hub-pozhichalur',
  name: 'Pozhichalur Express Hub',
  locality: 'Pozhichalur',
  address: 'Main Road, Pozhichalur, Chennai, Tamil Nadu 600074',
  pincode: '600074',
  latitude: 12.9818,
  longitude: 80.1384,
  maxRadiusKm: 8.0,
  deliveryMinutes: 18,
};

export const BENGALURU_DARK_STORE_HUB = {
  id: 'hub-bengaluru',
  name: 'Affordz Bengaluru Express Hub',
  locality: 'Indiranagar',
  address: '100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
  pincode: '560038',
  latitude: 12.9784,
  longitude: 77.6408,
  maxRadiusKm: 8.0,
  deliveryMinutes: 18,
};

export const DEFAULT_DARK_STORES = [
  DARK_STORE_HUB,
  {
    id: 'hub-tambaram',
    name: 'Tambaram Central Hub',
    locality: 'Tambaram',
    address: 'GST Road, Tambaram, Chennai, Tamil Nadu 600045',
    pincode: '600045',
    latitude: 12.9249,
    longitude: 80.1000,
    maxRadiusKm: 8.0,
    deliveryMinutes: 20,
  },
  BENGALURU_DARK_STORE_HUB,
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return Number((R * c).toFixed(1));
}

export function checkAddressServiceability(address: AddressModel | null): ServiceabilityResult {
  const catalogHubs = (useCatalogStore.getState().darkStores || []).filter((h: any) => h?.isActive !== false);
  const rawHubs = catalogHubs.length > 0 ? catalogHubs : DEFAULT_DARK_STORES;

  const liveHubs = rawHubs.map((h: any) => ({
    ...h,
    name: h.name || 'Affordz Express Hub',
    latitude: typeof h.lat === 'number' ? h.lat : (typeof h.latitude === 'number' ? h.latitude : 0),
    longitude: typeof h.lng === 'number' ? h.lng : (typeof h.longitude === 'number' ? h.longitude : 0),
    maxRadiusKm: typeof h.maxRadiusKm === 'number' ? h.maxRadiusKm : 8.0,
    deliveryMinutes: typeof h.deliveryMinutes === 'number' ? h.deliveryMinutes : 18,
  }));

  const fallbackHub = liveHubs[0] || DARK_STORE_HUB;
  const fallbackHubName = fallbackHub.name;
  const fallbackMaxRadius = fallbackHub.maxRadiusKm;

  if (!address) {
    return {
      isServiceable: false,
      distanceKm: 0,
      nearestHubName: fallbackHubName,
      maxRadiusKm: fallbackMaxRadius,
      statusText: 'LOCATION NOT SELECTED',
      reason: 'Please choose or enter your delivery location to verify delivery.',
    };
  }

  const lat1 = (address as any).latitude;
  const lon1 = (address as any).longitude;

  if (typeof lat1 === 'number' && typeof lon1 === 'number') {
    const hubsWithCoords = liveHubs.filter(
      (h: any) => typeof h?.latitude === 'number' && typeof h?.longitude === 'number' && h.latitude !== 0 && h.longitude !== 0,
    );
    if (hubsWithCoords.length > 0) {
      let bestHub = hubsWithCoords[0];
      let bestDist = haversineKm(lat1, lon1, bestHub.latitude, bestHub.longitude);
      for (let i = 1; i < hubsWithCoords.length; i++) {
        const d = haversineKm(lat1, lon1, hubsWithCoords[i].latitude, hubsWithCoords[i].longitude);
        if (d < bestDist) {
          bestDist = d;
          bestHub = hubsWithCoords[i];
        }
      }
      const radius = typeof bestHub.maxRadiusKm === 'number' ? bestHub.maxRadiusKm : 8.0;
      const isServ = bestDist <= radius;
      return {
        isServiceable: isServ,
        distanceKm: bestDist,
        nearestHubName: bestHub.name || fallbackHubName,
        maxRadiusKm: radius,
        statusText: isServ ? `AVAILABLE (${bestHub.deliveryMinutes || 18}-MIN DROP)` : 'NOT AVAILABLE FOR THIS PLACE',
        reason: isServ
          ? undefined
          : `Distance is ${bestDist} km from ${bestHub.name} (exceeds our ${radius} km instant drop radius).`,
        locality: address.locality,
      };
    }

    const dist = haversineKm(lat1, lon1, fallbackHub.latitude, fallbackHub.longitude);
    const isServ = dist <= fallbackMaxRadius;
    return {
      isServiceable: isServ,
      distanceKm: dist,
      nearestHubName: fallbackHubName,
      maxRadiusKm: fallbackMaxRadius,
      statusText: isServ ? `AVAILABLE (${fallbackHub.deliveryMinutes || 18}-MIN DROP)` : 'NOT AVAILABLE FOR THIS PLACE',
      reason: isServ
        ? undefined
        : `Distance is ${dist} km from ${fallbackHubName} (exceeds our ${fallbackMaxRadius} km instant drop radius).`,
      locality: address.locality,
    };
  }

  const localityText = `${address.locality || ''} ${address.city || ''} ${address.pincode || ''}`.toLowerCase();
  const matchedHub = liveHubs.find((h: any) => {
    const hubLoc = String(h?.locality || '').toLowerCase();
    const hubPin = String(h?.pincode || '').trim();
    return (hubLoc && localityText.includes(hubLoc)) || (hubPin && address.pincode === hubPin);
  });

  if (matchedHub) {
    const radius = typeof matchedHub.maxRadiusKm === 'number' ? matchedHub.maxRadiusKm : fallbackMaxRadius;
    return {
      isServiceable: true,
      distanceKm: typeof matchedHub.distanceKm === 'number' ? matchedHub.distanceKm : 1.8,
      nearestHubName: matchedHub.name || fallbackHubName,
      maxRadiusKm: radius,
      statusText: `AVAILABLE (${matchedHub.deliveryMinutes || 18}-MIN DROP)`,
      locality: address.locality || address.city,
    };
  }

  const pin = (address.pincode || '').replace(/\D/g, '');
  // Known active hub pincodes in Chennai
  if (['600074', '600045', '600043', '600044', '600075', '600091', '600088', '600061'].includes(pin)) {
    return {
      isServiceable: true,
      distanceKm: 2.2,
      nearestHubName: pin === '600045' ? 'Tambaram Central Hub' : 'Pozhichalur Express Hub',
      maxRadiusKm: 8.0,
      statusText: 'AVAILABLE (18-MIN DROP)',
      locality: address.locality || address.city,
    };
  }

  // Bangalore test locations support
  const city = (address.city || '').toLowerCase();
  const isBengaluru = city.includes('bengaluru') || city.includes('bangalore') || pin.startsWith('560');
  if (isBengaluru) {
    return {
      isServiceable: true,
      distanceKm: 3.5,
      nearestHubName: 'Affordz Express Hub',
      maxRadiusKm: 8.0,
      statusText: 'AVAILABLE (18-MIN DROP)',
      locality: address.locality || address.city,
    };
  }

  return {
    isServiceable: false,
    distanceKm: 0,
    nearestHubName: fallbackHubName,
    maxRadiusKm: fallbackMaxRadius,
    statusText: 'NOT AVAILABLE FOR THIS PLACE',
    reason: `Instant 18-minute express delivery is currently available near Pozhichalur (600074) and Tambaram (600045) darkstores.`,
    locality: address.locality || address.city,
  };
}

interface AddressState {
  addresses: AddressModel[];
  selectedAddressId: string;
  previewAddress: AddressModel | null;
  hasLocationConfirmed: boolean;
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  addAddress: (data: Omit<AddressModel, 'id' | 'userId'>) => Promise<AddressModel>;
  confirmLocation: (data: Omit<AddressModel, 'id' | 'userId'>) => Promise<AddressModel>;
  setPreviewAddress: (data: Omit<AddressModel, 'id' | 'userId'> | null) => AddressModel | null;
  updateAddress: (id: string, data: Partial<AddressModel>) => Promise<AddressModel>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setSelectedAddressId: (id: string) => void;
  setHasLocationConfirmed: (val: boolean) => void;
  getSelectedAddress: () => AddressModel | null;
  getServiceability: () => ServiceabilityResult;
  resetAddresses: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddressId: '',
  previewAddress: null,
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
          previewAddress: null,
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
      if (!getAuthToken()) {
        const preview = get().setPreviewAddress(data);
        set({ isLoading: false });
        if (preview) return preview;
        throw new Error('Please sign in to save a delivery address.');
      }
      const newAddr = await addressApi.addAddress(data);
      const existing = get().addresses.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a));
      const updated = [...existing, newAddr];
      set({
        addresses: updated,
        selectedAddressId: newAddr.id,
        previewAddress: null,
        hasLocationConfirmed: true,
        isLoading: false,
      });
      return newAddr;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Unable to save address.' });
      throw err;
    }
  },

  setPreviewAddress: (data) => {
    if (!data) {
      set({ previewAddress: null });
      return null;
    }
    const preview: AddressModel = {
      id: '',
      userId: '',
      label: data.label || 'Delivery Location',
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      line1: data.line1 || '',
      line2: data.line2,
      locality: data.locality || '',
      city: data.city || 'Bengaluru',
      state: data.state,
      pincode: data.pincode || '',
      latitude: data.latitude,
      longitude: data.longitude,
      isDefault: false,
    };
    set({
      previewAddress: preview,
      hasLocationConfirmed: true,
      error: null,
    });
    return preview;
  },

  confirmLocation: async (data) => {
    if (getAuthToken()) {
      return get().addAddress(data);
    }
    return get().setPreviewAddress(data)!;
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
    set({ selectedAddressId: id, previewAddress: null, hasLocationConfirmed: true });
  },

  setHasLocationConfirmed: (val: boolean) => {
    set({ hasLocationConfirmed: val });
  },

  getSelectedAddress: () => {
    const { addresses, selectedAddressId, previewAddress } = get();
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0] || previewAddress || null;
  },

  getServiceability: () => {
    const addr = get().getSelectedAddress();
    return checkAddressServiceability(addr);
  },

  resetAddresses: () => {
    set({
      addresses: [],
      selectedAddressId: '',
      previewAddress: null,
      hasLocationConfirmed: false,
      isLoading: false,
      error: null,
    });
  },
}));

registerAuthLogoutReset(() => {
  useAddressStore.getState().resetAddresses();
});

registerAuthLoginCallback(() => {
  useAddressStore.getState().fetchAddresses().catch(() => {});
});
