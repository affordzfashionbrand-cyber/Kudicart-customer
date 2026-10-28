import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Camera, Star } from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';
import { CUSTOMER_LOOKS } from './product-constants';

export function ProductCustomerLooks() {
  return (
    <View style={{ marginTop: 24, paddingLeft: 16 }}>
      <View style={{ paddingRight: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Camera size={13} color="#FF5A1F" />
            <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FF5A1F', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              REAL CLIENT DRAPES
            </Text>
          </View>
          <EditorialText
            first="Customer looks &"
            second="styling."
            fontSize={18}
            lineHeight={22}
            color="#111111"
            singleLine
            withDot
          />
        </View>
        <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#111111' }}>4.9 ★ (148)</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={{ gap: 12, paddingRight: 16 }}
      >
        {CUSTOMER_LOOKS.map((look) => (
          <View
            key={look.id}
            style={{
              width: 220,
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <View style={{ width: '100%', height: 165, position: 'relative' }}>
              <Image
                source={{ uri: look.image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                contentPosition="top"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(17, 17, 17, 0.85)',
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>
                  {look.height} • Size {look.size}
                </Text>
              </View>
            </View>

            <View style={{ padding: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>
                  {look.author}
                </Text>
                <View style={{ flexDirection: 'row', gap: 1 }}>
                  {[...Array(look.rating)].map((_, r) => (
                    <Star key={r} size={9} color="#D4AF37" fill="#D4AF37" />
                  ))}
                </View>
              </View>
              <Text style={{ fontSize: 9, color: '#71717A', marginBottom: 5 }}>
                {look.locality}
              </Text>
              <Text style={{ fontSize: 10, color: '#4A4A4A', lineHeight: 14 }} numberOfLines={3}>
                &ldquo;{look.comment}&rdquo;
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
