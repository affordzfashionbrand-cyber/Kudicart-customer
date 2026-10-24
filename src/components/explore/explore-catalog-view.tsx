import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  StretchHorizontal,
} from 'lucide-react-native';

import { AnimatedPressable } from '@/components/common/animated-pressable';
import { ProductCard } from '@/components/common/product-card';
import { EmptyState } from '@/components/common/empty-state';
import { SectionTitle } from '@/components/common/section-title';
import { ProductItem } from '@/data/homeData';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { getEnrichedProductCatalog, sortProductList } from '@/utils/product-catalog';

import {
  EXPLORE_CATEGORIES,
  ExploreCategoryDef,
  GENDER_TABS,
} from './explore-data';

export { EXPLORE_CATEGORIES, ExploreCategoryDef };

type PriceFilterType = 'ALL' | 'UNDER_2500' | '2500_5000' | 'ABOVE_5000';
type SortType = 'FEATURED' | 'PRICE_LOW_HIGH' | 'PRICE_HIGH_LOW' | 'RATING' | 'DISCOUNT';
type ViewMode = 'GRID' | 'COMPACT';

export interface ExploreCatalogViewProps {
  initialCategory?: string;
  initialGender?: 'All' | 'Men' | 'Women' | 'Kids';
  initialQuery?: string;
  maxPriceFilter?: number;
  products?: ProductItem[];
  onOpenProduct?: (product: any) => void;
  onWishlist?: (id: string | number) => void;
  onBag?: (id: string | number) => void;
}

export const ExploreCatalogView = React.memo(function ExploreCatalogView({
  initialCategory = 'All',
  initialGender = 'All',
  initialQuery = '',
  maxPriceFilter,
  products: propProducts,
  onOpenProduct: propOnOpenProduct,
  onWishlist: propOnWishlist,
  onBag: propOnBag,
}: ExploreCatalogViewProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addItem } = useCartStore();
  const storeProducts = useCatalogStore((s) => s.products);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women' | 'Kids'>(initialGender);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<PriceFilterType>(
    maxPriceFilter ? (maxPriceFilter <= 2500 ? 'UNDER_2500' : '2500_5000') : 'ALL'
  );
  const [sortOption, setSortOption] = useState<SortType>('FEATURED');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');

  // Master product catalog combining all datasets
  const masterProducts = useMemo<ProductItem[]>(() => {
    if (propProducts && propProducts.length > 0) return propProducts;
    return getEnrichedProductCatalog(storeProducts);
  }, [propProducts, storeProducts]);

  // Active Category Definition
  const activeCategoryDef = useMemo(() => {
    return EXPLORE_CATEGORIES.find((c) => c.id === selectedCategory) || EXPLORE_CATEGORIES[0];
  }, [selectedCategory]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let result = [...masterProducts];

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.wear || '').toLowerCase().includes(q)
      );
    }

    // Gender
    if (selectedGender !== 'All') {
      result = result.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat === selectedGender.toLowerCase() || cat === 'all';
      });
    }

    // Category / Wear
    if (selectedCategory !== 'All') {
      result = result.filter((p) => {
        const wear = (p.wear || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return wear === selectedCategory.toLowerCase() || cat === selectedCategory.toLowerCase();
      });
    }

    // Subcategory
    if (selectedSubcategory !== 'All') {
      const sub = selectedSubcategory.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(sub) ||
          (p.brand || '').toLowerCase().includes(sub)
      );
    }

    // Price
    if (priceFilter === 'UNDER_2500') result = result.filter((p) => p.price <= 2500);
    else if (priceFilter === '2500_5000') result = result.filter((p) => p.price > 2500 && p.price <= 5000);
    else if (priceFilter === 'ABOVE_5000') result = result.filter((p) => p.price > 5000);

    // Sort
    return sortProductList(result, sortOption);
  }, [masterProducts, searchQuery, selectedGender, selectedCategory, selectedSubcategory, priceFilter, sortOption]);

  const handleOpenProduct = useCallback(
    (product: any) => {
      if (propOnOpenProduct) propOnOpenProduct(product);
      else router.push({ pathname: '/product/[id]', params: { id: String(product.id) } });
    },
    [propOnOpenProduct, router]
  );

  const handleWishlist = useCallback(
    (id: string | number) => {
      if (propOnWishlist) propOnWishlist(id);
      else toggleWishlist(String(id));
    },
    [propOnWishlist, toggleWishlist]
  );

  const handleBag = useCallback(
    (id: string | number) => {
      if (propOnBag) {
        propOnBag(id);
      } else {
        const item = masterProducts.find((p) => String(p.id) === String(id));
        if (item) {
          addItem(
            {
              id: String(item.id),
              brand: item.brand,
              title: item.name,
              description: '',
              price: item.price,
              originalPrice: item.old || item.price,
              discount: '',
              rating: Number(item.rating) || 4.8,
              reviewsCount: 120,
              stockQuantity: 10,
              readyToShip: true,
              sizes: ['S', 'M', 'L'],
              image: item.image,
              altText: item.name,
              galleryImages: [item.image],
              category: item.category,
            },
            'M',
            'Default',
            1
          );
        }
      }
    },
    [propOnBag, masterProducts, addItem]
  );

  const resetAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGender('All');
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setPriceFilter('ALL');
    setSortOption('FEATURED');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* 1. Search Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F7F5F0',
            borderRadius: 14,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#E2DFD8',
          }}
        >
          <Search size={16} color="#8A8580" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by label, weave, silhouette..."
            placeholderTextColor="#A0A0A0"
            style={{ flex: 1, paddingVertical: 9, paddingHorizontal: 8, fontSize: 13, color: '#111111' }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={15} color="#8A8580" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* 2. Gender Department Strip */}
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#F0ECE4',
              borderRadius: 12,
              padding: 3,
            }}
          >
            {GENDER_TABS.map((tab) => {
              const active = selectedGender === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setSelectedGender(tab.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 7,
                    borderRadius: 9,
                    backgroundColor: active ? '#111111' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: active ? '800' : '600', color: active ? '#FFFFFF' : '#666666' }}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3. Category Carousel */}
        <View style={{ paddingVertical: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {EXPLORE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory('All');
                  }}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: active ? '#111111' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: active ? '#111111' : '#E8E5DF',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: active ? '800' : '600', color: active ? '#FFFFFF' : '#4A4A4A' }}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Subcategory Pills */}
        {activeCategoryDef.subcategories && (
          <View style={{ paddingBottom: 8 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
              {activeCategoryDef.subcategories.map((sub) => {
                const active = selectedSubcategory === sub;
                return (
                  <Pressable
                    key={sub}
                    onPress={() => setSelectedSubcategory(sub)}
                    style={{
                      paddingHorizontal: 11,
                      paddingVertical: 5,
                      borderRadius: 12,
                      backgroundColor: active ? '#FF5A1F' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: active ? '#FF5A1F' : '#E8E5DF',
                    }}
                  >
                    <Text style={{ fontSize: 10.5, fontWeight: active ? '900' : '600', color: active ? '#FFFFFF' : '#55524E' }}>
                      {sub}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 5. Sort & Filter Bar */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 11.5, color: '#71717A', fontWeight: '500' }}>
            Showing <Text style={{ fontWeight: '800', color: '#111111' }}>{filteredProducts.length}</Text> pieces
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* View Mode Toggle */}
            <Pressable
              onPress={() => setViewMode(viewMode === 'GRID' ? 'COMPACT' : 'GRID')}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {viewMode === 'GRID' ? <StretchHorizontal size={13} color="#111111" /> : <LayoutGrid size={13} color="#111111" />}
            </Pressable>
          </View>
        </View>

        {/* 6. Product Grid */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          {filteredProducts.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredProducts.map((p) => (
                <View key={p.id} style={{ width: viewMode === 'GRID' ? '48.5%' : '100%', marginBottom: 14 }}>
                  <ProductCard
                    product={p}
                    badge="18M DROP"
                    wished={wishlist.includes(String(p.id))}
                    onWishlist={() => handleWishlist(p.id)}
                    onBag={() => handleBag(p.id)}
                    onOpen={() => handleOpenProduct(p)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="NO PIECES FOUND"
              body="No atelier pieces match your active search filters."
              action="RESET FILTERS"
              onClick={resetAllFilters}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
});
