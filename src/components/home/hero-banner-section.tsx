import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { HERO_BANNERS, HeroBannerItem } from '@/data/homeData';
import { useHomeContentStore } from '@/store/useHomeContentStore';
import { HomeLayoutBanner } from '@/services/api';
import { Fonts } from '@/constants/theme';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { LazyImage } from '@/components/common/lazy-image';
import { HeroBannerSkeleton } from '@/components/common/skeleton';

export interface HeroBannerSectionProps {
  banners?: (HomeLayoutBanner | HeroBannerItem)[];
  onBannerPress: (banner: any) => void;
}

export const HeroBannerSection = React.memo(function HeroBannerSection({
  banners: propBanners,
  onBannerPress,
}: HeroBannerSectionProps) {
  const storeBanners = useHomeContentStore((s) => s.banners);
  const isCmsLoading = useHomeContentStore((s) => s.isLoading);
  const hasHydrated = useHomeContentStore((s) => s.hasHydrated);
  const rawBanners = (propBanners && propBanners.length > 0 ? propBanners : storeBanners) || HERO_BANNERS;
  const approvedHeroBanners = rawBanners.filter((b: any) => {
    const approved = !b.status || b.status === 'APPROVED';
    const isHeroPlacement = !b.placement || b.placement === 'HERO_CAROUSEL';
    return approved && isHeroPlacement;
  });
  const activeBanners = approvedHeroBanners.length > 0 ? approvedHeroBanners : HERO_BANNERS;

  const { width: windowWidth } = useWindowDimensions();
  const bannerWidth = Math.min(windowWidth, 440) - 32;
  const bannerHeight = 215;

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const activeBannerIndexRef = useRef(0);
  const bannerFlatListRef = useRef<FlatList<any>>(null);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      if (isInteractingRef.current) return;
      const next = (activeBannerIndexRef.current + 1) % activeBanners.length;
      activeBannerIndexRef.current = next;
      setActiveBannerIndex(next);
      bannerFlatListRef.current?.scrollToOffset({
        offset: next * bannerWidth,
        animated: true,
      });
    }, 4500);

    return () => {
      clearInterval(timer);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [bannerWidth, activeBanners.length]);

  if (!propBanners && isCmsLoading && !hasHydrated) {
    return <HeroBannerSkeleton bannerWidth={bannerWidth} />;
  }

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
          data={activeBanners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          overScrollMode="never"
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={Platform.OS !== 'web'}
          keyExtractor={(item) => item.id}
          onScrollBeginDrag={() => {
            isInteractingRef.current = true;
          }}
          onScrollEndDrag={() => {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => {
              isInteractingRef.current = false;
            }, 3000);
          }}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
            if (newIndex >= 0 && newIndex < activeBanners.length) {
              activeBannerIndexRef.current = newIndex;
              setActiveBannerIndex(newIndex);
            }
          }}
          getItemLayout={(_, index) => ({
            length: bannerWidth,
            offset: bannerWidth * index,
            index,
          })}
          renderItem={({ item, index }) => {
            const imgUri = (item as any).imageUrl || (item as any).image;
            const discountText = (item as any).discountText;
            return (
              <Pressable
                onPress={() => onBannerPress(item)}
                style={{ width: bannerWidth, height: bannerHeight, position: 'relative' }}
              >
                <LazyImage
                  source={imgUri}
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
                {discountText ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 25,
                      backgroundColor: '#FF5A1F',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.sansBold,
                        fontSize: 10,
                        fontWeight: '900',
                        color: '#ffffff',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {discountText}
                    </Text>
                  </View>
                ) : null}
                <View style={{ position: 'absolute', bottom: 22, left: 22, zIndex: 20, right: 85 }}>
                  <Text style={{
                    fontFamily: Fonts.sansBold,
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
                    <Text style={{ fontFamily: Fonts.sansExtraBold, fontSize: 10.5, color: '#ffffff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.8, marginRight: 12 }}>
                      EXPLORE DROP
                    </Text>
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={13} color="#111111" strokeWidth={2.5} />
                    </View>
                  </AnimatedPressable>
                </View>
              </Pressable>
            );
          }}
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
          {activeBanners.map((_, i) => (
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
