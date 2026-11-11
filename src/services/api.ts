import { Platform } from 'react-native';
import {
  OrderStatus as CanonicalOrderStatus,
  CheckoutResponseContract,
  TryAndBuySessionContract,
} from '@/contracts/order-contracts';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

export const PRODUCT_ID_MAP: Record<string, string> = {
  '101': 'prod-2',
  'prod-101': 'prod-2',
  '102': 'prod-1',
  'prod-102': 'prod-1',
  '103': 'prod-3',
  'prod-103': 'prod-3',
  '104': 'prod-5',
  'prod-104': 'prod-5',
  '105': 'prod-6',
  'prod-105': 'prod-6',
  '106': 'prod-4',
  'prod-106': 'prod-4',
  '107': 'prod-10',
  'prod-107': 'prod-10',
  '108': 'prod-7',
  'prod-108': 'prod-7',
  '1': 'prod-1',
  '2': 'prod-5',
  '3': 'prod-9',
  '4': 'prod-6',
  '5': 'prod-5',
  '6': 'prod-6',
  '7': 'prod-7',
  '8': 'prod-8',
  '9': 'prod-4',
  '10': 'prod-10',
};

// Token management in-memory (fails closed to null)
let authToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;
let tokenRefresherCallback: (() => Promise<string | null>) | null = null;
let isHandlingUnauthorized = false;
let refreshPromise: Promise<string | null> | null = null;

export function setTokenRefresher(cb: (() => Promise<string | null>) | null) {
  tokenRefresherCallback = cb;
}

export const setOnUnauthorizedCallback = (callback: (() => void) | null) => {
  onUnauthorizedCallback = callback;
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export interface ApiError extends Error {
  status?: number;
}

function createApiError(message: string, status?: number): ApiError {
  const err = new Error(message) as ApiError;
  if (typeof status === 'number') {
    err.status = status;
  }
  return err;
}

// Generic request helper with timeout, single 401 refresh retry, and strict 403 non-logout
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 401) {
        const isAuthExchangeEndpoint =
          endpoint.includes('/auth/login-firebase') ||
          endpoint.includes('/auth/firebase/login') ||
          endpoint.includes('/auth/phone/');

        if (!isRetry && !isAuthExchangeEndpoint && typeof tokenRefresherCallback === 'function') {
          if (!refreshPromise) {
            refreshPromise = tokenRefresherCallback().finally(() => {
              refreshPromise = null;
            });
          }
          const refreshedToken = await refreshPromise;
          if (refreshedToken) {
            setAuthToken(refreshedToken);
            return request<T>(endpoint, options, true);
          }
        }

        if (!isAuthExchangeEndpoint) {
          setAuthToken(null);
          if (!isHandlingUnauthorized && typeof onUnauthorizedCallback === 'function') {
            isHandlingUnauthorized = true;
            try {
              onUnauthorizedCallback();
            } catch {
              // ignore
            } finally {
              setTimeout(() => {
                isHandlingUnauthorized = false;
              }, 1000);
            }
          }
        }
      }
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.message || `Request failed with status ${res.status}`,
        res.status,
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    const text = await res.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isAborted =
      error?.name === 'AbortError' ||
      error?.message?.includes('canceled') ||
      error?.message?.includes('aborted');
    if (!isAborted) {
      console.warn(`[Affordz API] ${endpoint} request error:`, error?.message || error);
    }
    throw error;
  }
}

// -------------------------------------------------------------
// AUTH API
// -------------------------------------------------------------
export interface AuthUser {
  id: string;
  phone: string | null;
  name: string;
  email: string | null;
  avatar: string | null;
  role: 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN';
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  role: string;
  user: AuthUser;
}

export const authApi = {
  sendOtp: async (phone: string): Promise<{ success: boolean; message: string; countdownSeconds: number; devOtp?: string; otp?: string }> => {
    try {
      return await request<{ success: boolean; message: string; countdownSeconds: number; devOtp?: string; otp?: string }>(
        '/api/v1/auth/phone/send-otp',
        {
          method: 'POST',
          body: JSON.stringify({ phoneNumber: phone }),
        }
      );
    } catch (err: any) {
      console.warn('[Affordz Auth] sendOtp failed:', err?.message || err);
      throw new Error(err?.message || 'Could not send OTP: Authentication service is unavailable.');
    }
  },

  verifyOtp: async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    try {
      const res = await request<VerifyOtpResponse>('/api/v1/auth/phone/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    } catch (err: any) {
      console.warn('[Affordz Auth] verifyOtp failed:', err?.message || err);
      throw new Error(err?.message || 'Invalid or unverified OTP. Authentication failed.');
    }
  },

  loginFirebase: async (idToken: string): Promise<VerifyOtpResponse> => {
    try {
      const res = await request<VerifyOtpResponse>('/api/v1/auth/login-firebase', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    } catch (err: any) {
      console.warn('[Affordz Auth] loginFirebase failed:', err?.message || err);
      throw new Error(err?.message || 'Firebase login failed: Unable to authenticate with server.');
    }
  },

  getProfile: async (): Promise<AuthUser | null> => {
    if (!authToken) return null;
    try {
      return await request<AuthUser>('/api/v1/users/me');
    } catch {
      return null;
    }
  },

  verifyProfileSession: async (): Promise<AuthUser | null> => {
    if (!authToken) return null;
    return await request<AuthUser>('/api/v1/users/me');
  },

  updateProfile: async (data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    avatar?: string | null;
  }): Promise<AuthUser> => {
    if (!authToken) {
      throw createApiError('Please sign in to update your profile.', 401);
    }

    const payload: Record<string, any> = {};
    if (data.name !== undefined && data.name.trim()) {
      payload.name = data.name.trim();
    }
    if (data.email !== undefined) {
      const emailTrim = data.email === null ? '' : data.email.trim();
      payload.email = emailTrim ? emailTrim.toLowerCase() : null;
    }
    if (data.phone !== undefined) {
      const phoneTrim = data.phone === null ? '' : data.phone.trim();
      payload.phone = phoneTrim ? phoneTrim : null;
    }
    if (data.avatar !== undefined) {
      payload.avatar = data.avatar;
    }

    return await request<AuthUser>('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteAccount: async (): Promise<{ deleted?: boolean; success?: boolean; message?: string }> => {
    if (!authToken) {
      throw createApiError('Please sign in to delete your account.', 401);
    }
    return await request<{ deleted?: boolean; success?: boolean; message?: string }>(
      '/api/v1/users/me',
      { method: 'DELETE' },
    );
  },
};

// -------------------------------------------------------------
// CATALOG API
// -------------------------------------------------------------
export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  level?: 1 | 2 | 3;
  parentId?: string | null;
  countText: string;
  icon: string;
  image?: string;
  banner?: string;
  gender?: 'Women' | 'Men' | 'Kids' | 'Unisex';
  productCount?: number;
  displayOrder?: number;
  subcategories?: CategoryItem[];
  children?: CategoryItem[];
}

export interface ProductColor {
  name: string;
  hex: string;
  productId?: string;
  image?: string;
}

export interface ApiProduct {
  id: string;
  colorGroupId?: string;
  colorName?: string;
  colorHex?: string;
  brand: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewsCount: number;
  stockQuantity: number;
  stockBadge?: string | null;
  readyToShip: boolean;
  sizes: string[];
  fabric?: string | null;
  origin?: string | null;
  image: string;
  altText: string;
  galleryImages: string[];
  category: string;
  fulfillmentType?: 'DARK_STORE' | 'VENDOR';
  darkStoreHubId?: string;
  darkStoreHub?: { id: string; name: string; locality: string; deliveryMinutes: number };
  tryAndBuyEligible?: boolean;
  vendor?: {
    id: string;
    storeName: string;
    address: string;
    phone: string;
  };
  colors?: ProductColor[];
  specifications?: Record<string, string>;
  certification?: string;
}

export interface ApiSearchSuggestionItem {
  text: string;
  type: 'keyword' | 'category' | 'brand';
  highlight?: string;
  count?: number;
}

export interface ApiSearchSuggestionsResponse {
  query: string;
  suggestions: ApiSearchSuggestionItem[];
  categories: { id: string; name: string; count: number }[];
  brands: { name: string; count: number }[];
  trending: string[];
  recentPicks: ApiProduct[];
}

export const catalogApi = {
  getCategories: async (params?: { tree?: boolean; parentId?: string; level?: number; gender?: string }): Promise<CategoryItem[]> => {
    const q = new URLSearchParams();
    if (params?.tree) q.append('tree', 'true');
    if (params?.parentId) q.append('parentId', params.parentId);
    if (params?.level) q.append('level', String(params.level));
    if (params?.gender && params.gender !== 'All') q.append('gender', params.gender);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<CategoryItem[]>(`/api/v1/categories${qs}`);
  },

  getCategoriesHierarchy: async (gender?: string): Promise<CategoryItem[]> => {
    const q = gender && gender !== 'All' ? `?gender=${encodeURIComponent(gender)}` : '';
    return await request<CategoryItem[]>(`/api/v1/categories/hierarchy${q}`);
  },

  getDarkStores: async (): Promise<any[]> => {
    return await request<any[]>('/api/v1/dark-stores');
  },

  getActiveCoupons: async (): Promise<any[]> => {
    return await request<any[]>('/api/v1/coupons/active');
  },

  getProducts: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
    fulfillmentType?: string;
    tryAndBuyOnly?: boolean | string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiProduct[]> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.fulfillmentType) query.append('fulfillmentType', params.fulfillmentType);
    if (params?.tryAndBuyOnly) query.append('tryAndBuyOnly', String(params.tryAndBuyOnly));
    if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request<ApiProduct[]>(`/api/v1/products${qs}`);
  },

  getProductById: async (id: string): Promise<ApiProduct> => {
    const rawId = String(id).trim();
    const mappedId =
      PRODUCT_ID_MAP[rawId] ||
      (rawId.startsWith('prod-') || rawId.startsWith('deal-') ? rawId : `prod-${rawId}`);
    return await request<ApiProduct>(`/api/v1/products/${encodeURIComponent(mappedId)}`);
  },

  getSearchSuggestions: async (q?: string, limit?: number): Promise<ApiSearchSuggestionsResponse> => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (limit) params.append('limit', String(limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request<ApiSearchSuggestionsResponse>(`/api/v1/search/suggestions${qs}`);
  },

  searchProducts: async (params?: {
    search?: string;
    category?: string;
    fulfillmentType?: string;
    tryAndBuyOnly?: boolean | string;
    sortBy?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiProduct[]> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.fulfillmentType) query.append('fulfillmentType', params.fulfillmentType);
    if (params?.tryAndBuyOnly) query.append('tryAndBuyOnly', String(params.tryAndBuyOnly));
    if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request<ApiProduct[]>(`/api/v1/search${qs}`);
  },
};

// -------------------------------------------------------------
// CART API
// -------------------------------------------------------------
export interface CartItemModel {
  id: string;
  cartId?: string;
  productId: string;
  product?: ApiProduct;
  title?: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  discount?: string;
  size: string;
  trialSize?: string | null;
  isTryAndBuy?: boolean;
  fulfillmentType?: 'DARK_STORE' | 'VENDOR';
  darkStoreHub?: any;
  color?: string | null;
  quantity: number;
  image?: string;
}

export interface CartSplitBucketModel {
  bucketKey: string;
  vendorId: string;
  vendorName: string;
  fulfillmentType: 'DARK_STORE' | 'VENDOR';
  darkStoreHubId?: string | null;
  itemTotal: number;
  itemCount: number;
  tryAndBuyEligible: boolean;
  deliveryFee: number;
  items: CartItemModel[];
}

export interface CartModel {
  id: string;
  userId?: string;
  items: CartItemModel[];
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  discountAmount?: number;
  giftWrap?: boolean;
  giftWrapFee?: number;
  donationAmount?: number;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
  couponCode?: string | null;
  grandTotal: number;
  splitOrderCount?: number;
  splitBuckets?: CartSplitBucketModel[];
  count?: number;
}

export const cartApi = {
  getCart: async (): Promise<CartModel> => {
    if (!authToken) {
      return {
        id: '',
        userId: '',
        items: [],
        itemTotal: 0,
        deliveryFee: 0,
        taxes: 0,
        giftWrap: false,
        giftWrapFee: 0,
        donationAmount: 0,
        splitOrderCount: 0,
        splitBuckets: [],
        grandTotal: 0,
      };
    }
    return await request<CartModel>('/api/v1/cart');
  },

  updatePreferences: async (prefs: {
    giftWrap?: boolean;
    donationAmount?: number;
  }): Promise<CartModel> => {
    return await request<CartModel>('/api/v1/cart/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    });
  },

  addItem: async (
    productId: string,
    size: string,
    quantity = 1,
    trialSize?: string,
    color?: string,
  ): Promise<CartModel> => {
    try {
      return await request<CartModel>('/api/v1/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productId:
            String(productId).startsWith('prod-') || String(productId).startsWith('deal-')
              ? String(productId)
              : !isNaN(Number(productId))
              ? `prod-${productId}`
              : String(productId),
          size,
          quantity,
          ...(trialSize ? { trialSize } : {}),
          ...(color ? { color } : {}),
        }),
      });
    } catch (e: any) {
      throw e;
    }
  },

  updateQuantity: async (itemId: string, delta: number): Promise<CartModel> => {
    return await request<CartModel>(`/api/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    });
  },

  removeItem: async (itemId: string): Promise<CartModel> => {
    return await request<CartModel>(`/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  applyCoupon: async (code: string): Promise<CartModel> => {
    return await request<CartModel>('/api/v1/cart/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  removeCoupon: async (): Promise<CartModel> => {
    return await request<CartModel>('/api/v1/cart/coupons/remove', {
      method: 'DELETE',
    });
  },

  clearCart: async (): Promise<{ success: boolean }> => {
    return await request<{ success: boolean }>('/api/v1/cart', {
      method: 'DELETE',
    });
  },
};

// -------------------------------------------------------------
// ADDRESS API
// -------------------------------------------------------------
export interface AddressModel {
  id: string;
  userId: string;
  label: string;
  recipientName?: string;
  recipientPhone?: string;
  line1: string;
  line2?: string;
  locality: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const addressApi = {
  getAddresses: async (): Promise<AddressModel[]> => {
    if (!authToken) {
      return [];
    }
    return await request<AddressModel[]>('/api/v1/addresses');
  },

  addAddress: async (data: Omit<AddressModel, 'id' | 'userId'>): Promise<AddressModel> => {
    if (!authToken) {
      throw createApiError('Please sign in to save a delivery address.', 401);
    }
    return await request<AddressModel>('/api/v1/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAddress: async (id: string, data: Partial<AddressModel>): Promise<AddressModel> => {
    if (!authToken) {
      throw createApiError('Please sign in to update a delivery address.', 401);
    }
    return await request<AddressModel>(`/api/v1/addresses/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteAddress: async (id: string): Promise<boolean> => {
    if (!authToken) {
      throw createApiError('Please sign in to remove a delivery address.', 401);
    }
    await request<{ success: boolean }>(`/api/v1/addresses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  },

  setDefault: async (id: string): Promise<AddressModel> => {
    if (!authToken) {
      throw createApiError('Please sign in to select a default delivery address.', 401);
    }
    return await request<AddressModel>(`/api/v1/addresses/${encodeURIComponent(id)}/default`, {
      method: 'PATCH',
    });
  },
};

// -------------------------------------------------------------
// ORDERS & TRACKING API
// -------------------------------------------------------------
export type OrderStatus = CanonicalOrderStatus;

export interface OrderItemModel {
  id: string;
  productId?: string;
  title: string;
  brand: string;
  size: string;
  color?: string;
  trialSize?: string;
  price: number;
  quantity: number;
  image: string;
  fulfillmentType?: string;
  isTryAndBuy?: boolean;
  tryAndBuyDecision?: 'KEEP' | 'RETURN' | string | null;
}

export interface OrderModel {
  id: string;
  orderNumber: string;
  version?: number;
  customerId: string;
  checkoutGroupId?: string | null;
  groupNumber?: string | null;
  fulfillmentType?: string;
  status: OrderStatus;
  paymentMethod: 'RAZORPAY' | 'COD';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'PARTIAL';
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  taxAmount?: number;
  giftWrapFee?: number;
  donationAmount?: number;
  discountAmount?: number;
  couponCode?: string | null;
  isTryAndBuy?: boolean;
  isArrived?: boolean;
  arrivedAt?: string | null;
  handoverOtp?: string;
  tryAndBuySession?: TryAndBuySessionContract | null;
  grandTotal: number;
  etaMinutes: number;
  createdAt: string;
  address?: AddressModel;
  deliveryAddress?: AddressModel;
  items: OrderItemModel[];
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    photo?: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayKeyId?: string;
  checkoutSessionToken?: string;
  checkoutSessionUrl?: string;
  splitOrders?: OrderModel[];
  checkoutGroup?: CheckoutResponseContract;
}

export interface OrderTrackingMilestone {
  key: OrderStatus;
  label: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  timestamp?: string;
}

export interface TrackingModel {
  orderId: string;
  orderNumber: string;
  version?: number;
  status: OrderStatus;
  trackingActive?: boolean;
  isArrived?: boolean;
  arrivedAt?: string | null;
  etaMinutes: number;
  itemTotal?: number;
  deliveryFee?: number;
  taxes?: number;
  giftWrapFee?: number;
  donationAmount?: number;
  discountAmount?: number;
  couponCode?: string | null;
  isTryAndBuy?: boolean;
  tryAndBuySession?: TryAndBuySessionContract | null;
  handoverOtp?: string | null;
  deliveryInstructions?: string | null;
  grandTotal?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryAddress?: AddressModel;
  driverLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
  } | null;
  driverCoords?: {
    latitude: number;
    longitude: number;
  } | null;
  customerCoords?: {
    latitude: number;
    longitude: number;
  } | null;
  deliveryCoordinates?: {
    latitude: number;
    longitude: number;
  };
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  route?: {
    encodedPolyline?: string;
    coordinates?: [number, number][];
    distanceMeters?: number;
    distanceKm?: string;
    durationSeconds?: number;
    durationMinutes?: number;
    travelMode?: string;
    isRealRoute?: boolean;
    isStraightLineReference?: boolean;
    routeUnavailable?: boolean;
  } | null;
  items?: OrderItemModel[];
  milestones: OrderTrackingMilestone[];
  history?: any[];
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    photo?: string;
    rating: number;
    currentLocation?: {
      latitude: number;
      longitude: number;
      heading?: number;
      accuracy?: number;
      speed?: number;
      updatedAt?: string;
    } | null;
    isStale?: boolean;
  } | null;
}

export interface CheckoutPayload {
  addressId: string;
  paymentMethod: 'RAZORPAY' | 'COD';
  couponCode?: string;
  isTryAndBuy?: boolean;
  isBuyNow?: boolean;
  items?: OrderItemModel[];
  itemTotal?: number;
  deliveryFee?: number;
  taxes?: number;
  grandTotal?: number;
  giftWrap?: boolean;
  donationAmount?: number;
  deliveryInstructions?: string;
  idempotencyKey?: string;
}

function mapRawOrder(raw: any): OrderModel {
  return {
    ...raw,
    taxes: raw.taxes ?? raw.taxAmount ?? 0,
    taxAmount: raw.taxAmount ?? raw.taxes ?? 0,
    discountAmount: raw.discountAmount ?? 0,
    address: raw.address || raw.deliveryAddress,
    deliveryAddress: raw.deliveryAddress || raw.address,
    driver:
      raw.driver ||
      (raw.driverName
        ? {
            id: raw.driverId || '',
            name: raw.driverName,
            phone: raw.driverPhone || '',
            vehicle: raw.driverVehicle || '',
          }
        : undefined),
    items: (raw.items || []).map((it: any) => ({
      ...it,
      brand: it.brand || 'Affordz',
      size: it.size || 'Free',
      quantity: it.quantity || 1,
    })),
  } as OrderModel;
}

export const ordersApi = {
  checkout: async (
    payloadOrAddressId: string | CheckoutPayload,
    paymentMethodArg?: 'RAZORPAY' | 'COD',
  ): Promise<OrderModel> => {
    const rawPayload: CheckoutPayload =
      typeof payloadOrAddressId === 'string'
        ? { addressId: payloadOrAddressId, paymentMethod: paymentMethodArg || 'COD' }
        : payloadOrAddressId;

    const idempotencyKey =
      rawPayload.idempotencyKey ||
      `chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const requestBody = {
      addressId: rawPayload.addressId,
      paymentMethod: rawPayload.paymentMethod,
      couponCode: rawPayload.couponCode || undefined,
      isTryAndBuy: Boolean(rawPayload.isTryAndBuy),
      isBuyNow: Boolean(rawPayload.isBuyNow),
      giftWrap: Boolean(rawPayload.giftWrap),
      donationAmount: Number(rawPayload.donationAmount || 0),
      deliveryInstructions: rawPayload.deliveryInstructions || undefined,
      items: rawPayload.items?.map((it: any) => ({
        productId: it.productId || it.id,
        title: it.title,
        size: it.size,
        trialSize: it.trialSize,
        quantity: it.quantity || 1,
        fulfillmentType: it.fulfillmentType,
        isTryAndBuy: it.isTryAndBuy,
      })),
    };

    const res = await request<CheckoutResponseContract>('/api/v1/orders/checkout', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(requestBody),
    });

    const gatewayKeyId =
      (res as any).razorpayKeyId ||
      process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
      null;

    const splitOrders = (res.orders || []).map((o) =>
      mapRawOrder({
        ...o,
        checkoutGroupId: res.checkoutGroupId,
        groupNumber: res.groupNumber,
        razorpayOrderId: res.razorpayOrderId || o.razorpayOrderId,
        razorpayKeyId: gatewayKeyId,
      }),
    );

    const primary =
      splitOrders[0] ||
      mapRawOrder({
        id: res.checkoutGroupId,
        orderNumber: res.groupNumber,
        customerId: '',
        status: 'PLACED',
        paymentMethod: res.paymentMethod,
        paymentStatus: res.paymentStatus,
        itemTotal: res.itemTotal,
        deliveryFee: res.deliveryFeeTotal,
        taxAmount: res.taxesTotal,
        grandTotal: res.grandTotal,
        etaMinutes: 18,
        razorpayOrderId: res.razorpayOrderId,
        razorpayKeyId: gatewayKeyId,
        checkoutGroupId: res.checkoutGroupId,
        groupNumber: res.groupNumber,
        items: [],
      });

    return {
      ...primary,
      grandTotal: res.grandTotal ?? primary.grandTotal,
      razorpayOrderId: res.razorpayOrderId || primary.razorpayOrderId,
      razorpayKeyId: gatewayKeyId || primary.razorpayKeyId,
      checkoutSessionToken: (res as any).checkoutSessionToken || primary.checkoutSessionToken,
      checkoutSessionUrl: (res as any).checkoutSessionUrl || primary.checkoutSessionUrl,
      checkoutGroup: res,
      splitOrders,
    };
  },

  verifyPayment: async (data: {
    orderId: string;
    checkoutGroupId?: string;
    paymentId: string;
    signature: string;
    razorpayOrderId?: string;
  }): Promise<any> => {
    const res = await request<any>('/api/v1/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      ...res,
      orders: Array.isArray(res?.orders) ? res.orders.map(mapRawOrder) : undefined,
    };
  },

  getOrderById: async (orderId: string): Promise<OrderModel> => {
    const raw = await request<any>(`/api/v1/orders/${encodeURIComponent(orderId)}`);
    return mapRawOrder(raw);
  },

  getOrders: async (): Promise<OrderModel[]> => {
    if (!authToken) {
      return [];
    }
    const rawList = await request<any[]>('/api/v1/orders');
    return Array.isArray(rawList) ? rawList.map(mapRawOrder) : [];
  },

  cancelOrder: async (orderId: string, reason?: string): Promise<OrderModel> => {
    const raw = await request<any>(
      `/api/v1/orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Cancelled by customer' }),
      },
    );
    return mapRawOrder(raw?.order || raw);
  },

  submitTryAndBuySelections: async (
    orderId: string,
    selections: Record<string, 'KEEP' | 'RETURN'>,
  ): Promise<OrderModel> => {
    const res = await request<any>(
      `/api/v1/orders/${encodeURIComponent(orderId)}/try-and-buy/customer-selections`,
      {
        method: 'POST',
        body: JSON.stringify({ selections }),
      },
    );
    return mapRawOrder(res?.order || res);
  },

  trackOrder: async (orderId: string): Promise<TrackingModel> => {
    const res = await request<any>(
      `/api/v1/orders/${encodeURIComponent(orderId)}/track`,
    );
    return {
      ...res,
      deliveryCoordinates: res.deliveryCoordinates || res.customerCoords || undefined,
      driver: res.driver
        ? {
            ...res.driver,
            vehicle: res.driver.vehicle || res.driver.vehicleRegistration || '',
            currentLocation: res.driver.currentLocation || res.driverLocation || null,
          }
        : null,
    };
  },

  getOrderRoute: async (orderId: string): Promise<any> => {
    return await request<any>(
      `/api/v1/orders/${encodeURIComponent(orderId)}/route`,
    );
  },
};

export const notificationsApi = {
  list: async (limit = 50): Promise<{ items: any[]; unreadCount: number; total: number }> => {
    if (!authToken) return { items: [], unreadCount: 0, total: 0 };
    return await request<{ items: any[]; unreadCount: number; total: number }>(
      `/api/v1/notifications?limit=${limit}`,
    );
  },

  markRead: async (id: string) => {
    return await request<{ success: boolean }>(
      `/api/v1/notifications/${encodeURIComponent(id)}/read`,
      { method: 'PATCH' },
    );
  },

  markAllRead: async () => {
    return await request<{ success: boolean }>('/api/v1/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

// -------------------------------------------------------------
// REVIEWS API
// -------------------------------------------------------------
export interface ReviewModel {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const reviewsApi = {
  createReview: async (data: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean; review: ReviewModel }> => {
    return await request<{ success: boolean; review: ReviewModel }>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProductReviews: async (productId: string): Promise<ReviewModel[]> => {
    try {
      const rawId = String(productId).trim();
      const mappedId = PRODUCT_ID_MAP[rawId] || rawId;
      return await request<ReviewModel[]>(`/api/v1/reviews/products/${mappedId}`);
    } catch {
      return [];
    }
  },
};

// -------------------------------------------------------------
// SUPPORT API
// -------------------------------------------------------------
export interface SupportTicketModel {
  id: string;
  userId: string;
  orderId?: string | null;
  title: string;
  description?: string | null;
  category: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  resolutionRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const supportApi = {
  createTicket: async (data: {
    title: string;
    category: string;
    description: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    orderId?: string;
  }): Promise<SupportTicketModel> => {
    if (!authToken) {
      throw createApiError('Please sign in to submit a support ticket.', 401);
    }
    return await request<SupportTicketModel>('/api/v1/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTickets: async (): Promise<SupportTicketModel[]> => {
    if (!authToken) {
      return [];
    }
    return await request<SupportTicketModel[]>('/api/v1/support/tickets');
  },
};

export interface RazorpayOrderResponse {
  success?: boolean;
  orderId?: string;
  razorpayOrderId: string;
  amountInPaisa: number;
  amount: number;
  currency: string;
  keyId: string | null;
  checkoutSessionToken?: string;
  checkoutSessionUrl?: string;
  notes?: Record<string, any>;
}

export interface PaymentStatusResponse {
  orderId: string | null;
  orderNumber: string | null;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | string;
  orderStatus: string | null;
  checkoutGroupId?: string | null;
  paymentMethod: string;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  grandTotal: number;
  updatedAt?: string;
  transactions?: any[];
}

export const paymentsApi = {
  createRazorpayOrder: async (amount: number, orderId?: string): Promise<RazorpayOrderResponse> => {
    return await request<RazorpayOrderResponse>('/api/v1/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  },

  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    return await request<PaymentStatusResponse>(`/api/v1/payments/status/${encodeURIComponent(orderId)}`);
  },

  verifySignature: async (data: {
    orderId: string;
    paymentId: string;
    signature: string;
    razorpayOrderId?: string;
  }): Promise<any> => {
    return await request<any>('/api/v1/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
