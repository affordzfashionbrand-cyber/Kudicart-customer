import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { ProductItem, formatPrice } from '@/data/homeData';

interface WishlistEmptyStateProps {
  discoveryProducts: ProductItem[];
  onExplore: () => void;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number) => void;
  onOpen: (product: ProductItem) => void;
}

export const WishlistEmptyState = React.memo(function WishlistEmptyState({
  discoveryProducts,
  onExplore,
  onWishlist,
  onBag,
  onOpen,
}: WishlistEmptyStateProps) {
  return (
    <View style={{ marginTop: 8 }}>
      {/* Hero Atelier Empty Card */}
      <View
        style={{
          backgroundColor: '#F4F1EA',
          borderWidth: 1,
          borderColor: '#D9D9D5',
          borderRadius: 28,
          padding: 6,
          marginBottom: 32,
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            paddingHorizontal: 22,
            paddingVertical: 36,
            alignItems: 'center',
          }}
        >
          {/* Glowing Terracotta Icon Shell */}
          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              backgroundColor: '#FAF8F5',
              borderWidth: 1.5,
              borderColor: '#E5E0D8',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: '#FFF5F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={26} color="#FF5A1F" strokeWidth={2.4} fill="#FF5A1F" />
            </View>
          </View>

          <EditorialText
            first="Nothing saved."
            second="Yet."
            fontSize={26}
            lineHeight={32}
            color="#111111"
            withDot
            style={{ marginBottom: 8, textAlign: 'center' }}
          />

          <Text
            style={{
              fontSize: 13,
              color: '#71717A',
              textAlign: 'center',
              lineHeight: 19,
              maxWidth: 290,
              marginBottom: 22,
            }}
          >
            Curate your personal atelier capsule. Tap the heart on any piece you love to save it for instant 18-minute doorstep try & buy.
          </Text>

          <AnimatedPressable
            onPress={onExplore}
            style={{
              backgroundColor: '#111111',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              EXPLORE ATELIER COLLECTION
            </Text>
            <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.4} />
          </AnimatedPressable>
        </View>
      </View>

      {/* Discovery Section: Trending Drops */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} color="#FF5A1F" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color: '#FF5A1F',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              CURATOR RECOMMENDATIONS
            </Text>
          </View>
        </View>

        <EditorialText
          first="Curate these"
          second="trending drops."
          fontSize={18}
          lineHeight={22}
          color="#111111"
          singleLine
          withDot
          style={{ marginBottom: 14 }}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {discoveryProducts.slice(0, 4).map((product) => (
            <View
              key={product.id}
              style={{
                width: '48.5%',
                marginBottom: 16,
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#E8E5DF',
              }}
            >
              <View style={{ width: '100%', height: 165, position: 'relative' }}>
                <Pressable onPress={() => onOpen(product)} style={{ width: '100%', height: '100%' }}>
                  <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </Pressable>

                <AnimatedPressable
                  onPress={() => onWishlist(product.id)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart size={15} color="#111111" strokeWidth={2} />
                </AnimatedPressable>
              </View>

              <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 8.5,
                    color: '#71717A',
                    fontWeight: '800',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {product.brand}
                </Text>

                <EditorialText
                  text={product.name}
                  fontSize={12.5}
                  lineHeight={16}
                  color="#111111"
                  singleLine
                  numberOfLines={1}
                  style={{ marginBottom: 4 }}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                    {formatPrice(product.price)}
                  </Text>
                  <AnimatedPressable
                    onPress={() => onBag(product.id)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: '#111111',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingBag size={12} color="#FFFFFF" strokeWidth={2.2} />
                  </AnimatedPressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});
