import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Zap, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { formatPrice } from '@/data/homeData';

interface ProductBottomBarProps {
  price: number;
  originalPrice: number;
  isDarkStoreProduct: boolean;
  deliveryMinutes?: number;
  bottomInset: number;
  stockQuantity?: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductBottomBar({
  price,
  originalPrice,
  isDarkStoreProduct,
  deliveryMinutes = 18,
  bottomInset,
  stockQuantity = 10,
  onAddToCart,
  onBuyNow,
}: ProductBottomBarProps) {
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity < 5;

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
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
          <Text style={{ fontSize: 17, fontWeight: '900', color: '#111111' }}>
            {formatPrice(price)}
          </Text>
          <Text style={{ fontSize: 10.5, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
            {formatPrice(originalPrice)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
          {isOutOfStock ? (
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#EF4444' }}>
              Sold Out
            </Text>
          ) : isLowStock ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <AlertTriangle size={10} color="#F59E0B" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#D97706' }}>
                Only {stockQuantity} left in vault
              </Text>
            </View>
          ) : (
            <>
              <Zap size={9.5} color="#FF5A1F" fill="#FF5A1F" />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#9A3412' }} numberOfLines={1}>
                {isDarkStoreProduct ? `${deliveryMinutes}-Min Drop` : 'Boutique Atelier'}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        {isOutOfStock ? (
          <View
            style={{
              flex: 1,
              maxWidth: 240,
              backgroundColor: '#F3F4F6',
              borderRadius: 22,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingVertical: 11,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.5 }}>
              OUT OF STOCK
            </Text>
          </View>
        ) : (
          <>
            {/* 1. Add to Bag Button */}
            <AnimatedPressable
              onPress={onAddToCart}
              style={{
                flex: 1,
                maxWidth: 135,
                backgroundColor: '#FFFFFF',
                borderRadius: 22,
                borderWidth: 1.5,
                borderColor: '#111111',
                paddingVertical: 11,
                paddingHorizontal: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <ShoppingBag size={13} color="#111111" />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '900',
                  color: '#111111',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
                numberOfLines={1}
              >
                ADD TO BAG
              </Text>
            </AnimatedPressable>

            {/* 2. Buy Now Button */}
            <AnimatedPressable
              onPress={onBuyNow}
              style={{
                flex: 1,
                maxWidth: 135,
                backgroundColor: '#111111',
                borderRadius: 22,
                paddingVertical: 11,
                paddingHorizontal: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '900',
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
