import { create } from 'zustand';
import { catalogApi, ApiProduct, CategoryItem } from '@/services/api';

export type FulfillmentFilterType = 'ALL' | 'DARK_STORE' | 'VENDOR';

interface CatalogState {
  categories: CategoryItem[];
  products: ApiProduct[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  fulfillmentFilter: FulfillmentFilterType;
  darkStores: any[];
  activeCoupons: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectedProduct: ApiProduct | null;

  fetchCategories: () => Promise<void>;
  fetchDarkStores: () => Promise<void>;
  fetchCoupons: () => Promise<void>;
  fetchProducts: (params?: {
    category?: string;
    search?: string;
    sort?: string;
    fulfillmentType?: string;
  }) => Promise<void>;
  refreshCatalog: () => Promise<void>;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setFulfillmentFilter: (filter: FulfillmentFilterType) => void;
  fetchProductById: (id: string) => Promise<ApiProduct | null>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  products: [],
  selectedCategory: 'All',
  searchQuery: '',
  sortBy: 'popular',
  fulfillmentFilter: 'ALL',
  darkStores: [],
  activeCoupons: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  selectedProduct: null,

  fetchCategories: async () => {
    try {
      const categories = await catalogApi.getCategories();
      set({ categories });
    } catch (err: any) {
      console.warn('Error fetching categories:', err);
    }
  },

  fetchDarkStores: async () => {
    try {
      const darkStores = await catalogApi.getDarkStores();
      set({ darkStores });
    } catch (err: any) {
      console.warn('Error fetching dark stores:', err);
    }
  },

  fetchCoupons: async () => {
    try {
      const activeCoupons = await catalogApi.getActiveCoupons();
      set({ activeCoupons });
    } catch (err: any) {
      console.warn('Error fetching coupons:', err);
    }
  },

  fetchProducts: async (overrideParams) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const category = overrideParams?.category !== undefined ? overrideParams.category : state.selectedCategory;
      const search = overrideParams?.search !== undefined ? overrideParams.search : state.searchQuery;
      const sort = overrideParams?.sort !== undefined ? overrideParams.sort : state.sortBy;
      const fulfillmentType =
        overrideParams?.fulfillmentType !== undefined
          ? overrideParams.fulfillmentType
          : state.fulfillmentFilter === 'ALL'
          ? undefined
          : state.fulfillmentFilter;

      const products = await catalogApi.getProducts({
        category,
        search,
        sort,
        fulfillmentType,
      });
      set({ products, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to fetch catalog' });
    }
  },

  refreshCatalog: async () => {
    set({ isRefreshing: true });
    try {
      await Promise.all([
        get().fetchCategories(),
        get().fetchDarkStores(),
        get().fetchCoupons(),
        get().fetchProducts(),
      ]);
    } finally {
      set({ isRefreshing: false });
    }
  },

  setSelectedCategory: (cat: string) => {
    set({ selectedCategory: cat });
    get().fetchProducts({ category: cat });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchProducts({ search: query });
  },

  setSortBy: (sort: string) => {
    set({ sortBy: sort });
    get().fetchProducts({ sort });
  },

  setFulfillmentFilter: (filter: FulfillmentFilterType) => {
    set({ fulfillmentFilter: filter });
    const fulfillmentType = filter === 'ALL' ? undefined : filter;
    get().fetchProducts({ fulfillmentType });
  },

  fetchProductById: async (id: string) => {
    try {
      const product = await catalogApi.getProductById(id);
      set({ selectedProduct: product });
      return product;
    } catch (err) {
      console.warn('Error fetching product by id:', err);
      return null;
    }
  },
}));
