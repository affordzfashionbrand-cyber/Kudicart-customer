import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SectionTitle } from '@/components/common/section-title';
import { ProductCard } from '@/components/common/product-card';
import { ALGO_TABS, ALGO_PRODUCTS, AlgoTabType, AlgoProduct } from '@/data/homeData';

export interface TodayLookSectionProps {
  storeWishlist: string[];
  selectedGender: 'All' | 'Men' | 'Women' | 'Kids';
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number) => void;
  onOpenProduct: (product: any) => void;
}

export const TodayLookSection = React.memo(function TodayLookSection({
  storeWishlist,
  selectedGender,
  onWishlist,
  onBag,
  onOpenProduct,
}: TodayLookSectionProps) {
  const [selectedAlgoTab, setSelectedAlgoTab] = useState<AlgoTabType>('viewed');
  const [viewedProductIds, setViewedProductIds] = useState<(number | string)[]>([101, 102, 103, 104, 105]);

  const recommendedProducts = useMemo(() => {
    if (selectedAlgoTab === 'viewed') {
      return ALGO_PRODUCTS.filter(p => viewedProductIds.includes(p.id))
        .concat(ALGO_PRODUCTS.filter(p => !viewedProductIds.includes(p.id)));
    } else if (selectedAlgoTab === 'searched') {
      return ALGO_PRODUCTS.filter(p => p.wear === 'Footwear' || p.wear === 'Tops');
    } else if (selectedAlgoTab === 'favorites') {
      const wishedItems = ALGO_PRODUCTS.filter(p => storeWishlist.includes(String(p.id)));
      if (wishedItems.length > 0) {
        return wishedItems.concat(ALGO_PRODUCTS.filter(p => !storeWishlist.includes(String(p.id))));
      }
      return ALGO_PRODUCTS.filter(p => p.priceDrop >= 250);
    } else {
      if (selectedGender !== 'All') {
        const matching = ALGO_PRODUCTS.filter(p => p.category === selectedGender);
        if (matching.length > 0) return matching;
      }
      return ALGO_PRODUCTS;
    }
  }, [selectedAlgoTab, viewedProductIds, storeWishlist, selectedGender]);

  const handleOpen = (item: AlgoProduct) => {
    setViewedProductIds(prev => [item.id, ...prev.filter(id => id !== item.id)]);
    onOpenProduct(item);
  };

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 18,
        backgroundColor: '#F4F1EA',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#D9D9D5',
        paddingTop: 16,
        paddingBottom: 16,
        shadowColor: '#111111',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header: Signature Luxury Editorial Title */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <SectionTitle
          label="FASHION, NOW"
          firstLine="Today's look"
          secondLine="today."
          marginBottom={0}
        />
      </View>

      {/* Filter Pills Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingBottom: 12 }}
      >
        {ALGO_TABS.map((tabItem) => {
          const isSelected = selectedAlgoTab === tabItem.id;
          return (
            <Pressable
              key={tabItem.id}
              onPress={() => setSelectedAlgoTab(tabItem.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: isSelected ? '#111111' : '#ffffff',
                borderWidth: 1,
                borderColor: isSelected ? '#111111' : '#D9D9D5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isSelected ? 0.12 : 0.03,
                shadowRadius: 3,
                elevation: isSelected ? 2 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? '#ffffff' : '#353335',
                }}
              >
                {tabItem.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Horizontal Product Cards Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {recommendedProducts.map((item) => (
          <View key={item.id} style={{ width: 180, marginRight: 16 }}>
            <ProductCard
              product={item}
              wished={storeWishlist.includes(String(item.id))}
              onWishlist={onWishlist}
              onBag={onBag}
              onOpen={handleOpen}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});
