import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Star, ShieldCheck } from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';
import { formatPrice } from '@/data/homeData';
import { FontStyles } from '@/constants/theme';
import { COLOR_VARIANTS } from './product-constants';

interface ProductDetailsSectionProps {
  brand: string;
  title: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  savingsAmount: number;
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
}

export function ProductDetailsSection({
  brand,
  title,
  rating,
  reviewsCount,
  price,
  originalPrice,
  savingsAmount,
  selectedColor,
  onSelectColor,
}: ProductDetailsSectionProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {/* Brand & Edition Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text
          style={[
            FontStyles.sansBold,
            {
              fontSize: 9.5,
              color: '#FF5A1F',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            },
          ]}
        >
          {brand} • SIGNATURE RUNWAY COLLECTION
        </Text>
        <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
          <Text style={[FontStyles.sansBold, { fontSize: 8.5, color: '#71717A' }]}>LIMITED RUN</Text>
        </View>
      </View>

      <EditorialText
        text={title}
        fontSize={25}
        lineHeight={29}
        color="#111111"
        withDot
        style={{ marginBottom: 6 }}
      />

      {/* Ratings & Authenticity Trust */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Star size={13} color="#D4AF37" fill="#D4AF37" />
          <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#111111' }]}>{rating.toFixed(1)}</Text>
          <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#71717A' }]}>({reviewsCount} verified reviews)</Text>
        </View>

        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D9D9D5' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <ShieldCheck size={13} color="#10B981" />
          <Text style={[FontStyles.sansBold, { fontSize: 10.5, color: '#10B981' }]}>
            Silk Mark Certified
          </Text>
        </View>
      </View>

      {/* Price Row */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
        <Text style={[FontStyles.sansBold, { fontSize: 24, color: '#111111' }]}>
          {formatPrice(price)}
        </Text>
        <Text style={[FontStyles.sansRegular, { fontSize: 14, color: '#A0A0A0', textDecorationLine: 'line-through' }]}>
          {formatPrice(originalPrice)}
        </Text>
        {savingsAmount > 0 && (
          <View
            style={{
              backgroundColor: '#FFF0EA',
              paddingHorizontal: 7,
              paddingVertical: 2.5,
              borderRadius: 6,
            }}
          >
            <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#FF5A1F' }]}>
              SAVE {formatPrice(savingsAmount)}
            </Text>
          </View>
        )}
      </View>

      <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#8A8580' }]}>
        Inclusive of all artisan levies & hand-tied ceremonial packaging
      </Text>

      {/* Atelier Hue / Swatches */}
      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#111111' }]}>
            Atelier Shade: <Text style={{ color: '#FF5A1F' }}>{selectedColor}</Text>
          </Text>
          <Text style={[FontStyles.sansMedium, { fontSize: 9.5, color: '#71717A' }]}>3 Colorways</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {COLOR_VARIANTS.map((c) => {
            const isSelected = selectedColor === c.name;
            return (
              <Pressable
                key={c.name}
                onPress={() => onSelectColor(c.name)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  backgroundColor: isSelected ? '#FFFFFF' : '#F7F5F0',
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#111111' : '#E8E5DF',
                }}
              >
                <View
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 6.5,
                    backgroundColor: c.hex,
                    borderWidth: 1,
                    borderColor: '#D4AF37',
                  }}
                />
                <Text
                  style={[
                    isSelected ? FontStyles.sansBold : FontStyles.sansMedium,
                    {
                      fontSize: 10.5,
                      color: isSelected ? '#111111' : '#71717A',
                    },
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
