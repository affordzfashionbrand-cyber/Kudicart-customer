import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ruler, CheckCircle2 } from 'lucide-react-native';
import { AVAILABLE_SIZES } from './product-constants';
import { FontStyles } from '@/constants/theme';

interface ProductSizeSectionProps {
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onOpenSizeGuide: () => void;
  isDarkStoreProduct?: boolean;
  hasError?: boolean;
}

export function ProductSizeSection({
  selectedSize,
  onSelectSize,
  onOpenSizeGuide,
  isDarkStoreProduct,
  hasError = false,
}: ProductSizeSectionProps) {
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
          <Text style={[FontStyles.sansRegular, { fontSize: 11, color: hasError ? '#EA580C' : '#71717A' }]}>
            {hasError ? '• Choose your fit below' : '(Runs true to couture drape)'}
          </Text>
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
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {AVAILABLE_SIZES.map((sz) => {
          const isSelected = selectedSize === sz;
          return (
            <Pressable
              key={sz}
              onPress={() => onSelectSize(sz)}
              style={{
                flex: 1,
                height: 44,
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

      {/* Fit Prediction Meter */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          marginTop: 10,
          borderWidth: 1,
          borderColor: '#E8E5DF',
        }}
      >
        <CheckCircle2 size={13} color="#15803D" />
        <Text style={[FontStyles.sansMedium, { fontSize: 11, color: '#111111' }]}>
          <Text style={[FontStyles.sansBold, { color: '#15803D' }]}>94% of clients</Text> say this piece runs True to Couture Size
        </Text>
      </View>
    </View>
  );
}
