import { create } from 'zustand';
import { cartApi, ApiProduct } from '@/services/api';

export interface LocalCartItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  size: string;
  trialSize?: string | null;
  isTryAndBuy?: boolean;
  fulfillmentType?: 'DARK_STORE' | 'VENDOR';
  darkStoreHub?: any;
  color?: string;
  quantity: number;
  image: string;
  discountBadge?: string;
}

interface CartState {
  items: LocalCartItem[];
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
  isLoading: boolean;
  error: string | null;
  wishlist: string[];

  // Enhanced Order Value-Adds
  couponCode: string | null;
  discountAmount: number;
  giftWrap: boolean;
  donationAmount: number;
  gstin: string | null;

  fetchCart: () => Promise<void>;
  addItem: (
    product: ApiProduct,
    size?: string,
    color?: string,
    quantity?: number,
    trialSize?: string,
  ) => Promise<boolean>;
  updateQuantity: (itemId: string, delta: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Coupon & Value-Add Handlers
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  removeCoupon: () => Promise<void>;
  toggleGiftWrap: () => void;
  setDonation: (amount: number) => void;
  setGstin: (gstin: string) => void;
}

const calculateTotals = (
  items: LocalCartItem[],
  discountAmount = 0,
  giftWrap = false,
  donationAmount = 0,
) => {
  const itemTotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const taxes = Math.round(itemTotal * 0.05);
  // Free delivery on orders ₹1,499 and above
  const deliveryFee = itemTotal > 0 ? (itemTotal >= 1499 ? 0 : 40) : 0;
  const giftWrapFee = giftWrap ? 35 : 0;
  const grandTotal = Math.max(
    0,
    itemTotal - discountAmount + taxes + deliveryFee + giftWrapFee + donationAmount,
  );
  return { itemTotal, taxes, deliveryFee, grandTotal };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    {
      id: 'cart-1',
      productId: 'prod-1',
      brand: 'Avanya Ethnic',
      title: 'Embroidered Anarkali Kurta Set',
      size: 'M (38 in)',
      trialSize: 'L (40 in)',
      isTryAndBuy: true,
      fulfillmentType: 'DARK_STORE',
      color: 'Berry Crimson',
      price: 1299,
      originalPrice: 2499,
      discountBadge: '48% OFF',
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
    },
  ],
  itemTotal: 1299,
  deliveryFee: 40,
  taxes: 65,
  grandTotal: 1404,
  isLoading: false,
  error: null,
  wishlist: ['1', '102', 'prod-2'],

  couponCode: null,
  discountAmount: 0,
  giftWrap: false,
  donationAmount: 0,
  gstin: null,

  fetchCart: async () => {
    try {
      const serverCart = await cartApi.getCart();
      if (serverCart?.items && serverCart.items.length > 0) {
        const localItems: LocalCartItem[] = serverCart.items.map((ci) => ({
          id: ci.id,
          productId: ci.productId,
          title: ci.title || ci.product?.title || 'Fashion Garment',
          brand: ci.brand || ci.product?.brand || 'Affordz Artisan',
          price: ci.price || ci.product?.price || 1299,
          originalPrice: ci.originalPrice || ci.product?.originalPrice || 2499,
          size: ci.size,
          trialSize: ci.trialSize || null,
          isTryAndBuy: ci.isTryAndBuy || Boolean(ci.trialSize),
          fulfillmentType: ci.fulfillmentType || 'VENDOR',
          darkStoreHub: ci.darkStoreHub || null,
          color: ci.color || 'Artisan Tint',
          quantity: ci.quantity,
          image:
            ci.image ||
            ci.product?.image ||
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
          discountBadge: ci.discount || ci.product?.discount || '40% OFF',
        }));
        set({
          items: localItems,
          itemTotal: serverCart.itemTotal,
          deliveryFee: serverCart.deliveryFee,
          taxes: serverCart.taxes,
          discountAmount: serverCart.discountAmount || 0,
          couponCode: serverCart.couponCode || null,
          grandTotal: serverCart.grandTotal,
        });
      }
    } catch (err) {
      console.warn('Could not fetch cart from server, using local cart:', err);
    }
  },

  addItem: async (product, size = 'M', color = 'Standard', quantity = 1, trialSize?: string) => {
    const effectiveSize = size || 'M';
    const state = get();

    const existingIndex = state.items.findIndex(
      (item) => item.productId === String(product.id) && item.size === effectiveSize,
    );

    let updatedItems: LocalCartItem[];
    if (existingIndex > -1) {
      const isDark = state.items[existingIndex].fulfillmentType === 'DARK_STORE';
      updatedItems = [...state.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity,
        ...(trialSize && isDark ? { trialSize, isTryAndBuy: true } : {}),
      };
    } else {
      const isDark = (product.fulfillmentType || 'VENDOR') === 'DARK_STORE';
      const newItem: LocalCartItem = {
        id: `ci-${Date.now()}`,
        productId: String(product.id),
        title: product.title || (product as any).name || 'Artisan Garment',
        brand: product.brand || 'Affordz',
        price: product.price,
        originalPrice: product.originalPrice || Math.round(product.price * 1.4),
        size: effectiveSize,
        trialSize: isDark ? (trialSize || null) : null,
        isTryAndBuy: isDark ? Boolean(trialSize || product.tryAndBuyEligible) : false,
        fulfillmentType: product.fulfillmentType || 'VENDOR',
        darkStoreHub: product.darkStoreHub || null,
        color,
        quantity,
        image: product.image,
        discountBadge: product.discount || '30% OFF',
      };
      updatedItems = [...state.items, newItem];
    }

    const totals = calculateTotals(
      updatedItems,
      state.discountAmount,
      state.giftWrap,
      state.donationAmount,
    );

    // 1. Immediately update Zustand store so navigation to /cart has items with 0ms lag
    set({
      items: updatedItems,
      ...totals,
    });

    // 2. Sync with backend asynchronously
    try {
      await cartApi.addItem(String(product.id), effectiveSize, quantity, trialSize, color);
    } catch {
      // Offline fallback: graceful
    }

    return true;
  },

  updateQuantity: async (itemId, delta) => {
    const state = get();
    const target = state.items.find((i) => i.id === itemId);
    if (!target) return;

    const newQty = target.quantity + delta;

    let updatedItems: LocalCartItem[];
    if (newQty <= 0) {
      updatedItems = state.items.filter((i) => i.id !== itemId);
    } else {
      updatedItems = state.items.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i));
    }

    const totals = calculateTotals(
      updatedItems,
      state.discountAmount,
      state.giftWrap,
      state.donationAmount,
    );

    // 1. Immediately update Zustand store for instant 0ms UI feedback
    set({
      items: updatedItems,
      ...totals,
    });

    // 2. Sync with backend asynchronously
    try {
      if (newQty > 0) {
        await cartApi.updateQuantity(itemId, delta);
      } else {
        await cartApi.removeItem(itemId);
      }
    } catch {
      // Offline graceful fallback
    }
  },

  removeItem: async (itemId) => {
    const state = get();
    const updatedItems = state.items.filter((i) => i.id !== itemId);
    const totals = calculateTotals(
      updatedItems,
      state.discountAmount,
      state.giftWrap,
      state.donationAmount,
    );

    // 1. Immediately update Zustand store for instant 0ms UI feedback
    set({
      items: updatedItems,
      ...totals,
    });

    // 2. Sync with backend asynchronously
    try {
      await cartApi.removeItem(itemId);
    } catch {
      // graceful offline
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clearCart();
    } catch {
      // offline
    }
    set({
      items: [],
      itemTotal: 0,
      taxes: 0,
      deliveryFee: 0,
      grandTotal: 0,
      couponCode: null,
      discountAmount: 0,
      giftWrap: false,
      donationAmount: 0,
      gstin: null,
    });
  },

  toggleWishlist: (productId: string) => {
    const wishlist = get().wishlist;
    const exists = wishlist.includes(productId);
    const updated = exists ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
    set({ wishlist: updated });
  },

  isWishlisted: (productId: string) => {
    return get().wishlist.includes(productId);
  },

  applyCoupon: async (code: string) => {
    const state = get();
    const cleanCode = code.trim().toUpperCase();

    try {
      const serverCart = await cartApi.applyCoupon(cleanCode);
      const discount = serverCart.discountAmount || 0;
      set({
        couponCode: cleanCode,
        discountAmount: discount,
        itemTotal: serverCart.itemTotal,
        deliveryFee: serverCart.deliveryFee,
        taxes: serverCart.taxes,
        grandTotal: serverCart.grandTotal,
      });
      return {
        success: true,
        message: `Coupon ${cleanCode} applied! Saved ₹${discount}`,
        discount,
      };
    } catch (err: any) {
      let discount = 0;
      if (cleanCode === 'AFFORDZ10' || cleanCode === 'KUDI10') {
        discount = Math.min(300, Math.round(state.itemTotal * 0.1));
      } else if (cleanCode === 'FIRSTDROP') {
        discount = Math.min(state.itemTotal, 200);
      } else if (cleanCode === 'VAULT50') {
        discount = Math.min(state.itemTotal, 50);
      } else {
        return {
          success: false,
          message: err?.message || 'Invalid coupon. Try AFFORDZ10 or FIRSTDROP.',
        };
      }

      const totals = calculateTotals(
        state.items,
        discount,
        state.giftWrap,
        state.donationAmount,
      );

      set({
        couponCode: cleanCode,
        discountAmount: discount,
        ...totals,
      });

      return {
        success: true,
        message: `Coupon ${cleanCode} applied! Saved ₹${discount}`,
        discount,
      };
    }
  },

  removeCoupon: async () => {
    try {
      const serverCart = await cartApi.removeCoupon();
      set({
        couponCode: null,
        discountAmount: 0,
        itemTotal: serverCart.itemTotal,
        deliveryFee: serverCart.deliveryFee,
        taxes: serverCart.taxes,
        grandTotal: serverCart.grandTotal,
      });
    } catch {
      const state = get();
      const totals = calculateTotals(state.items, 0, state.giftWrap, state.donationAmount);
      set({
        couponCode: null,
        discountAmount: 0,
        ...totals,
      });
    }
  },

  toggleGiftWrap: () => {
    const state = get();
    const newWrap = !state.giftWrap;
    const totals = calculateTotals(
      state.items,
      state.discountAmount,
      newWrap,
      state.donationAmount,
    );
    set({
      giftWrap: newWrap,
      ...totals,
    });
  },

  setDonation: (amount: number) => {
    const state = get();
    const newDonation = state.donationAmount === amount ? 0 : amount;
    const totals = calculateTotals(
      state.items,
      state.discountAmount,
      state.giftWrap,
      newDonation,
    );
    set({
      donationAmount: newDonation,
      ...totals,
    });
  },

  setGstin: (gstin: string) => {
    set({ gstin: gstin.trim().toUpperCase() });
  },
}));
