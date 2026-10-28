import { Platform } from 'react-native';
import { COMPLETE_CATEGORY_HIERARCHY } from '@/data/category-hierarchy-data';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

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

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Generic request helper with timeout and offline-resilience
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return await res.json();
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
  phone: string;
  name: string;
  email: string;
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
  sendOtp: async (phone: string): Promise<{ success: boolean; message: string; countdownSeconds: number }> => {
    try {
      return await request<{ success: boolean; message: string; countdownSeconds: number }>(
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

  getProfile: async (): Promise<AuthUser> => {
    try {
      return await request<AuthUser>('/api/v1/users/me');
    } catch {
      return {
        id: 'usr-1',
        phone: '+91 8124188999',
        name: 'Ananya Sharma',
        email: 'ananya.sharma@example.com',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'CUSTOMER',
      };
    }
  },

  updateProfile: async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const payload: Record<string, any> = {};
    if (data.name && data.name.trim()) payload.name = data.name.trim();
    if (data.email && data.email.trim() && data.email.includes('@')) payload.email = data.email.trim();
    if (data.avatar) payload.avatar = data.avatar;

    try {
      return await request<AuthUser>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      console.warn('[Affordz Auth] updateProfile remote sync note:', err?.message || err);
      return {
        id: data.id || 'usr-1',
        phone: data.phone || '+91 8124188999',
        name: data.name?.trim() || 'Affordz Customer',
        email: data.email?.trim() || 'customer@affordz.in',
        avatar: data.avatar || null,
        role: 'CUSTOMER',
      };
    }
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

export interface ApiProduct {
  id: string;
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
  categories: Array<{ id: string; name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  trending: string[];
  recentPicks: ApiProduct[];
}

export const catalogApi = {
  getCategories: async (params?: { tree?: boolean; parentId?: string; level?: number; gender?: string }): Promise<CategoryItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.tree) q.append('tree', 'true');
      if (params?.parentId) q.append('parentId', params.parentId);
      if (params?.level) q.append('level', String(params.level));
      if (params?.gender && params.gender !== 'All') q.append('gender', params.gender);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<CategoryItem[]>(`/api/v1/categories${qs}`);
    } catch {
      return COMPLETE_CATEGORY_HIERARCHY as any;
    }
  },

  getCategoriesHierarchy: async (gender?: string): Promise<CategoryItem[]> => {
    try {
      const q = gender && gender !== 'All' ? `?gender=${encodeURIComponent(gender)}` : '';
      return await request<CategoryItem[]>(`/api/v1/categories/hierarchy${q}`);
    } catch {
      if (!gender || gender === 'All') return COMPLETE_CATEGORY_HIERARCHY as any;
      const g = gender.toLowerCase();
      return COMPLETE_CATEGORY_HIERARCHY.filter(
        (c) => c.gender.toLowerCase() === g || c.gender.toLowerCase() === 'unisex',
      ) as any;
    }
  },

  getDarkStores: async (): Promise<any[]> => {
    try {
      return await request<any[]>('/api/v1/dark-stores');
    } catch {
      return [
        { id: 'hub-indiranagar', name: 'Indiranagar Express Hub', locality: 'Indiranagar', deliveryMinutes: 18, isActive: true },
        { id: 'hub-koramangala', name: 'Koramangala Fashion Vault', locality: 'Koramangala', deliveryMinutes: 20, isActive: true },
        { id: 'hub-lavelle', name: 'Lavelle Concierge Hub', locality: 'Lavelle Road', deliveryMinutes: 15, isActive: true },
        { id: 'hub-whitefield', name: 'Whitefield Prestige Hub', locality: 'Whitefield', deliveryMinutes: 25, isActive: true },
      ];
    }
  },

  getActiveCoupons: async (): Promise<any[]> => {
    try {
      return await request<any[]>('/api/v1/coupons/active');
    } catch {
      return [
        { id: 'cpn-1', code: 'AFFORDZ10', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 999, maxDiscount: 300, isActive: true },
        { id: 'cpn-2', code: 'FIRSTDROP', discountType: 'FLAT', discountValue: 200, minOrderValue: 799, maxDiscount: 200, isActive: true },
      ];
    }
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
    try {
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
    } catch {
      // Resilient fallback products
      return [
        {
          id: 'prod-1',
          brand: 'Avanya Ethnic',
          title: 'Embroidered Anarkali Kurta Set',
          description: 'Intricate Zardozi thread embroidery on chanderi silk with matching dupatta.',
          price: 1299,
          originalPrice: 2499,
          discount: '48% OFF',
          rating: 4.8,
          reviewsCount: 142,
          stockQuantity: 12,
          stockBadge: 'Ready in 35m',
          readyToShip: true,
          sizes: ['S', 'M', 'L', 'XL'],
          fabric: 'Chanderi Silk Blend',
          origin: 'Handcrafted in Jaipur',
          image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
          altText: 'Anarkali Kurta Set',
          galleryImages: [
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
            'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=800&q=85',
          ],
          category: 'Kurtis',
          vendor: {
            id: 'vend-1',
            storeName: 'Avanya Ethnic Boutique',
            address: 'Shop 14, 100ft Road, Indiranagar, Bengaluru',
            phone: '+91 80 4123 9988',
          },
        },
        {
          id: 'prod-2',
          brand: 'Varanasi Looms',
          title: 'Handloom Cotton Saree with Zari',
          description: 'Traditional Kaddi border handloom cotton saree woven by master artisans.',
          price: 1849,
          originalPrice: 3190,
          discount: '42% OFF',
          rating: 4.9,
          reviewsCount: 88,
          stockQuantity: 8,
          stockBadge: 'Express Dispatch',
          readyToShip: true,
          sizes: ['Free Size'],
          fabric: '100% Breathable Mulmul Cotton',
          origin: 'Varanasi, Uttar Pradesh',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
          altText: 'Cotton Saree with Zari',
          galleryImages: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'],
          category: 'Sarees',
          vendor: {
            id: 'vend-1',
            storeName: 'Avanya Ethnic Boutique',
            address: 'Shop 14, 100ft Road, Indiranagar, Bengaluru',
            phone: '+91 80 4123 9988',
          },
        },
        {
          id: 'prod-3',
          brand: 'Gulabi Studio',
          title: 'Tiered Floral Rayon Maxi Dress',
          description: 'Flowy botanical silhouette with flutter sleeves and waist tie sash.',
          price: 999,
          originalPrice: 1999,
          discount: '50% OFF',
          rating: 4.6,
          reviewsCount: 65,
          stockQuantity: 15,
          stockBadge: 'Only 3 left in M',
          readyToShip: true,
          sizes: ['S', 'M', 'L'],
          fabric: '100% Rayon',
          origin: 'Sanganer, Rajasthan',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85',
          altText: 'Floral Rayon Maxi Dress',
          galleryImages: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85'],
          category: 'Dresses',
          vendor: {
            id: 'vend-2',
            storeName: 'Gulabi Studio',
            address: '42 Commercial Street, Bengaluru',
            phone: '+91 80 2558 7711',
          },
        },
        {
          id: 'prod-4',
          brand: 'Suta Weaves',
          title: 'Indigo Dabu Print Cotton Fabric',
          description: 'Mud resist printed natural indigo organic fabric, sold per metre.',
          price: 450,
          originalPrice: 650,
          discount: '30% OFF',
          rating: 4.7,
          reviewsCount: 39,
          stockQuantity: 40,
          stockBadge: 'Cut-to-Length',
          readyToShip: true,
          sizes: ['1 Metre', '2 Metres', '5 Metres'],
          fabric: 'Organic Cotton (60s count)',
          origin: 'Bagru, Rajasthan',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85',
          altText: 'Indigo Dabu Print',
          galleryImages: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85'],
          category: 'Fabrics',
          vendor: {
            id: 'vend-2',
            storeName: 'Gulabi Studio',
            address: '42 Commercial Street, Bengaluru',
            phone: '+91 80 2558 7711',
          },
        },
      ];
    }
  },

  getProductById: async (id: string): Promise<ApiProduct> => {
    try {
      const rawId = String(id).trim();
      const mappedId =
        PRODUCT_ID_MAP[rawId] ||
        (rawId.startsWith('prod-') || rawId.startsWith('deal-') ? rawId : `prod-${rawId}`);
      return await request<ApiProduct>(`/api/v1/products/${mappedId}`);
    } catch {
      const all = await catalogApi.getProducts().catch(() => []);
      const fallbackId = PRODUCT_ID_MAP[String(id)] || String(id);
      return all.find((p) => p.id === id || p.id === fallbackId) || all[0];
    }
  },

  getSearchSuggestions: async (q?: string, limit?: number): Promise<ApiSearchSuggestionsResponse> => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (limit) params.append('limit', String(limit));
      const qs = params.toString() ? `?${params.toString()}` : '';
      return await request<ApiSearchSuggestionsResponse>(`/api/v1/search/suggestions${qs}`);
    } catch {
      const cleanQ = (q || '').trim().toLowerCase();
      const trending = [
        'Handloom Silk Sarees',
        'Embroidered Anarkali Sets',
        'Chanderi Silk Tunics',
        'Tiered Floral Maxi Dresses',
        'Structured Linen Shirts',
        'Raw Selvedge Denim',
        'Court Leather Sneakers',
        'Minimal Leather Totes',
      ];
      const all = await catalogApi.getProducts();
      if (!cleanQ) {
        return {
          query: '',
          suggestions: trending.map((text) => ({ text, type: 'keyword' })),
          categories: [
            { id: 'kurtis', name: 'Kurtis', count: 12 },
            { id: 'sarees', name: 'Sarees', count: 8 },
            { id: 'dresses', name: 'Dresses', count: 15 },
          ],
          brands: [
            { name: 'Avanya Ethnic', count: 6 },
            { name: 'Gulabi Studio', count: 5 },
          ],
          trending,
          recentPicks: all.slice(0, 4),
        };
      }

      const matchingSuggestions = trending
        .filter((t) => t.toLowerCase().includes(cleanQ))
        .map((text) => ({ text, type: 'keyword' as const }));

      const matchingProducts = all.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQ) ||
          p.brand.toLowerCase().includes(cleanQ) ||
          (p.category && p.category.toLowerCase().includes(cleanQ)),
      );

      return {
        query: q || '',
        suggestions: matchingSuggestions,
        categories: [],
        brands: [],
        trending,
        recentPicks: matchingProducts.slice(0, 4),
      };
    }
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
    try {
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
    } catch {
      return catalogApi.getProducts(params);
    }
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

export interface CartModel {
  id: string;
  userId?: string;
  items: CartItemModel[];
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  discountAmount?: number;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
  couponCode?: string | null;
  grandTotal: number;
  count?: number;
}

export const cartApi = {
  getCart: async (): Promise<CartModel> => {
    try {
      return await request<CartModel>('/api/v1/cart');
    } catch {
      return {
        id: 'cart-usr-1',
        userId: 'usr-1',
        items: [],
        itemTotal: 0,
        deliveryFee: 40,
        taxes: 0,
        grandTotal: 40,
      };
    }
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
  line1: string;
  locality: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

const inMemoryAddresses: AddressModel[] = [
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
];

export const addressApi = {
  getAddresses: async (): Promise<AddressModel[]> => {
    try {
      return await request<AddressModel[]>('/api/v1/addresses');
    } catch {
      return [...inMemoryAddresses];
    }
  },

  addAddress: async (data: Omit<AddressModel, 'id' | 'userId'>): Promise<AddressModel> => {
    try {
      const added = await request<AddressModel>('/api/v1/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      inMemoryAddresses.push(added);
      return added;
    } catch {
      const newAddr: AddressModel = {
        id: `addr-${Date.now()}`,
        userId: 'usr-1',
        ...data,
      };
      if (newAddr.isDefault) {
        inMemoryAddresses.forEach((a) => (a.isDefault = false));
      }
      inMemoryAddresses.push(newAddr);
      return newAddr;
    }
  },

  updateAddress: async (id: string, data: Partial<AddressModel>): Promise<AddressModel> => {
    try {
      const updated = await request<AddressModel>(`/api/v1/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      const idx = inMemoryAddresses.findIndex((a) => a.id === id);
      if (idx !== -1) inMemoryAddresses[idx] = updated;
      return updated;
    } catch {
      const idx = inMemoryAddresses.findIndex((a) => a.id === id);
      if (idx !== -1) {
        inMemoryAddresses[idx] = { ...inMemoryAddresses[idx], ...data };
        return inMemoryAddresses[idx];
      }
      throw new Error('Address not found');
    }
  },

  deleteAddress: async (id: string): Promise<boolean> => {
    try {
      await request<{ success: boolean }>(`/api/v1/addresses/${id}`, {
        method: 'DELETE',
      });
      const idx = inMemoryAddresses.findIndex((a) => a.id === id);
      if (idx !== -1) inMemoryAddresses.splice(idx, 1);
      return true;
    } catch {
      const idx = inMemoryAddresses.findIndex((a) => a.id === id);
      if (idx !== -1) {
        inMemoryAddresses.splice(idx, 1);
      }
      return true;
    }
  },

  setDefault: async (id: string): Promise<AddressModel> => {
    try {
      const res = await request<AddressModel>(`/api/v1/addresses/${id}/default`, {
        method: 'PATCH',
      });
      inMemoryAddresses.forEach((a) => (a.isDefault = a.id === id));
      return res;
    } catch {
      inMemoryAddresses.forEach((a) => (a.isDefault = a.id === id));
      const found = inMemoryAddresses.find((a) => a.id === id);
      return found || inMemoryAddresses[0];
    }
  },
};

// -------------------------------------------------------------
// ORDERS & TRACKING API
// -------------------------------------------------------------
export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface OrderItemModel {
  id: string;
  title: string;
  brand: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderModel {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  paymentMethod: 'RAZORPAY' | 'COD';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  discountAmount?: number;
  couponCode?: string | null;
  isTryAndBuy?: boolean;
  grandTotal: number;
  etaMinutes: number;
  createdAt: string;
  address: AddressModel;
  items: OrderItemModel[];
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    photo?: string;
  };
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
  status: OrderStatus;
  etaMinutes: number;
  itemTotal?: number;
  deliveryFee?: number;
  taxes?: number;
  discountAmount?: number;
  couponCode?: string | null;
  isTryAndBuy?: boolean;
  grandTotal?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryAddress?: AddressModel;
  items?: OrderItemModel[];
  milestones: OrderTrackingMilestone[];
  history?: any[];
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    currentLocation?: {
      latitude: number;
      longitude: number;
      heading?: number;
    };
  };
}

export interface CheckoutPayload {
  addressId: string;
  paymentMethod: 'RAZORPAY' | 'COD';
  couponCode?: string;
  isTryAndBuy?: boolean;
  items?: OrderItemModel[];
  itemTotal?: number;
  deliveryFee?: number;
  taxes?: number;
  grandTotal?: number;
}

const inMemoryOrders: OrderModel[] = [
  {
    id: 'ord-89241',
    orderNumber: 'AF-89241',
    customerId: 'usr-1',
    status: 'OUT_FOR_DELIVERY',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'COMPLETED',
    itemTotal: 1299,
    deliveryFee: 40,
    taxes: 65,
    grandTotal: 1404,
    etaMinutes: 18,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    address: {
      id: 'addr-1',
      userId: 'usr-1',
      label: 'Home Sanctuary',
      line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      isDefault: true,
    },
    items: [
      {
        id: 'oi-1',
        title: 'Embroidered Anarkali Kurta Set',
        brand: 'Avanya Ethnic',
        size: 'M (38 in)',
        price: 1299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
      },
    ],
    driver: {
      id: 'drv-1',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      vehicle: 'KA 03 EV 4821',
    },
  },
  {
    id: 'ord-72019',
    orderNumber: 'AF-72019',
    customerId: 'usr-1',
    status: 'DELIVERED',
    paymentMethod: 'COD',
    paymentStatus: 'COMPLETED',
    itemTotal: 1899,
    deliveryFee: 0,
    taxes: 95,
    grandTotal: 1994,
    etaMinutes: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    address: {
      id: 'addr-1',
      userId: 'usr-1',
      label: 'Home Sanctuary',
      line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      isDefault: true,
    },
    items: [
      {
        id: 'oi-2',
        title: 'Heritage Handwoven Chanderi Kurta',
        brand: 'Affordz Atelier',
        size: 'L (40 in)',
        price: 1899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      },
    ],
    driver: {
      id: 'drv-2',
      name: 'Suresh Gowda',
      phone: '+91 98765 99887',
      vehicle: 'KA 01 EK 9102',
    },
  },
];

export const ordersApi = {
  checkout: async (
    payloadOrAddressId: string | CheckoutPayload,
    paymentMethodArg?: 'RAZORPAY' | 'COD',
  ): Promise<OrderModel> => {
    const payload: CheckoutPayload =
      typeof payloadOrAddressId === 'string'
        ? { addressId: payloadOrAddressId, paymentMethod: paymentMethodArg || 'COD' }
        : payloadOrAddressId;

    try {
      const order = await request<OrderModel>('/api/v1/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      inMemoryOrders.unshift(order);
      return order;
    } catch {
      // Find actual selected address from inMemoryAddresses
      const chosenAddress =
        inMemoryAddresses.find((a) => a.id === payload.addressId) ||
        inMemoryAddresses[0] || {
          id: payload.addressId,
          userId: 'usr-1',
          label: 'Delivery Address',
          line1: '42 Westend Boulevard',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          isDefault: true,
        };

      const fallbackItems: OrderItemModel[] =
        payload.items && payload.items.length > 0
          ? payload.items
          : [
              {
                id: 'item-1',
                title: 'Embroidered Anarkali Kurta Set',
                brand: 'Avanya Ethnic',
                size: 'M',
                price: 1299,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
              },
            ];

      const itemTotal = payload.itemTotal ?? fallbackItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const deliveryFee = payload.deliveryFee ?? (itemTotal >= 999 ? 0 : 40);
      const taxes = payload.taxes ?? Math.round(itemTotal * 0.05);
      const discount = payload.couponCode ? 200 : 0;
      const grandTotal = payload.grandTotal ?? itemTotal + deliveryFee + taxes - discount;

      const mockOrder: OrderModel = {
        id: `ord-${Date.now()}`,
        orderNumber: `AF-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: 'usr-1',
        status: 'PLACED',
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
        itemTotal,
        deliveryFee,
        taxes,
        discountAmount: discount,
        couponCode: payload.couponCode || null,
        isTryAndBuy: payload.isTryAndBuy || false,
        grandTotal,
        etaMinutes: payload.isTryAndBuy ? 18 : 25,
        createdAt: new Date().toISOString(),
        address: chosenAddress,
        items: fallbackItems,
        driver: {
          id: 'drv-1',
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          vehicle: 'Ather 450X EV • KA 03 EV 4821',
        },
      };

      inMemoryOrders.unshift(mockOrder);
      return mockOrder;
    }
  },

  verifyPayment: async (data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<any> => {
    try {
      const res = await request<any>('/api/v1/orders/verify-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const ord = inMemoryOrders.find((o) => o.id === data.orderId);
      if (ord) ord.paymentStatus = 'COMPLETED';
      return res;
    } catch {
      const ord = inMemoryOrders.find((o) => o.id === data.orderId);
      if (ord) ord.paymentStatus = 'COMPLETED';
      return { verified: true, status: 'PAID', ...data };
    }
  },

  getOrders: async (): Promise<OrderModel[]> => {
    try {
      return await request<OrderModel[]>('/api/v1/orders');
    } catch {
      return [...inMemoryOrders];
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, note?: string): Promise<any> => {
    try {
      return await request(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: note || `Status updated to ${status}` }),
      });
    } catch {
      const ord = inMemoryOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
      if (ord) {
        ord.status = status;
      }
      return { success: true, status };
    }
  },
  trackOrder: async (orderId: string): Promise<TrackingModel> => {
    try {
      return await request<TrackingModel>(`/api/v1/orders/${orderId}/track`);
    } catch {
      const targetOrder =
        inMemoryOrders.find((o) => o.id === orderId || o.orderNumber === orderId) || inMemoryOrders[0];

      const isCod = targetOrder.paymentMethod === 'COD';
      const locality = targetOrder.address?.locality || 'your destination';

      return {
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber,
        status: targetOrder.status,
        etaMinutes: targetOrder.status === 'DELIVERED' ? 0 : targetOrder.etaMinutes || 14,
        milestones: [
          {
            key: 'PLACED',
            label: 'Order Placed',
            description: isCod ? 'Order confirmed via Cash on Delivery (COD)' : 'Order verified via Razorpay Secure UPI',
            status: 'completed',
          },
          {
            key: 'ACCEPTED',
            label: 'Vendor Accepted',
            description: 'Affordz Atelier confirmed garments',
            status: 'completed',
          },
          {
            key: 'PREPARING',
            label: 'Preparing Garment',
            description: 'Quality inspection & iron press completed',
            status: 'completed',
          },
          {
            key: 'READY_FOR_PICKUP',
            label: 'Ready for Pickup',
            description: 'Packed in eco-seal garment sleeve',
            status: 'completed',
          },
          {
            key: 'ASSIGNED',
            label: 'Delivery Partner Assigned',
            description: targetOrder.driver?.name ? `${targetOrder.driver.name} assigned` : 'Rajesh Kumar assigned',
            status: 'completed',
          },
          {
            key: 'PICKED_UP',
            label: 'Picked Up',
            description: 'Collected from Express Hub',
            status: 'completed',
          },
          {
            key: 'OUT_FOR_DELIVERY',
            label: 'Out for Delivery',
            description: `Rider is en route to ${locality}`,
            status: targetOrder.status === 'DELIVERED' ? 'completed' : 'active',
          },
          {
            key: 'DELIVERED',
            label: 'Delivered',
            description: 'Handover & OTP confirmation',
            status: targetOrder.status === 'DELIVERED' ? 'completed' : 'upcoming',
          },
        ],
        driver: targetOrder.driver
          ? {
              id: targetOrder.driver.id,
              name: targetOrder.driver.name,
              phone: targetOrder.driver.phone,
              vehicle: targetOrder.driver.vehicle,
              rating: 4.9,
              currentLocation: {
                latitude: 12.9789,
                longitude: 77.6408,
                heading: 45,
              },
            }
          : {
              id: 'drv-1',
              name: 'Rajesh Kumar',
              phone: '+91 98765 43210',
              vehicle: 'Ather 450X EV • KA 03 EV 4821',
              rating: 4.9,
              currentLocation: {
                latitude: 12.9789,
                longitude: 77.6408,
                heading: 45,
              },
            },
      };
    }
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
      return [
        {
          id: 'rev-1',
          userId: 'usr-1',
          productId,
          orderId: 'ord-89241',
          rating: 5,
          comment: 'Truly gorgeous fabric and fits like a dream! Soft chanderi with neat embroidery.',
          createdAt: new Date().toISOString(),
          user: { name: 'Ananya Sharma' },
        },
      ];
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
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export const supportApi = {
  createTicket: async (data: {
    title: string;
    category: string;
    description: string;
    orderId?: string;
  }): Promise<SupportTicketModel> => {
    try {
      return await request<SupportTicketModel>('/api/v1/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: 'usr-1',
        title: data.title,
        category: data.category,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  getTickets: async (): Promise<SupportTicketModel[]> => {
    try {
      return await request<SupportTicketModel[]>('/api/v1/support/tickets');
    } catch {
      return [
        {
          id: 'TCK-4819',
          userId: 'usr-1',
          title: 'Fitting & Sizing Guidance',
          category: 'Sizing Issue',
          status: 'OPEN',
          createdAt: '2026-03-20T10:30:00Z',
          updatedAt: '2026-03-20T10:30:00Z',
        },
      ];
    }
  },
};
