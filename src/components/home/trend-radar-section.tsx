import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { TREND_RADAR_ITEMS, TrendRadarItem } from '@/data/homeData';
import { Fonts } from '@/constants/theme';

interface TrendRadarSectionProps {
  onSelectTrend: (item: TrendRadarItem) => void;
  onExploreAll: () => void;
}

export const TrendRadarSection = React.memo(function TrendRadarSection({
  onSelectTrend,
  onExploreAll,
}: TrendRadarSectionProps) {
  return (
    <View style={{ marginBottom: 36 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <View style={{ backgroundColor: '#111111', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
              <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>FWD_26</Text>
            </View>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11, fontWeight: '700', letterSpacing: 2.5, color: '#888888', textTransform: 'uppercase' }}>
              CURATED MOODBOARDS
            </Text>
          </View>
          <Text style={{ fontSize: 34, lineHeight: 36, letterSpacing: -0.5, color: '#000000' }}>
            <Text style={{ fontFamily: Fonts.serifRegular, fontWeight: '400' }}>Trend</Text>
            {'\n'}
            <Text style={{ fontFamily: Fonts.serifSemiBold, fontWeight: '700' }}>
              radar.
            </Text>
          </Text>
        </View>
        <Pressable
          onPress={onExploreAll}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 3 }}
        >
          <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#111111' }}>Explore All</Text>
          <ChevronRight size={14} color="#111111" />
        </Pressable>
      </View>

      {/* Horizontal Carousel of Moodboard Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
      >
        {TREND_RADAR_ITEMS.map((item) => (
          <AnimatedPressable
            key={item.id}
            onPress={() => onSelectTrend(item)}
            style={{
              width: 195,
              height: 275,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: '#1E1D1E',
              borderWidth: 1,
              borderColor: '#D9D9D5',
              position: 'relative',
              shadowColor: '#111111',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: 7,
              elevation: 3,
            }}
          >
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
            />

            {/* Top subtle vignette */}
            <LinearGradient
              colors={['rgba(0,0,0,0.35)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.35 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Bottom deep gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
              start={{ x: 0, y: 0.35 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Tag Pill Top Left */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                paddingHorizontal: 8,
                paddingVertical: 3.5,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#111111', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 }}>
                {item.tag}
              </Text>
            </View>

            {/* Content Bottom */}
            <View style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: '900',
                  letterSpacing: 0.5,
                  textShadowColor: 'rgba(0,0,0,0.9)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {item.aesthetic}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  color: '#E6E4DF',
                  fontSize: 10.5,
                  lineHeight: 14,
                  fontWeight: '500',
                  marginTop: 3,
                  marginBottom: 10,
                }}
              >
                {item.description}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  paddingHorizontal: 10,
                  paddingVertical: 4.5,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6, marginRight: 4 }}>
                  EXPLORE FIT
                </Text>
                <ArrowRight size={10} color="#ffffff" strokeWidth={2.5} />
              </View>
            </View>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
});
