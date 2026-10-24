import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { HERO_BANNERS, HeroBannerItem } from '@/data/homeData';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';

export interface HeroBannerSectionProps {
  onBannerPress: (banner: HeroBannerItem) => void;
}

export const HeroBannerSection = React.memo(function HeroBannerSection({
  onBannerPress,
}: HeroBannerSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const bannerWidth = Math.min(windowWidth, 440) - 32;
  const bannerHeight = 215;

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerFlatListRef = useRef<FlatList<HeroBannerItem>>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isInteractingRef.current) return;
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % HERO_BANNERS.length;
        bannerFlatListRef.current?.scrollToOffset({
          offset: next * bannerWidth,
          animated: true,
        });
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [bannerWidth]);

  return (
    <View style={{ alignItems: 'center', marginBottom: 22 }}>
      <View
        style={{
          width: bannerWidth,
          height: bannerHeight,
          borderRadius: 22,
          overflow: 'hidden',
          backgroundColor: '#18181b',
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <FlatList
          ref={bannerFlatListRef}
          data={HERO_BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          overScrollMode="never"
          keyExtractor={(item) => item.id}
          onScrollBeginDrag={() => {
            isInteractingRef.current = true;
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isInteractingRef.current = false;
            }, 3000);
          }}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
            if (newIndex >= 0 && newIndex < HERO_BANNERS.length) {
              setActiveBannerIndex(newIndex);
            }
          }}
          getItemLayout={(_, index) => ({
            length: bannerWidth,
            offset: bannerWidth * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => onBannerPress(item)}
              style={{ width: bannerWidth, height: bannerHeight, position: 'relative' }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                priority={index === 0 ? 'high' : 'normal'}
                transition={200}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0.25)', 'transparent']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0.75, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ position: 'absolute', bottom: 22, left: 22, zIndex: 20, right: 85 }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 2.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  {item.tag}
                </Text>

                <EditorialText
                  first={item.title1}
                  second={item.title2}
                  fontSize={34}
                  lineHeight={36}
                  color="#ffffff"
                  style={{ marginBottom: 16 }}
                />

                {/* Nested CTA & Island Button */}
                <AnimatedPressable
                  className="flex-row items-center bg-black/40 backdrop-blur-md rounded-full pl-[20px] pr-[6px] py-[6px] self-start border border-white/20"
                  onPress={() => onBannerPress(item)}
                >
                  <Text style={{ fontSize: 10.5, color: '#ffffff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.8, marginRight: 12 }}>
                    EXPLORE DROP
                  </Text>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={13} color="#111111" strokeWidth={2.5} />
                  </View>
                </AnimatedPressable>
              </View>
            </Pressable>
          )}
        />

        {/* Floating Pagination Pill & Dots Indicator */}
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            zIndex: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 12,
          }}
        >
          {HERO_BANNERS.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setActiveBannerIndex(i);
                bannerFlatListRef.current?.scrollToOffset({
                  offset: i * bannerWidth,
                  animated: true,
                });
              }}
              hitSlop={6}
            >
              <View
                style={{
                  height: 4.5,
                  borderRadius: 2.5,
                  backgroundColor: activeBannerIndex === i ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                  width: activeBannerIndex === i ? 18 : 5,
                }}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
});
