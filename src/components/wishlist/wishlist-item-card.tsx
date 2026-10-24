import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, ShoppingBag, Check } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { ProductItem, formatPrice } from '@/data/homeData';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface WishlistItemCardProps {
  product: ProductItem;
  selectedSize: string;
  isMovedToBag: boolean;
  onSelectSize: (productId: string | number, size: string) => void;
  onMoveToBag: (product: ProductItem) => void;
  onRemove: (id: string | number) => void;
  onOpen: (product: ProductItem) => void;
}

export const WishlistItemCard = React.memo(function WishlistItemCard({
  product,
  selectedSize,
  isMovedToBag,
  onSelectSize,
  onMoveToBag,
  onRemove,
  onOpen,
}: WishlistItemCardProps) {
  const currentSize = selectedSize || 'M';
  const hasDiscount = Boolean(product.old && product.old > product.price);
  const discountPct = hasDiscount
    ? Math.round((((product.old || 0) - product.price) / (product.old || 1)) * 100)
    : 0;

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8E5DF',
      }}
    >
      {/* Product Image Stage */}
      <View style={{ width: '100%', height: 215, position: 'relative' }}>
        <Pressable onPress={() => onOpen(product)} style={{ width: '100%', height: '100%' }}>
          <Image
            source={{ uri: product.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        </Pressable>

        {/* Top-Left Badge: 18M Drop */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: '#111111',
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 6,
            zIndex: 10,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.6 }}>
            18M DROP
          </Text>
        </View>

        {/* Top-Right: Remove from Wishlist Heart Button */}
        <AnimatedPressable
          onPress={() => onRemove(product.id)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
          }}
        >
          <Heart size={16} color="#FF5A1F" fill="#FF5A1F" />
        </AnimatedPressable>

        {/* Bottom-Left Pill: Discount percentage */}
        {hasDiscount && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: '#FF5A1F',
              paddingHorizontal: 6,
              paddingVertical: 2.5,
              borderRadius: 6,
              zIndex: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.3 }}>
              {discountPct}% OFF
            </Text>
          </View>
        )}
      </View>

      {/* Card Information */}
      <View style={{ paddingHorizontal: 8, paddingTop: 10, paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 9,
            color: '#71717A',
            fontWeight: '800',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          {product.brand}
        </Text>

        <EditorialText
          text={product.name}
          fontSize={13}
          lineHeight={16}
          color="#111111"
          singleLine
          numberOfLines={1}
          style={{ marginBottom: 4 }}
        />

        {/* Price Row */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: 8 }}>
          <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
            {formatPrice(product.price)}
          </Text>
          {product.old ? (
            <Text
              style={{
                fontSize: 10.5,
                color: '#A1A1AA',
                textDecorationLine: 'line-through',
              }}
            >
              {formatPrice(product.old)}
            </Text>
          ) : null}
        </View>

        {/* Size Selection Pills */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 8.5, color: '#8A8580', fontWeight: '800', marginBottom: 4 }}>
            SIZE: {currentSize}
          </Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {AVAILABLE_SIZES.map((sz) => {
              const isSelected = currentSize === sz;
              return (
                <Pressable
                  key={sz}
                  onPress={() => onSelectSize(product.id, sz)}
                  style={{
                    flex: 1,
                    height: 20,
                    borderRadius: 5,
                    backgroundColor: isSelected ? '#111111' : '#F5F2EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: isSelected ? '#111111' : '#E8E5DF',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8.5,
                      fontWeight: '800',
                      color: isSelected ? '#FFFFFF' : '#111111',
                    }}
                  >
                    {sz}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Move To Bag CTA */}
        <AnimatedPressable
          onPress={() => onMoveToBag(product)}
          style={{
            backgroundColor: isMovedToBag ? '#22C55E' : '#111111',
            borderRadius: 12,
            paddingVertical: 7,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          {isMovedToBag ? (
            <>
              <Check size={11} color="#FFFFFF" strokeWidth={3} />
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>
                IN BAG
              </Text>
            </>
          ) : (
            <>
              <ShoppingBag size={11} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>
                MOVE TO BAG
              </Text>
            </>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
});
