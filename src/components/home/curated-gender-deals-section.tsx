import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { FOR_HIM_DEALS, FOR_HER_DEALS, CuratedDealCard } from '@/data/homeData';

export interface CuratedGenderDealsSectionProps {
  onDealPress: (deal: CuratedDealCard) => void;
  onGenderHeaderPress: (gender: 'Men' | 'Women') => void;
}

export const CuratedGenderDealsSection = React.memo(function CuratedGenderDealsSection({
  onDealPress,
  onGenderHeaderPress,
}: CuratedGenderDealsSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const availableInner = Math.min(windowWidth, 440) - 24 - 20;
  const curCardWidth = Math.floor((availableInner - 16) / 3);
  const curCardHeight = Math.floor(curCardWidth * 1.54);

  const renderDealCards = (deals: CuratedDealCard[]) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {deals.map((deal) => (
        <AnimatedPressable
          key={deal.id}
          onPress={() => onDealPress(deal)}
          containerStyle={{ width: curCardWidth }}
          style={{
            width: curCardWidth,
            height: curCardHeight,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#1E1D1E',
            borderWidth: 1.5,
            borderColor: '#D4AF37',
            position: 'relative',
            shadowColor: '#111111',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Image
            source={{ uri: deal.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            recyclingKey={deal.id}
            transition={150}
          />

          {/* Top subtle vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Bottom dark gradient for legibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
            start={{ x: 0, y: 0.35 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Ornate Golden Corner Accents */}
          <View style={{ position: 'absolute', top: 3.5, left: 3.5, width: 7, height: 7, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: '#F2D379' }} />
          <View style={{ position: 'absolute', top: 3.5, right: 3.5, width: 7, height: 7, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: '#F2D379' }} />
          <View style={{ position: 'absolute', bottom: 3.5, left: 3.5, width: 7, height: 7, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: '#F2D379' }} />
          <View style={{ position: 'absolute', bottom: 3.5, right: 3.5, width: 7, height: 7, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: '#F2D379' }} />

          {/* Brand Badges & Bottom Tier Overlay */}
          <View style={{ position: 'absolute', bottom: 6, left: 3, right: 3, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 5 }}>
              {deal.brandBadges.map((badge, bIdx) => (
                <View key={bIdx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {badge.isBadge && (
                    <View style={{ width: 11, height: 11, borderRadius: 2.5, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 2.5 }}>
                      <Text style={{ fontSize: 7, fontWeight: '900', color: '#111111' }}>a</Text>
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#ffffff',
                      fontSize: deal.brandBadges.length > 1 ? 8 : 9.5,
                      fontWeight: '900',
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                      textShadowColor: 'rgba(0,0,0,0.9)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {badge.text}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.78)',
                paddingVertical: 3.5,
                paddingHorizontal: 2,
                borderRadius: 4,
                alignItems: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: '#ffffff',
                  fontSize: 9.5,
                  fontWeight: '900',
                  letterSpacing: 0.5,
                  textAlign: 'center',
                }}
              >
                {deal.tierTag}
              </Text>
            </View>
          </View>
        </AnimatedPressable>
      ))}
    </View>
  );

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 26,
        backgroundColor: '#FAF8F3',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E8E5DD',
        paddingVertical: 18,
        paddingHorizontal: 10,
        shadowColor: '#111111',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* --- SECTION: FOR HIM > --- */}
      <View style={{ marginBottom: 20 }}>
        <Pressable
          onPress={() => onGenderHeaderPress('Men')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            marginBottom: 12,
          }}
        >
          <EditorialText
            first="For"
            second="him"
            fontSize={20}
            lineHeight={22}
            color="#C59B27"
            singleLine={true}
          />
          <View
            style={{
              width: 19,
              height: 19,
              borderRadius: 10,
              backgroundColor: '#D4AF37',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={12} color="#ffffff" strokeWidth={3} />
          </View>
        </Pressable>

        {renderDealCards(FOR_HIM_DEALS)}
      </View>

      {/* --- SECTION: FOR HER > --- */}
      <View>
        <Pressable
          onPress={() => onGenderHeaderPress('Women')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            marginBottom: 12,
          }}
        >
          <EditorialText
            first="For"
            second="her"
            fontSize={20}
            lineHeight={22}
            color="#C59B27"
            singleLine={true}
          />
          <View
            style={{
              width: 19,
              height: 19,
              borderRadius: 10,
              backgroundColor: '#D4AF37',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={12} color="#ffffff" strokeWidth={3} />
          </View>
        </Pressable>

        {renderDealCards(FOR_HER_DEALS)}
      </View>
    </View>
  );
});
