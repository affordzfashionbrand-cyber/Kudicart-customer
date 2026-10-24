import { create } from 'zustand';
import { addressApi, AddressModel } from '@/services/api';

interface AddressState {
  addresses: AddressModel[];
  selectedAddressId: string;
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  addAddress: (data: Omit<AddressModel, 'id' | 'userId'>) => Promise<AddressModel>;
  updateAddress: (id: string, data: Partial<AddressModel>) => Promise<AddressModel>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setSelectedAddressId: (id: string) => void;
  getSelectedAddress: () => AddressModel | null;
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
      get().selectedAddressId === id
        ? filtered[0]?.id || ''
        : get().selectedAddressId;
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
    set({ selectedAddressId: id });
  },

  getSelectedAddress: () => {
    const { addresses, selectedAddressId } = get();
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  },
}));
