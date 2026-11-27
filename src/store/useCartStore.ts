import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  cartApi,
  ApiProduct,
  CartModel,
  CartSplitBucketModel,
  getAuthToken,
} from '@/services/api';
import { registerAuthLoginCallback, registerAuthLogoutReset } from '@/store/useAuthStore';

let cartMutationChain: Promise<any> = Promise.resolve();
let cartMutationSeq = 0;
let lastServerCartSnapshot: CartModel | null = null;

function enqueueCartMutation<T>(fn: (mySeq: number) => Promise<T>): Promise<T> {
  cartMutationSeq += 1;
  const mySeq = cartMutationSeq;
  const next = cartMutationChain.then(
    () => fn(mySeq),
    () => fn(mySeq),
  );
  cartMutationChain = next.catch(() => {});
  return next;
}

const WISHLIST_STORAGE_KEY = 'affordz_wishlist';

async function loadPersistedWishlist(): Promise<string[]> {
  try {
    if (Platform.OS !== 'web') {
      const raw = await SecureStore.getItemAsync(WISHLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((id) => String(id));
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((id) => String(id));
      }
    }
  } catch {
    // ignore storage read error in tests/restricted environments
  }
  return [];
}

async function savePersistedWishlist(wishlist: string[]): Promise<void> {
  try {
    const raw = JSON.stringify(wishlist);
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(WISHLIST_STORAGE_KEY, raw);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, raw);
    }
  } catch {
    // ignore storage write error
  }
}

const FREE_DELIVERY_THRESHOLD = 1499;
const STANDARD_DELIVERY_FEE = 40;
/** MRP is GST-inclusive; no extra GST line is added at checkout. */
const GST_TAX_RATE = 0;
const GIFT_WRAP_FEE = 35;
const TRY_AND_BUY_SLOT_DURATION_MS = 15 * 60 * 1000;

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
  tryAndBuyEligible?: boolean;
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
  needGstInvoice: boolean;
  gstin: string | null;
  gstBusinessName: string | null;
  tryAndBuySlotExpiresAt: number | null;

  // Buy Now Standalone State (Exact product direct checkout)
  buyNowItem: LocalCartItem | null;
  setBuyNowItem: (item: LocalCartItem | null) => void;
  clearBuyNowItem: () => void;
  updateBuyNowQuantity: (delta: number) => void;

  fetchCart: () => Promise<void>;
  syncGuestCartToServer: () => Promise<void>;
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
  removeFromWishlist: (productId: string) => void;
  hydrateWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;

  // Coupon & Value-Add Handlers
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  removeCoupon: () => Promise<void>;
  toggleGiftWrap: () => Promise<void>;
  setDonation: (amount: number) => Promise<void>;
  setNeedGstInvoice: (val: boolean) => void;
  setGstin: (gstin: string) => void;
  setGstBusinessName: (name: string) => void;
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
  (serverCart.items || []).map((ci) => {
    const fType = ci.fulfillmentType || ci.product?.fulfillmentType || 'VENDOR';
    const isDark = fType === 'DARK_STORE';
    const eligible = isDark && (ci.tryAndBuyEligible ?? ci.product?.tryAndBuyEligible ?? ci.isTryAndBuy ?? false);
    return {
      id: ci.id,
      productId: ci.productId,
      title: ci.title || ci.product?.title || 'Fashion Garment',
      brand: ci.brand || ci.product?.brand || 'Affordz',
      vendorId: (ci as any).vendorId || ci.product?.vendor?.id,
      vendorName: (ci as any).vendorName || ci.product?.vendor?.storeName || ci.brand || ci.product?.brand,
      price: ci.price ?? ci.product?.price ?? 0,
      originalPrice: ci.originalPrice ?? ci.product?.originalPrice ?? ci.price ?? 0,
      size: ci.size,
      trialSize: isDark ? (ci.trialSize || null) : null,
      isTryAndBuy: eligible,
      tryAndBuyEligible: eligible,
      fulfillmentType: fType,
      darkStoreHub: ci.darkStoreHub || ci.product?.darkStoreHub || null,
      color: ci.color || 'Standard',
      quantity: ci.quantity,
      image: ci.image || ci.product?.image || '',
      discountBadge: ci.discount || ci.product?.discount || '',
    };
  });

function resolveNextTryAndBuySlot(
  items: LocalCartItem[],
  currentExpiresAt: number | null,
): number | null {
  const hasEligibleDark = items.some(
    (it) => it.fulfillmentType === 'DARK_STORE' && it.isTryAndBuy !== false,
  );
  if (!hasEligibleDark) return null;
  if (currentExpiresAt && currentExpiresAt > Date.now()) return currentExpiresAt;
  return Date.now() + TRY_AND_BUY_SLOT_DURATION_MS;
}

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
  needGstInvoice: false,
  gstin: null,
  gstBusinessName: null,
  tryAndBuySlotExpiresAt: null,

  buyNowItem: null,
  setBuyNowItem: (item) =>
    set({
      buyNowItem: item,
      ...(item && item.fulfillmentType === 'DARK_STORE' && item.isTryAndBuy !== false
        ? { tryAndBuySlotExpiresAt: Date.now() + TRY_AND_BUY_SLOT_DURATION_MS }
        : {}),
    }),
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
    const seqAtStart = cartMutationSeq;
    set({ isLoading: true, error: null });
    try {
      const serverCart = await cartApi.getCart();
      if (seqAtStart !== cartMutationSeq) {
        set({ isLoading: false });
        return;
      }
      lastServerCartSnapshot = serverCart;
      if (getAuthToken() || serverCart?.id || (serverCart?.items && serverCart.items.length > 0)) {
        const localItems = mapServerCartItems(serverCart);
        set({
          items: localItems,
          ...mapServerCartTotals(serverCart),
          tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(localItems, get().tryAndBuySlotExpiresAt),
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      if (seqAtStart !== cartMutationSeq) {
        set({ isLoading: false });
        return;
      }
      set({
        isLoading: false,
        error: err?.message || 'Could not fetch cart from server.',
      });
    }
  },

  syncGuestCartToServer: async () => {
    if (!getAuthToken()) return;
    const unsyncedItems = get().items.filter((it) => it.id.startsWith('ci-'));
    await enqueueCartMutation(async (mySeq) => {
      if (!getAuthToken()) return;
      let latestSyncedCart: CartModel | null = null;
      for (const item of unsyncedItems) {
        try {
          const serverCart = await cartApi.addItem(
            item.productId,
            item.size || 'M',
            item.quantity,
            item.trialSize || undefined,
            item.color || undefined,
          );
          lastServerCartSnapshot = serverCart;
          latestSyncedCart = serverCart;
        } catch {
          // ignore individual item sync failure (e.g., out of stock) and hydrate server truth
        }
      }
      if (!latestSyncedCart) {
        try {
          const latest = await cartApi.getCart();
          lastServerCartSnapshot = latest;
          latestSyncedCart = latest;
        } catch {
          // non-fatal
        }
      }
      if (mySeq === cartMutationSeq && latestSyncedCart && Array.isArray(latestSyncedCart.items)) {
        const mapped = mapServerCartItems(latestSyncedCart);
        set({
          items: mapped,
          ...mapServerCartTotals(latestSyncedCart),
          tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(mapped, get().tryAndBuySlotExpiresAt),
          error: null,
        });
      }
    });
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
      tryAndBuySlotExpiresAt: state.tryAndBuySlotExpiresAt,
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
        ...(trialSize && isDark ? { trialSize, isTryAndBuy: true, tryAndBuyEligible: true } : {}),
      };
    } else {
      const isDark = (product.fulfillmentType || 'VENDOR') === 'DARK_STORE';
      const eligible = isDark ? Boolean(trialSize || product.tryAndBuyEligible !== false) : false;
      const newItem: LocalCartItem = {
        id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: String(product.id),
        title: product.title || (product as any).name || 'Artisan Garment',
        brand: product.brand || 'Affordz',
        vendorId: product.vendor?.id || (product as any).vendorId,
        vendorName: product.vendor?.storeName || product.brand || 'Affordz',
        price: product.price,
        originalPrice: product.originalPrice || Math.round(product.price * 1.4),
        size: effectiveSize,
        trialSize: isDark ? (trialSize || null) : null,
        isTryAndBuy: eligible,
        tryAndBuyEligible: eligible,
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
      tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(updatedItems, state.tryAndBuySlotExpiresAt),
      ...totals,
    });

    if (getAuthToken()) {
      return enqueueCartMutation(async (mySeq) => {
        if (!getAuthToken()) return true;
        try {
          const serverCart = await cartApi.addItem(
            String(product.id),
            effectiveSize,
            quantity,
            trialSize,
            color,
          );
          lastServerCartSnapshot = serverCart;
          if (mySeq === cartMutationSeq && serverCart && Array.isArray(serverCart.items)) {
            const mapped = mapServerCartItems(serverCart);
            set({
              items: mapped,
              ...mapServerCartTotals(serverCart),
              tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(mapped, get().tryAndBuySlotExpiresAt),
              error: null,
            });
          }
          return true;
        } catch (err: any) {
          if (mySeq === cartMutationSeq) {
            set({
              ...prevSnapshot,
              error: err?.message || 'Unable to add item to bag.',
            });
          }
          return false;
        }
      });
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
      tryAndBuySlotExpiresAt: state.tryAndBuySlotExpiresAt,
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
      tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(updatedItems, state.tryAndBuySlotExpiresAt),
      ...totals,
    });

    if (getAuthToken()) {
      const targetProductId = target.productId;
      const targetSize = target.size;
      await enqueueCartMutation(async (mySeq) => {
        if (!getAuthToken()) return;
        try {
          let resolvedId = itemId;
          if (resolvedId.startsWith('ci-')) {
            const snapshotItems = lastServerCartSnapshot?.items || [];
            const matched = snapshotItems.find(
              (si) =>
                String(si.productId) === String(targetProductId) &&
                String(si.size || '') === String(targetSize || ''),
            );
            if (matched?.id) {
              resolvedId = matched.id;
            } else {
              const fresh = await cartApi.getCart();
              lastServerCartSnapshot = fresh;
              const freshMatch = (fresh.items || []).find(
                (si) =>
                  String(si.productId) === String(targetProductId) &&
                  String(si.size || '') === String(targetSize || ''),
              );
              if (freshMatch?.id) {
                resolvedId = freshMatch.id;
              } else {
                // Item never reached server DB; nothing to remove/update on server
                return;
              }
            }
          }

          const serverCart =
            newQty > 0
              ? await cartApi.updateQuantity(resolvedId, delta)
              : await cartApi.removeItem(resolvedId);
          lastServerCartSnapshot = serverCart;
          if (mySeq === cartMutationSeq && serverCart && Array.isArray(serverCart.items)) {
            const mapped = mapServerCartItems(serverCart);
            set({
              items: mapped,
              ...mapServerCartTotals(serverCart),
              tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(mapped, get().tryAndBuySlotExpiresAt),
              error: null,
            });
          }
        } catch (err: any) {
          if (mySeq === cartMutationSeq) {
            set({
              ...prevSnapshot,
              error: err?.message || 'Unable to update item quantity.',
            });
          }
        }
      });
    }
  },

  removeItem: async (itemId) => {
    const state = get();
    const target = state.items.find((i) => i.id === itemId);
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
      tryAndBuySlotExpiresAt: state.tryAndBuySlotExpiresAt,
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
      tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(updatedItems, state.tryAndBuySlotExpiresAt),
      ...totals,
    });

    if (getAuthToken()) {
      const targetProductId = target?.productId;
      const targetSize = target?.size;
      await enqueueCartMutation(async (mySeq) => {
        if (!getAuthToken()) return;
        try {
          let resolvedId = itemId;
          if (resolvedId.startsWith('ci-') && targetProductId) {
            const snapshotItems = lastServerCartSnapshot?.items || [];
            const matched = snapshotItems.find(
              (si) =>
                String(si.productId) === String(targetProductId) &&
                String(si.size || '') === String(targetSize || ''),
            );
            if (matched?.id) {
              resolvedId = matched.id;
            } else {
              const fresh = await cartApi.getCart();
              lastServerCartSnapshot = fresh;
              const freshMatch = (fresh.items || []).find(
                (si) =>
                  String(si.productId) === String(targetProductId) &&
                  String(si.size || '') === String(targetSize || ''),
              );
              if (freshMatch?.id) {
                resolvedId = freshMatch.id;
              } else {
                return;
              }
            }
          }

          const serverCart = await cartApi.removeItem(resolvedId);
          lastServerCartSnapshot = serverCart;
          if (mySeq === cartMutationSeq && serverCart && Array.isArray(serverCart.items)) {
            const mapped = mapServerCartItems(serverCart);
            set({
              items: mapped,
              ...mapServerCartTotals(serverCart),
              tryAndBuySlotExpiresAt: resolveNextTryAndBuySlot(mapped, get().tryAndBuySlotExpiresAt),
              error: null,
            });
          }
        } catch (err: any) {
          if (mySeq === cartMutationSeq) {
            set({
              ...prevSnapshot,
              error: err?.message || 'Unable to remove item.',
            });
          }
        }
      });
    }
  },

  clearCart: async () => {
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
      needGstInvoice: false,
      gstin: null,
      gstBusinessName: null,
      tryAndBuySlotExpiresAt: null,
      error: null,
    });
    if (getAuthToken()) {
      await enqueueCartMutation(async () => {
        try {
          await cartApi.clearCart();
          lastServerCartSnapshot = null;
        } catch {
          // Ignore clear errors after checkout
        }
      });
    }
  },

  hydrateWishlist: async () => {
    const stored = await loadPersistedWishlist();
    if (stored.length > 0 && get().wishlist.length === 0) {
      set({ wishlist: stored });
    }
  },

  toggleWishlist: (productId: string) => {
    const idStr = String(productId);
    const wishlist = get().wishlist.map((id) => String(id));
    const exists = wishlist.includes(idStr);
    const updated = exists ? wishlist.filter((id) => id !== idStr) : [...wishlist, idStr];
    set({ wishlist: updated });
    void savePersistedWishlist(updated);
  },

  removeFromWishlist: (productId: string) => {
    const idStr = String(productId);
    const updated = get().wishlist.map((id) => String(id)).filter((id) => id !== idStr);
    set({ wishlist: updated });
    void savePersistedWishlist(updated);
  },

  isWishlisted: (productId: string) => {
    const idStr = String(productId);
    return get().wishlist.some((id) => String(id) === idStr);
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

  setNeedGstInvoice: (val: boolean) => {
    set({ needGstInvoice: val });
  },

  setGstin: (gstin: string) => {
    set({ gstin: gstin.trim().toUpperCase() });
  },

  setGstBusinessName: (name: string) => {
    set({ gstBusinessName: name });
  },

  resetCartState: () => {
    lastServerCartSnapshot = null;
    cartMutationSeq += 1;
    void savePersistedWishlist([]);
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
      needGstInvoice: false,
      gstin: null,
      gstBusinessName: null,
      tryAndBuySlotExpiresAt: null,
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

registerAuthLoginCallback(() => {
  useCartStore.getState().syncGuestCartToServer().catch(() => {});
});
