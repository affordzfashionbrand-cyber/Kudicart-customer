import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Share,
  ActivityIndicator,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  BackHandler,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react-native';

import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useDarkStore } from '@/store/useDarkStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from '@/components/auth-modal';
import { catalogApi, ApiProduct } from '@/services/api';
import { safeBack } from '@/utils/navigation';
import { SearchSuggestionsOverlay } from '@/components/home/search-suggestions-overlay';
import { ProductDetailSkeleton } from '@/components/common/skeleton';

import {
  AVAILABLE_SIZES,
  ProductHeader,
  ProductStatusBadge,
  ProductGallery,
  ProductDetailsSection,
  ProductDeliverySection,
  ProductOffersSection,
  ProductSizeSection,
  ProductSpecsSection,
  ProductCustomerLooks,
  ProductEnsembleSection,
  ProductReviewsSection,
  ProductBottomBar,
  ProductSizeModal,
  ProductRelatedCatalog,
} from '@/components/product';

import { DEFAULT_PRODUCTS, ProductItem } from '@/data/homeData';
import { resolveProductGalleryShots } from '@/data/product-gallery-data';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { products: storeProducts } = useCatalogStore();
  const {
    addItem,
    updateQuantity,
    removeItem,
    toggleWishlist,
    wishlist,
    items: cartItems,
  } = useCartStore();
  const { selectedDarkStore } = useDarkStore();
  const { isAuthenticated } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cartItems]);

  const [liveProduct, setLiveProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product from live backend
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setIsLoading(true);
      try {
        if (id) {
          const res = await catalogApi.getProductById(String(id));
          if (isMounted && res) {
            setLiveProduct(res);
          }
        }
      } catch {
        // Fallback to storeProducts or seed default
        const fromStore = storeProducts.find((p) => String(p.id) === String(id));
        if (isMounted && fromStore) {
          setLiveProduct(fromStore);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id, storeProducts]);

  // Resolve Product Data
  const product = useMemo<ApiProduct | null>(() => {
    if (liveProduct) return liveProduct;
    const fromStore = storeProducts.find((p) => String(p.id) === String(id));
    if (fromStore) return fromStore;

    // Fallback for default seed products
    const fromDefault = DEFAULT_PRODUCTS.find((p) => String(p.id) === String(id));
    if (fromDefault) {
      return {
        id: String(fromDefault.id),
        brand: fromDefault.brand,
        title: fromDefault.name,
        description: 'Exquisite handcrafted apparel tailored from premium textiles by master ateliers.',
        price: fromDefault.price,
        originalPrice: fromDefault.old,
        discount: '40% OFF',
        rating: Number(fromDefault.rating) || 4.9,
        reviewsCount: 148,
        stockQuantity: 10,
        readyToShip: true,
        sizes: AVAILABLE_SIZES,
        image: fromDefault.image,
        altText: fromDefault.name,
        galleryImages: [fromDefault.image],
        category: fromDefault.category,
        fulfillmentType: [4, 8, 9, 10, 102, 103, 106, 107].includes(Number(fromDefault.id)) ? 'DARK_STORE' : 'VENDOR',
        tryAndBuyEligible: [4, 8, 9, 10, 102, 103, 106, 107].includes(Number(fromDefault.id)),
      };
    }
    return null;
  }, [liveProduct, storeProducts, id]);

  // Determine Dark Store / Try & Buy Status (Strict Invariant: Only DARK_STORE has Try & Buy)
  const isDarkStoreProduct = useMemo(() => {
    return product?.fulfillmentType === 'DARK_STORE';
  }, [product]);

  // Multi-Angle Lookbook Gallery Shots (Atelier 4-5 Angles Guarantee)
  const galleryShots = useMemo(() => {
    return resolveProductGalleryShots({
      id: product?.id,
      category: product?.category,
      wear: (product as any)?.wear,
      image: product?.image,
      galleryImages: product?.galleryImages,
    });
  }, [product]);

  const galleryImages = useMemo(() => {
    return galleryShots.map((s) => s.uri);
  }, [galleryShots]);

  const shotLabels = useMemo(() => {
    return galleryShots.map((s) => s.label);
  }, [galleryShots]);

  // Available Sizes for this Product
  const availableProductSizes = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) {
      return product.sizes;
    }
    return AVAILABLE_SIZES;
  }, [product]);

  // Interaction State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [sizeError, setSizeError] = useState(false);
  const sizeSectionLayoutY = useRef<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedColor, setSelectedColor] = useState('Classic Fabric');
  const [dualSizeTrial, setDualSizeTrial] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Search Suggestions State
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hardware Back Handler for Search Overlay
  useEffect(() => {
    if (!isSearchOverlayVisible) return;
    const onHardwareBack = () => {
      setIsSearchOverlayVisible(false);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [isSearchOverlayVisible]);

  // Ensure default selected size matches available product sizes
  useEffect(() => {
    if (availableProductSizes.length > 0 && !availableProductSizes.includes(selectedSize)) {
      setSelectedSize(availableProductSizes[0]);
    }
  }, [availableProductSizes, selectedSize]);

  // Current item in bag for this product & selected size
  const currentCartItem = useMemo(() => {
    if (!product || !selectedSize) return null;
    return cartItems.find(
      (item) => item.productId === String(product.id) && item.size === selectedSize,
    );
  }, [cartItems, product, selectedSize]);

  const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;

  // Pincode & Delivery State
  const [pincode, setPincode] = useState('560038');
  const [pincodeInput, setPincodeInput] = useState('560038');
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const deliveryEstimate = useMemo(() => {
    const isBangalore = pincode.startsWith('560');
    if (isBangalore && isDarkStoreProduct) {
      return {
        is18Min: true,
        badge: '18-MIN DOORSTEP DROP',
        etaText: 'Concierge arrives in 18 minutes',
        hub: selectedDarkStore?.name || product?.darkStoreHub?.name || 'Indiranagar Express Hub',
      };
    }
    return {
      is18Min: false,
      badge: 'BOUTIQUE ARTISAN SHIPPING',
      etaText: 'Delivered in 2-3 business days',
      hub: product?.vendor?.storeName || 'Artisan Workshop',
    };
  }, [pincode, isDarkStoreProduct, selectedDarkStore, product]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAnim] = useState(() => new Animated.Value(100));

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 100, duration: 250, useNativeDriver: true }),
    ]).start(() => setToastMessage(null));
  }, [toastAnim]);

  // Smart Bottom Bar Threshold
  const catalogYThreshold = useRef(0);
  const buyBarTranslateY = useRef(new Animated.Value(0)).current;
  const isInCatalogZone = useRef(false);

  const allRelatedProducts = useMemo<ProductItem[]>(() => {
    return DEFAULT_PRODUCTS.filter((p) => String(p.id) !== String(id));
  }, [id]);

  const handleCatalogLayout = useCallback((event: LayoutChangeEvent) => {
    catalogYThreshold.current = event.nativeEvent.layout.y;
  }, []);

  const isNative = Platform.OS !== 'web';

  const handleProductScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const threshold = catalogYThreshold.current;
    if (threshold <= 0) return;

    const triggerPoint = threshold - 200;
    if (currentY >= triggerPoint && !isInCatalogZone.current) {
      isInCatalogZone.current = true;
      Animated.spring(buyBarTranslateY, {
        toValue: 120,
        useNativeDriver: isNative,
        tension: 80,
        friction: 12,
      }).start();
    } else if (currentY < triggerPoint && isInCatalogZone.current) {
      isInCatalogZone.current = false;
      Animated.spring(buyBarTranslateY, {
        toValue: 0,
        useNativeDriver: isNative,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [buyBarTranslateY, isNative]);

  const handleApplyPincode = (codeToApply?: string) => {
    const code = (codeToApply || pincodeInput).trim();
    if (code.length === 6 && /^\d+$/.test(code)) {
      setPincode(code);
      setPincodeInput(code);
      setIsEditingPincode(false);
      showToast(`Delivery updated for PIN ${code}`);
    } else {
      showToast('Please enter a valid 6-digit Indian PIN code');
    }
  };

  const handleCopyCoupon = (code: string) => {
    setCopiedCoupon(code);
    showToast(`Coupon ${code} copied! Apply at checkout`);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  // Adjacent Size for Dual-Size Trial
  const adjacentSize = useMemo(() => {
    if (!selectedSize) return availableProductSizes[1] || 'L';
    const idx = availableProductSizes.indexOf(selectedSize);
    if (idx === -1 || idx === availableProductSizes.length - 1) {
      return availableProductSizes[0] || 'M';
    }
    return availableProductSizes[idx + 1];
  }, [selectedSize, availableProductSizes]);

  // High-Fidelity Skeleton Loading Screen
  if (isLoading && !product) {
    return <ProductDetailSkeleton />;
  }

  // Clean 404 Not Found Screen
  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <AlertCircle size={48} color="#FF5A1F" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#111111', textAlign: 'center' }}>
          Style Not Found
        </Text>
        <Text style={{ fontSize: 13, color: '#6B6667', textAlign: 'center', marginTop: 8, maxWidth: 280 }}>
          This garment is no longer available in our collection or has been archived.
        </Text>
        <Pressable
          onPress={() => safeBack(router)}
          style={{
            marginTop: 24,
            backgroundColor: '#FF5A1F',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
            Back to Catalog
          </Text>
        </Pressable>
      </View>
    );
  }

  // Pricing calculations
  const productMrp = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : Math.round(product.price * 1.6);
  const savingsAmount = productMrp - product.price;
  const discountPct = Math.round((savingsAmount / productMrp) * 100);
  const isWished = wishlist.includes(String(product.id));
  const productTitle = product.title || (product as any).name || 'Artisan Couture';

  const handleToggleWishlist = () => {
    toggleWishlist(String(product.id));
    showToast(isWished ? 'Removed from saved pieces' : 'Saved to personal wishlist');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Look at this handcrafted ${productTitle} on Affordz: affordz://product/${product.id}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.stockQuantity <= 0) {
      showToast('This item is currently out of stock');
      return;
    }

    const effectiveSize = selectedSize || availableProductSizes[0] || 'M';
    const trialSizeParam = dualSizeTrial && isDarkStoreProduct ? adjacentSize : undefined;

    await addItem(
      {
        id: String(product.id),
        brand: product.brand,
        title: productTitle,
        description: product.description || '',
        price: product.price,
        originalPrice: productMrp,
        discount: `${discountPct}% OFF`,
        rating: Number(product.rating) || 4.9,
        reviewsCount: product.reviewsCount || 148,
        stockQuantity: product.stockQuantity,
        readyToShip: true,
        sizes: availableProductSizes,
        image: product.image,
        altText: productTitle,
        galleryImages: galleryImages,
        category: product.category || 'Apparel',
        fulfillmentType: product.fulfillmentType,
        tryAndBuyEligible: product.tryAndBuyEligible,
      },
      effectiveSize,
      selectedColor,
      1,
      trialSizeParam,
    );

    showToast(
      trialSizeParam
        ? `Added Size ${effectiveSize} to Bag (Free Fit-Check ${trialSizeParam})`
        : `Added Size ${effectiveSize} to Bag`,
    );
  };

  const executeBuyNow = async () => {
    if (!product) return;
    const effectiveSize = selectedSize || availableProductSizes[0] || 'M';
    const trialSizeParam = dualSizeTrial && isDarkStoreProduct ? adjacentSize : undefined;

    // Check if this item + size is already in cart
    const existing = cartItems.find(
      (item) => item.productId === String(product.id) && item.size === effectiveSize,
    );

    if (!existing) {
      await addItem(
        {
          id: String(product.id),
          brand: product.brand,
          title: productTitle,
          description: product.description || '',
          price: product.price,
          originalPrice: productMrp,
          discount: `${discountPct}% OFF`,
          rating: Number(product.rating) || 4.9,
          reviewsCount: product.reviewsCount || 148,
          stockQuantity: product.stockQuantity,
          readyToShip: true,
          sizes: availableProductSizes,
          image: product.image,
          altText: productTitle,
          galleryImages: galleryImages,
          category: product.category || 'Apparel',
          fulfillmentType: product.fulfillmentType,
          tryAndBuyEligible: product.tryAndBuyEligible,
        },
        effectiveSize,
        selectedColor,
        1,
        trialSizeParam,
      );
    }

    // Direct, guaranteed progression to checkout
    router.push('/cart');
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (product.stockQuantity <= 0) {
      showToast('This item is currently out of stock');
      return;
    }

    if (!selectedSize) {
      showToast('Please select a size first');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in to proceed with Buy Now');
      setIsAuthModalOpen(true);
      return;
    }

    await executeBuyNow();
  };

  const handleIncrementQuantity = () => {
    if (currentCartItem) {
      updateQuantity(currentCartItem.id, 1);
      showToast(`Quantity updated to ${currentQuantity + 1}`);
    }
  };

  const handleDecrementQuantity = () => {
    if (currentCartItem) {
      if (currentQuantity <= 1) {
        removeItem(currentCartItem.id);
        showToast('Removed from Bag');
      } else {
        updateQuantity(currentCartItem.id, -1);
        showToast(`Quantity updated to ${currentQuantity - 1}`);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* 1. Glass Top Header with Bag icon (replacing likes) */}
      <ProductHeader
        topInset={insets.top}
        cartCount={totalCartCount}
        onBack={() => safeBack(router)}
        onOpenSearchOverlay={() => setIsSearchOverlayVisible(true)}
        onShare={handleShare}
        onOpenBag={() => router.push('/cart')}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      {/* 2. Scrollable Body Content */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 10) + 54,
          paddingBottom: 120,
        }}
        onScroll={handleProductScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS !== 'web'}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        decelerationRate="normal"
        directionalLockEnabled={true}
      >
        {/* Floating Status Badge */}
        <ProductStatusBadge
          isDarkStoreProduct={isDarkStoreProduct}
          brand={product.brand}
          darkStoreName={selectedDarkStore?.name || product.darkStoreHub?.name}
          distanceKm={selectedDarkStore?.distanceKm}
        />

        {/* 3. Lookbook Carousel Stage */}
        <ProductGallery
          galleryImages={galleryImages}
          shotLabels={shotLabels}
          productTitle={productTitle}
          brand={product.brand}
          activeImageIndex={activeImageIndex}
          onSelectImage={setActiveImageIndex}
          isDarkStoreProduct={isDarkStoreProduct}
          deliveryMinutes={selectedDarkStore?.deliveryMinutes || product.darkStoreHub?.deliveryMinutes}
          discountPct={discountPct}
          isWished={isWished}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 4. Product Identity & Pricing Block */}
        <ProductDetailsSection
          brand={product.brand}
          title={productTitle}
          rating={Number(product.rating) || 4.9}
          reviewsCount={product.reviewsCount || 148}
          price={product.price}
          originalPrice={productMrp}
          savingsAmount={savingsAmount}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />

        {/* 5. Hyper-Local 18-Minute Try & Buy Card & Delivery Checker */}
        <ProductDeliverySection
          isDarkStoreProduct={isDarkStoreProduct}
          selectedDarkStoreDeliveryMinutes={selectedDarkStore?.deliveryMinutes || product.darkStoreHub?.deliveryMinutes}
          pincode={pincode}
          pincodeInput={pincodeInput}
          isEditingPincode={isEditingPincode}
          deliveryEstimate={deliveryEstimate}
          setPincodeInput={setPincodeInput}
          setIsEditingPincode={setIsEditingPincode}
          onApplyPincode={handleApplyPincode}
        />

        {/* Best Offers & Coupons */}
        <ProductOffersSection
          copiedCoupon={copiedCoupon}
          onCopyCoupon={handleCopyCoupon}
        />

        {/* 6. Size & Fit Selector with Secondary Fit-Check Trial Size */}
        <View
          onLayout={(e) => {
            sizeSectionLayoutY.current = e.nativeEvent.layout.y;
          }}
        >
          <ProductSizeSection
            selectedSize={selectedSize}
            onSelectSize={(sz) => {
              setSelectedSize(sz);
              setSizeError(false);
            }}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            isDarkStoreProduct={isDarkStoreProduct}
            dualSizeTrial={dualSizeTrial}
            onToggleDualSizeTrial={() => setDualSizeTrial(!dualSizeTrial)}
            adjacentSize={adjacentSize}
            hasError={sizeError}
          />
        </View>

        {/* Specs, Materials & Craftsmanship */}
        <ProductSpecsSection isDarkStoreProduct={isDarkStoreProduct} />

        {/* Customer Looks & Styling */}
        <ProductCustomerLooks />

        {/* Ensemble Recommendations */}
        <ProductEnsembleSection
          ensembleProducts={allRelatedProducts.slice(0, 4)}
          wishlist={wishlist}
          onToggleWishlist={(epId) => toggleWishlist(epId)}
          onAddToCart={(ep: any) => {
            addItem(
              {
                id: String(ep.id),
                brand: ep.brand,
                title: ep.name,
                description: '',
                price: ep.price,
                originalPrice: ep.old || ep.price * 1.4,
                discount: '30% OFF',
                rating: 4.8,
                reviewsCount: 110,
                stockQuantity: 8,
                readyToShip: true,
                sizes: ['S', 'M', 'L'],
                image: ep.image,
                altText: ep.name,
                galleryImages: [ep.image],
                category: ep.category,
              },
              'M',
              'Default',
              1,
            );
            showToast(`Added ${ep.name} to bag`);
          }}
          onOpenProduct={(epId) => router.push({ pathname: '/product/[id]', params: { id: epId } })}
        />

        {/* Verified Reviews Section with Write Review Modal */}
        <ProductReviewsSection
          productId={String(product.id)}
          productTitle={productTitle}
          productImage={product.image}
          brand={product.brand}
          rating={Number(product.rating) || 4.9}
          reviewsCount={product.reviewsCount || 148}
        />

        {/* Related Products Catalog */}
        <View onLayout={handleCatalogLayout}>
          <ProductRelatedCatalog
            products={allRelatedProducts}
            currentProductId={String(product.id)}
            wishlist={wishlist}
            onWishlist={(epId) => toggleWishlist(String(epId))}
            onBag={(epId) => {
              const p = allRelatedProducts.find((pr) => String(pr.id) === String(epId));
              if (p) {
                addItem(
                  {
                    id: String(p.id),
                    brand: p.brand,
                    title: p.name,
                    description: '',
                    price: p.price,
                    originalPrice: p.old || Math.round(p.price * 1.3),
                    discount: '30% OFF',
                    rating: Number(p.rating) || 4.8,
                    reviewsCount: 120,
                    stockQuantity: 10,
                    readyToShip: true,
                    sizes: ['S', 'M', 'L'],
                    image: p.image,
                    altText: p.name,
                    galleryImages: [p.image],
                    category: p.category,
                  },
                  'M',
                  'Default',
                  1,
                );
                showToast(`Added ${p.brand} to Bag`);
              }
            }}
            onOpenProduct={(ep) =>
              router.push({ pathname: '/product/[id]', params: { id: String(ep.id) } })
            }
          />
        </View>
      </ScrollView>

      {/* Docked Bottom Bar */}
      <Animated.View style={{ transform: [{ translateY: buyBarTranslateY }] }}>
        <ProductBottomBar
          price={product.price}
          originalPrice={productMrp}
          isDarkStoreProduct={isDarkStoreProduct}
          deliveryMinutes={selectedDarkStore?.deliveryMinutes || product.darkStoreHub?.deliveryMinutes}
          bottomInset={insets.bottom}
          stockQuantity={product.stockQuantity}
          currentQuantity={currentQuantity}
          selectedSize={selectedSize}
          onAddToCart={handleAddToCart}
          onIncrementQuantity={handleIncrementQuantity}
          onDecrementQuantity={handleDecrementQuantity}
          onBuyNow={handleBuyNow}
        />
      </Animated.View>

      {/* Size Guide Modal */}
      <ProductSizeModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 90,
            alignSelf: 'center',
            backgroundColor: 'rgba(17, 17, 17, 0.95)',
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            zIndex: 99,
            transform: [{ translateY: toastAnim }],
          }}
        >
          <ShoppingBag size={14} color="#FF5A1F" />
          <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Live Search Suggestions Autocomplete Overlay */}
      <SearchSuggestionsOverlay
        visible={isSearchOverlayVisible}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSelectQuery={(term) => {
          setIsSearchOverlayVisible(false);
          router.push({
            pathname: '/explore',
            params: { q: term },
          });
        }}
        onOpenProduct={(selected) => {
          setIsSearchOverlayVisible(false);
          if (String(selected.id) !== String(id)) {
            router.push({
              pathname: '/product/[id]',
              params: { id: String(selected.id) },
            });
          }
        }}
        onClose={() => setIsSearchOverlayVisible(false)}
      />

      {/* Authentication Modal for Buy Now */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          showToast('Signed in successfully! Progressing to checkout...');
          executeBuyNow();
        }}
      />
    </View>
  );
}
