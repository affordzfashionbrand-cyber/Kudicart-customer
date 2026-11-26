import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { TrendingCityItem } from '@/data/homeData';
import { useHomeContentStore } from '@/store/useHomeContentStore';
import { useCatalogStore } from '@/store/useCatalogStore';

export interface TrendingCitySectionProps {
  onItemPress: (item: TrendingCityItem) => void;
}

export const TrendingCitySection = React.memo(function TrendingCitySection({
  onItemPress,
}: TrendingCitySectionProps) {
  const cmsItems = useHomeContentStore((s) => s.curatedSections['TRENDING_CITY']);
  const catalogProducts = useCatalogStore((s) => s.products);

  const items = useMemo<TrendingCityItem[]>(() => {
    if (Array.isArray(cmsItems) && cmsItems.length > 0) {
      return cmsItems.map((it: any, idx: number) => {
        const meta = it.metadata || {};
        const gender =
          meta.gender === 'Men' || meta.gender === 'Women' || meta.gender === 'Kids'
            ? meta.gender
            : 'All';
        return {
          id: String(it.id || `cms-city-${idx}`),
          label: String(it.title || 'Trending Edit'),
          genderTarget: gender,
          wearTarget: meta.wear || undefined,
          searchQuery: String(it.actionValue || it.title || ''),
          image: String(it.imageUrl || ''),
        };
      });
    }
    return catalogProducts
      .filter((p) => Boolean(p.image))
      .slice(0, 6)
      .map((p) => {
        const gender =
          p.gender === 'Men' || p.gender === 'Women' || p.gender === 'Kids' ? p.gender : 'All';
        return {
          id: `city-${p.id}`,
          label: `${gender !== 'All' ? `${gender} - ` : ''}${p.brand}`,
          genderTarget: gender,
          wearTarget: p.wear || undefined,
          searchQuery: p.title,
          image: p.image,
        };
      });
  }, [cmsItems, catalogProducts]);

  if (items.length === 0) return null;

  return (
    <View style={{ marginBottom: 26, marginTop: 4 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle
          label="LOCAL DISCOVERY"
          firstLine="Trending in"
          secondLine="your city."
          marginBottom={16}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
      >
        {items.map((item) => (
          <AnimatedPressable
            key={item.id}
            onPress={() => onItemPress(item)}
            containerStyle={{ width: 144, alignItems: 'center' }}
            style={{ width: 144, alignItems: 'center' }}
          >
            <View
              style={{
                width: 144,
                height: 196,
                borderRadius: 22,
                overflow: 'hidden',
                backgroundColor: '#F4F1EA',
                borderWidth: 1,
                borderColor: '#E6E4DF',
                shadowColor: '#111111',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                recyclingKey={item.id}
                transition={150}
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#111111',
                textAlign: 'center',
                marginTop: 10,
                letterSpacing: -0.1,
              }}
            >
              {item.label}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
});
