import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Sparkles,
  Zap,
  Tag,
  Star,
  Check,
  Plus,
  Heart,
  ChevronRight,
} from 'lucide-react-native';
import { formatPrice } from '@/data/homeData';
import { PulsingRadarBeacon } from '@/components/common/pulsing-radar-beacon';
import { AnimatedPriceTicker } from '@/components/common/animated-price-ticker';

export interface DealProduct {
  id: string;
  brand: string;
  title: string;
  price: number;
  originalPrice: number;
  discountBadge: string;
  rating: number;
  reviewsCount: number;
  category: 'Ethnic' | 'Western' | 'Footwear' | 'Accessories';
  deliveryMinutes: number;
  image: string;
  sizes: string[];
}

export const TOP_CART_DEALS: DealProduct[] = [
  {
    id: 'deal-anarkali-102',
    brand: 'Avanya Ethnic',
    title: 'Embroidered Anarkali Kurta Set',
    price: 1299,
    originalPrice: 2499,
    discountBadge: '48% OFF',
    rating: 4.8,
    reviewsCount: 142,
    category: 'Ethnic',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'deal-cotton-shirt-104',
    brand: 'Studio 04',
    title: 'Structured Pure Cotton Shirt',
    price: 1890,
    originalPrice: 3990,
    discountBadge: '53% OFF',
    rating: 4.8,
    reviewsCount: 89,
    category: 'Western',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=800&q=85',
    sizes: ['38', '40', '42', '44'],
  },
  {
    id: 'deal-floral-maxi-103',
    brand: 'Gulabi Studio',
    title: 'Tiered Floral Rayon Maxi Dress',
    price: 999,
    originalPrice: 1999,
    discountBadge: '50% OFF',
    rating: 4.7,
    reviewsCount: 215,
    category: 'Western',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=85',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'deal-saree-101',
    brand: 'Varanasi Looms',
    title: 'Handloom Cotton Saree with Zari',
    price: 1849,
    originalPrice: 3190,
    discountBadge: '42% OFF',
    rating: 4.9,
    reviewsCount: 98,
    category: 'Ethnic',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    sizes: ['Free Size'],
  },
  {
    id: 'deal-leather-tote-3',
    brand: 'Forme Atelier',
    title: 'Minimal Leather Crossbody Tote',
    price: 1790,
    originalPrice: 3890,
    discountBadge: '54% OFF',
    rating: 4.9,
    reviewsCount: 112,
    category: 'Accessories',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85',
    sizes: ['Standard'],
  },
  {
    id: 'deal-trousers-105',
    brand: 'Aurel',
    title: 'Wide Leg Tailored Wool Trousers',
    price: 2990,
    originalPrice: 5490,
    discountBadge: '46% OFF',
    rating: 4.7,
    reviewsCount: 52,
    category: 'Western',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=800&q=85',
    sizes: ['28', '30', '32', '34'],
  },
  {
    id: 'deal-sunglasses-addon-1',
    brand: 'Kudi Eyewear',
    title: 'Midnight Square Acetate Shades',
    price: 1290,
    originalPrice: 2490,
    discountBadge: '48% OFF',
    rating: 4.8,
    reviewsCount: 78,
    category: 'Accessories',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
    sizes: ['Standard'],
  },
  {
    id: 'deal-sneaker-8',
    brand: 'Studio 04',
    title: 'Court Minimal Leather Sneaker',
    price: 3990,
    originalPrice: 6990,
    discountBadge: '43% OFF',
    rating: 4.8,
    reviewsCount: 63,
    category: 'Footwear',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=85',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
  },
  {
    id: 'deal-chanderi-106',
    brand: 'Maison Silk',
    title: 'Chanderi Festive Silk Kurta Set',
    price: 4990,
    originalPrice: 8990,
    discountBadge: '45% OFF',
    rating: 4.9,
    reviewsCount: 114,
    category: 'Ethnic',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'deal-selvedge-108',
    brand: 'Novalis',
    title: 'Raw Selvedge Rigid Denim',
    price: 3690,
    originalPrice: 5890,
    discountBadge: '37% OFF',
    rating: 4.8,
    reviewsCount: 46,
    category: 'Western',
    deliveryMinutes: 18,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=85',
    sizes: ['30', '32', '34', '36'],
  },
];

type DealTab = 'ALL' | 'FLASH' | 'UNDER1999' | 'BESTSELLER';

interface CartTopDealsProps {
  onAddToCart: (deal: DealProduct) => void;
  onOpenProduct: (productId: string) => void;
  cartProductIds?: string[];
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  title?: string;
  subtitle?: string;
}

export const CartTopDeals: React.FC<CartTopDealsProps> = ({
  onAddToCart,
  onOpenProduct,
  cartProductIds = [],
  wishlist = [],
  onToggleWishlist,
  title = 'Top Deals Curated For You',
  subtitle = 'EXCLUSIVE ATELIER DISCOUNTS • 18-MIN EXPRESS DROP',
}) => {
  const [activeTab, setActiveTab] = useState<DealTab>('ALL');
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (newTab: DealTab) => {
    if (newTab === activeTab) return;
    Animated.parallel([
      Animated.timing(tabFadeAnim, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(tabSlideAnim, {
        toValue: 8,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setActiveTab(newTab);
      Animated.parallel([
        Animated.timing(tabFadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(tabSlideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    });
  };

  const filteredDeals = useMemo(() => {
    switch (activeTab) {
      case 'FLASH':
        return TOP_CART_DEALS.filter((d) => {
          const discountNum = parseInt(d.discountBadge, 10) || 0;
          return discountNum >= 45;
        });
      case 'UNDER1999':
        return TOP_CART_DEALS.filter((d) => d.price < 2000);
      case 'BESTSELLER':
        return TOP_CART_DEALS.filter((d) => d.rating >= 4.8);
      case 'ALL':
      default:
        return TOP_CART_DEALS;
    }
  }, [activeTab]);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 16,
      }}
    >
      {/* Header with Sparkles / Deal badge */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#FFF1ED',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={14} color="#FF5A1F" fill="#FF5A1F" />
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                color: '#FF5A1F',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {subtitle}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: '#ECFDF5',
              paddingHorizontal: 7,
              paddingVertical: 2.5,
              borderRadius: 6,
            }}
          >
            <Sparkles size={11} color="#059669" />
            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#065F46' }}>UP TO 54% OFF</Text>
          </View>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
          {title}
        </Text>
      </View>

      {/* Filter Tabs Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
      >
        {[
          { id: 'ALL', label: '🔥 All Deals' },
          { id: 'FLASH', label: '⚡ Flash Drops (45%+ Off)' },
          { id: 'UNDER1999', label: '🏷️ Under ₹1,999' },
          { id: 'BESTSELLER', label: '⭐ Best Sellers' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handleTabChange(tab.id as DealTab)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isSelected ? '#111111' : '#E8E5DF',
                backgroundColor: isSelected ? '#111111' : pressed ? '#F4F1EA' : '#FAF8F5',
              })}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? '#FFFFFF' : '#4A4A4A',
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Deals Horizontal Carousel */}
      <Animated.View style={{ opacity: tabFadeAnim, transform: [{ translateY: tabSlideAnim }] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
        >
        {filteredDeals.map((deal) => {
          const isAdded = cartProductIds.includes(deal.id);
          const isWished = wishlist.includes(deal.id);
          const savings = deal.originalPrice - deal.price;

          return (
            <View
              key={deal.id}
              style={{
                width: 172,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E8E5DF',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              {/* Product Image Stage */}
              <Pressable
                onPress={() => onOpenProduct(deal.id)}
                style={{ width: '100%', height: 160, position: 'relative', backgroundColor: '#F4F1EA' }}
              >
                <Image
                  source={{ uri: deal.image }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />

                {/* Discount Badge */}
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: '#DC2626',
                    paddingHorizontal: 6,
                    paddingVertical: 2.5,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF' }}>
                    {deal.discountBadge}
                  </Text>
                </View>

                {/* Wishlist Heart Icon */}
                {onToggleWishlist && (
                  <Pressable
                    onPress={() => onToggleWishlist(deal.id)}
                    hitSlop={8}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 2,
                    }}
                  >
                    <Heart
                      size={14}
                      color={isWished ? '#EF4444' : '#111111'}
                      fill={isWished ? '#EF4444' : 'transparent'}
                    />
                  </Pressable>
                )}

                {/* 18-Min Express Pill */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    left: 8,
                    backgroundColor: 'rgba(17, 17, 17, 0.85)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <PulsingRadarBeacon size={5} color="#4ADE80" />
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#FFFFFF' }}>
                    18-MIN DROP
                  </Text>
                </View>
              </Pressable>

              {/* Product Info & Price */}
              <View style={{ padding: 10, flex: 1, justifyContent: 'space-between' }}>
                <Pressable onPress={() => onOpenProduct(deal.id)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text
                      style={{
                        fontSize: 9.5,
                        fontWeight: '900',
                        color: '#6B6667',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {deal.brand}
                    </Text>

                    {/* Rating Pill */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Star size={10} color="#EAB308" fill="#EAB308" />
                      <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#111111' }}>
                        {deal.rating}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 11.5,
                      fontWeight: '700',
                      color: '#111111',
                      marginTop: 2,
                      lineHeight: 15,
                    }}
                    numberOfLines={1}
                  >
                    {deal.title}
                  </Text>

                  {/* Pricing row */}
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 4 }}>
                    <AnimatedPriceTicker
                      value={deal.price}
                      style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#A0A0A0',
                        textDecorationLine: 'line-through',
                      }}
                    >
                      {formatPrice(deal.originalPrice)}
                    </Text>
                  </View>

                  {savings > 0 && (
                    <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#15803D', marginTop: 1 }}>
                      Save {formatPrice(savings)}
                    </Text>
                  )}
                </Pressable>

                {/* Add to Bag Action Button */}
                <Pressable
                  onPress={() => onAddToCart(deal)}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    backgroundColor: isAdded ? '#ECFDF5' : pressed ? '#222222' : '#111111',
                    borderWidth: 1,
                    borderColor: isAdded ? '#A7F3D0' : '#111111',
                    borderRadius: 10,
                    paddingVertical: 7,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 4,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${deal.title} to bag`}
                >
                  {isAdded ? (
                    <>
                      <Check size={12} color="#059669" strokeWidth={3} />
                      <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#059669' }}>
                        ADDED ✓
                      </Text>
                    </>
                  ) : (
                    <>
                      <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                      <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 }}>
                        ADD TO BAG
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};
