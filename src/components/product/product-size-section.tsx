import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ruler } from 'lucide-react-native';
import { AVAILABLE_SIZES } from './product-constants';
import { FontStyles } from '@/constants/theme';

interface ProductSizeSectionProps {
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onOpenSizeGuide: () => void;
  sizes?: string[];
  isDarkStoreProduct?: boolean;
  hasError?: boolean;
}

export function ProductSizeSection({
  selectedSize,
  onSelectSize,
  onOpenSizeGuide,
  sizes,
  isDarkStoreProduct,
  hasError = false,
}: ProductSizeSectionProps) {
  const activeSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : AVAILABLE_SIZES;

  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 18,
        paddingVertical: hasError ? 8 : 0,
        backgroundColor: hasError ? 'rgba(255, 90, 31, 0.05)' : 'transparent',
        borderRadius: 16,
        borderWidth: hasError ? 1.5 : 0,
        borderColor: hasError ? '#FF5A1F' : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[FontStyles.sansBold, { fontSize: 13, color: hasError ? '#FF5A1F' : '#111111' }]}>
            {hasError ? 'Select Size (Required)' : 'Select Size'}
          </Text>
          {hasError ? (
            <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#EA580C' }]}>
              • Choose your fit below
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onOpenSizeGuide}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Ruler size={12} color="#FF5A1F" />
          <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#FF5A1F' }]}>Size Guide</Text>
        </Pressable>
      </View>

      {/* Size Chips */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {activeSizes.map((sz) => {
          const isSelected = selectedSize === sz;
          return (
            <Pressable
              key={sz}
              onPress={() => onSelectSize(sz)}
              style={{
                flex: activeSizes.length <= 6 ? 1 : undefined,
                minWidth: 48,
                height: 44,
                paddingHorizontal: 10,
                borderRadius: 14,
                backgroundColor: isSelected ? '#111111' : '#FFFFFF',
                borderWidth: isSelected ? 1.5 : hasError ? 1.5 : 1,
                borderColor: isSelected ? '#111111' : hasError ? '#FF5A1F' : '#E5E0D8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={[
                  FontStyles.sansBold,
                  {
                    fontSize: 13,
                    color: isSelected ? '#FFFFFF' : '#111111',
                  },
                ]}
              >
                {sz}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
