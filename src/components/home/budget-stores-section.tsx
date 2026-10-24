import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { BUDGET_STORE_ITEMS, BudgetStoreItem } from '@/data/homeData';

interface BudgetStoresSectionProps {
  onSelectBudget: (item: BudgetStoreItem) => void;
  onViewAll: () => void;
}

export const BudgetStoresSection = React.memo(function BudgetStoresSection({
  onSelectBudget,
  onViewAll,
}: BudgetStoresSectionProps) {
  const { width: windowWidth } = useWindowDimensions();

  return (
    <View style={{ marginBottom: 32, paddingHorizontal: 6 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 10, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <SectionTitle
          label="PRICE STORES"
          firstLine="Shop by"
          secondLine="budget."
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

      {/* 2x2 Clean Grid of Budget Cards */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 4 }}>
        {BUDGET_STORE_ITEMS.map((item) => {
          const availableW = Math.min(windowWidth, 440) - 20;
          const bCardWidth = Math.floor((availableW - 10) / 2);
          const bCardHeight = Math.floor(bCardWidth * 1.18);

          return (
            <AnimatedPressable
              key={item.id}
              onPress={() => onSelectBudget(item)}
              containerStyle={{ width: bCardWidth }}
              style={{
                width: bCardWidth,
                height: bCardHeight,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: '#1E1D1E',
                borderWidth: 1.2,
                borderColor: '#D9D9D5',
                position: 'relative',
                shadowColor: '#111111',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 5,
                elevation: 3,
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={150}
              />

              {/* Top Vignette */}
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.35 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Bottom Dark Gradient for Text Legibility */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
                start={{ x: 0, y: 0.35 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Micro Badge Top Left */}
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  paddingHorizontal: 8,
                  paddingVertical: 3.5,
                  borderRadius: 6,
                  borderWidth: 0.5,
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 }}>
                  {item.badge}
                </Text>
              </View>

              {/* Content Bottom */}
              <View style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '900',
                    letterSpacing: 0.2,
                    textShadowColor: 'rgba(0,0,0,0.9)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {item.tier}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#E6E4DF',
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 2,
                  }}
                >
                  {item.tagline}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
});
