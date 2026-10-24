import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionTitle } from '@/components/common/section-title';
import { LUXE_WEEKEND_DEALS, LuxeDealItem } from '@/data/homeData';

interface UrbanDealsSectionProps {
  onSelectDeal: (deal: LuxeDealItem) => void;
}

export const UrbanDealsSection = React.memo(function UrbanDealsSection({
  onSelectDeal,
}: UrbanDealsSectionProps) {
  return (
    <View style={{ backgroundColor: '#111111', paddingVertical: 28, marginBottom: 36, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#353335' }}>
      <View style={{ alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 }}>
        <SectionTitle
          label="URBAN EDITORIAL"
          firstLine="Urban"
          secondLine="editorial."
          align="center"
          inverted={true}
          marginBottom={10}
        />

        {/* Time Pill Badge */}
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 4.5, borderRadius: 999, marginTop: 9, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF5A1F', marginRight: 5 }} />
          <Text style={{ color: '#ffffff', fontSize: 9.5, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            DROP_04 • LIVE NOW
          </Text>
        </View>
      </View>

      {/* Horizontal Luxe Deals Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {LUXE_WEEKEND_DEALS.map((deal) => (
          <Pressable
            key={deal.id}
            onPress={() => onSelectDeal(deal)}
            style={({ pressed }) => ({
              width: 145,
              height: 195,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#18181b',
              borderWidth: 1,
              borderColor: '#353335',
              position: 'relative',
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Image
              source={{ uri: deal.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.92)']}
              start={{ x: 0, y: 0.35 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ position: 'absolute', bottom: 12, left: 10, right: 10, alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '900', letterSpacing: 0.6, textAlign: 'center' }} numberOfLines={1}>
                {deal.brand}
              </Text>
              <Text style={{ color: '#D9D9D5', fontSize: 9.5, marginTop: 1, textAlign: 'center' }} numberOfLines={1}>
                {deal.title}
              </Text>
              <View style={{ backgroundColor: '#111111', borderWidth: 1, borderColor: '#353335', paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 5, marginTop: 5 }}>
                <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 }}>
                  {deal.discount}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});
