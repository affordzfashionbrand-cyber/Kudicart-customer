import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MockProduct } from '@/data/mockProducts';
import { Icon } from '@/components/icon';
import { EditorialText } from '@/components/common/section-title';
import { FontStyles } from '@/constants/theme';
import { LazyImage } from '@/components/common/lazy-image';

interface ProductCardProps {
  product: MockProduct;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MockProduct) => void;
  cardWidth?: number;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  cardWidth = 160,
}: ProductCardProps) {
  const router = useRouter();

  // Wishlist heart scale animation
  const [heartScale] = useState(() => new Animated.Value(1));

  // Add to cart feedback animation
  const [cartScale] = useState(() => new Animated.Value(1));

  const handleHeartPress = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        bounciness: 12,
        speed: 18,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleWishlist(product.id);
  };

  const handleAddToCart = () => {
    Animated.sequence([
      Animated.timing(cartScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(cartScale, {
        toValue: 1,
        bounciness: 10,
        speed: 16,
        useNativeDriver: true,
      }),
    ]).start();

    onAddToCart(product);
  };

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {/* Product Image Container */}
      <TouchableOpacity
        onPress={() => router.push(`/product/${product.id}` as any)}
        activeOpacity={0.9}
        style={styles.imageContainer}
      >
        <LazyImage
          source={{ uri: product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85' }}
          containerStyle={StyleSheet.absoluteFill}
          style={styles.productImage}
          contentFit="cover"
          priority="low"
        />

        {/* Bestseller / Category Badge */}
        {product.badge && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}

        {/* Stock Scarcity Tag */}
        {product.stockBadge && (
          <View style={styles.stockBadgePill}>
            <Text style={styles.stockBadgeText}>{product.stockBadge}</Text>
          </View>
        )}

        {/* Multi-angle Indicator on bottom-left */}
        <View style={styles.multiAngleIcon}>
          <Icon name="filter_none" size={12} color="#ffffff" />
        </View>

        {/* Wishlist Heart Button on bottom-right */}
        <TouchableOpacity
          onPress={handleHeartPress}
          activeOpacity={0.8}
          style={styles.wishlistBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Icon
              name={isWishlisted ? 'favorite' : 'favorite_border'}
              size={18}
              color={isWishlisted ? '#FF5A1F' : '#111111'}
            />
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        {/* Brand Name */}
        <Text style={styles.brandName} numberOfLines={1}>
          {product.brand}
        </Text>

        {/* Product Title */}
        <TouchableOpacity
          onPress={() => router.push(`/product/${product.id}` as any)}
          style={{ marginTop: 2, marginBottom: 2 }}
        >
          <EditorialText
            text={product.name}
            fontSize={12.5}
            lineHeight={16}
            color="#1b1b1e"
            singleLine={true}
            numberOfLines={1}
          />
        </TouchableOpacity>

        {/* Rating Stars & Count */}
        <View style={styles.ratingRow}>
          <View style={styles.starsWrapper}>
            <Icon name="star" size={13} color="#f59e0b" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
          <Text style={styles.reviewsCount}>({product.reviewsCount})</Text>
        </View>

        {/* Pricing Row: Sale Price, MRP strike, Discount % */}
        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>₹{product.price}</Text>
          <Text style={styles.mrpText}>₹{product.originalPrice}</Text>
          <Text style={styles.discountText}>
            {product.discountPercentage}% OFF
          </Text>
        </View>

        {/* Green Offer Price Pill */}
        <View style={styles.offerPriceRow}>
          <View style={styles.offerDot} />
          <Text style={styles.offerPriceText}>
            Offer price : <Text style={styles.offerBold}>₹{product.offerPrice}</Text>
          </Text>
        </View>

        {/* Add to Bag Button */}
        <Animated.View style={{ transform: [{ scale: cartScale }], marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleAddToCart}
            activeOpacity={0.85}
            style={styles.addBagBtn}
          >
            <Icon name="add_shopping_cart" size={15} color="#111111" />
            <Text style={styles.addBagText}>Add to Bag</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0edf1',
    marginRight: 12,
  },
  imageContainer: {
    width: '100%',
    height: 195,
    backgroundColor: '#f5f3f6',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#18181b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...FontStyles.sansBold,
    color: '#ffffff',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  stockBadgePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeText: {
    ...FontStyles.sansBold,
    color: '#b91c1c',
    fontSize: 8,
  },
  multiAngleIcon: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsContainer: {
    padding: 10,
  },
  brandName: {
    ...FontStyles.sansMedium,
    fontSize: 9.5,
    color: '#71717a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  productName: {
    ...FontStyles.sansBold,
    fontSize: 12,
    color: '#1b1b1e',
    marginTop: 2,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  starsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    ...FontStyles.sansBold,
    fontSize: 11,
    color: '#1b1b1e',
  },
  reviewsCount: {
    ...FontStyles.sansRegular,
    fontSize: 10.5,
    color: '#a1a1aa',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  salePrice: {
    ...FontStyles.sansBold,
    fontSize: 13.5,
    color: '#1b1b1e',
  },
  mrpText: {
    ...FontStyles.sansRegular,
    fontSize: 11,
    color: '#a1a1aa',
    textDecorationLine: 'line-through',
  },
  discountText: {
    ...FontStyles.sansBold,
    fontSize: 10,
    color: '#16a34a',
  },
  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  offerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16a34a',
  },
  offerPriceText: {
    ...FontStyles.sansMedium,
    fontSize: 10.5,
    color: '#16a34a',
  },
  offerBold: {
    ...FontStyles.sansBold,
  },
  addBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F4F1EA',
    borderWidth: 1,
    borderColor: '#D9D9D5',
    borderRadius: 8,
    paddingVertical: 6,
  },
  addBagText: {
    ...FontStyles.sansBold,
    fontSize: 11,
    color: '#111111',
  },
});
