import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ArrowUpDown } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { ProductCard } from '@/components/common/product-card';
import { ProductCardSkeleton } from '@/components/common/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ProductItem } from '@/data/homeData';
import { useCatalogStore } from '@/store/useCatalogStore';

interface HomeProductCatalogSectionProps {
  products: ProductItem[];
  wishlist: string[];
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number, size?: string) => void;
  onOpenProduct: (product: any) => void;
  isLoading?: boolean;
}

const DEFAULT_FILTER_TABS = ['All', 'Women', 'Men', 'Kids', 'Ethnic', 'Western', 'Footwear'];

type SortType = 'FEATURED' | 'LOW_TO_HIGH' | 'HIGH_TO_LOW';

export const HomeProductCatalogSection = React.memo(function HomeProductCatalogSection({
  products,
  wishlist,
  onWishlist,
  onBag,
  onOpenProduct,
  isLoading = false,
}: HomeProductCatalogSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortType>('FEATURED');
  const catalogCategories = useCatalogStore((s) => s.categories);

  const filterTabs = useMemo(() => {
    if (!catalogCategories || catalogCategories.length === 0) {
      return DEFAULT_FILTER_TABS;
    }
    const tabs: string[] = ['All'];
    const seen = new Set<string>(['all']);
    const pushUnique = (label?: string) => {
      if (!label) return;
      const trimmed = label.trim();
      const lower = trimmed.toLowerCase();
      if (!trimmed || seen.has(lower)) return;
      seen.add(lower);
      tabs.push(trimmed);
    };
    catalogCategories.filter((c) => c.level === 1 || !c.parentId).forEach((c) => pushUnique(c.name));
    catalogCategories.filter((c) => c.level === 2).slice(0, 6).forEach((c) => pushUnique(c.name));
    return tabs.length > 1 ? tabs : DEFAULT_FILTER_TABS;
  }, [catalogCategories]);

  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Filter by selected category / gender / wear / subtree
    if (selectedFilter !== 'All') {
      const target = selectedFilter.toLowerCase();
      const matchingSubtreeIds = new Set<string>();
      const matchingNames = new Set<string>([target]);
      const visitDown = (node: any) => {
        if (!node) return;
        matchingSubtreeIds.add(node.id);
        if (node.name) matchingNames.add(String(node.name).toLowerCase());
        catalogCategories
          .filter((child) => child.parentId === node.id)
          .forEach(visitDown);
      };
      catalogCategories
        .filter((c) => String(c.name || '').toLowerCase() === target)
        .forEach(visitDown);

      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const wear = (p.wear || '').toLowerCase();
        const gender = (p.gender || '').toLowerCase();
        const tags = (p.tags || []).map((t) => String(t).toLowerCase());
        return (
          (p.categoryId && matchingSubtreeIds.has(p.categoryId)) ||
          matchingNames.has(cat) ||
          matchingNames.has(wear) ||
          matchingNames.has(gender) ||
          tags.some((t) => matchingNames.has(t))
        );
      });
    }

    // Sort
    if (sortOption === 'LOW_TO_HIGH') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'HIGH_TO_LOW') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, selectedFilter, sortOption, catalogCategories]);

  const toggleSort = () => {
    setSortOption((prev) => {
      if (prev === 'FEATURED') return 'LOW_TO_HIGH';
      if (prev === 'LOW_TO_HIGH') return 'HIGH_TO_LOW';
      return 'FEATURED';
    });
  };

  const sortLabel = sortOption === 'FEATURED'
    ? 'Featured'
    : sortOption === 'LOW_TO_HIGH'
      ? 'Price: Low'
      : 'Price: High';

  return (
    <View style={{ marginTop: 8, marginBottom: 40, paddingHorizontal: 16 }}>
      {/* Section Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <SectionTitle
          label="ALL PRODUCTS"
          firstLine="Explore all"
          secondLine="designs."
          marginBottom={0}
        />

        {/* Sort Button */}
        <Pressable
          onPress={toggleSort}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 999,
            shadowColor: '#111111',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <ArrowUpDown size={12} color="#111111" />
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }}>
            {sortLabel}
          </Text>
        </Pressable>
      </View>

      {/* Subtitle / Counter */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontSize: 12, color: '#6B6667', fontWeight: '500' }}>
          Handcrafted luxury apparel from verified ateliers
        </Text>
        <View style={{ backgroundColor: '#F4F1EA', borderWidth: 1, borderColor: '#D9D9D5', paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 6 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111' }}>
            {displayedProducts.length} Items
          </Text>
        </View>
      </View>

      {/* Category Filter Pills Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
      >
        {filterTabs.map((tab) => {
          const isSelected = selectedFilter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setSelectedFilter(tab)}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isSelected ? '#111111' : '#ffffff',
                borderWidth: 1,
                borderColor: isSelected ? '#111111' : '#D9D9D5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isSelected ? 0.12 : 0.03,
                shadowRadius: 3,
                elevation: isSelected ? 2 : 1,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? '#ffffff' : '#353335',
                  letterSpacing: 0.2,
                }}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 2-Column Product Grid */}
      {isLoading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4].map((skeletonId) => (
            <View key={skeletonId} style={{ width: '48%', marginBottom: 20 }}>
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      ) : displayedProducts.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {displayedProducts.map((product) => (
            <View key={product.id} style={{ width: '48%', marginBottom: 20 }}>
              <ProductCard
                product={product}
                wished={wishlist.includes(String(product.id))}
                onWishlist={onWishlist}
                onBag={onBag}
                onOpen={onOpenProduct}
              />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          title="NO PRODUCTS FOUND"
          body="No items match your active filter selection."
          action="RESET FILTER"
          onClick={() => setSelectedFilter('All')}
        />
      )}
    </View>
  );
});
