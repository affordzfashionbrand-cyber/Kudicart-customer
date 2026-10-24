import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { VENDOR_BRAND_TILES, VendorBrandTile } from '@/data/homeData';

interface VendorSpotlightSectionProps {
  onSelectBrand: (tile: VendorBrandTile) => void;
  onViewAll: () => void;
}

export const VendorSpotlightSection = React.memo(function VendorSpotlightSection({
  onSelectBrand,
  onViewAll,
}: VendorSpotlightSectionProps) {
  const { width: windowWidth } = useWindowDimensions();

  return (
    <View style={{ marginBottom: 36, paddingHorizontal: 6 }}>
      {/* Section Header */}
      <View style={{ paddingHorizontal: 10, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <SectionTitle
          label="ARCHIVE & LABELS"
          firstLine="Brand"
          secondLine="spotlight."
          marginBottom={0}
        />
        <Pressable
          onPress={onViewAll}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 3 }}
        >
          <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#111111' }}>View All</Text>
          <ChevronRight size={14} color="#111111" />
        </Pressable>
      </View>

      {/* 3x3 Grid of Brand Tiles with 2.5px borders */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start', paddingHorizontal: 4 }}>
        {VENDOR_BRAND_TILES.map((tile) => {
          const availableWidth = Math.min(windowWidth, 440) - 20;
          const tileWidth = Math.floor((availableWidth - 6) / 3);
          const tileHeight = Math.floor(tileWidth * 1.48);

          return (
            <Pressable
              key={tile.id}
              onPress={() => onSelectBrand(tile)}
              style={({ pressed }) => ({
                width: tileWidth,
                height: tileHeight,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                backgroundColor: '#1f2937',
                opacity: pressed ? 0.94 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              {/* Background Model Image */}
              <Image
                source={{ uri: tile.image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={150}
              />

              {/* Subtle Top Vignette for Contrast */}
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.25 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Bottom Dark Gradient for Legibility */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.92)']}
                start={{ x: 0, y: 0.38 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Brand Name & Discount Overlay */}
              <View style={{ position: 'absolute', bottom: 8, left: 4, right: 4, alignItems: 'center' }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#ffffff',
                    fontSize: tile.subBrand ? 12 : 11,
                    fontWeight: '900',
                    letterSpacing: tile.brand.length <= 5 ? 1.5 : 0.4,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    textShadowColor: 'rgba(0,0,0,0.85)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {tile.brand}
                </Text>

                {tile.subBrand && (
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#e4e4e7',
                      fontSize: 7,
                      fontWeight: '800',
                      letterSpacing: 0.8,
                      textAlign: 'center',
                      marginTop: -1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {tile.subBrand}
                  </Text>
                )}

                {/* Discount Text */}
                <View style={{ marginTop: 2.5, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 9.5,
                      fontWeight: '800',
                      letterSpacing: 0.2,
                      textAlign: 'center',
                      lineHeight: 12,
                    }}
                  >
                    {tile.discount}
                  </Text>
                  {tile.extraDiscount && (
                    <Text
                      style={{
                        color: '#111111',
                        fontSize: 8.5,
                        fontWeight: '800',
                        textAlign: 'center',
                        lineHeight: 11,
                      }}
                    >
                      {tile.extraDiscount}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
