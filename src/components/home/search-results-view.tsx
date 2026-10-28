import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { ArrowLeft, ArrowUpDown, Zap, Sparkles, X, Check, Search, SlidersHorizontal } from 'lucide-react-native';
import { ProductCard } from '@/components/common/product-card';
import { ProductCardSkeleton } from '@/components/common/skeleton';
import { ProductItem } from '@/data/homeData';
import { Fonts } from '@/constants/theme';
import { FulfillmentFilterType } from '@/store/useCatalogStore';

interface SearchResultsViewProps {
  query: string;
  products: ProductItem[];
  wishlist: string[];
  fulfillmentFilter: FulfillmentFilterType;
  onSelectFulfillmentFilter: (filter: FulfillmentFilterType) => void;
  onClearSearch: () => void;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number) => void;
  onOpenProduct: (product: any) => void;
  onSelectSearchQuery: (query: string) => void;
  isLoading?: boolean;
}

type SearchSortOption = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING';

export const SearchResultsView = React.memo(function SearchResultsView({
  query,
  products,
  wishlist,
  fulfillmentFilter,
  onSelectFulfillmentFilter,
  onClearSearch,
  onWishlist,
  onBag,
  onOpenProduct,
  onSelectSearchQuery,
  isLoading = false,
}: SearchResultsViewProps) {
  const [sortOption, setSortOption] = useState<SearchSortOption>('RELEVANCE');
  const [tryAndBuyOnly, setTryAndBuyOnly] = useState<boolean>(false);

  // Multi-token fuzzy matching & filtering on the active product catalog
  const filteredProducts = useMemo(() => {
    const cleanQ = (query || '').toLowerCase().trim();
    const tokens = cleanQ.split(/\s+/).filter(Boolean);

    let list = [...products];

    // 1. Text Search matching
    if (tokens.length > 0) {
      list = list.filter((p) => {
        const title = (p.name || (p as any).title || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const wear = ((p as any).wear || '').toLowerCase();
        const fabric = ((p as any).fabric || '').toLowerCase();
        const desc = ((p as any).description || '').toLowerCase();

        return tokens.some(
          (t) =>
            title.includes(t) ||
            brand.includes(t) ||
            cat.includes(t) ||
            wear.includes(t) ||
            fabric.includes(t) ||
            desc.includes(t),
        );
      });
    }

    // 2. Fulfillment Type filter
    if (fulfillmentFilter === 'DARK_STORE') {
      list = list.filter(
        (p: any) =>
          p.fulfillmentType === 'DARK_STORE' ||
          (p.wear && (p.wear === 'Ethnic' || p.wear === 'Western' || p.wear === 'Tops')),
      );
    } else if (fulfillmentFilter === 'VENDOR') {
      list = list.filter((p: any) => p.fulfillmentType === 'VENDOR');
    }

    // 3. Try & Buy filter
    if (tryAndBuyOnly) {
      list = list.filter((p: any) => p.tryAndBuyEligible !== false);
    }

    // 4. Sorting
    if (sortOption === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'RATING') {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return list;
  }, [products, query, fulfillmentFilter, tryAndBuyOnly, sortOption]);

  // Split into 2 columns for responsive masonry-like layout
  const leftColProducts = useMemo(
    () => filteredProducts.filter((_, idx) => idx % 2 === 0),
    [filteredProducts],
  );
  const rightColProducts = useMemo(
    () => filteredProducts.filter((_, idx) => idx % 2 === 1),
    [filteredProducts],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Search Result Info Strip */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
          {/* Back Button to Return to Home / Category Feed */}
          <Pressable
            onPress={(e) => {
              if (Platform.OS === 'web') {
                (e as any)?.stopPropagation?.();
              }
              onClearSearch();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pressed ? '#E8E5DF' : '#F4F1EA',
              borderWidth: 1,
              borderColor: '#D9D9D5',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
            })}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <ArrowLeft size={18} color="#111111" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 15,
                fontFamily: Fonts.sansBold,
                color: '#111111',
              }}
            >
              {filteredProducts.length} {filteredProducts.length === 1 ? 'style' : 'styles'} found
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontFamily: Fonts.sansMedium,
                color: '#71717A',
                marginTop: 1,
              }}
            >
              for "{query}"
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onClearSearch}
          hitSlop={6}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pressed ? '#E8E5DF' : '#F4F1EA',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 14,
            gap: 4,
            ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
          })}
        >
          <X size={13} color="#FF5A1F" />
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: Fonts.sansSemiBold,
              color: '#111111',
            }}
          >
            Clear Search
          </Text>
        </Pressable>
      </View>

      {/* Filter & Sort Chips Bar */}
      <View
        style={{
          paddingVertical: 10,
          backgroundColor: '#FAF8F5',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {/* Fulfillment: All */}
          <Pressable
            onPress={() => onSelectFulfillmentFilter('ALL')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: fulfillmentFilter === 'ALL' ? '#111111' : '#ffffff',
              borderWidth: 1,
              borderColor: fulfillmentFilter === 'ALL' ? '#111111' : '#D9D9D5',
            }}
          >
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.sansBold,
                color: fulfillmentFilter === 'ALL' ? '#ffffff' : '#4A4647',
              }}
            >
              All Styles
            </Text>
          </Pressable>

          {/* Fulfillment: 18-Min Express */}
          <Pressable
            onPress={() =>
              onSelectFulfillmentFilter(fulfillmentFilter === 'DARK_STORE' ? 'ALL' : 'DARK_STORE')
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: fulfillmentFilter === 'DARK_STORE' ? '#C2410C' : '#ffffff',
              borderWidth: 1,
              borderColor: fulfillmentFilter === 'DARK_STORE' ? '#C2410C' : '#D9D9D5',
              gap: 4,
            }}
          >
            <Zap size={11} color={fulfillmentFilter === 'DARK_STORE' ? '#ffffff' : '#C2410C'} />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.sansBold,
                color: fulfillmentFilter === 'DARK_STORE' ? '#ffffff' : '#9A3412',
              }}
            >
              18-Min Express
            </Text>
          </Pressable>

          {/* Fulfillment: Boutique Artisans */}
          <Pressable
            onPress={() =>
              onSelectFulfillmentFilter(fulfillmentFilter === 'VENDOR' ? 'ALL' : 'VENDOR')
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: fulfillmentFilter === 'VENDOR' ? '#111111' : '#ffffff',
              borderWidth: 1,
              borderColor: fulfillmentFilter === 'VENDOR' ? '#111111' : '#D9D9D5',
              gap: 4,
            }}
          >
            <Sparkles size={11} color={fulfillmentFilter === 'VENDOR' ? '#F59E0B' : '#B45309'} />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.sansBold,
                color: fulfillmentFilter === 'VENDOR' ? '#ffffff' : '#78350F',
              }}
            >
              Boutique Artisans
            </Text>
          </Pressable>

          {/* Try & Buy Only */}
          <Pressable
            onPress={() => setTryAndBuyOnly((prev) => !prev)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: tryAndBuyOnly ? '#FF5A1F' : '#ffffff',
              borderWidth: 1,
              borderColor: tryAndBuyOnly ? '#FF5A1F' : '#D9D9D5',
              gap: 4,
            }}
          >
            {tryAndBuyOnly && <Check size={11} color="#ffffff" />}
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.sansBold,
                color: tryAndBuyOnly ? '#ffffff' : '#111111',
              }}
            >
              Try & Buy Only
            </Text>
          </Pressable>

          {/* Sort: Price Low to High */}
          <Pressable
            onPress={() =>
              setSortOption((prev) => (prev === 'PRICE_ASC' ? 'RELEVANCE' : 'PRICE_ASC'))
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: sortOption === 'PRICE_ASC' ? '#111111' : '#ffffff',
              borderWidth: 1,
              borderColor: sortOption === 'PRICE_ASC' ? '#111111' : '#D9D9D5',
              gap: 4,
            }}
          >
            <ArrowUpDown size={11} color={sortOption === 'PRICE_ASC' ? '#ffffff' : '#6B6667'} />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.sansMedium,
                color: sortOption === 'PRICE_ASC' ? '#ffffff' : '#111111',
              }}
            >
              Price: Low
            </Text>
          </Pressable>

          {/* Sort: Price High to Low */}
          <Pressable
            onPress={() =>
              setSortOption((prev) => (prev === 'PRICE_DESC' ? 'RELEVANCE' : 'PRICE_DESC'))
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              backgroundColor: sortOption === 'PRICE_DESC' ? '#111111' : '#ffffff',
              borderWidth: 1,
              borderColor: sortOption === 'PRICE_DESC' ? '#111111' : '#D9D9D5',
              gap: 4,
            }}
          >
            <ArrowUpDown size={11} color={sortOption === 'PRICE_DESC' ? '#ffffff' : '#6B6667'} />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.sansMedium,
                color: sortOption === 'PRICE_DESC' ? '#ffffff' : '#111111',
              }}
            >
              Price: High
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Product Results Grid or Empty State */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <ProductCardSkeleton />
              <View style={{ height: 16 }} />
              <ProductCardSkeleton />
            </View>
            <View style={{ flex: 1 }}>
              <ProductCardSkeleton />
              <View style={{ height: 16 }} />
              <ProductCardSkeleton />
            </View>
          </View>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View
          style={{
            paddingVertical: 48,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#F4F1EA',
              borderWidth: 1,
              borderColor: '#E8E5DF',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Search size={26} color="#8A8580" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: Fonts.serifBold,
              color: '#111111',
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            No styles found
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: Fonts.sans,
              color: '#71717A',
              textAlign: 'center',
              lineHeight: 18,
              marginBottom: 24,
            }}
          >
            We couldn't find any designs matching "{query}". Try checking your spelling or explore these trending searches:
          </Text>

          {/* Quick Alternative Suggestions */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {['Silk Sarees', 'Kurtis', 'Linen Shirts', 'Floral Dresses', 'Selvedge Denim'].map((tag, idx) => (
              <Pressable
                key={idx}
                onPress={() => onSelectSearchQuery(tag)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  borderRadius: 18,
                }}
              >
                <Text style={{ fontSize: 12.5, fontFamily: Fonts.sansMedium, color: '#111111' }}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onClearSearch}
            style={{
              backgroundColor: '#111111',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: Fonts.sansBold, color: '#ffffff' }}>
              Clear Search & Browse All
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Left Column */}
            <View style={{ flex: 1 }}>
              {leftColProducts.map((p) => (
                <ProductCard
                  key={String(p.id)}
                  product={p}
                  wished={wishlist.includes(String(p.id))}
                  onWishlist={onWishlist}
                  onBag={onBag}
                  onOpen={onOpenProduct}
                  badge={p.wear === 'Ethnic' ? 'TRY & BUY' : undefined}
                />
              ))}
            </View>

            {/* Right Column */}
            <View style={{ flex: 1 }}>
              {rightColProducts.map((p) => (
                <ProductCard
                  key={String(p.id)}
                  product={p}
                  wished={wishlist.includes(String(p.id))}
                  onWishlist={onWishlist}
                  onBag={onBag}
                  onOpen={onOpenProduct}
                  badge={p.wear === 'Ethnic' ? 'TRY & BUY' : undefined}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
});
