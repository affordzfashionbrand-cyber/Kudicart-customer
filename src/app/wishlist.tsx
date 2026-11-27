import React, { useCallback, useMemo } from 'react';
import { View, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { WishlistView } from '@/components/views/wishlist-view';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useCartStore } from '@/store/useCartStore';
import { ProductItem } from '@/data/homeData';
import { safeBack } from '@/utils/navigation';

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const { products: storeProducts, isLoading: catalogLoading } = useCatalogStore();
  const { wishlist: storeWishlist, removeFromWishlist, addItem, hydrateWishlist } = useCartStore();

  React.useEffect(() => {
    void hydrateWishlist();
  }, [hydrateWishlist]);

  // Active products catalog
  const activeProducts = useMemo<ProductItem[]>(() => {
    const list: ProductItem[] = [];
    if (storeProducts && storeProducts.length > 0) {
      storeProducts.forEach((p) => {
        if (!list.some((existing) => String(existing.id) === String(p.id))) {
          list.push({
            id: p.id,
            brand: p.brand,
            name: p.title,
            price: p.price,
            old: p.originalPrice || Math.round(p.price * 1.3),
            rating: String(p.rating || '4.8'),
            category: p.category || 'Women',
            wear: (p as any).wear || p.category || 'Tops',
            image: p.image || (p.galleryImages && p.galleryImages[0]) || '',
            fulfillmentType: (p as any).fulfillmentType,
            sizes: Array.isArray((p as any).sizes) ? (p as any).sizes : ['S', 'M', 'L'],
            stockQuantity: (p as any).stockQuantity,
          } as any);
        }
      });
    }
    return list;
  }, [storeProducts]);

  // Wishlist products
  const wishlistProducts = useMemo(() => {
    const normalizedSet = new Set(storeWishlist.map((id) => String(id)));
    return activeProducts.filter((product) => normalizedSet.has(String(product.id)));
  }, [activeProducts, storeWishlist]);

  const handleBag = useCallback(
    (productId: string | number, selectedSize?: string) => {
      const product: any = activeProducts.find((p) => String(p.id) === String(productId));
      if (!product) return;
      const productSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['M'];
      const chosenSize = selectedSize && productSizes.includes(selectedSize)
        ? selectedSize
        : (selectedSize || productSizes[0] || 'M');
      addItem(
        {
          id: String(product.id),
          brand: product.brand,
          title: product.name,
          description: product.description || '',
          price: product.price,
          originalPrice: product.old || product.price,
          discount: '',
          rating: Number(product.rating) || 4.8,
          reviewsCount: Number(product.reviewsCount) || 0,
          stockQuantity: typeof product.stockQuantity === 'number' ? product.stockQuantity : 1,
          readyToShip: product.readyToShip !== false,
          sizes: productSizes,
          image: product.image,
          altText: product.name,
          galleryImages: [product.image],
          category: product.category,
          fulfillmentType: product.fulfillmentType,
        },
        chosenSize,
        'Default',
        1
      );
    },
    [activeProducts, addItem]
  );

  const handleOpenProduct = useCallback(
    (product: any) => {
      router.push({
        pathname: '/product/[id]',
        params: { id: String(product.id) },
      });
    },
    [router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Top Header Bar */}
      <View
        style={{
          paddingTop,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: '#FDFBF7',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E0D8',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <AnimatedPressable
          onPress={() => safeBack(router)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F4F1EA',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} color="#111111" strokeWidth={2.4} />
        </AnimatedPressable>

        <EditorialText first="Atelier" second="Wishlist." fontSize={19} color="#111111" withDot />

        <View style={{ width: 40 }} />
      </View>

      {/* Wishlist View */}
      <WishlistView
        products={wishlistProducts}
        allProducts={activeProducts}
        isLoading={catalogLoading}
        onBag={handleBag}
        onWishlist={(id) => removeFromWishlist(String(id))}
        onOpen={handleOpenProduct}
        onExplore={() => router.push('/')}
        onGoToBag={() => router.push('/cart')}
      />
    </View>
  );
}
