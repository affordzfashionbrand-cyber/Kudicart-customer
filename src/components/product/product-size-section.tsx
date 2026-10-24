import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ruler, CheckCircle2, Check } from 'lucide-react-native';
import { AVAILABLE_SIZES } from './product-constants';

interface ProductSizeSectionProps {
  selectedSize: string;
  onSelectSize: (size: string) => void;
  onOpenSizeGuide: () => void;
  isDarkStoreProduct: boolean;
  dualSizeTrial: boolean;
  onToggleDualSizeTrial: () => void;
  adjacentSize: string;
}

export function ProductSizeSection({
  selectedSize,
  onSelectSize,
  onOpenSizeGuide,
  isDarkStoreProduct,
  dualSizeTrial,
  onToggleDualSizeTrial,
  adjacentSize,
}: ProductSizeSectionProps) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Select Size</Text>
          <Text style={{ fontSize: 11, color: '#71717A' }}>(Runs true to couture drape)</Text>
        </View>

        <Pressable
          onPress={onOpenSizeGuide}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Ruler size={12} color="#FF5A1F" />
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF5A1F' }}>Size Guide</Text>
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
                borderWidth: 1,
                borderColor: isSelected ? '#111111' : '#E5E0D8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '900',
                  color: isSelected ? '#FFFFFF' : '#111111',
                }}
              >
                {sz}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Fit Prediction Meter (Myntra Standard) */}
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
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#111111' }}>
          <Text style={{ fontWeight: '900', color: '#15803D' }}>94% of clients</Text> say this piece runs True to Couture Size
        </Text>
      </View>

      {/* Dual-Size Trial Checkbox (ONLY FOR DARK STORE) */}
      {isDarkStoreProduct && (
        <Pressable
          onPress={onToggleDualSizeTrial}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 12,
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#E8E5DF',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              backgroundColor: dualSizeTrial ? '#111111' : '#F7F5F0',
              borderWidth: 1.5,
              borderColor: dualSizeTrial ? '#111111' : '#C8C4BC',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {dualSizeTrial && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>
                Send adjacent backup size ({adjacentSize}) for trial
              </Text>
              <View style={{ backgroundColor: '#FFF0EA', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: '900', color: '#FF5A1F' }}>ZERO COST</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10.5, color: '#71717A', marginTop: 2, lineHeight: 14 }}>
              Rider carries both sizes. You test both fits in mirror and retain the winner instantly.
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}
