import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MOCK_BRANDS, BrandItem } from '@/data/mockBrands';
import { Icon } from '@/components/icon';
import { EditorialText } from '@/components/common/section-title';

interface BrandsSectionProps {
  onBrandPress?: (brand: BrandItem) => void;
}

export function BrandsSection({ onBrandPress }: BrandsSectionProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>ARCHIVE & LABELS • DROP 04</Text>
          <EditorialText
            first="Official"
            second="houses"
            fontSize={28}
            lineHeight={30}
            singleLine={true}
          />
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
          <Text style={styles.viewAllText}>ALL LABELS</Text>
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
        {MOCK_BRANDS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onBrandPress && onBrandPress(item)}
            activeOpacity={0.8}
            style={styles.brandCard}
          >
            {/* Emblem Circle */}
            <View
              style={[
                styles.emblemCircle,
                { backgroundColor: item.bgColor || '#111111' },
              ]}
            >
              <Text
                style={[
                  styles.emblemText,
                  { color: item.textColor || '#FFFFFF' },
                ]}
              >
                {item.logoInitial}
              </Text>
            </View>

            {/* Brand Name */}
            <Text style={styles.brandName} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Tagline */}
            <Text style={styles.brandTagline} numberOfLines={1}>
              {item.tagline}
            </Text>

            {/* Offer Pill */}
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{item.discountOffer}</Text>
            </View>
          </TouchableOpacity>
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
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  brandCard: {
    width: 140,
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
  },
  emblemCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  emblemText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111111',
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 10,
    color: '#6B6667',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
    fontWeight: '500',
  },
  offerBadge: {
    backgroundColor: '#F7F7F5',
    borderWidth: 1,
    borderColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offerText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: 0.3,
  },
});
