import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MockProduct } from '@/data/mockProducts';
import { ProductCard } from '@/components/home/product-card';
import { Icon } from '@/components/icon';
import { EditorialText } from '@/components/common/section-title';

interface DealCountdownSectionProps {
  dealProducts: MockProduct[];
  wishlistIds: Set<string>;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MockProduct) => void;
  onViewAllDeals?: () => void;
}

// 9 hours, 00 mins, 32 secs countdown in total seconds
const INITIAL_SECONDS = 9 * 3600 + 32;

export function DealCountdownSection({
  dealProducts,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onViewAllDeals,
}: DealCountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return INITIAL_SECONDS; // Auto-reset when reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Countdown Header Banner */}
      <View style={styles.headerBar}>
        <View style={styles.badgeLabelRow}>
          <View style={styles.boltIconWrap}>
            <Icon name="bolt" size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.eyebrow}>DROP_04 • FLASH ARCHIVE</Text>
            <EditorialText
              first="Drops expiring"
              second="in"
              fontSize={18}
              lineHeight={21}
              color="#ffffff"
              singleLine={true}
            />
          </View>
        </View>

        {/* Digit Boxes */}
        <View style={styles.timerRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeNumber}>{pad(hours)}</Text>
            <Text style={styles.timeUnit}>h</Text>
          </View>
          <Text style={styles.timeColon}>:</Text>
          <View style={styles.timeBox}>
            <Text style={styles.timeNumber}>{pad(minutes)}</Text>
            <Text style={styles.timeUnit}>m</Text>
          </View>
          <Text style={styles.timeColon}>:</Text>
          <View style={[styles.timeBox, styles.timeBoxSeconds]}>
            <Text style={[styles.timeNumber, styles.secondsNumber]}>
              {pad(seconds)}
            </Text>
            <Text style={styles.timeUnit}>s</Text>
          </View>
        </View>
      </View>

      {/* Horizontal Carousel of Deal Products */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
      >
        {dealProducts.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            isWishlisted={wishlistIds.has(item.id)}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
            cardWidth={175}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F1EA',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D9D9D5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boltIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#6B6667',
    letterSpacing: 1,
  },
  heading: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeBoxSeconds: {
    borderColor: '#111111',
    backgroundColor: '#F7F7F5',
  },
  timeNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111111',
  },
  secondsNumber: {
    color: '#111111',
  },
  timeUnit: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#6B6667',
    marginLeft: 2,
  },
  timeColon: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6B6667',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
