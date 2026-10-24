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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react-native';

import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useDarkStore } from '@/store/useDarkStore';
import { catalogApi, ApiProduct } from '@/services/api';
import { safeBack } from '@/utils/navigation';

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

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { products: storeProducts } = useCatalogStore();
  const { addItem, toggleWishlist, wishlist } = useCartStore();
  const { selectedDarkStore } = useDarkStore();

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
        fulfillmentType: 'DARK_STORE',
        tryAndBuyEligible: true,
      };
    }
    return null;
  }, [liveProduct, storeProducts, id]);

  // Determine Dark Store / Try & Buy Status
  const isDarkStoreProduct = useMemo(() => {
    return product?.fulfillmentType === 'DARK_STORE' || Boolean(product?.tryAndBuyEligible);
  }, [product]);

  // Lookbook Gallery Images
  const galleryImages = useMemo(() => {
    if (product?.galleryImages && product.galleryImages.length > 0) {
      return product.galleryImages;
    }
    if (product?.image) {
      return [product.image];
    }
    return [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85',
    ];
  }, [product]);

  // Available Sizes for this Product
  const availableProductSizes = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) {
      return product.sizes;
    }
    return AVAILABLE_SIZES;
  }, [product]);

  // Interaction State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Classic Fabric');
  const [dualSizeTrial, setDualSizeTrial] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Set default selected size when available
  useEffect(() => {
    if (availableProductSizes.length > 0 && !availableProductSizes.includes(selectedSize)) {
      setSelectedSize(availableProductSizes[0]);
    }
  }, [availableProductSizes, selectedSize]);

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

  const handleProductScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const threshold = catalogYThreshold.current;
    if (threshold <= 0) return;

    const triggerPoint = threshold - 200;
    if (currentY >= triggerPoint && !isInCatalogZone.current) {
      isInCatalogZone.current = true;
      Animated.spring(buyBarTranslateY, {
        toValue: 120,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (currentY < triggerPoint && isInCatalogZone.current) {
      isInCatalogZone.current = false;
      Animated.spring(buyBarTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [buyBarTranslateY]);

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
    const idx = availableProductSizes.indexOf(selectedSize);
    if (idx === -1 || idx === availableProductSizes.length - 1) {
      return availableProductSizes[0] || 'M';
    }
    return availableProductSizes[idx + 1];
  }, [selectedSize, availableProductSizes]);

  // Loading Screen
  if (isLoading && !product) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF5A1F" />
        <Text style={{ marginTop: 12, fontSize: 13, color: '#6B6667', fontWeight: '700' }}>
          Loading Runway Piece...
        </Text>
      </View>
    );
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

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0) {
      showToast('This item is currently out of stock');
      return;
    }

    const trialSizeParam = dualSizeTrial && isDarkStoreProduct ? adjacentSize : undefined;

    addItem(
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
      selectedSize,
      selectedColor,
      1,
      trialSizeParam,
    );

    showToast(
      trialSizeParam
        ? `Added to Bag with Free Fit-Check Size ${trialSizeParam}`
        : 'Added to Bag',
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* 1. Glass Top Header */}
      <ProductHeader
        topInset={insets.top}
        isWished={isWished}
        onBack={() => safeBack(router)}
        onSearchPress={() => router.push('/explore')}
        onShare={handleShare}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 2. Scrollable Body Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 10) + 54,
          paddingBottom: 120,
        }}
        onScroll={handleProductScroll}
        scrollEventThrottle={16}
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
          activeImageIndex={activeImageIndex}
          onSelectImage={setActiveImageIndex}
          isDarkStoreProduct={isDarkStoreProduct}
          deliveryMinutes={selectedDarkStore?.deliveryMinutes || product.darkStoreHub?.deliveryMinutes}
          discountPct={discountPct}
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
        <ProductSizeSection
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          isDarkStoreProduct={isDarkStoreProduct}
          dualSizeTrial={dualSizeTrial}
          onToggleDualSizeTrial={() => setDualSizeTrial(!dualSizeTrial)}
          adjacentSize={adjacentSize}
        />

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

        {/* Verified Reviews Section */}
        <ProductReviewsSection />

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
          onAddToCart={handleAddToCart}
          onBuyNow={() => {
            handleAddToCart();
            router.push('/cart');
          }}
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
    </View>
  );
}
