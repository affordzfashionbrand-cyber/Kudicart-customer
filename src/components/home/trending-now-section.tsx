import React, { useCallback } from 'react';
import { View, Text, Pressable, FlatList, Platform } from 'react-native';
import { SectionTitle } from '@/components/common/section-title';
import { ProductCard } from '@/components/common/product-card';
import { ProductCardSkeleton } from '@/components/common/skeleton';
import { ProductItem } from '@/data/homeData';

interface TrendingNowSectionProps {
  products: ProductItem[];
  wishlist: string[];
  isFilterActive: boolean;
  onResetFilter: () => void;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number, size?: string) => void;
  onOpen: (product: any) => void;
  isLoading?: boolean;
}

export const TrendingNowSection = React.memo(function TrendingNowSection({
  products,
  wishlist,
  isFilterActive,
  onResetFilter,
  onWishlist,
  onBag,
  onOpen,
  isLoading = false,
}: TrendingNowSectionProps) {
  const trendingList = React.useMemo(() => products.slice(0, 8), [products]);

  const renderProduct = useCallback(
    ({ item }: { item: ProductItem }) => (
      <View className="w-[180px] mr-[16px]">
        <ProductCard
          product={item}
          wished={wishlist.includes(String(item.id))}
          onWishlist={onWishlist}
          onBag={onBag}
          onOpen={onOpen}
        />
      </View>
    ),
    [wishlist, onWishlist, onBag, onOpen],
  );

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
      {isLoading && trendingList.length === 0 ? (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <ProductCardSkeleton cardWidth={180} />
          <ProductCardSkeleton cardWidth={180} />
        </View>
      ) : (
        <FlatList
          data={trendingList}
          horizontal
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          overScrollMode="never"
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          removeClippedSubviews={Platform.OS !== 'web'}
          className="-mx-5 px-5"
        />
      )}
    </View>
  );
});
