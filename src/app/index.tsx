import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Animated, Pressable, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingBag, Sparkles, ChevronRight } from 'lucide-react-native';

import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';

import {
  DEFAULT_PRODUCTS,
  BANK_OFFERS,
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
import { TodayLookSection } from '@/components/home/today-look-section';
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

import { ShopView } from '@/components/views/shop-view';
import { WishlistView } from '@/components/views/wishlist-view';
import { BagView } from '@/components/views/bag-view';
import { AccountView } from '@/components/views/account-view';
import { DarkStoreView } from '@/components/views/dark-store-view';

import { AuthModal } from '@/components/auth-modal';
import { AddressModal } from '@/components/address-modal';
import { SelectDarkStoreModal } from '@/components/home/select-dark-store-modal';
import { useDarkStore } from '@/store/useDarkStore';

export default function Page() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Global Stores
  const {
    products: storeProducts,
    categories,
    activeCoupons,
    isLoading,
    isRefreshing,
    refreshCatalog,
    fetchCategories,
    fetchProducts,
    fetchDarkStores,
    fetchCoupons,
  } = useCatalogStore();
  const { items: cartItems, addItem, toggleWishlist: storeToggleWishlist, wishlist: storeWishlist } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, selectedAddressId, setSelectedAddressId } = useAddressStore();
  const { isDarkStoreModalOpen, openDarkStoreModal, closeDarkStoreModal } = useDarkStore();

  // Screen Tabs & Active Filters
  const [tab, setTab] = useState('HOME');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women' | 'Kids'>('All');
  const [selectedWear, setSelectedWear] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
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

  const handleHomeScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Near the top — always show
    if (currentY <= CATEGORY_BAR_HEIGHT) {
      if (!isCategoryVisible.current) {
        isCategoryVisible.current = true;
        Animated.spring(categoryTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      }
    } else if (diff > 8 && isCategoryVisible.current) {
      // Scrolling DOWN past the section — hide it
      isCategoryVisible.current = false;
      Animated.spring(categoryTranslateY, {
        toValue: -CATEGORY_BAR_HEIGHT,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (diff < -8 && !isCategoryVisible.current) {
      // Scrolling UP — reveal it
      isCategoryVisible.current = true;
      Animated.spring(categoryTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }

    lastScrollY.current = currentY;
  }, [categoryTranslateY]);

  // Initial Data Fetch
  useEffect(() => {
    fetchCategories();
    fetchDarkStores();
    fetchCoupons();
    fetchProducts();
  }, [fetchCategories, fetchDarkStores, fetchCoupons, fetchProducts]);

  // Derived Active Product Catalog normalized to ProductItem (Live API prioritized)
  const activeProducts = useMemo<ProductItem[]>(() => {
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts.map((p) => ({
        id: p.id,
        brand: p.brand,
        name: p.title,
        price: p.price,
        old: p.originalPrice || Math.round(p.price * 1.3),
        rating: String(p.rating || '4.8'),
        category: p.category || 'Women',
        wear: (p as any).wear || 'Tops',
        image: p.image || (p.galleryImages && p.galleryImages[0]) || '',
      }));
    }
    return [...DEFAULT_PRODUCTS];
  }, [storeProducts]);

  // Filtered Products for Shop / Search
  const filtered = useMemo<ProductItem[]>(() => {
    return activeProducts.filter((product) => {
      const pName = (product.name || '').toLowerCase();
      const pBrand = (product.brand || '').toLowerCase();
      const pCat = product.category || 'All';
      const pWear = product.wear || 'All';

      const matchQuery = !query || pName.includes(query.toLowerCase()) || pBrand.includes(query.toLowerCase());
      const matchGender = selectedGender === 'All' || pCat === selectedGender || pCat === 'All';
      const matchWear = selectedWear === 'All' || pWear === selectedWear;
      const matchCategory = category === 'All' || pCat === category;
      const matchPrice = maxPriceFilter === null || product.price <= maxPriceFilter;

      return matchQuery && matchGender && matchWear && matchCategory && matchPrice;
    });
  }, [activeProducts, query, selectedGender, selectedWear, category, maxPriceFilter]);

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
      Animated.timing(toastAnim, { toValue: 0, duration: 320, easing: bespokeEasing, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 100, duration: 320, easing: bespokeEasing, useNativeDriver: true }),
    ]).start(() => {
      setToast('');
    });
  }, [toastAnim]);

  // Actions
  const addToBag = useCallback((productId: string | number) => {
    const product = activeProducts.find((p) => String(p.id) === String(productId));
    if (!product) return;

    addItem({
      id: String(product.id),
      brand: product.brand,
      title: product.name,
      description: '',
      price: product.price,
      originalPrice: product.old || product.price,
      discount: '',
      rating: Number(product.rating) || 4.8,
      reviewsCount: 120,
      stockQuantity: 10,
      readyToShip: true,
      sizes: ['S', 'M', 'L'],
      image: product.image,
      altText: product.name,
      galleryImages: [product.image],
      category: product.category,
    }, 'M', 'Default', 1);

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
    setTab('SHOP');
  }, []);

  // Category Bubbles Handlers
  const handleSelectGender = useCallback((gender: 'All' | 'Men' | 'Women' | 'Kids') => {
    setSelectedGender(gender);
    setSelectedWear('All');
    setCategory(gender === 'All' ? 'All' : gender);
  }, []);

  const handleSelectWear = useCallback((wearId: string) => {
    setSelectedWear((prev) => (prev === wearId ? 'All' : wearId));
  }, []);

  // Banner Press Handlers
  const handleBannerPress = useCallback((banner: HeroBannerItem) => {
    if (banner.categoryTarget !== 'All') {
      setSelectedGender(banner.categoryTarget);
      setCategory(banner.categoryTarget);
    }
    if (banner.wearTarget) {
      setSelectedWear(banner.wearTarget);
    }
    setTab('SHOP');
  }, []);

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
    }
    setTab('SHOP');
  }, []);

  const handleCuratedDealPress = useCallback((deal: CuratedDealCard) => {
    setSelectedGender(deal.gender);
    setCategory(deal.gender);
    if (deal.wear) {
      setSelectedWear(deal.wear);
    }
    if (deal.searchQuery) {
      setQuery(deal.searchQuery);
    }
    setTab('SHOP');
  }, []);

  const handleBudgetPress = useCallback((item: BudgetStoreItem) => {
    setMaxPriceFilter(item.maxPrice);
    setTab('SHOP');
  }, []);

  const handleTrendRadarPress = useCallback((item: TrendRadarItem) => {
    setQuery(item.searchQuery);
    setTab('SHOP');
  }, []);

  const handleBrandSelect = useCallback((tile: VendorBrandTile) => {
    const cleanQuery = tile.brand.replace(/[®|]/g, '').trim();
    setQuery(cleanQuery);
    setTab('SHOP');
  }, []);

  const handleUrbanDealSelect = useCallback((deal: LuxeDealItem) => {
    setQuery(deal.brand);
    setTab('SHOP');
  }, []);

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

  // Bag Products List
  const bagProductsList = useMemo(() => {
    return cartItems.map((ci) => ({
      id: ci.productId,
      brand: ci.brand,
      name: ci.title,
      price: ci.price,
      image: ci.image,
    }));
  }, [cartItems]);

  // Wishlist Products List
  const wishlistProductsList = useMemo(() => {
    return activeProducts.filter((product: any) => storeWishlist.includes(String(product.id)));
  }, [activeProducts, storeWishlist]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Top Header */}
      {tab !== 'CART' && (
        <HomeHeader
          paddingTop={insets.top + 8}
          selectedAddressText={selectedAddressText}
          onOpenAddressModal={() => setIsAddressModalOpen(true)}
          onOpenAccount={() => setTab('ACCOUNT')}
          query={query}
          onQueryChange={setQuery}
          onSelectSearchQuery={handleSelectSearchQuery}
        />
      )}

      {/* Main Content Area */}
      {tab === 'CART' ? (
        <View style={{ flex: 1 }}>
          <BagView
            products={bagProductsList}
            onShop={() => setTab('SHOP')}
            onPayNow={() => router.push('/cart')}
            onOpenProduct={handleOpenProduct}
            onBack={() => setTab('HOME')}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          onScroll={tab === 'HOME' ? handleHomeScroll : undefined}
          scrollEventThrottle={16}
          refreshControl={
            tab === 'HOME' ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshCatalog}
                tintColor="#FF5A1F"
                colors={['#FF5A1F', '#C2410C']}
              />
            ) : undefined
          }
        >
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

            {/* ROW 3: Compact Hero Banner Carousel with Isolated Auto-Advance Interval */}
            <HeroBannerSection onBannerPress={handleBannerPress} />

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
                  <Text style={{ fontSize: 9.5, color: '#6B6667', marginTop: 1.5 }} numberOfLines={1}>
                    Try sizes • Keep what fits
                  </Text>
                </View>
              </View>
              <ChevronRight size={14} color="#111111" />
            </Pressable>

            {/* ROW 4: Dynamic Bank Offer Strip with Isolated 3.8s Ticker */}
            <BankOffersTicker
              onPress={() => setIsBankModalOpen(true)}
              selectedIndex={currentBankIndex}
            />

            {/* ROW 5: Trending in Your City */}
            <TrendingCitySection onItemPress={handleTrendingCityPress} />

            {/* Algorithm Recommendation Engine: Today's Look. Today. */}
            <TodayLookSection
              storeWishlist={storeWishlist}
              selectedGender={selectedGender}
              onWishlist={toggleWishlist}
              onBag={addToBag}
              onOpenProduct={handleOpenProduct}
            />

            {/* Curated Luxury Tiers: For Him & For Her */}
            <CuratedGenderDealsSection
              onDealPress={handleCuratedDealPress}
              onGenderHeaderPress={(g) => {
                handleSelectGender(g);
                setTab('SHOP');
              }}
            />

            {/* Shop by Budget Stores (2x2 Grid) */}
            <BudgetStoresSection
              onSelectBudget={handleBudgetPress}
              onViewAll={() => {
                setMaxPriceFilter(null);
                setTab('SHOP');
              }}
            />

            {/* Flash Atelier Live Drop (Isolated 1-Second Timer) */}
            <FlashDropSection
              onExplore={() => {
                setCategory('All');
                setTab('SHOP');
              }}
            />

            {/* Trend Radar / Aesthetic Hub */}
            <TrendRadarSection
              onSelectTrend={handleTrendRadarPress}
              onExploreAll={() => setTab('SHOP')}
            />

            {/* Vendor Brand Campaign Spotlight (3x3 Grid) */}
            <VendorSpotlightSection
              onSelectBrand={handleBrandSelect}
              onViewAll={() => setTab('SHOP')}
            />

            {/* Urban Editorial Deals Banner Strip */}
            <UrbanDealsSection onSelectDeal={handleUrbanDealSelect} />

            {/* Trending Now Horizontal Carousel */}
            <TrendingNowSection
              products={filtered.length > 0 ? filtered : activeProducts}
              wishlist={storeWishlist}
              isFilterActive={selectedGender !== 'All' || selectedWear !== 'All'}
              onResetFilter={handleResetTrendingFilter}
              onWishlist={toggleWishlist}
              onBag={addToBag}
              onOpen={handleOpenProduct}
            />

            {/* Affordz Promise & Doorstep Trust Pillars */}
            <AffordzPromiseSection />

            {/* Modern Redefined Editorial Showcase */}
            <ModernRedefinedBanner onExploreDrop={() => setTab('SHOP')} />

            {/* At last of the homepage: Full App Product Catalog with Category Filters & Sorting */}
            <HomeProductCatalogSection
              products={activeProducts}
              wishlist={storeWishlist}
              onWishlist={toggleWishlist}
              onBag={addToBag}
              onOpenProduct={handleOpenProduct}
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
          />
        )}

        {/* Tab 3: Wishlist View */}
        {tab === 'WISHLIST' && (
          <WishlistView
            products={wishlistProductsList}
            allProducts={activeProducts}
            onBag={addToBag}
            onWishlist={toggleWishlist}
            onOpen={handleOpenProduct}
            onExplore={() => setTab('SHOP')}
            onGoToBag={() => setTab('CART')}
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
            onAuth={() => setIsAuthModalOpen(true)}
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
      </ScrollView>
    )}

      {/* Floating Bottom Pill Nav (Hidden on Cart/Bag screen so sticky Place Order bar is unobstructed) */}
      {tab !== 'CART' && (
        <FloatingBottomBar
          currentTab={tab}
          onSelectTab={setTab}
          totalBagCount={totalBagCount}
          wishlistCount={storeWishlist.length}
          onOpenDarkStoreModal={openDarkStoreModal}
        />
      )}

      {/* Animated Action Toast */}
      <Animated.View
        style={{ transform: [{ translateY: toastAnim }] }}
        className="absolute bottom-[110px] self-center bg-[#111111]/95 border border-[#353335] backdrop-blur-md px-[20px] py-[14px] rounded-full flex-row items-center gap-[10px] shadow-lg z-50"
      >
        <View className="w-[24px] h-[24px] bg-white/10 rounded-full items-center justify-center">
          <ShoppingBag size={13} color="#ffffff" />
        </View>
        <Text className="text-white text-[12px] font-bold tracking-wide">{toast}</Text>
      </Animated.View>

      {/* Hyper-Local Fashion Dark Store Selection Modal */}
      <SelectDarkStoreModal
        visible={isDarkStoreModalOpen}
        onClose={closeDarkStoreModal}
        onSelectStore={(store) => {
          setToast(`Connected to ${store.shortName} • ${store.deliveryMinutes}m Drop`);
          Animated.sequence([
            Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.delay(2200),
            Animated.timing(toastAnim, { toValue: 100, duration: 250, useNativeDriver: true }),
          ]).start();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Address Selection Modal */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => setSelectedAddressId(addr.id)}
      />

      {/* Interactive Bank Offers Bottom Sheet Modal */}
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

      {/* Doorstep Try & Buy Explainer Modal */}
      <TryBuyModal
        visible={isTryAndBuyModalOpen}
        onClose={() => setIsTryAndBuyModalOpen(false)}
        onExplore={() => {
          setIsTryAndBuyModalOpen(false);
          setTab('SHOP');
        }}
      />
    </View>
  );
}
