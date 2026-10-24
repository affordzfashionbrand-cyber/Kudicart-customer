import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import {
  ShoppingBag,
  Zap,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check,
  Tag,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { ProductItem, DEFAULT_PRODUCTS, formatPrice } from '@/data/homeData';
import { WishlistItemCard } from '@/components/wishlist/wishlist-item-card';
import { WishlistEmptyState } from '@/components/wishlist/wishlist-empty-state';

export interface WishlistViewProps {
  products: ProductItem[];
  allProducts?: ProductItem[];
  onBag: (id: string | number) => void;
  onWishlist: (id: string | number) => void;
  onOpen: (product: any) => void;
  onExplore: () => void;
  onGoToBag?: () => void;
}

type FilterCategory = 'ALL' | 'WOMEN' | 'MEN' | 'EXPRESS' | 'DEALS';

export const WishlistView = React.memo(function WishlistView({
  products,
  allProducts = DEFAULT_PRODUCTS,
  onBag,
  onWishlist,
  onOpen,
  onExplore,
}: WishlistViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [movedToBagMap, setMovedToBagMap] = useState<Record<string, boolean>>({});
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [allMovedSuccess, setAllMovedSuccess] = useState(false);

  // Totals
  const totalWishlistValue = useMemo(
    () => products.reduce((acc, p) => acc + (p.price || 0), 0),
    [products]
  );
  const totalOriginalValue = useMemo(
    () => products.reduce((acc, p) => acc + (p.old || p.price || 0), 0),
    [products]
  );
  const totalSavings = useMemo(
    () => Math.max(0, totalOriginalValue - totalWishlistValue),
    [totalOriginalValue, totalWishlistValue]
  );

  // Filter chips counts
  const womenCount = useMemo(
    () => products.filter((p) => (p.category || '').toLowerCase() === 'women').length,
    [products]
  );
  const menCount = useMemo(
    () => products.filter((p) => (p.category || '').toLowerCase() === 'men').length,
    [products]
  );
  const dealsCount = useMemo(
    () => products.filter((p) => Boolean(p.old && p.old > p.price)).length,
    [products]
  );

  // Filtered products list
  const filteredProducts = useMemo(() => {
    switch (activeFilter) {
      case 'WOMEN':
        return products.filter((p) => (p.category || '').toLowerCase() === 'women');
      case 'MEN':
        return products.filter((p) => (p.category || '').toLowerCase() === 'men');
      case 'EXPRESS':
        return products.slice(0, Math.max(1, Math.ceil(products.length * 0.75)));
      case 'DEALS':
        return products.filter((p) => Boolean(p.old && p.old > p.price));
      case 'ALL':
      default:
        return products;
    }
  }, [products, activeFilter]);

  // Actions
  const handleMoveToBag = useCallback(
    (product: ProductItem) => {
      onBag(product.id);
      setMovedToBagMap((prev) => ({ ...prev, [String(product.id)]: true }));
      setTimeout(() => {
        setMovedToBagMap((prev) => ({ ...prev, [String(product.id)]: false }));
      }, 1600);
    },
    [onBag]
  );

  const handleMoveAllToBag = useCallback(() => {
    if (products.length === 0 || isMovingAll) return;
    setIsMovingAll(true);
    products.forEach((p) => onBag(p.id));
    setAllMovedSuccess(true);
    setTimeout(() => {
      setIsMovingAll(false);
      setAllMovedSuccess(false);
    }, 2000);
  }, [products, onBag, isMovingAll]);

  const handleSelectSize = useCallback((productId: string | number, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [String(productId)]: size }));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
      >
        {/* Top Header */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={13} color="#FF5A1F" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                color: '#FF5A1F',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              SAVED ATELIER PIECES
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <EditorialText
              first="My curated"
              second="wishlist."
              fontSize={24}
              lineHeight={28}
              color="#111111"
              singleLine
              withDot
            />
            <View
              style={{
                backgroundColor: '#111111',
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>
                {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
              </Text>
            </View>
          </View>
        </View>

        {products.length > 0 ? (
          <>
            {/* Valuation Summary Bar */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#E8E5DF',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#71717A', textTransform: 'uppercase' }}>
                  TOTAL CAPSULE VALUE
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
                    {formatPrice(totalWishlistValue)}
                  </Text>
                  {totalSavings > 0 && (
                    <View
                      style={{
                        backgroundColor: '#FFF0EA',
                        paddingHorizontal: 5,
                        paddingVertical: 1.5,
                        borderRadius: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Tag size={9} color="#FF5A1F" />
                      <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FF5A1F' }}>
                        Save {formatPrice(totalSavings)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <AnimatedPressable
                onPress={handleMoveAllToBag}
                style={{
                  backgroundColor: allMovedSuccess ? '#22C55E' : '#111111',
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {allMovedSuccess ? (
                  <>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    <Text style={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: '900' }}>ALL MOVED</Text>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={12} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: '900' }}>MOVE ALL TO BAG</Text>
                  </>
                )}
              </AnimatedPressable>
            </View>

            {/* Filter Tabs */}
            <View style={{ marginBottom: 14 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {[
                  { id: 'ALL', label: `All (${products.length})` },
                  ...(womenCount > 0 ? [{ id: 'WOMEN', label: `Women (${womenCount})` }] : []),
                  ...(menCount > 0 ? [{ id: 'MEN', label: `Men (${menCount})` }] : []),
                  { id: 'EXPRESS', label: '⚡ 18M Express Drop' },
                  ...(dealsCount > 0 ? [{ id: 'DEALS', label: `Deals (${dealsCount})` }] : []),
                ].map((chip) => {
                  const isSelected = activeFilter === chip.id;
                  return (
                    <AnimatedPressable
                      key={chip.id}
                      onPress={() => setActiveFilter(chip.id as FilterCategory)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 14,
                        backgroundColor: isSelected ? '#111111' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isSelected ? '#111111' : '#E8E5DF',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? '#FFFFFF' : '#4A4A4A',
                        }}
                      >
                        {chip.label}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Product Cards Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={{ width: '48.5%', marginBottom: 14 }}>
                  <WishlistItemCard
                    product={product}
                    selectedSize={selectedSizes[String(product.id)] || 'M'}
                    isMovedToBag={Boolean(movedToBagMap[String(product.id)])}
                    onSelectSize={handleSelectSize}
                    onMoveToBag={handleMoveToBag}
                    onRemove={onWishlist}
                    onOpen={onOpen}
                  />
                </View>
              ))}
            </View>
          </>
        ) : (
          <WishlistEmptyState
            discoveryProducts={allProducts}
            onExplore={onExplore}
            onWishlist={onWishlist}
            onBag={onBag}
            onOpen={onOpen}
          />
        )}

        {/* Affordz Atelier Promise Footer */}
        <View
          style={{
            backgroundColor: '#F4F1EA',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            borderRadius: 22,
            padding: 16,
            marginTop: 12,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <ShieldCheck size={16} color="#FF5A1F" strokeWidth={2.4} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                color: '#111111',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              AFFORDZ ATELIER PROMISE
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#E5E0D8',
                }}
              >
                <Zap size={13} color="#FF5A1F" fill="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#111111' }}>
                  18-Minute Express Try & Buy
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', lineHeight: 14 }}>
                  Dispatched in minutes from hyper-local temperature-controlled dark stores.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#E5E0D8',
                }}
              >
                <RotateCcw size={13} color="#111111" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#111111' }}>
                  Doorstep Try & Keep What Fits
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', lineHeight: 14 }}>
                  Our style rider waits while you try on your size. Return instantly on spot.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});
