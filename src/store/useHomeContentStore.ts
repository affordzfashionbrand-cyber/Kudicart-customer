import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  homeContentApi,
  HomeLayoutSection,
  HomeLayoutBanner,
  HomeLayoutBankOffer,
} from '@/services/api';
import {
  HERO_BANNERS,
  BANK_OFFERS,
  BUDGET_STORE_ITEMS,
  TREND_RADAR_ITEMS,
} from '@/data/homeData';

const CACHE_KEY = '@kudicart_home_layout';

async function getCachedLayout(): Promise<any | null> {
  try {
    if (Platform.OS !== 'web') {
      const raw = await SecureStore.getItemAsync(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch (err) {
    console.warn('Failed to read cached home layout:', err);
  }
  return null;
}

async function setCachedLayout(data: any): Promise<void> {
  try {
    const raw = JSON.stringify(data);
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(CACHE_KEY, raw);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CACHE_KEY, raw);
    }
  } catch (err) {
    console.warn('Failed to persist home layout cache:', err);
  }
}

function filterApprovedBanners(banners: HomeLayoutBanner[] | undefined): HomeLayoutBanner[] {
  if (!Array.isArray(banners)) return [];
  return banners.filter((b) => !b.status || b.status === 'APPROVED');
}
// Default initial state matching standard sections
const DEFAULT_SECTIONS: HomeLayoutSection[] = [
  { sectionKey: 'HERO_BANNER', displayName: 'Hero Banners Carousel', displayOrder: 1, isEnabled: true },
  { sectionKey: 'BANK_OFFERS', displayName: 'Partner Bank Offers Ticker', displayOrder: 2, isEnabled: true },
  { sectionKey: 'TRENDING_CITY', displayName: 'Trending in Your City', displayOrder: 3, isEnabled: true },
  { sectionKey: 'CURATED_DEALS', displayName: 'Curated Deals (Him & Her)', displayOrder: 4, isEnabled: true },
  { sectionKey: 'BUDGET_STORES', displayName: 'Shop by Budget Stores', displayOrder: 5, isEnabled: true },
  { sectionKey: 'FLASH_DROP', displayName: 'Flash Atelier Live Drop', displayOrder: 6, isEnabled: true },
  { sectionKey: 'TREND_RADAR', displayName: 'Trend Radar / Aesthetic Hub', displayOrder: 7, isEnabled: true },
  { sectionKey: 'BRAND_SPOTLIGHT', displayName: 'Vendor Brand Spotlight', displayOrder: 8, isEnabled: true },
  { sectionKey: 'LUXE_WEEKEND', displayName: 'Urban Editorial Deals Strip', displayOrder: 9, isEnabled: true },
];

const DEFAULT_BANNERS: HomeLayoutBanner[] = HERO_BANNERS.map((b, index) => ({
  id: b.id,
  placement: 'HERO_CAROUSEL',
  tag: b.tag,
  title1: b.title1,
  title2: b.title2,
  imageUrl: b.image,
  targetGender: b.categoryTarget,
  actionType: 'CATEGORY',
  actionValue: b.wearTarget || b.categoryTarget,
  displayOrder: index + 1,
}));

const DEFAULT_BANK_OFFERS: HomeLayoutBankOffer[] = BANK_OFFERS.map((o, index) => ({
  id: o.id,
  bankName: o.bankName,
  badgeBgColor: o.badgeBg,
  badgeBg: o.badgeBg,
  title: o.title,
  subtitle: o.subtitle,
  code: o.code,
  discountText: o.discount,
  discount: o.discount,
  minSpendText: o.minSpend,
  minSpend: o.minSpend,
  details: o.details,
  displayOrder: index + 1,
}));

export interface HomeContentState {
  sections: HomeLayoutSection[];
  banners: HomeLayoutBanner[];
  bankOffers: HomeLayoutBankOffer[];
  curatedSections: Record<string, any[]>;
  isLoading: boolean;
  isRefreshing: boolean;
  hasHydrated: boolean;
  error: string | null;

  fetchHomeLayout: (forceRefresh?: boolean, gender?: string) => Promise<void>;
  hydrateOfflineCache: () => Promise<void>;
}

export const useHomeContentStore = create<HomeContentState>((set, get) => ({
  sections: DEFAULT_SECTIONS,
  banners: DEFAULT_BANNERS,
  bankOffers: DEFAULT_BANK_OFFERS,
  curatedSections: {},
  isLoading: false,
  isRefreshing: false,
  hasHydrated: false,
  error: null,

  hydrateOfflineCache: async () => {
    if (get().hasHydrated) return;
    const cached = await getCachedLayout();
    if (cached) {
      const approvedCachedBanners = filterApprovedBanners(cached.banners);
      set({
        sections: cached.sections || DEFAULT_SECTIONS,
        banners: approvedCachedBanners.length ? approvedCachedBanners : DEFAULT_BANNERS,
        bankOffers: cached.bankOffers || DEFAULT_BANK_OFFERS,
        curatedSections: cached.curatedSections || {},
        hasHydrated: true,
      });
    } else {
      set({ hasHydrated: true });
    }
  },

  fetchHomeLayout: async (forceRefresh = false, gender?: string) => {
    // 1. Instant offline hydrate from storage if first load
    if (!forceRefresh && !get().hasHydrated) {
      await get().hydrateOfflineCache();
    }

    try {
      if (forceRefresh) {
        set({ isRefreshing: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }

      const response = await homeContentApi.getLayout(gender);
      if (response && response.success && response.data) {
        const { sections, banners, bankOffers, curatedSections } = response.data;
        const approvedBanners = filterApprovedBanners(banners);
        const nextState = {
          sections: sections?.length ? sections : DEFAULT_SECTIONS,
          banners: approvedBanners.length ? approvedBanners : DEFAULT_BANNERS,
          bankOffers: bankOffers?.length ? bankOffers : DEFAULT_BANK_OFFERS,
          curatedSections: curatedSections || {},
          isLoading: false,
          isRefreshing: false,
          hasHydrated: true,
          error: null,
        };

        set(nextState);
        await setCachedLayout({ ...response.data, banners: approvedBanners });
      } else {
        set({ isLoading: false, isRefreshing: false });
      }
    } catch (err: any) {
      // Graceful fallback to cached or default data on error
      set({
        error: err?.message || 'Failed to fetch homepage content',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },
}));
