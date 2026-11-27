import React from 'react';
import { View, Text } from 'react-native';
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { ProductCard } from '@/components/common/product-card';
import { EditorialText } from '@/components/common/section-title';
import { ProductItem } from '@/data/homeData';
import { useCartStore } from '@/store/useCartStore';

interface WishlistEmptyStateProps {
  discoveryProducts: ProductItem[];
  onExplore: () => void;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number, size?: string) => void;
  onOpen: (product: ProductItem) => void;
}

export const WishlistEmptyState = React.memo(function WishlistEmptyState({
  discoveryProducts,
  onExplore,
  onWishlist,
  onBag,
  onOpen,
}: WishlistEmptyStateProps) {
  const wishlistIds = useCartStore((s) => s.wishlist);
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
            Curate your personal atelier capsule. Tap the heart on any piece you love to save it for instant 19-minute doorstep try & buy.
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
            <View key={product.id} style={{ width: '48.5%', marginBottom: 16 }}>
              <ProductCard
                product={product}
                wished={wishlistIds.includes(String(product.id))}
                onWishlist={onWishlist}
                onBag={onBag}
                onOpen={onOpen}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});
