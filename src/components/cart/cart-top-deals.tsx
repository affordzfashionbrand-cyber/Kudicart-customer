import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { catalogApi, ApiProduct } from '@/services/api';
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
  category: string;
  deliveryMinutes: number;
  image: string;
  sizes: string[];
  stockQuantity?: number;
  readyToShip?: boolean;
  tryAndBuyEligible?: boolean;
  fulfillmentType?: string;
}

export const TOP_CART_DEALS: DealProduct[] = [];

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
  subtitle = 'EXCLUSIVE ATELIER DISCOUNTS â€¢ 19-MIN EXPRESS DROP',
}) => {
  const [deals, setDeals] = useState<DealProduct[]>([]);
  const [activeTab, setActiveTab] = useState<DealTab>('ALL');
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    catalogApi
      .getProducts({ limit: 12, sort: 'popular' })
      .then((products: ApiProduct[]) => {
        if (!active || !Array.isArray(products)) return;
        const mapped: DealProduct[] = products.map((p) => {
          const orig = Number(p.originalPrice || p.price || 0);
          const curr = Number(p.price || 0);
          const pct = orig > curr ? Math.round(((orig - curr) / orig) * 100) : 0;
          return {
            id: p.id,
            brand: p.brand,
            title: p.title,
            price: curr,
            originalPrice: orig,
            discountBadge: pct > 0 ? `${pct}% OFF` : p.discount || 'DEAL',
            rating: Number(p.rating) || 4.8,
            reviewsCount: Number(p.reviewsCount) || 0,
            category: p.wear || p.category || 'Fashion',
            deliveryMinutes: 18,
            image: p.image,
            sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['M'],
            stockQuantity: p.stockQuantity,
            readyToShip: p.readyToShip,
            tryAndBuyEligible: p.tryAndBuyEligible,
            fulfillmentType: p.fulfillmentType,
          };
        });
        setDeals(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
        return deals.filter((d) => {
          const discountNum = parseInt(d.discountBadge, 10) || 0;
          return discountNum >= 40;
        });
      case 'UNDER1999':
        return deals.filter((d) => d.price < 2000);
      case 'BESTSELLER':
        return deals.filter((d) => d.rating >= 4.8);
      case 'ALL':
      default:
        return deals;
    }
  }, [activeTab, deals]);

  if (deals.length === 0) return null;

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
          { id: 'ALL', label: 'ðŸ”¥ All Deals' },
          { id: 'FLASH', label: 'âš¡ Flash Drops (45%+ Off)' },
          { id: 'UNDER1999', label: 'ðŸ·ï¸ Under â‚¹1,999' },
          { id: 'BESTSELLER', label: 'â­ Best Sellers' },
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
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      onToggleWishlist(deal.id);
                    }}
                    hitSlop={10}
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

                {/* 19-Min Express Pill */}
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
                    19-MIN DROP
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
                        ADDED âœ“
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
