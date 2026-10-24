import React from 'react';
import { View, Text } from 'react-native';
import { Star, CheckCircle2 } from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';

export function ProductReviewsSection() {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <EditorialText first="Atelier trial" second="stories." fontSize={17} lineHeight={20} singleLine withDot />
          <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#111111' }}>148</Text>
          </View>
        </View>
        <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#FF5A1F' }}>Read All</Text>
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E8E5DF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#FFF0EA',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#FF5A1F' }}>AM</Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>Ananya Mathur</Text>
              <Text style={{ fontSize: 9.5, color: '#71717A' }}>Indiranagar 12th Main • 18-min drop</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 1 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={11} color="#D4AF37" fill="#D4AF37" />
            ))}
          </View>
        </View>

        <Text style={{ fontSize: 11.5, color: '#4A4A4A', fontStyle: 'italic', lineHeight: 16 }}>
          &ldquo;Fabric is unimaginably light with that genuine crisp handloom rustle. The concierge rider waited outside patiently while I slipped it on. Retained Size S and he took M back effortlessly. Game-changing luxury.&rdquo;
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <CheckCircle2 size={11} color="#15803D" />
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
            Verified Affordz Try & Buy Order
          </Text>
        </View>
      </View>
    </View>
  );
}
