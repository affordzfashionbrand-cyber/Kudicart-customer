import { useHomeContentStore } from '@/store/useHomeContentStore';
import { handleActionPress } from '@/utils/deepLinkRouter';
import { homeContentApi } from '@/services/api';
import { Linking } from 'react-native';

jest.mock('@/services/api', () => {
  const actual = jest.requireActual('@/services/api');
  return {
    ...actual,
    homeContentApi: {
      getLayout: jest.fn(),
    },
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('Customer App Dynamic Homepage CMS & Deep Linking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHomeContentStore', () => {
    it('initializes with default mock sections, banners, and bank offers', () => {
      const state = useHomeContentStore.getState();
      expect(state.sections.length).toBeGreaterThanOrEqual(9);
      expect(state.banners.length).toBeGreaterThanOrEqual(1);
      expect(state.bankOffers.length).toBeGreaterThanOrEqual(1);
      expect(state.sections.some((s) => s.sectionKey === 'HERO_BANNER')).toBe(true);
      expect(state.sections.some((s) => s.sectionKey === 'BANK_OFFERS')).toBe(true);
    });

    it('fetches and updates layout from homeContentApi', async () => {
      const mockLayoutData = {
        success: true,
        data: {
          sections: [
            { id: 'sec-1', sectionKey: 'BANK_OFFERS', displayName: 'Bank Deals', displayOrder: 1, isEnabled: true },
            { id: 'sec-2', sectionKey: 'HERO_BANNER', displayName: 'Hero Drop', displayOrder: 2, isEnabled: true },
          ],
          banners: [
            {
              id: 'banner-test-1',
              placement: 'HERO_CAROUSEL',
              tag: 'NEW LAUNCH',
              title1: 'Festive',
              title2: 'Drop',
              imageUrl: 'https://cdn.example.com/festive.jpg',
              targetGender: 'Women',
              actionType: 'PRODUCT',
              actionValue: 'prod-festive-101',
              displayOrder: 1,
            },
          ],
          bankOffers: [
            {
              id: 'offer-test-1',
              bankName: 'HDFC BANK',
              badgeBgColor: '#004c8f',
              title: '15% OFF',
              subtitle: 'On HDFC Cards',
              code: 'HDFC15',
              discountText: '15% OFF',
              details: 'Terms and conditions apply',
              displayOrder: 1,
            },
          ],
          curatedSections: {},
        },
      };

      (homeContentApi.getLayout as jest.Mock).mockResolvedValue(mockLayoutData);

      await useHomeContentStore.getState().fetchHomeLayout(true, 'Women');

      const state = useHomeContentStore.getState();
      expect(state.sections.length).toBe(2);
      expect(state.sections[0].sectionKey).toBe('BANK_OFFERS');
      expect(state.banners.length).toBe(1);
      expect(state.banners[0].title1).toBe('Festive');
      expect(state.bankOffers.length).toBe(1);
      expect(state.bankOffers[0].bankName).toBe('HDFC BANK');
    });

    it('gracefully handles network errors without wiping initial state', async () => {
      (homeContentApi.getLayout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const initialBannersCount = useHomeContentStore.getState().banners.length;
      await useHomeContentStore.getState().fetchHomeLayout(true);

      const state = useHomeContentStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.banners.length).toBe(initialBannersCount);
    });
  });

  describe('DeepLink Router (handleActionPress)', () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };

    const mockCatalogActions = {
      setQuery: jest.fn(),
      setCategory: jest.fn(),
      setGender: jest.fn(),
      setTab: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('navigates to /product/[id] on PRODUCT action', () => {
      handleActionPress('PRODUCT', 'prod-12345', mockRouter, mockCatalogActions);
      expect(mockRouter.push).toHaveBeenCalledWith('/product/prod-12345');
    });

    it('navigates to /category/[id] on CATEGORY action and updates category state', () => {
      handleActionPress('CATEGORY', 'Silk-Sarees', mockRouter, mockCatalogActions);
      expect(mockCatalogActions.setCategory).toHaveBeenCalledWith('Silk-Sarees');
      expect(mockRouter.push).toHaveBeenCalledWith('/category/Silk-Sarees');
    });

    it('updates query and switches tab to SHOP on SEARCH_QUERY action', () => {
      handleActionPress('SEARCH_QUERY', 'Chanderi Kurta', mockRouter, mockCatalogActions);
      expect(mockCatalogActions.setQuery).toHaveBeenCalledWith('Chanderi Kurta');
      expect(mockCatalogActions.setTab).toHaveBeenCalledWith('SHOP');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('updates query and switches tab to SHOP on BRAND action', () => {
      handleActionPress('BRAND', 'Raw Mango', mockRouter, mockCatalogActions);
      expect(mockCatalogActions.setQuery).toHaveBeenCalledWith('Raw Mango');
      expect(mockCatalogActions.setTab).toHaveBeenCalledWith('SHOP');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('opens external URL on EXTERNAL_URL action', async () => {
      const spyCanOpen = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
      const spyOpen = jest.spyOn(Linking, 'openURL').mockResolvedValue(null as any);

      handleActionPress('EXTERNAL_URL', 'https://kudicart.com/special', mockRouter, mockCatalogActions);

      expect(spyCanOpen).toHaveBeenCalledWith('https://kudicart.com/special');
      await Promise.resolve(); // flush promise
      expect(spyOpen).toHaveBeenCalledWith('https://kudicart.com/special');
    });

    it('does nothing when actionType is NONE or undefined', () => {
      handleActionPress('NONE', 'irrelevant', mockRouter, mockCatalogActions);
      handleActionPress(undefined, undefined, mockRouter, mockCatalogActions);
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(mockCatalogActions.setTab).not.toHaveBeenCalled();
    });
  });
});
