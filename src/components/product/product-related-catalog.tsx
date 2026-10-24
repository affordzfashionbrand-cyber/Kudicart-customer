import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ArrowUpDown, Sparkles } from 'lucide-react-native';
import { ProductCard } from '@/components/common/product-card';
import { EmptyState } from '@/components/common/empty-state';
import { EditorialText } from '@/components/common/section-title';

interface ProductRelatedCatalogProps {
  products: any[];
  currentProductId: string;
  wishlist: string[];
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number) => void;
  onOpenProduct: (product: any) => void;
}

const FILTER_TABS = ['All', 'Women', 'Men', 'Kids', 'Ethnic', 'Western', 'Footwear', 'Accessories'];

type SortType = 'FEATURED' | 'LOW_TO_HIGH' | 'HIGH_TO_LOW';

export const ProductRelatedCatalog = React.memo(function ProductRelatedCatalog({
  products,
  currentProductId,
  wishlist,
  onWishlist,
  onBag,
  onOpenProduct,
}: ProductRelatedCatalogProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortType>('FEATURED');

  // Exclude the current product from the list
  const allProducts = useMemo(() => {
    return products.filter((p) => String(p.id) !== String(currentProductId));
  }, [products, currentProductId]);

  const displayedProducts = useMemo(() => {
    let list = [...allProducts];

    if (selectedFilter !== 'All') {
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const wear = (p.wear || '').toLowerCase();
        const target = selectedFilter.toLowerCase();
        return cat === target || wear === target;
      });
    }

    if (sortOption === 'LOW_TO_HIGH') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'HIGH_TO_LOW') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [allProducts, selectedFilter, sortOption]);

  const toggleSort = () => {
    setSortOption((prev) => {
      if (prev === 'FEATURED') return 'LOW_TO_HIGH';
      if (prev === 'LOW_TO_HIGH') return 'HIGH_TO_LOW';
      return 'FEATURED';
    });
  };

  const sortLabel =
    sortOption === 'FEATURED'
      ? 'Featured'
      : sortOption === 'LOW_TO_HIGH'
        ? 'Price: Low'
        : 'Price: High';

  return (
    <View style={{ marginTop: 32, paddingHorizontal: 16, paddingBottom: 40 }}>
      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: '#E8E5DF',
          marginBottom: 24,
        }}
      />

      {/* Section Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#111111',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={13} color="#ffffff" />
        </View>
        <EditorialText
          first="You may also"
          second="love."
          fontSize={18}
          lineHeight={22}
          singleLine
          withDot
        />
      </View>

      <Text
        style={{
          fontSize: 11.5,
          color: '#6B6667',
          fontWeight: '500',
          marginBottom: 16,
          paddingLeft: 36,
        }}
      >
        Curated picks from our atelier collection
      </Text>

      {/* Filter Pills + Sort + Count Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: '#F4F1EA',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111' }}>
            {displayedProducts.length} Items
          </Text>
        </View>

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

      {/* Horizontal Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        overScrollMode="never"
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
      >
        {FILTER_TABS.map((tab) => {
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
      {displayedProducts.length > 0 ? (
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
