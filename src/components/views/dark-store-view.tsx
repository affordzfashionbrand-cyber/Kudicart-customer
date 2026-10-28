import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Zap,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Store,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { ProductCard } from '@/components/common/product-card';
import { useDarkStore } from '@/store/useDarkStore';
import { useCartStore } from '@/store/useCartStore';
import { ProductItem, DEFAULT_PRODUCTS } from '@/data/homeData';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface DarkStoreViewProps {
  products?: ProductItem[];
  wishlist?: string[];
  onWishlist?: (id: string | number) => void;
  onBag?: (id: string | number) => void;
  onOpen?: (product: any) => void;
  onOpenDarkStoreModal?: () => void;
}
export const DarkStoreView = React.memo(function DarkStoreView({
  products = DEFAULT_PRODUCTS,
  wishlist = [],
  onWishlist,
  onBag,
  onOpen,
  onOpenDarkStoreModal,
}: DarkStoreViewProps) {
  const router = useRouter();
  const { selectedDarkStore, darkStores, openDarkStoreModal } = useDarkStore();
  const { addItem, toggleWishlist: storeToggleWishlist, wishlist: storeWishlist } = useCartStore();

  // Active store fallback to Indiranagar Hub if none selected
  const currentStore = selectedDarkStore || darkStores[0];

  const effectiveWishlist = wishlist.length > 0 ? wishlist : storeWishlist;

  const handleWishlist = (id: string | number) => {
    if (onWishlist) {
      onWishlist(id);
    } else {
      storeToggleWishlist(String(id));
    }
  };

  const handleBag = (product: ProductItem) => {
    if (onBag) {
      onBag(product.id);
    } else {
      addItem({
        id: String(product.id),
        brand: product.brand,
        title: product.name,
        description: '',
        price: product.price,
        originalPrice: product.old,
        discount: '',
        rating: Number(product.rating) || 4.8,
        reviewsCount: 120,
        stockQuantity: 10,
        readyToShip: true,
        sizes: ['S', 'M', 'L'],
        image: product.image,
        altText: product.name,
        galleryImages: [product.image],
        category: product.category,
      });
    }
  };

  const handleProductPress = (product: ProductItem) => {
    if (onOpen) {
      onOpen(product);
    } else {
      router.push(`/product/${product.id}` as any);
    }
  };

  const filteredProducts = products;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#FAF8F5' }}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      {/* Top Hero Section: Luxury Fashion Atelier / Dark Store with Atmospheric Background */}
      <View
        style={{
          position: 'relative',
          paddingTop: 24,
          paddingBottom: 26,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: 'hidden',
          backgroundColor: '#111111',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        {/* Atmospheric Dark Store Boutique Background Image */}
        <Image
          source={require('@/assets/images/dark-store-vault.jpg')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
          contentFit="cover"
          priority="high"
          transition={300}
        />

        {/* Cinematic Dark Obsidian Vignette - perfectly tuned so the dark store warehouse racks & warm lighting remain clearly visible while keeping text 100% legible */}
        <LinearGradient
          colors={[
            'rgba(14, 14, 14, 0.72)',
            'rgba(14, 14, 14, 0.40)',
            'rgba(14, 14, 14, 0.88)',
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Ambient Terracotta / Amber Warm Radial Glow */}
        <LinearGradient
          colors={['rgba(255, 90, 31, 0.15)', 'transparent', 'rgba(154, 63, 23, 0.35)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Foreground Content */}
        <View style={{ position: 'relative', zIndex: 10 }}>
          {/* Eyebrow with live pulse */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: '#FF5A1F',
              }}
            />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '900',
                color: '#FF5A1F',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              HYPER-LOCAL FULFILLMENT VAULT
            </Text>
          </View>

          {/* Signature Dual Typography */}
          <EditorialText
            first="Select Dark"
            second="Store"
            fontSize={32}
            color="#ffffff"
            withDot
          />

          <Text
            style={{
              fontSize: 13,
              color: '#A0A0A0',
              marginTop: 6,
              lineHeight: 18,
            }}
          >
            Instant doorstep delivery in {currentStore.deliveryMinutes} mins directly from your neighborhood fashion dark store.
          </Text>

          {/* Interactive Connected Dark Store Hub Card */}
          <AnimatedPressable
            onPress={onOpenDarkStoreModal || openDarkStoreModal}
            style={{
              marginTop: 18,
              backgroundColor: 'rgba(26, 22, 19, 0.88)',
              borderWidth: 1.5,
              borderColor: '#FF5A1F',
              borderRadius: 20,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#FF5A1F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: '#9A3412',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Store size={22} color="#ffffff" />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontWeight: '900',
                      color: '#ffffff',
                      letterSpacing: -0.2,
                    }}
                    numberOfLines={1}
                  >
                    {currentStore.name}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <MapPin size={11} color="#FF5A1F" />
                  <Text style={{ fontSize: 11, color: '#CCCCCC' }}>
                    {currentStore.locality} • <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{currentStore.distanceKm} km</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Switch Hub Button */}
            <View
              style={{
                backgroundColor: '#FF5A1F',
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Zap size={11} color="#ffffff" fill="#ffffff" />
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#ffffff' }}>
                {currentStore.deliveryMinutes}m Drop
              </Text>
              <ChevronRight size={13} color="#ffffff" />
            </View>
          </AnimatedPressable>

          {/* Live Features Pill Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <Clock size={11} color="#FF5A1F" />
              <Text style={{ fontSize: 10.5, color: '#E0E0E0', fontWeight: '700' }}>
                Packed in 2 mins
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <ShieldCheck size={11} color="#4ADE80" />
              <Text style={{ fontSize: 10.5, color: '#E0E0E0', fontWeight: '700' }}>
                Doorstep Try & Buy
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <Sparkles size={11} color="#FFD700" />
              <Text style={{ fontSize: 10.5, color: '#E0E0E0', fontWeight: '700' }}>
                Fresh Steam Pressed
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Count & Status Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingHorizontal: 20,
          marginTop: 20,
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 2,
              color: '#71717A',
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
          >
            HYPER-LOCAL ATELIER
          </Text>
          <EditorialText
            first="Curated"
            second="styles."
            fontSize={23}
            lineHeight={26}
            singleLine={true}
            color="#111111"
            withDot
          />
          <Text style={{ fontSize: 11, color: '#6B6667', fontWeight: '500', marginTop: 2 }}>
            {filteredProducts.length} styles • Ready for {currentStore.deliveryMinutes}-min doorstep drop
          </Text>
        </View>

        <Pressable
          onPress={onOpenDarkStoreModal || openDarkStoreModal}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingBottom: 4 }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF5A1F' }}>
            Switch Store Hub
          </Text>
          <ChevronRight size={13} color="#FF5A1F" />
        </Pressable>
      </View>

      {/* Product Catalog Grid (2 Columns using Affordz's signature ProductCard) */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      >
        {filteredProducts.map((product) => (
          <View key={product.id} style={{ width: '48.5%', marginBottom: 18 }}>
            <ProductCard
              product={product}
              badge={`${currentStore.deliveryMinutes}M DROP`}
              wished={effectiveWishlist.includes(String(product.id))}
              onWishlist={() => handleWishlist(product.id)}
              onBag={() => handleBag(product)}
              onOpen={() => handleProductPress(product)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
});
