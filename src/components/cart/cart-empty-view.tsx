import React from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { ArrowLeft, Package, CheckCircle2 } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { CartTopDeals } from '@/components/cart/cart-top-deals';
import { MotionEditorialShowcase } from '@/components/common/motion-editorial-showcase';

export interface CartEmptyViewProps {
  paddingTop: number;
  router: any;
  safeBack: (router: any) => void;
  handleDealAddToCart: (product: any) => void;
  handleOpenProduct: (id: any) => void;
  cartProductIds: string[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  toastMessage?: string | null;
  toastAnim: Animated.Value;
}

export const CartEmptyView = React.memo(function CartEmptyView({
  paddingTop,
  router,
  safeBack,
  handleDealAddToCart,
  handleOpenProduct,
  cartProductIds,
  wishlist,
  toggleWishlist,
  toastMessage,
  toastAnim,
}: CartEmptyViewProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <View
        style={{
          paddingTop,
          backgroundColor: 'rgba(250, 248, 245, 0.96)',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          height: 60 + paddingTop,
          paddingHorizontal: 16,
        }}
      >
        <AnimatedPressable
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => safeBack(router)}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>
        <View style={{ flex: 1, alignItems: 'center', marginRight: 38 }}>
          <Text
            style={{
              fontSize: 9.5,
              fontWeight: '800',
              letterSpacing: 1.5,
              color: '#6B6667',
              textTransform: 'uppercase',
            }}
          >
            CHECKOUT
          </Text>
          <EditorialText first="Order" second="payment." fontSize={17} lineHeight={20} singleLine withDot />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#F0ECE4',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Package size={32} color="#111111" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#111111', marginBottom: 4 }}>
            Your bag is empty
          </Text>
          <Text
            style={{
              fontSize: 12.5,
              color: '#6B6667',
              textAlign: 'center',
              maxWidth: 280,
              lineHeight: 17,
              marginBottom: 18,
            }}
          >
            Explore our curated collections of artisanal wear or pick from trending top deals below.
          </Text>
          <AnimatedPressable
            style={{
              backgroundColor: '#111111',
              borderRadius: 999,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
            onPress={() => safeBack(router)}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800', letterSpacing: 1.1 }}>
              EXPLORE ATELIER
            </Text>
          </AnimatedPressable>
        </View>

        {/* Top Deals Curated For You in Empty Bag */}
        <View style={{ paddingHorizontal: 16 }}>
          <CartTopDeals
            onAddToCart={handleDealAddToCart}
            onOpenProduct={handleOpenProduct}
            cartProductIds={cartProductIds}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            title="Top Deals Curated For You"
            subtitle="EXCLUSIVE ATELIER DISCOUNTS • 18-MIN EXPRESS DROP"
          />

          <View style={{ marginTop: 24, marginBottom: 12 }}>
            <MotionEditorialShowcase onSelectProduct={handleOpenProduct} />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 40,
            alignSelf: 'center',
            backgroundColor: 'rgba(17, 17, 17, 0.95)',
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            zIndex: 99,
            transform: [{ translateY: toastAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <CheckCircle2 size={14} color="#22C55E" />
          <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
});
