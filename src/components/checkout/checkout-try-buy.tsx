import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Fonts } from '@/constants/theme';

interface CheckoutTryBuyProps {
  tryAndBuyEnabled: boolean;
  onToggle: () => void;
}

export const CheckoutTryBuy = React.memo(function CheckoutTryBuy({
  tryAndBuyEnabled,
  onToggle,
}: CheckoutTryBuyProps) {
  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' }}>
            <Zap size={18} color="#FF5A1F" fill="#FF5A1F" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontFamily: Fonts.sansBold, fontSize: 13.5, color: '#111111' }}>
                Doorstep Try & Buy
              </Text>
              <View style={{ backgroundColor: '#FF5A1F', paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 }}>
                <Text style={{ fontFamily: Fonts.sansBold, fontSize: 8, color: '#FFFFFF' }}>FREE TRIAL</Text>
              </View>
            </View>
            <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
              Rider waits 15 mins while you try sizes. Keep what fits, return the rest on the spot!
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onToggle}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: tryAndBuyEnabled ? '#111111' : '#D9D9D5',
            padding: 2,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              alignSelf: tryAndBuyEnabled ? 'flex-end' : 'flex-start',
            }}
          />
        </Pressable>
      </View>
    </View>
  );
});
