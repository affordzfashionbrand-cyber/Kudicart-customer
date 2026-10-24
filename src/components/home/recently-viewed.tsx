import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MockProduct } from '@/data/mockProducts';
import { ProductCard } from '@/components/home/product-card';
import { EditorialText } from '@/components/common/section-title';

interface RecentlyViewedProps {
  products: MockProduct[];
  wishlistIds: Set<string>;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MockProduct) => void;
  onClearHistory?: () => void;
}

export function RecentlyViewed({
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onClearHistory,
}: RecentlyViewedProps) {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>YOUR SELECTIONS • ARCHIVE</Text>
          <EditorialText
            first="Recently"
            second="viewed"
            fontSize={28}
            lineHeight={30}
            singleLine={true}
          />
        </View>

        {onClearHistory && (
          <TouchableOpacity
            onPress={onClearHistory}
            activeOpacity={0.7}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>CLEAR</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            isWishlisted={wishlistIds.has(item.id)}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
            cardWidth={160}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    backgroundColor: '#F7F7F5',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B6667',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B6667',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
