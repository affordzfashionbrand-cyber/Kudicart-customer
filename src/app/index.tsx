import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Animated, Pressable, RefreshControl, NativeSyntheticEvent, NativeScrollEvent, BackHandler, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShoppingBag, Sparkles, ChevronRight, AlertTriangle, Zap, MapPin } from 'lucide-react-native';

import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useHomeContentStore } from '@/store/useHomeContentStore';
import { handleActionPress } from '@/utils/deepLinkRouter';

import {
  ProductItem,
  HeroBannerItem,
  TrendingCityItem,
  CuratedDealCard,
  BudgetStoreItem,
  TrendRadarItem,
  VendorBrandTile,
  LuxeDealItem,
  bespokeEasing,
} from '@/data/homeData';

import { HomeHeader } from '@/components/home/home-header';
import { CategoryBubblesSection } from '@/components/home/category-bubbles-section';
import { HeroBannerSection } from '@/components/home/hero-banner-section';
import { BankOffersTicker } from '@/components/home/bank-offers-ticker';
import { TrendingCitySection } from '@/components/home/trending-city-section';
import { CuratedGenderDealsSection } from '@/components/home/curated-gender-deals-section';
import { BudgetStoresSection } from '@/components/home/budget-stores-section';
import { FlashDropSection } from '@/components/home/flash-drop-section';
import { TrendRadarSection } from '@/components/home/trend-radar-section';
import { VendorSpotlightSection } from '@/components/home/vendor-spotlight-section';
import { UrbanDealsSection } from '@/components/home/urban-deals-section';
import { TrendingNowSection } from '@/components/home/trending-now-section';
import { AffordzPromiseSection } from '@/components/home/affordz-promise-section';
import { ModernRedefinedBanner } from '@/components/home/modern-redefined-banner';
import { HomeProductCatalogSection } from '@/components/home/home-product-catalog-section';
import { BankOffersModal } from '@/components/home/bank-offers-modal';
import { TryBuyModal } from '@/components/home/try-buy-modal';
import { FloatingBottomBar } from '@/components/home/floating-bottom-bar';
import { EditorialText } from '@/components/common/section-title';
import { Fonts, FontStyles } from '@/constants/theme';
import { SearchSuggestionsOverlay } from '@/components/home/search-suggestions-overlay';
import { SearchResultsView } from '@/components/home/search-results-view';

import { ShopView } from '@/components/views/shop-view';
import { WishlistView } from '@/components/views/wishlist-view';
import { AccountView } from '@/components/views/account-view';
import { DarkStoreView } from '@/components/views/dark-store-view';
import { NotificationModal } from '@/components/notification-modal';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useOrderStore } from '@/store/useOrderStore';
import { TERMINAL_ORDER_STATUSES } from '@/contracts/order-contracts';

import { AuthModal } from '@/components/auth-modal';
import { AddressModal } from '@/components/address-modal';
import { SelectDarkStoreModal } from '@/components/home/select-dark-store-modal';
import { LocationOnboardingModal } from '@/components/location/location-onboarding-modal';
import { useDarkStore } from '@/store/useDarkStore';

export default function Page() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();

  // Global Stores
  const {
    products: storeProducts,
    isLoading,
    isRefreshing,
    fulfillmentFilter,
    setFulfillmentFilter,
    executeSearch,
    refreshCatalog,
    fetchCategories,
    fetchProducts,
    fetchDarkStores,
    fetchCoupons,
  } = useCatalogStore();
  const { items: cartItems, addItem, toggleWishlist: storeToggleWishlist, wishlist: storeWishlist } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    hasLocationConfirmed,
    getServiceability,
    getSelectedAddress,
    fetchAddresses,
  } = useAddressStore();
  const { isDarkStoreModalOpen, openDarkStoreModal, closeDarkStoreModal } = useDarkStore();

  // Dynamic Homepage Content CMS Store
  const {
    sections: cmsSections,
    fetchHomeLayout,
    hydrateOfflineCache,
    isRefreshing: isCmsRefreshing,
  } = useHomeContentStore();

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Screen Tabs & Active Filters
  const [tab, setTab] = useState('HOME');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);

  useEffect(() => {
    if (!params.tab) return;
    const requested = String(params.tab).toUpperCase();
    if (requested === 'CART') {
      router.push('/cart');
      return;
    }
    if (['HOME', 'SHOP', 'DARK_STORE', 'WISHLIST', 'ACCOUNT'].includes(requested)) {
      setTab(requested);
    }
  }, [params.tab, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchNotifications();
    void fetchOrders();
  }, [isAuthenticated, isNotificationsOpen, fetchNotifications, fetchOrders]);

  const hasActiveOrder = useMemo(
    () => orders.some((o) => o && !TERMINAL_ORDER_STATUSES.includes(o.status as any)),
    [orders],
  );

  useEffect(() => {
    if (!isAuthenticated || !hasActiveOrder) return;
    const pollTimer = setInterval(() => {
      void fetchOrders();
    }, 30000);
    return () => clearInterval(pollTimer);
  }, [isAuthenticated, hasActiveOrder, fetchOrders]);

  const handleSelectTab = useCallback(
    (nextTab: string) => {
      if (nextTab === 'CART') {
        router.push('/cart');
        return;
      }
      setTab(nextTab);
    },
    [router]
  );
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women' | 'Kids'>('All');
  const [selectedWear, setSelectedWear] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  // Search Suggestions Overlay Modal
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const serviceability = getServiceability();
  const selectedAddress = getSelectedAddress();

  // Upfront Location Gate: Prompt on initial visit if not confirmed yet
  useEffect(() => {
    if (!hasLocationConfirmed) {
      const timer = setTimeout(() => {
        setIsLocationModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasLocationConfirmed]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTryAndBuyModalOpen, setIsTryAndBuyModalOpen] = useState(false);
  const [currentBankIndex, setCurrentBankIndex] = useState(0);
  const [copiedBankCode, setCopiedBankCode] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState('');
  const toastAnim = useRef(new Animated.Value(100)).current;

  // Smart Sticky Category Bar — show on scroll-up, hide on scroll-down
  const CATEGORY_BAR_HEIGHT = 170;
  const lastScrollY = useRef(0);
  const categoryTranslateY = useRef(new Animated.Value(0)).current;
  const isCategoryVisible = useRef(true);

  const isNative = Platform.OS !== 'web';

  const handleHomeScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Near the top — always show
    if (currentY <= CATEGORY_BAR_HEIGHT) {
      if (!isCategoryVisible.current) {
        isCategoryVisible.current = true;
        Animated.spring(categoryTranslateY, {
          toValue: 0,
          useNativeDriver: isNative,
          tension: 80,
          friction: 12,
        }).start();
      }
    } else if (diff > 12 && isCategoryVisible.current) {
      // Scrolling DOWN past the section — hide it
      isCategoryVisible.current = false;
      Animated.spring(categoryTranslateY, {
        toValue: -CATEGORY_BAR_HEIGHT,
        useNativeDriver: isNative,
        tension: 80,
        friction: 12,
      }).start();
    } else if (diff < -12 && !isCategoryVisible.current) {
      // Scrolling UP — reveal it
      isCategoryVisible.current = true;
      Animated.spring(categoryTranslateY, {
        toValue: 0,
        useNativeDriver: isNative,
        tension: 80,
        friction: 12,
      }).start();
    }

    lastScrollY.current = currentY;
  }, [categoryTranslateY, isNative]);

  // Initial Data Fetch
  useEffect(() => {
    void useCartStore.getState().hydrateWishlist();
    fetchCategories();
    fetchDarkStores();
    fetchCoupons();
    fetchProducts();
    hydrateOfflineCache();
    fetchHomeLayout(false, selectedGender);
  }, [fetchCategories, fetchDarkStores, fetchCoupons, fetchProducts, hydrateOfflineCache, fetchHomeLayout]);

  // Android Hardware Back Button Handling
  useEffect(() => {
    const onHardwareBack = () => {
      if (isSearchOverlayVisible) {
        setIsSearchOverlayVisible(false);
        return true;
      }
      if (query.trim().length > 0) {
        setQuery('');
        return true;
      }
      if (tab !== 'HOME') {
        setTab('HOME');
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [isSearchOverlayVisible, query, tab]);

  const catalogCategories = useCatalogStore((s) => s.categories);

  const flatCategories = useMemo(() => {
    const out: any[] = [];
    const visit = (nodes: any[]) => {
      for (const node of nodes) {
        out.push(node);
        if (Array.isArray(node.children) && node.children.length > 0) visit(node.children);
        if (Array.isArray(node.subcategories) && node.subcategories.length > 0) visit(node.subcategories);
      }
    };
    visit(catalogCategories || []);
    return out;
  }, [catalogCategories]);

  // Derived Active Product Catalog normalized to ProductItem (Live API prioritized)
  const activeProducts = useMemo<ProductItem[]>(() => {
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts.map((p) => {
        const matchedCat = flatCategories.find(
          (c) =>
            (p.categoryId && c.id === p.categoryId) ||
            (p.category && String(c.name || '').toLowerCase() === String(p.category).toLowerCase()),
        );
        const derivedWear =
          (p as any).wear ||
          (matchedCat?.parentId
            ? flatCategories.find((parent) => parent.id === matchedCat.parentId)?.name
            : undefined) ||
          p.category ||
          'Tops';
        return {
          id: p.id,
          brand: p.brand,
          name: p.title,
          price: p.price,
          old: p.originalPrice || Math.round(p.price * 1.3),
          rating: String(p.rating || '4.8'),
          category: p.category || 'Women',
          categoryId: p.categoryId || matchedCat?.id || null,
          gender: p.gender || matchedCat?.gender || undefined,
          wear: derivedWear,
          tags: Array.isArray(p.tags) ? p.tags : [],
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L'],
          stockQuantity: typeof p.stockQuantity === 'number' ? p.stockQuantity : 10,
          reviewsCount: typeof p.reviewsCount === 'number' ? p.reviewsCount : 0,
          image: p.image || (p.galleryImages && p.galleryImages[0]) || '',
          fulfillmentType: (p as any).fulfillmentType,
          tryAndBuyEligible: (p as any).tryAndBuyEligible ?? true,
          fabric: (p as any).fabric,
          description: (p as any).description,
        };
      });
    }
    return [];
  }, [storeProducts, flatCategories]);

  // Filtered Products for Shop / Search
  const filtered = useMemo<ProductItem[]>(() => {
    const collectSubtreeIdsAndNames = (target: string) => {
      const ids = new Set<string>();
      const names = new Set<string>();
      const normalized = target.toLowerCase();
      names.add(normalized);
      ids.add(target);
      const seedNodes = flatCategories.filter(
        (c) => c.id === target || String(c.name || '').toLowerCase() === normalized,
      );
      const visitDown = (node: any) => {
        if (!node) return;
        ids.add(node.id);
        if (node.name) names.add(String(node.name).toLowerCase());
        flatCategories
          .filter((child) => child.parentId === node.id)
          .forEach(visitDown);
      };
      seedNodes.forEach(visitDown);
      return { ids, names };
    };

    const wearMatcher = selectedWear !== 'All' ? collectSubtreeIdsAndNames(selectedWear) : null;
    const catMatcher = category !== 'All' ? collectSubtreeIdsAndNames(category) : null;

    return activeProducts.filter((product) => {
      const pName = (product.name || '').toLowerCase();
      const pBrand = (product.brand || '').toLowerCase();
      const pCat = (product.category || '').toLowerCase();
      const pWear = (product.wear || '').toLowerCase();
      const pGender = (product.gender || '').toLowerCase();
      const pTags = (product.tags || []).map((t) => String(t).toLowerCase());

      const matchQuery = !query || pName.includes(query.toLowerCase()) || pBrand.includes(query.toLowerCase());
      const genderTarget = selectedGender.toLowerCase();
      const matchGender =
        selectedGender === 'All' ||
        pGender === genderTarget ||
        pGender === 'unisex' ||
        pCat === genderTarget ||
        pCat === 'all' ||
        pTags.includes(genderTarget);

      const matchWear =
        !wearMatcher ||
        (product.categoryId && wearMatcher.ids.has(product.categoryId)) ||
        wearMatcher.names.has(pCat) ||
        wearMatcher.names.has(pWear) ||
        pTags.some((t) => wearMatcher.names.has(t));

      const matchCategory =
        !catMatcher ||
        (product.categoryId && catMatcher.ids.has(product.categoryId)) ||
        catMatcher.names.has(pCat) ||
        catMatcher.names.has(pGender) ||
        pTags.some((t) => catMatcher.names.has(t));

      const matchPrice = maxPriceFilter === null || product.price <= maxPriceFilter;

      return matchQuery && matchGender && matchWear && matchCategory && matchPrice;
    });
  }, [activeProducts, flatCategories, query, selectedGender, selectedWear, category, maxPriceFilter]);

  // Formatted Selected Address text
  const selectedAddressText = useMemo(() => {
    const selected = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    return selected ? `${selected.label} • ${selected.city}` : 'Select Delivery Address';
  }, [addresses, selectedAddressId]);

  // Total Bag Counter
  const totalBagCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  // Toast Trigger Helper
  const showToast = useCallback((message: string) => {
    setToast(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 320, easing: bespokeEasing, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 100, duration: 320, easing: bespokeEasing, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      setToast('');
    });
  }, [toastAnim, setToast]);

  // Actions
  const addToBag = useCallback((productId: string | number, selectedSize?: string) => {
    const product = activeProducts.find((p) => String(p.id) === String(productId));
    if (!product) return;

    const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['M'];
    const chosenSize = selectedSize && availableSizes.includes(selectedSize)
      ? selectedSize
      : (selectedSize || availableSizes[0] || 'M');

    addItem({
      id: String(product.id),
      brand: product.brand,
      title: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.old || product.price,
      discount: '',
      rating: Number(product.rating) || 4.8,
      reviewsCount: typeof product.reviewsCount === 'number' ? product.reviewsCount : 0,
      stockQuantity: typeof product.stockQuantity === 'number' ? product.stockQuantity : 10,
      readyToShip: true,
      sizes: availableSizes,
      image: product.image,
      altText: product.name,
      galleryImages: [product.image],
      category: product.category,
      fulfillmentType: product.fulfillmentType as any,
    }, chosenSize, 'Default', 1);

    showToast(`Added ${product.brand} to Bag`);
  }, [activeProducts, addItem, showToast]);

  const toggleWishlist = useCallback((productId: string | number) => {
    storeToggleWishlist(String(productId));
  }, [storeToggleWishlist]);

  const handleOpenProduct = useCallback((product: any) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: String(product.id) },
    });
  }, [router]);

  // Header Handlers
  const handleSelectSearchQuery = useCallback((text: string) => {
    setQuery(text);
    executeSearch(text);
  }, [executeSearch]);

  // Category Bubbles Handlers
  const handleSelectGender = useCallback((gender: 'All' | 'Men' | 'Women' | 'Kids') => {
    setSelectedGender(gender);
    setSelectedWear('All');
    setCategory(gender === 'All' ? 'All' : gender);
    fetchHomeLayout(false, gender);
  }, [fetchHomeLayout]);

  const handleSelectWear = useCallback(
    (wearId: string) => {
      setSelectedWear(wearId);
      router.push({
        pathname: '/category/[id]',
        params: {
          id: wearId,
          ...(selectedGender !== 'All' ? { gender: selectedGender } : {}),
        },
      });
    },
    [router, selectedGender],
  );

  // Banner Press Handlers
  const handleBannerPress = useCallback((banner: any) => {
    if (banner?.actionType && banner.actionType !== 'NONE') {
      handleActionPress(banner.actionType, banner.actionValue, router, {
        setQuery,
        setCategory,
        setGender: setSelectedGender,
        setTab,
      });
      return;
    }
    if (banner?.categoryTarget && banner.categoryTarget !== 'All') {
      setSelectedGender(banner.categoryTarget);
      setCategory(banner.categoryTarget);
    }
    if (banner?.wearTarget) {
      setSelectedWear(banner.wearTarget);
    }
    setTab('SHOP');
  }, [router]);

  const handleTrendingCityPress = useCallback((item: TrendingCityItem) => {
    if (item.genderTarget !== 'All') {
      setSelectedGender(item.genderTarget);
      setCategory(item.genderTarget);
    }
    if (item.wearTarget) {
      setSelectedWear(item.wearTarget);
    }
    if (item.searchQuery) {
      setQuery(item.searchQuery);
      executeSearch(item.searchQuery);
    }
  }, [executeSearch]);

  const handleCuratedDealPress = useCallback((deal: CuratedDealCard) => {
    setSelectedGender(deal.gender);
    setCategory(deal.gender);
    if (deal.wear) {
      setSelectedWear(deal.wear);
    }
    if (deal.searchQuery) {
      setQuery(deal.searchQuery);
      executeSearch(deal.searchQuery);
    }
  }, [executeSearch]);

  const handleBudgetPress = useCallback((item: BudgetStoreItem) => {
    setMaxPriceFilter(item.maxPrice);
    setTab('SHOP');
  }, []);

  const handleTrendRadarPress = useCallback((item: TrendRadarItem) => {
    setQuery(item.searchQuery);
    executeSearch(item.searchQuery);
  }, [executeSearch]);

  const handleBrandSelect = useCallback((tile: VendorBrandTile) => {
    const cleanQuery = tile.brand.replace(/[®|]/g, '').trim();
    setQuery(cleanQuery);
    executeSearch(cleanQuery);
  }, [executeSearch]);

  const handleUrbanDealSelect = useCallback((deal: LuxeDealItem) => {
    setQuery(deal.brand);
    executeSearch(deal.brand);
  }, [executeSearch]);

  const handleCopyBankCode = useCallback((code: string) => {
    setCopiedBankCode(code);
    showToast(`Copied code ${code}!`);
    setTimeout(() => setCopiedBankCode(null), 2500);
  }, [showToast]);

  const handleResetTrendingFilter = useCallback(() => {
    setSelectedGender('All');
    setSelectedWear('All');
    setCategory('All');
  }, []);

  // Active CMS Homepage Sections (Filtered by isEnabled and Sorted by displayOrder)
  const activeCmsSections = useMemo(() => {
    return [...cmsSections]
      .filter((s) => s.isEnabled)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [cmsSections]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshCatalog(),
      fetchHomeLayout(true, selectedGender),
    ]);
  }, [refreshCatalog, fetchHomeLayout, selectedGender]);

  // Wishlist Products List
  const wishlistProductsList = useMemo(() => {
    return activeProducts.filter((product: any) => storeWishlist.includes(String(product.id)));
  }, [activeProducts, storeWishlist]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Top Header */}
      <HomeHeader
        paddingTop={insets.top + 8}
        selectedAddressText={selectedAddressText}
        isServiceable={serviceability.isServiceable}
        onOpenAddressModal={() => setIsLocationModalOpen(true)}
        onOpenAccount={() => setTab('ACCOUNT')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadNotifications}
        query={query}
        onQueryChange={(text) => {
          setQuery(text);
          if (text.trim().length > 0) {
            executeSearch(text);
          }
        }}
        onSelectSearchQuery={handleSelectSearchQuery}
        onOpenSearchOverlay={() => setIsSearchOverlayVisible(true)}
      />

      {/* Main Content Area */}
      <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          onScroll={tab === 'HOME' && !query ? handleHomeScroll : undefined}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS !== 'web'}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
          decelerationRate="normal"
          directionalLockEnabled={true}
          refreshControl={
            tab === 'HOME' && !query ? (
              <RefreshControl
                refreshing={isRefreshing || isCmsRefreshing}
                onRefresh={handleRefresh}
                tintColor="#FF5A1F"
                colors={['#FF5A1F', '#C2410C']}
              />
            ) : undefined
          }
        >
        {/* Active Search Results View */}
        {query.trim().length > 0 ? (
          <SearchResultsView
            query={query}
            products={activeProducts}
            wishlist={storeWishlist}
            fulfillmentFilter={fulfillmentFilter}
            onSelectFulfillmentFilter={setFulfillmentFilter}
            onClearSearch={() => setQuery('')}
            onWishlist={toggleWishlist}
            onBag={addToBag}
            onOpenProduct={handleOpenProduct}
            onSelectSearchQuery={handleSelectSearchQuery}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/* Smart Sticky Category Bar — shown at top & on scroll-up, hidden on scroll-down */}
            {tab === 'HOME' && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  transform: [{ translateY: categoryTranslateY }],
                }}
              >
                <CategoryBubblesSection
                  selectedGender={selectedGender}
                  selectedWear={selectedWear}
                  onSelectGender={handleSelectGender}
                  onSelectWear={handleSelectWear}
                />
              </Animated.View>
            )}

        {tab === 'HOME' && (
          <View>
            {/* Spacer to push content below the floating category bar */}
            <View style={{ height: CATEGORY_BAR_HEIGHT }} />

            {/* Dynamic CMS Sections Loop (Ordered and Toggled via Admin Studio) */}
            {activeCmsSections.map((section) => {
              switch (section.sectionKey) {
                case 'HERO_BANNER':
                  return (
                    <React.Fragment key="HERO_BANNER">
                      {/* Compact Hero Banner Carousel with Isolated Auto-Advance Interval */}
                      <HeroBannerSection onBannerPress={handleBannerPress} />

                      {/* Hyperlocal 19-Min Instant Drop Serviceability Banner */}
                      {!serviceability.isServiceable ? (
                        <View
                          style={{
                            marginHorizontal: 16,
                            marginTop: 12,
                            marginBottom: 10,
                            backgroundColor: '#FEF2F2',
                            borderWidth: 1.5,
                            borderColor: '#FCA5A5',
                            borderRadius: 20,
                            padding: 16,
                            shadowColor: '#DC2626',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                            elevation: 3,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={15} color="#DC2626" />
                              </View>
                              <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#DC2626', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
                                NOT AVAILABLE FOR THIS PLACE
                              </Text>
                            </View>

                            <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#FECACA' }}>
                              <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#B91C1C' }]}>
                                {serviceability.distanceKm} KM (MAX {serviceability.maxRadiusKm.toFixed(1)} KM)
                              </Text>
                            </View>
                          </View>

                          <Text style={[FontStyles.sansBold, { fontSize: 13, color: '#991B1B', lineHeight: 18 }]}>
                            Instant 19-minute delivery is not available at {selectedAddress?.locality || selectedAddress?.city || 'this location'}.
                          </Text>
                          <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#7F1D1D', marginTop: 3, lineHeight: 16 }]}>
                            Our Ather 450X EV quick-commerce fleet operates within {serviceability.maxRadiusKm.toFixed(1)} km of our Express Hub. Items can only be ordered via Standard Boutique Dispatch (2-4 Days) or choose another location.
                          </Text>

                          <Pressable
                            onPress={() => setIsLocationModalOpen(true)}
                            style={{
                              marginTop: 12,
                              backgroundColor: '#DC2626',
                              borderRadius: 12,
                              paddingVertical: 9,
                              paddingHorizontal: 14,
                              alignSelf: 'flex-start',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <MapPin size={13} color="#FFFFFF" />
                            <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#FFFFFF', letterSpacing: 0.5 }]}>
                              SELECT SERVICEABLE LOCATION
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View
                          style={{
                            marginHorizontal: 16,
                            marginTop: 10,
                            marginBottom: 6,
                            backgroundColor: '#F0FDF4',
                            borderWidth: 1,
                            borderColor: '#BBF7D0',
                            borderRadius: 14,
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Zap size={13} color="#15803D" fill="#15803D" />
                            <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#15803D' }]}>
                              ⚡ 19-Min Instant Drop Available at {selectedAddress?.locality || selectedAddress?.city || 'Your Area'}
                            </Text>
                          </View>
                          <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#166534' }]}>
                            {serviceability.distanceKm} km from Hub
                          </Text>
                        </View>
                      )}

                      {/* Quick Strip: Doorstep Try & Buy Button */}
                      <Pressable
                        onPress={() => setIsTryAndBuyModalOpen(true)}
                        style={({ pressed }) => ({
                          marginHorizontal: 16,
                          marginBottom: 12,
                          backgroundColor: '#ffffff',
                          borderWidth: 1,
                          borderColor: '#D9D9D5',
                          borderRadius: 14,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          shadowColor: '#111111',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                          opacity: pressed ? 0.92 : 1,
                          transform: [{ scale: pressed ? 0.99 : 1 }],
                        })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: '#111111',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 8,
                            }}
                          >
                            <Sparkles size={13} color="#ffffff" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <EditorialText
                              first="Doorstep"
                              second="try & buy"
                              fontSize={13}
                              lineHeight={16}
                              singleLine={true}
                            />
                            <Text style={[FontStyles.sansRegular, { fontSize: 9.5, color: '#6B6667', marginTop: 1.5 }]} numberOfLines={1}>
                              Try sizes • Keep what fits
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={14} color="#111111" />
                      </Pressable>
                    </React.Fragment>
                  );

                case 'BANK_OFFERS':
                  return (
                    <BankOffersTicker
                      key="BANK_OFFERS"
                      onPress={() => setIsBankModalOpen(true)}
                      selectedIndex={currentBankIndex}
                    />
                  );

                case 'TRENDING_CITY':
                  return (
                    <TrendingCitySection
                      key="TRENDING_CITY"
                      onItemPress={handleTrendingCityPress}
                    />
                  );

                case 'CURATED_DEALS':
                  return (
                    <CuratedGenderDealsSection
                      key="CURATED_DEALS"
                      onDealPress={handleCuratedDealPress}
                      onGenderHeaderPress={(g) => {
                        handleSelectGender(g);
                        setTab('SHOP');
                      }}
                    />
                  );

                case 'BUDGET_STORES':
                  return (
                    <BudgetStoresSection
                      key="BUDGET_STORES"
                      onSelectBudget={handleBudgetPress}
                      onViewAll={() => {
                        setMaxPriceFilter(null);
                        setTab('SHOP');
                      }}
                    />
                  );

                case 'FLASH_DROP':
                  return (
                    <FlashDropSection
                      key="FLASH_DROP"
                      onExplore={() => {
                        setCategory('All');
                        setTab('SHOP');
                      }}
                    />
                  );

                case 'TREND_RADAR':
                  return (
                    <TrendRadarSection
                      key="TREND_RADAR"
                      onSelectTrend={handleTrendRadarPress}
                      onExploreAll={() => setTab('SHOP')}
                    />
                  );

                case 'BRAND_SPOTLIGHT':
                  return (
                    <VendorSpotlightSection
                      key="BRAND_SPOTLIGHT"
                      onSelectBrand={handleBrandSelect}
                      onViewAll={() => setTab('SHOP')}
                    />
                  );

                case 'LUXE_WEEKEND':
                  return (
                    <UrbanDealsSection
                      key="LUXE_WEEKEND"
                      onSelectDeal={handleUrbanDealSelect}
                    />
                  );

                default:
                  return null;
              }
            })}

            {/* Trending Now Horizontal Carousel */}
            <TrendingNowSection
              products={filtered.length > 0 ? filtered : activeProducts}
              wishlist={storeWishlist}
              isFilterActive={selectedGender !== 'All' || selectedWear !== 'All'}
              onResetFilter={handleResetTrendingFilter}
              onWishlist={toggleWishlist}
              onBag={addToBag}
              onOpen={handleOpenProduct}
              isLoading={isLoading}
            />

            {/* Affordz Promise & Doorstep Trust Pillars */}
            <AffordzPromiseSection />

            {/* Modern Redefined Editorial Showcase */}
            <ModernRedefinedBanner
              onExploreDrop={(banner) => {
                if (banner?.actionType && banner.actionType !== 'NONE') {
                  handleBannerPress(banner);
                } else {
                  setTab('SHOP');
                }
              }}
            />

            {/* At last of the homepage: Full App Product Catalog with Category Filters & Sorting */}
            <HomeProductCatalogSection
              products={activeProducts}
              wishlist={storeWishlist}
              onWishlist={toggleWishlist}
              onBag={addToBag}
              onOpenProduct={handleOpenProduct}
              isLoading={isLoading}
            />
          </View>
        )}

        {/* Tab 2: Discover All / Shop View */}
        {tab === 'SHOP' && (
          <ShopView
            products={activeProducts}
            category={category}
            setCategory={setCategory}
            wishlist={storeWishlist}
            onWishlist={toggleWishlist}
            onBag={addToBag}
            onOpen={handleOpenProduct}
            maxPriceFilter={maxPriceFilter}
            onClearPriceFilter={() => setMaxPriceFilter(null)}
            isLoading={isLoading}
          />
        )}

        {/* Tab 3: Wishlist View */}
        {tab === 'WISHLIST' && (
          <WishlistView
            products={wishlistProductsList}
            allProducts={activeProducts}
            onBag={addToBag}
            onWishlist={(id) => useCartStore.getState().removeFromWishlist(String(id))}
            onOpen={handleOpenProduct}
            onExplore={() => setTab('SHOP')}
            onGoToBag={() => router.push('/cart')}
            isLoading={isLoading}
          />
        )}

        {/* Tab 5: Account View */}
        {tab === 'ACCOUNT' && (
          <AccountView
            user={user}
            onOrders={() => router.push('/orders')}
            onAddresses={() => setIsAddressModalOpen(true)}
            onTracking={() => router.push('/tracking')}
            onSupport={() => router.push('/support')}
            onWishlist={() => setTab('WISHLIST')}
            onAuth={() => setIsAuthModalOpen(true)}
            onLogout={logout}
          />
        )}

        {/* Tab 6: Select Dark Store Products View */}
        {tab === 'DARK_STORE' && (
          <DarkStoreView
            products={activeProducts}
            wishlist={storeWishlist}
            onWishlist={toggleWishlist}
            onBag={addToBag}
            onOpen={handleOpenProduct}
            onOpenDarkStoreModal={openDarkStoreModal}
          />
        )}
          </>
        )}
      </ScrollView>

      {/* Floating Bottom Pill Nav */}
      <FloatingBottomBar
        currentTab={tab}
        onSelectTab={handleSelectTab}
        totalBagCount={totalBagCount}
        wishlistCount={storeWishlist.length}
        onOpenDarkStoreModal={openDarkStoreModal}
      />

      {/* Animated Action Toast */}
      <Animated.View
        style={{ transform: [{ translateY: toastAnim }] }}
        className="absolute bottom-[110px] self-center bg-[#111111]/95 border border-[#353335] backdrop-blur-md px-[20px] py-[14px] rounded-full flex-row items-center gap-[10px] shadow-lg z-50"
      >
        <View className="w-[24px] h-[24px] bg-white/10 rounded-full items-center justify-center">
          <ShoppingBag size={13} color="#ffffff" />
        </View>
        <Text style={[FontStyles.sansBold, { color: '#FFFFFF', fontSize: 12, letterSpacing: 0.3 }]}>{toast}</Text>
      </Animated.View>

      {/* Hyper-Local Fashion Dark Store Selection Modal */}
      {isDarkStoreModalOpen && (
        <SelectDarkStoreModal
          visible={isDarkStoreModalOpen}
          onClose={closeDarkStoreModal}
          onSelectStore={(store) => {
            setToast(`Connected to ${store.shortName} • ${store.deliveryMinutes}m Drop`);
            Animated.sequence([
              Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
              Animated.delay(2200),
              Animated.timing(toastAnim, { toValue: 100, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
            ]).start();
          }}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          visible={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <AddressModal
          visible={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          selectedAddressId={selectedAddressId}
          onSelectAddress={(addr) => setSelectedAddressId(addr.id)}
        />
      )}

      {/* Upfront 19-Min Location Onboarding & Serviceability Modal */}
      {isLocationModalOpen && (
        <LocationOnboardingModal
          visible={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onConfirm={(addr) => {
            setSelectedAddressId(addr.id);
            setIsLocationModalOpen(false);
          }}
        />
      )}

      {/* Interactive Bank Offers Bottom Sheet Modal */}
      {isBankModalOpen && (
        <BankOffersModal
          visible={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          currentBankIndex={currentBankIndex}
          onSelectOffer={(idx) => {
            setCurrentBankIndex(idx);
            setIsBankModalOpen(false);
          }}
          onCopyCode={handleCopyBankCode}
          copiedCode={copiedBankCode}
        />
      )}

      {/* Doorstep Try & Buy Explainer Modal */}
      {isTryAndBuyModalOpen && (
        <TryBuyModal
          visible={isTryAndBuyModalOpen}
          onClose={() => setIsTryAndBuyModalOpen(false)}
          onExplore={() => {
            setIsTryAndBuyModalOpen(false);
            setTab('SHOP');
          }}
        />
      )}

      {/* Live Search Suggestions Autocomplete & Trending Overlay */}
      {isSearchOverlayVisible && (
        <SearchSuggestionsOverlay
          visible={isSearchOverlayVisible}
          query={query}
          onQueryChange={setQuery}
          onSelectQuery={handleSelectSearchQuery}
          onOpenProduct={(product) => {
            setIsSearchOverlayVisible(false);
            handleOpenProduct(product);
          }}
          onClose={() => setIsSearchOverlayVisible(false)}
        />
      )}

      {/* Live Notifications Modal */}
      <NotificationModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </View>
  );
}
