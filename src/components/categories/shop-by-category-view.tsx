import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Store, Layers } from 'lucide-react-native';

import { EditorialText } from '@/components/common/section-title';
import { ProductItem, DEFAULT_PRODUCTS } from '@/data/homeData';
import { useCartStore } from '@/store/useCartStore';
import { useDarkStore } from '@/store/useDarkStore';

import {
  CATEGORY_COLLECTIONS,
  CategoryItemDef,
  ATELIER_STORES,
  AtelierStoreDef,
} from './category-data';
import { StoreDirectorySection } from './store-directory-section';
import { CategoryGridSection } from './category-grid-section';

// Re-export data and types for 100% backward compatibility
export { CATEGORY_COLLECTIONS, CategoryItemDef, ATELIER_STORES, AtelierStoreDef };

export interface ShopByCategoryViewProps {
  isStandaloneScreen?: boolean;
  products?: ProductItem[];
  wishlist?: string[];
  onWishlist?: (id: string | number) => void;
  onBag?: (id: string | number) => void;
  onOpen?: (product: any) => void;
  initialMode?: 'CATEGORY' | 'STORE';
  initialStoreId?: string | null;
}

export const ShopByCategoryView = React.memo(function ShopByCategoryView({
  isStandaloneScreen = false,
  products = [],
  wishlist: propWishlist,
  onWishlist: propOnWishlist,
  onBag: propOnBag,
  onOpen: propOnOpen,
  initialMode = 'CATEGORY',
  initialStoreId = null,
}: ShopByCategoryViewProps) {
  const router = useRouter();
  const { wishlist: storeWishlist, toggleWishlist: storeToggleWishlist, addItem } = useCartStore();
  const { setSelectedDarkStore, darkStores } = useDarkStore();

  const activeWishlist = propWishlist || storeWishlist;

  // View state: 'CATEGORY' vs 'STORE'
  const [viewMode, setViewMode] = useState<'CATEGORY' | 'STORE'>(initialMode);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(initialStoreId);
  const [storeTypeFilter, setStoreTypeFilter] = useState<'ALL' | 'DARK_STORE' | 'BRAND_BOUTIQUE'>('ALL');
  const [storeSubFilter, setStoreSubFilter] = useState<string>('ALL');

  // Category view filter state
  const [selectedGender, setSelectedGender] = useState<'All' | 'Women' | 'Men' | 'Kids'>('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');

  // Active Category & Store Objects
  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return CATEGORY_COLLECTIONS.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId]);

  const activeStore = useMemo(() => {
    if (!selectedStoreId) return null;
    return ATELIER_STORES.find((s) => s.id === selectedStoreId) || null;
  }, [selectedStoreId]);

  const visibleStores = useMemo(() => {
    if (storeTypeFilter === 'ALL') return ATELIER_STORES;
    return ATELIER_STORES.filter((s) => s.type === storeTypeFilter);
  }, [storeTypeFilter]);

  const visibleCategories = useMemo(() => {
    if (selectedGender === 'All') return CATEGORY_COLLECTIONS;
    return CATEGORY_COLLECTIONS.filter((c) => c.gender === selectedGender || c.gender === 'All');
  }, [selectedGender]);

  const masterProducts = useMemo(() => {
    return products && products.length > 0 ? products : DEFAULT_PRODUCTS;
  }, [products]);

  // Filtered Products for category view
  const filteredCategoryProducts = useMemo(() => {
    let list = [...masterProducts];

    if (selectedGender !== 'All') {
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat === selectedGender.toLowerCase() || cat === 'all';
      });
    }

    if (activeCategory) {
      if (activeCategory.wear !== 'All') {
        const wearTarget = activeCategory.wear.toLowerCase();
        list = list.filter((p) => {
          const pWear = (p.wear || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();
          return pWear === wearTarget || pCat === wearTarget;
        });
      } else if (activeCategory.gender !== 'All') {
        const genderTarget = activeCategory.gender.toLowerCase();
        list = list.filter((p) => (p.category || '').toLowerCase() === genderTarget);
      }
    }

    if (selectedSubcategory !== 'All' && !selectedSubcategory.startsWith('All ')) {
      const q = selectedSubcategory.toLowerCase();
      list = list.filter((p) => {
        const pName = (p.name || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        const pWear = (p.wear || '').toLowerCase();
        return pName.includes(q) || pBrand.includes(q) || pWear.includes(q);
      });
    }

    return list;
  }, [masterProducts, selectedGender, activeCategory, selectedSubcategory]);

  // Products belonging to the selected Store
  const storeProducts = useMemo(() => {
    if (!activeStore) return [];

    let list = masterProducts.filter((p) => activeStore.filterFn(p));
    if (list.length < 3) list = masterProducts.slice(0, 8);

    if (storeSubFilter === 'WOMEN') {
      list = list.filter((p) => (p.category || '').toLowerCase() === 'women');
    } else if (storeSubFilter === 'MEN') {
      list = list.filter((p) => (p.category || '').toLowerCase() === 'men');
    } else if (storeSubFilter === 'ETHNIC') {
      list = list.filter((p) => (p.wear || '').toLowerCase() === 'ethnic');
    } else if (storeSubFilter === 'WESTERN') {
      list = list.filter((p) => (p.wear || '').toLowerCase() === 'western');
    } else if (storeSubFilter === 'BUDGET') {
      list = list.filter((p) => p.price < 3500);
    } else if (storeSubFilter === 'EXPRESS') {
      list = list.filter((p) => p.price < 7000);
    }

    return list;
  }, [activeStore, masterProducts, storeSubFilter]);

  // Actions
  const handleToggleWishlist = useCallback(
    (id: string | number) => {
      if (propOnWishlist) propOnWishlist(id);
      else storeToggleWishlist(String(id));
    },
    [propOnWishlist, storeToggleWishlist]
  );

  const handleAddToBag = useCallback(
    (product: ProductItem) => {
      if (propOnBag) {
        propOnBag(product.id);
      } else {
        addItem(
          {
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
          },
          'M',
          'Default',
          1
        );
      }
    },
    [propOnBag, addItem]
  );

  const handleOpenProduct = useCallback(
    (product: any) => {
      if (propOnOpen) {
        propOnOpen(product);
      } else {
        router.push({
          pathname: '/product/[id]',
          params: { id: String(product.id) },
        });
      }
    },
    [propOnOpen, router]
  );

  const handleSelectCategory = useCallback(
    (catId: string) => {
      router.push({
        pathname: '/category/[id]',
        params: { id: catId },
      });
    },
    [router]
  );

  const handleSelectStore = useCallback(
    (store: AtelierStoreDef) => {
      setSelectedStoreId(store.id);
      setViewMode('STORE');
      setStoreSubFilter('ALL');

      if (store.type === 'DARK_STORE') {
        const matchingDs = darkStores.find((ds) => ds.id === store.id);
        if (matchingDs) setSelectedDarkStore(matchingDs);
      }
    },
    [darkStores, setSelectedDarkStore]
  );

  const content = (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* 1. Top Header & Mode Toggle */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: isStandaloneScreen ? (Platform.OS === 'android' ? 16 : 10) : 12,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: '#ECE8DF',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {isStandaloneScreen && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#D9D9D5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={18} color="#111111" />
            </Pressable>
          )}

          <View>
            <EditorialText
              first="Shop by"
              second={viewMode === 'STORE' ? 'store' : 'category'}
              fontSize={24}
              lineHeight={27}
              singleLine={true}
              withDot={true}
            />
            <Text style={{ fontSize: 11, color: '#71717A', fontWeight: '500', marginTop: 1 }}>
              {viewMode === 'STORE'
                ? activeStore
                  ? `${activeStore.name} • 18-min drop`
                  : 'Hyper-local ateliers & dark stores'
                : 'Curated editorial departments'}
            </Text>
          </View>
        </View>

        {/* Mode Switcher Pill */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F3EFEA',
            padding: 3,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: '#E2DDD3',
          }}
        >
          <Pressable
            onPress={() => setViewMode('CATEGORY')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5.5,
              borderRadius: 14,
              backgroundColor: viewMode === 'CATEGORY' ? '#111111' : 'transparent',
            }}
          >
            <Layers size={11} color={viewMode === 'CATEGORY' ? '#FFFFFF' : '#71717A'} />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: viewMode === 'CATEGORY' ? '800' : '600',
                color: viewMode === 'CATEGORY' ? '#FFFFFF' : '#71717A',
              }}
            >
              Category
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('STORE')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5.5,
              borderRadius: 14,
              backgroundColor: viewMode === 'STORE' ? '#111111' : 'transparent',
            }}
          >
            <Store size={11} color={viewMode === 'STORE' ? '#FF5A1F' : '#71717A'} />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: viewMode === 'STORE' ? '800' : '600',
                color: viewMode === 'STORE' ? '#FFFFFF' : '#71717A',
              }}
            >
              Store
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Primary View Body */}
      {viewMode === 'STORE' ? (
        <StoreDirectorySection
          activeStore={activeStore}
          storeProducts={storeProducts}
          storeTypeFilter={storeTypeFilter}
          setStoreTypeFilter={setStoreTypeFilter}
          storeSubFilter={storeSubFilter}
          setStoreSubFilter={setStoreSubFilter}
          visibleStores={visibleStores}
          activeWishlist={activeWishlist}
          onSelectStore={handleSelectStore}
          onBackToAllStores={() => {
            setSelectedStoreId(null);
            setStoreSubFilter('ALL');
          }}
          onToggleWishlist={handleToggleWishlist}
          onAddToBag={handleAddToBag}
          onOpenProduct={handleOpenProduct}
        />
      ) : (
        <CategoryGridSection
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
          activeCategory={activeCategory}
          visibleCategories={visibleCategories}
          filteredCategoryProducts={filteredCategoryProducts}
          activeWishlist={activeWishlist}
          onSelectStore={handleSelectStore}
          onViewAllStores={() => setViewMode('STORE')}
          onSelectCategory={handleSelectCategory}
          onResetCategory={() => {
            setSelectedCategoryId(null);
            setSelectedSubcategory('All');
          }}
          onToggleWishlist={handleToggleWishlist}
          onAddToBag={handleAddToBag}
          onOpenProduct={handleOpenProduct}
        />
      )}
    </View>
  );

  if (isStandaloneScreen) {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {content}
      </ScrollView>
    );
  }

  return content;
});
