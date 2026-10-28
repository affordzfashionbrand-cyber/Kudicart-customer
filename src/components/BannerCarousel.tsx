import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import homepageData from '../../assets/homepage_data.json';

const { width } = Dimensions.get('window');

interface BannerCarouselProps {
  source?: 'ajio' | 'myntra';
}

export default function BannerCarousel({ source = 'ajio' }: BannerCarouselProps) {
  const data = source === 'ajio' ? homepageData.ajio_banners : homepageData.myntra_banners;
  const banners = (data || []).slice(0, 5);

  if (banners.length === 0) return null;

  return (
    <View className="my-4">
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        className="w-full"
      >
        {banners.map((url, index) => (
          <View key={index} style={{ width }} className="px-3">
            <View className="overflow-hidden rounded-2xl border-2 border-[#D9D9D5] bg-[#F4F1EA] shadow-sm">
              <LazyImage 
                source={url} 
                style={{ width: '100%', height: 192 }}
                contentFit="cover"
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
