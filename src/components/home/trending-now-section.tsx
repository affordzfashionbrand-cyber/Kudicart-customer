import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SectionTitle } from '@/components/common/section-title';
import { ProductCard } from '@/components/common/product-card';
import { ProductItem } from '@/data/homeData';

interface TrendingNowSectionProps {
  products: ProductItem[];
  wishlist: string[];
  isFilterActive: boolean;
  onResetFilter: () => void;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number) => void;
  onOpen: (product: any) => void;
}

export const TrendingNowSection = React.memo(function TrendingNowSection({
  products,
  wishlist,
  isFilterActive,
  onResetFilter,
  onWishlist,
  onBag,
  onOpen,
}: TrendingNowSectionProps) {
  return (
    <View className="bg-white py-[30px] px-5 mb-[36px] rounded-[32px] mx-2 border border-[#D9D9D5]">
      <View className="flex-row justify-between items-start mb-4">
        <SectionTitle
          label="MOST WANTED"
          firstLine="Trending"
          secondLine="now."
          marginBottom={0}
        />
        {isFilterActive && (
          <Pressable
            onPress={onResetFilter}
            className="bg-[#F4F1EA] border border-[#D9D9D5] px-3 py-1.5 rounded-full mt-1"
          >
            <Text className="text-[10px] text-[#111111] font-black uppercase tracking-wider">Reset Filter</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        className="-mx-5 px-5"
      >
        {products.slice(0, 8).map((product) => (
          <View key={product.id} className="w-[180px] mr-[16px]">
            <ProductCard
              product={product}
              wished={wishlist.includes(String(product.id))}
              onWishlist={onWishlist}
              onBag={onBag}
              onOpen={onOpen}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});
