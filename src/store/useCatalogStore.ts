import { create } from 'zustand';
import { catalogApi, ApiProduct, CategoryItem, ApiSearchSuggestionsResponse } from '@/services/api';

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

  // Search & Suggestions State
  searchSuggestions: ApiSearchSuggestionsResponse | null;
  isSuggestionsLoading: boolean;
  recentSearches: string[];

  fetchCategories: () => Promise<void>;
  fetchDarkStores: () => Promise<void>;
  fetchCoupons: () => Promise<void>;
  fetchProducts: (params?: {
    category?: string;
    search?: string;
    sort?: string;
    fulfillmentType?: string;
    tryAndBuyOnly?: boolean | string;
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<void>;
  refreshCatalog: () => Promise<void>;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setFulfillmentFilter: (filter: FulfillmentFilterType) => void;
  fetchProductById: (id: string) => Promise<ApiProduct | null>;

  // Search actions
  fetchSearchSuggestions: (q?: string) => Promise<void>;
  clearSearchSuggestions: () => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  executeSearch: (term: string) => Promise<void>;
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

  // Search Initial State
  searchSuggestions: null,
  isSuggestionsLoading: false,
  recentSearches: ['Silk Sarees', 'Kurtis', 'Linen Shirts'],

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
        tryAndBuyOnly: overrideParams?.tryAndBuyOnly,
        minPrice: overrideParams?.minPrice,
        maxPrice: overrideParams?.maxPrice,
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

  fetchSearchSuggestions: async (q?: string) => {
    set({ isSuggestionsLoading: true });
    try {
      const suggestions = await catalogApi.getSearchSuggestions(q, 8);
      set({ searchSuggestions: suggestions, isSuggestionsLoading: false });
    } catch (err) {
      console.warn('Error fetching suggestions:', err);
      set({ isSuggestionsLoading: false });
    }
  },

  clearSearchSuggestions: () => {
    set({ searchSuggestions: null, isSuggestionsLoading: false });
  },

  addRecentSearch: (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const current = get().recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    set({ recentSearches: [clean, ...current].slice(0, 8) });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  executeSearch: async (term: string) => {
    const clean = term.trim();
    set({ searchQuery: clean });
    if (clean) {
      get().addRecentSearch(clean);
    }
    await get().fetchProducts({ search: clean });
  },
}));
