import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Star, ShieldCheck } from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';
import { formatPrice } from '@/data/homeData';
import { FontStyles } from '@/constants/theme';

interface ProductDetailsSectionProps {
  brand: string;
  title: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  savingsAmount: number;
  selectedColor: string;
  onSelectColor: (colorName: string, targetProductId?: string) => void;
  colors?: { name: string; hex: string; productId?: string; image?: string }[];
  certification?: string | null;
  stockBadge?: string | null;
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
  colors,
  certification,
  stockBadge,
}: ProductDetailsSectionProps) {
  const activeColorVariants = Array.isArray(colors) && colors.length > 0 ? colors : [];
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {/* Brand & Stock Row */}
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
          {brand}
        </Text>
        {stockBadge ? (
          <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={[FontStyles.sansBold, { fontSize: 8.5, color: '#71717A', textTransform: 'uppercase' }]}>
              {stockBadge}
            </Text>
          </View>
        ) : null}
      </View>

      <EditorialText
        text={title}
        fontSize={25}
        lineHeight={29}
        color="#111111"
        withDot
        style={{ marginBottom: 6 }}
      />

      {/* Ratings & Optional Certification */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          {reviewsCount > 0 ? (
            <>
              <Star size={13} color="#D4AF37" fill="#D4AF37" />
              <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#111111' }]}>{rating.toFixed(1)}</Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#71717A' }]}>
                ({reviewsCount} {reviewsCount === 1 ? 'verified review' : 'verified reviews'})
              </Text>
            </>
          ) : (
            <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#71717A' }]}>No reviews yet</Text>
          )}
        </View>

        {certification ? (
          <>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D9D9D5' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <ShieldCheck size={13} color="#10B981" />
              <Text style={[FontStyles.sansBold, { fontSize: 10.5, color: '#10B981' }]}>
                {certification}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Price Row */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
        <Text style={[FontStyles.sansBold, { fontSize: 24, color: '#111111' }]}>
          {formatPrice(price)}
        </Text>
        {originalPrice > price && (
          <Text style={[FontStyles.sansRegular, { fontSize: 14, color: '#A0A0A0', textDecorationLine: 'line-through' }]}>
            {formatPrice(originalPrice)}
          </Text>
        )}
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
        Inclusive of all taxes
      </Text>

      {/* Color Swatches (rendered only when product color variants exist) */}
      {activeColorVariants.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#111111' }]}>
              Color: <Text style={{ color: '#FF5A1F' }}>{selectedColor}</Text>
            </Text>
            <Text style={[FontStyles.sansMedium, { fontSize: 9.5, color: '#71717A' }]}>
              {activeColorVariants.length} {activeColorVariants.length === 1 ? 'Colorway' : 'Colorways'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {activeColorVariants.map((c: any) => {
              const isSelected = selectedColor === c.name;
              return (
                <Pressable
                  key={c.name}
                  onPress={() => onSelectColor(c.name, c.productId)}
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
      )}
    </View>
  );
}
