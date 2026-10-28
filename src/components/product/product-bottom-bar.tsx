import React from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { Zap, ShoppingBag, ArrowRight, AlertTriangle, Minus, Plus } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { formatPrice } from '@/data/homeData';
import { Fonts } from '@/constants/theme';

interface ProductBottomBarProps {
  price: number;
  originalPrice: number;
  isDarkStoreProduct: boolean;
  deliveryMinutes?: number;
  bottomInset: number;
  stockQuantity?: number;
  currentQuantity?: number;
  selectedSize?: string | null;
  onAddToCart: () => void;
  onIncrementQuantity?: () => void;
  onDecrementQuantity?: () => void;
  onBuyNow: () => void;
}

export function ProductBottomBar({
  price,
  originalPrice,
  isDarkStoreProduct,
  deliveryMinutes = 18,
  bottomInset,
  stockQuantity = 10,
  currentQuantity = 0,
  selectedSize,
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
  onBuyNow,
}: ProductBottomBarProps) {
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity < 5;
  const isInBag = currentQuantity > 0;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8E5DF',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? Math.max(bottomInset, 22) : 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 12,
      }}
    >
      {/* Left Price & Delivery Column */}
      <View style={{ flexShrink: 0, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
          <Text style={{ fontSize: 18, fontFamily: Fonts.sansBold, color: '#111111', letterSpacing: -0.3 }}>
            {formatPrice(price)}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: Fonts.sansMedium, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
            {formatPrice(originalPrice)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
          {isOutOfStock ? (
            <Text style={{ fontSize: 10, fontFamily: Fonts.sansBold, color: '#EF4444' }}>
              Sold Out
            </Text>
          ) : isLowStock ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <AlertTriangle size={10} color="#F59E0B" />
              <Text style={{ fontSize: 10, fontFamily: Fonts.sansBold, color: '#D97706' }}>
                Only {stockQuantity} left
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Zap size={9.5} color="#FF5A1F" fill="#FF5A1F" />
              <Text style={{ fontSize: 9.5, fontFamily: Fonts.sansBold, color: '#9A3412' }} numberOfLines={1}>
                {isDarkStoreProduct ? `${deliveryMinutes}-Min Drop` : 'Boutique Atelier'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Action Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          justifyContent: 'flex-end',
          marginLeft: 10,
        }}
      >
        {isOutOfStock ? (
          <View
            style={{
              flex: 1,
              maxWidth: 220,
              height: 44,
              backgroundColor: '#F3F4F6',
              borderRadius: 22,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 11, fontFamily: Fonts.sansBold, color: '#9CA3AF', letterSpacing: 0.6 }}>
              OUT OF STOCK
            </Text>
          </View>
        ) : (
          <>
            {/* 1. Add to Bag OR Quantity Stepper */}
            {isInBag ? (
              <View
                style={{
                  flex: 1,
                  maxWidth: 122,
                  minWidth: 98,
                  height: 44,
                  backgroundColor: '#111111',
                  borderRadius: 22,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 5,
                  borderWidth: 1.5,
                  borderColor: '#111111',
                  overflow: 'hidden',
                }}
              >
                <Pressable
                  onPress={onDecrementQuantity}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: pressed ? '#383838' : '#222222',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                >
                  <Minus size={13} color="#FFFFFF" strokeWidth={2.8} />
                </Pressable>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontFamily: Fonts.sansBold, color: '#FFFFFF' }}>
                    {currentQuantity}
                  </Text>
                </View>

                <Pressable
                  onPress={onIncrementQuantity}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: pressed ? '#383838' : '#222222',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                >
                  <Plus size={13} color="#FFFFFF" strokeWidth={2.8} />
                </Pressable>
              </View>
            ) : (
              <AnimatedPressable
                onPress={onAddToCart}
                containerStyle={{ flex: 1, maxWidth: 128, minWidth: 102 }}
                style={{
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: '#111111',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  paddingHorizontal: 8,
                  width: '100%',
                }}
              >
                <ShoppingBag size={13.5} color="#111111" strokeWidth={2.2} />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: Fonts.sansBold,
                    color: '#111111',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                  numberOfLines={1}
                >
                  ADD TO BAG
                </Text>
              </AnimatedPressable>
            )}

            {/* 2. Buy Now Button */}
            <AnimatedPressable
              onPress={onBuyNow}
              containerStyle={{ flex: 1, maxWidth: 130, minWidth: 106 }}
              style={{
                height: 44,
                borderRadius: 22,
                backgroundColor: '#111111',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: 8,
                width: '100%',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: Fonts.sansBold,
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
                numberOfLines={1}
              >
                BUY NOW
              </Text>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FF5A1F',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowRight size={11} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            </AnimatedPressable>
          </>
        )}
      </View>
    </View>
  );
}
