import { create } from 'zustand';
import {
  cartApi,
  ApiProduct,
  CartModel,
  CartSplitBucketModel,
  getAuthToken,
} from '@/services/api';
import { registerAuthLogoutReset } from '@/store/useAuthStore';

const FREE_DELIVERY_THRESHOLD = 1499;
const STANDARD_DELIVERY_FEE = 40;
const GST_TAX_RATE = 0.05;
const GIFT_WRAP_FEE = 35;

export interface LocalCartItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  vendorId?: string;
  vendorName?: string;
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
  giftWrapFee: number;
  splitOrderCount: number;
  splitBuckets: CartSplitBucketModel[];
  count: number;
  isLoading: boolean;
  error: string | null;
  wishlist: string[];

  // Enhanced Order Value-Adds
  couponCode: string | null;
  discountAmount: number;
  giftWrap: boolean;
  donationAmount: number;
  gstin: string | null;

  // Buy Now Standalone State (Exact product direct checkout)
  buyNowItem: LocalCartItem | null;
  setBuyNowItem: (item: LocalCartItem | null) => void;
  clearBuyNowItem: () => void;
  updateBuyNowQuantity: (delta: number) => void;

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
  toggleGiftWrap: () => Promise<void>;
  setDonation: (amount: number) => Promise<void>;
  setGstin: (gstin: string) => void;
  resetCartState: () => void;
}

const buildLocalSplitBuckets = (items: LocalCartItem[]): CartSplitBucketModel[] => {
  const map = new Map<string, LocalCartItem[]>();
  for (const item of items) {
    const fType = item.fulfillmentType === 'DARK_STORE' ? 'DARK_STORE' : 'VENDOR';
    const vId = item.vendorId || 'default-vendor';
    const key = `${vId}::${fType}`;
    const existing = map.get(key) || [];
    existing.push(item);
    map.set(key, existing);
  }

  const buckets: CartSplitBucketModel[] = [];
  map.forEach((bucketItems, bucketKey) => {
    const first = bucketItems[0];
    const bucketItemTotal = bucketItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const bucketItemCount = bucketItems.reduce((acc, i) => acc + i.quantity, 0);
    const fulfillmentType = first.fulfillmentType === 'DARK_STORE' ? 'DARK_STORE' : 'VENDOR';
    buckets.push({
      bucketKey,
      vendorId: first.vendorId || 'default-vendor',
      vendorName: first.vendorName || first.brand || 'Affordz',
      fulfillmentType,
      darkStoreHubId: first.darkStoreHub?.id ?? null,
      itemTotal: bucketItemTotal,
      itemCount: bucketItemCount,
      tryAndBuyEligible: fulfillmentType === 'DARK_STORE',
      deliveryFee: bucketItemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE,
      items: [],
    });
  });

  return buckets;
};

const calculateTotals = (
  items: LocalCartItem[],
  discountAmount = 0,
  giftWrap = false,
  donationAmount = 0,
) => {
  const itemTotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const taxes = Math.round(itemTotal * GST_TAX_RATE);
  const splitBuckets = buildLocalSplitBuckets(items);
  const splitOrderCount = items.length > 0 ? splitBuckets.length : 0;
  const deliveryFee =
    items.length > 0
      ? splitBuckets.reduce((acc, bucket) => acc + bucket.deliveryFee, 0)
      : 0;
  const giftWrapFee = items.length > 0 && giftWrap ? GIFT_WRAP_FEE : 0;
  const effectiveDonation = items.length > 0 ? Number(donationAmount || 0) : 0;
  const grandTotal = Math.max(
    0,
    itemTotal - discountAmount + taxes + deliveryFee + giftWrapFee + effectiveDonation,
  );
  return {
    itemTotal,
    taxes,
    deliveryFee,
    giftWrapFee,
    splitOrderCount,
    splitBuckets,
    count,
    grandTotal,
  };
};

const mapServerCartItems = (serverCart: CartModel): LocalCartItem[] =>
  (serverCart.items || []).map((ci) => ({
    id: ci.id,
    productId: ci.productId,
    title: ci.title || ci.product?.title || 'Fashion Garment',
    brand: ci.brand || ci.product?.brand || 'Affordz',
    vendorId: (ci as any).vendorId || ci.product?.vendor?.id,
    vendorName: (ci as any).vendorName || ci.product?.vendor?.storeName || ci.brand || ci.product?.brand,
    price: ci.price ?? ci.product?.price ?? 0,
    originalPrice: ci.originalPrice ?? ci.product?.originalPrice ?? ci.price ?? 0,
    size: ci.size,
    trialSize: ci.trialSize || null,
    isTryAndBuy: ci.isTryAndBuy ?? Boolean(ci.trialSize),
    fulfillmentType: ci.fulfillmentType || ci.product?.fulfillmentType || 'VENDOR',
    darkStoreHub: ci.darkStoreHub || ci.product?.darkStoreHub || null,
    color: ci.color || 'Standard',
    quantity: ci.quantity,
    image: ci.image || ci.product?.image || '',
    discountBadge: ci.discount || ci.product?.discount || '',
  }));

const mapServerCartTotals = (serverCart: CartModel) => {
  const items = serverCart.items || [];
  const splitBuckets = serverCart.splitBuckets || [];
  return {
    itemTotal: serverCart.itemTotal ?? 0,
    deliveryFee: serverCart.deliveryFee ?? 0,
    taxes: serverCart.taxes ?? 0,
    discountAmount: serverCart.discountAmount ?? 0,
    couponCode: serverCart.couponCode ?? null,
    giftWrap: Boolean(serverCart.giftWrap),
    giftWrapFee: serverCart.giftWrapFee ?? (serverCart.giftWrap ? GIFT_WRAP_FEE : 0),
    donationAmount: serverCart.donationAmount ?? 0,
    splitOrderCount: serverCart.splitOrderCount ?? splitBuckets.length,
    splitBuckets,
    count: serverCart.count ?? items.reduce((acc, i) => acc + i.quantity, 0),
    grandTotal: serverCart.grandTotal ?? 0,
  };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemTotal: 0,
  deliveryFee: 0,
  taxes: 0,
  grandTotal: 0,
  giftWrapFee: 0,
  splitOrderCount: 0,
  splitBuckets: [],
  count: 0,
  isLoading: false,
  error: null,
  wishlist: [],

  couponCode: null,
  discountAmount: 0,
  giftWrap: false,
  donationAmount: 0,
  gstin: null,

  buyNowItem: null,
  setBuyNowItem: (item) => set({ buyNowItem: item }),
  clearBuyNowItem: () => set({ buyNowItem: null }),
  updateBuyNowQuantity: (delta) => {
    const state = get();
    if (!state.buyNowItem) return;
    const newQty = state.buyNowItem.quantity + delta;
    if (newQty <= 0) {
      set({ buyNowItem: null });
    } else {
      set({
        buyNowItem: {
          ...state.buyNowItem,
          quantity: newQty,
        },
      });
    }
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const serverCart = await cartApi.getCart();
      if (getAuthToken() || serverCart?.id || (serverCart?.items && serverCart.items.length > 0)) {
        const localItems = mapServerCartItems(serverCart);
        set({
          items: localItems,
          ...mapServerCartTotals(serverCart),
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Could not fetch cart from server.',
      });
    }
  },

  addItem: async (product, size = 'M', color = 'Standard', quantity = 1, trialSize?: string) => {
    const effectiveSize = size || 'M';
    const state = get();
    const prevSnapshot = {
      items: state.items,
      itemTotal: state.itemTotal,
      deliveryFee: state.deliveryFee,
      taxes: state.taxes,
      grandTotal: state.grandTotal,
      giftWrapFee: state.giftWrapFee,
      splitOrderCount: state.splitOrderCount,
      splitBuckets: state.splitBuckets,
      count: state.count,
    };

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
        vendorId: product.vendor?.id || (product as any).vendorId,
        vendorName: product.vendor?.storeName || product.brand || 'Affordz',
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
        discountBadge: product.discount || '',
      };
      updatedItems = [...state.items, newItem];
    }

    const totals = calculateTotals(
      updatedItems,
      state.discountAmount,
      state.giftWrap,
      state.donationAmount,
    );

    set({
      items: updatedItems,
      error: null,
      ...totals,
    });

    if (getAuthToken()) {
      try {
        const serverCart = await cartApi.addItem(
          String(product.id),
          effectiveSize,
          quantity,
          trialSize,
          color,
        );
        if (serverCart && Array.isArray(serverCart.items)) {
          set({
            items: mapServerCartItems(serverCart),
            ...mapServerCartTotals(serverCart),
            error: null,
          });
        }
      } catch (err: any) {
        set({
          ...prevSnapshot,
          error: err?.message || 'Unable to add item to bag.',
        });
        return false;
      }
    }

    return true;
  },

  updateQuantity: async (itemId, delta) => {
    const state = get();
    const target = state.items.find((i) => i.id === itemId);
    if (!target) return;

    const prevSnapshot = {
      items: state.items,
      itemTotal: state.itemTotal,
      deliveryFee: state.deliveryFee,
      taxes: state.taxes,
      grandTotal: state.grandTotal,
      giftWrapFee: state.giftWrapFee,
      splitOrderCount: state.splitOrderCount,
      splitBuckets: state.splitBuckets,
      count: state.count,
    };

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

    set({
      items: updatedItems,
      error: null,
      ...totals,
    });

    if (getAuthToken()) {
      try {
        const serverCart =
          newQty > 0
            ? await cartApi.updateQuantity(itemId, delta)
            : await cartApi.removeItem(itemId);
        if (serverCart && Array.isArray(serverCart.items)) {
          set({
            items: mapServerCartItems(serverCart),
            ...mapServerCartTotals(serverCart),
            error: null,
          });
        }
      } catch (err: any) {
        set({
          ...prevSnapshot,
          error: err?.message || 'Unable to update item quantity.',
        });
      }
    }
  },

  removeItem: async (itemId) => {
    const state = get();
    const prevSnapshot = {
      items: state.items,
      itemTotal: state.itemTotal,
      deliveryFee: state.deliveryFee,
      taxes: state.taxes,
      grandTotal: state.grandTotal,
      giftWrapFee: state.giftWrapFee,
      splitOrderCount: state.splitOrderCount,
      splitBuckets: state.splitBuckets,
      count: state.count,
    };

    const updatedItems = state.items.filter((i) => i.id !== itemId);
    const totals = calculateTotals(
      updatedItems,
      state.discountAmount,
      state.giftWrap,
      state.donationAmount,
    );

    set({
      items: updatedItems,
      error: null,
      ...totals,
    });

    if (getAuthToken()) {
      try {
        const serverCart = await cartApi.removeItem(itemId);
        if (serverCart && Array.isArray(serverCart.items)) {
          set({
            items: mapServerCartItems(serverCart),
            ...mapServerCartTotals(serverCart),
            error: null,
          });
        }
      } catch (err: any) {
        set({
          ...prevSnapshot,
          error: err?.message || 'Unable to remove item.',
        });
      }
    }
  },

  clearCart: async () => {
    if (getAuthToken()) {
      try {
        await cartApi.clearCart();
      } catch {
        // Ignore clear errors after checkout
      }
    }
    set({
      items: [],
      itemTotal: 0,
      taxes: 0,
      deliveryFee: 0,
      grandTotal: 0,
      giftWrapFee: 0,
      splitOrderCount: 0,
      splitBuckets: [],
      count: 0,
      couponCode: null,
      discountAmount: 0,
      giftWrap: false,
      donationAmount: 0,
      gstin: null,
      error: null,
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
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      const serverCart = await cartApi.applyCoupon(cleanCode);
      const discount = serverCart.discountAmount || 0;
      set({
        ...(Array.isArray(serverCart.items) ? { items: mapServerCartItems(serverCart) } : {}),
        ...mapServerCartTotals(serverCart),
        couponCode: serverCart.couponCode || cleanCode,
        discountAmount: discount,
        error: null,
      });
      return {
        success: true,
        message: `Coupon ${cleanCode} applied! Saved ₹${discount}`,
        discount,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Unable to apply coupon. Please sign in and verify the code.',
      };
    }
  },

  removeCoupon: async () => {
    if (getAuthToken()) {
      try {
        const serverCart = await cartApi.removeCoupon();
        set({
          ...mapServerCartTotals(serverCart),
          couponCode: null,
          discountAmount: 0,
          error: null,
        });
        return;
      } catch (err: any) {
        set({ error: err?.message || 'Unable to remove coupon.' });
        return;
      }
    }
    const state = get();
    const totals = calculateTotals(state.items, 0, state.giftWrap, state.donationAmount);
    set({
      couponCode: null,
      discountAmount: 0,
      ...totals,
    });
  },

  toggleGiftWrap: async () => {
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
    if (getAuthToken()) {
      try {
        const serverCart = await cartApi.updatePreferences({ giftWrap: newWrap });
        set({
          ...mapServerCartTotals(serverCart),
          giftWrap: serverCart.giftWrap ?? newWrap,
        });
      } catch (err: any) {
        set({
          error: err?.message || 'Unable to save gift wrap preference.',
        });
      }
    }
  },

  setDonation: async (amount: number) => {
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
    if (getAuthToken()) {
      try {
        const serverCart = await cartApi.updatePreferences({ donationAmount: newDonation });
        set({
          ...mapServerCartTotals(serverCart),
          donationAmount: serverCart.donationAmount ?? newDonation,
        });
      } catch {
        // restore or keep error non-fatal; totals stay local if guest
      }
    }
  },

  setGstin: (gstin: string) => {
    set({ gstin: gstin.trim().toUpperCase() });
  },

  resetCartState: () => {
    set({
      items: [],
      buyNowItem: null,
      wishlist: [],
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      discountAmount: 0,
      giftWrap: false,
      giftWrapFee: 0,
      donationAmount: 0,
      gstin: null,
      couponCode: null,
      grandTotal: 0,
      splitOrderCount: 0,
      splitBuckets: [],
      count: 0,
      isLoading: false,
      error: null,
    });
  },
}));

registerAuthLogoutReset(() => {
  useCartStore.getState().resetCartState();
});
