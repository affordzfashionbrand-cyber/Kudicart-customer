import React, { useEffect, useMemo } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ExploreCatalogView } from '@/components/explore/explore-catalog-view';
import { ShopByCategoryView } from '@/components/categories/shop-by-category-view';
import { BottomNavBar } from '@/components/home/bottom-nav-bar';
import { EditorialText } from '@/components/common/section-title';
import { useCatalogStore } from '@/store/useCatalogStore';
import { ProductItem } from '@/data/homeData';
import { safeBack } from '@/utils/navigation';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { q, category, gender } = useLocalSearchParams<{
    q?: string;
    category?: string;
    gender?: string;
  }>();

  const { products: storeProducts, isLoading, fetchProducts } = useCatalogStore();

  useEffect(() => {
    if (storeProducts.length === 0 && !isLoading) {
      fetchProducts().catch(() => {});
    }
  }, [storeProducts.length, isLoading, fetchProducts]);

  const catalogProducts = useMemo<ProductItem[]>(() => {
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
      fulfillmentType: (p as any).fulfillmentType,
      tryAndBuyEligible: (p as any).tryAndBuyEligible,
    }));
  }, [storeProducts]);

  const hasSearchOrFilter = Boolean((q && q.trim().length > 0) || category || gender);

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7', paddingTop: Math.max(insets.top, 8) }}>
      {hasSearchOrFilter ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'android' ? 8 : 4,
              paddingBottom: 10,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#E8E5DF',
            }}
          >
            <Pressable
              onPress={() => safeBack(router, '/')}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#FAF8F5',
                borderWidth: 1,
                borderColor: '#D9D9D5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={18} color="#111111" />
            </Pressable>
            <EditorialText first="Explore" second="Catalog" fontSize={18} color="#111111" withDot />
            <View style={{ width: 36 }} />
          </View>
          <ExploreCatalogView
            initialQuery={q || ''}
            initialCategory={category || 'All'}
            initialGender={(gender as 'All' | 'Men' | 'Women' | 'Kids') || 'All'}
            products={catalogProducts}
          />
        </>
      ) : (
        <ShopByCategoryView
          isStandaloneScreen={true}
          products={catalogProducts}
          isLoading={isLoading}
        />
      )}
      <BottomNavBar
        activeTab={hasSearchOrFilter ? 'explore' : 'categories'}
        onOpenAccount={() => router.push('/?tab=ACCOUNT')}
      />
    </View>
  );
}
