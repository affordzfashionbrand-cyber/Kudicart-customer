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
import { Icon } from '@/components/icon';
import { EditorialText } from '@/components/common/section-title';

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  products: MockProduct[];
  wishlistIds: Set<string>;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MockProduct) => void;
  onViewAll?: () => void;
  eyebrow?: string;
}

export function ProductCarouselSection({
  title,
  subtitle,
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onViewAll,
  eyebrow,
}: ProductCarouselSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <EditorialText
            text={title}
            fontSize={24}
            lineHeight={27}
            singleLine={true}
          />
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.7}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Icon name="arrow_forward" size={14} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            isWishlisted={wishlistIds.has(item.id)}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
            cardWidth={168}
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
  titleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B6667',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B6667',
    marginTop: 2,
    fontWeight: '500',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingBottom: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
