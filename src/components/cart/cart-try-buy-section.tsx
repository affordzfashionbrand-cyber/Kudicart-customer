import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';

export interface CartTryBuySectionProps {
  hasDarkStoreItems: boolean;
  tryAndBuyEnabled: boolean;
  onToggleTryAndBuy: () => void;
}

export const CartTryBuySection = React.memo(function CartTryBuySection({
  hasDarkStoreItems,
  tryAndBuyEnabled,
  onToggleTryAndBuy,
}: CartTryBuySectionProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: hasDarkStoreItems ? '#FFF7ED' : '#F4F4F5',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Zap
              size={18}
              color={hasDarkStoreItems ? '#FF5A1F' : '#A1A1AA'}
              fill={hasDarkStoreItems ? '#FF5A1F' : '#A1A1AA'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: '900',
                  color: hasDarkStoreItems ? '#111111' : '#71717A',
                }}
              >
                Doorstep Try & Buy
              </Text>
              {hasDarkStoreItems ? (
                <View
                  style={{
                    backgroundColor: '#FF5A1F',
                    paddingHorizontal: 6,
                    paddingVertical: 1.5,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>FREE TRIAL</Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: '#E4E4E7',
                    paddingHorizontal: 6,
                    paddingVertical: 1.5,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 8, fontWeight: '800', color: '#71717A' }}>DARK STORE ONLY</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
              {hasDarkStoreItems
                ? 'Rider waits 15 mins while you try sizes. Keep what fits, return the rest on the spot!'
                : 'Doorstep Try & Buy is exclusive to 18-minute Dark Store items. Boutique vendor orders are delivered via standard shipping with 7-day doorstep returns.'}
            </Text>
          </View>
        </View>

        {/* Toggle Switch */}
        <Pressable
          disabled={!hasDarkStoreItems}
          onPress={onToggleTryAndBuy}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: !hasDarkStoreItems ? '#E4E4E7' : tryAndBuyEnabled ? '#111111' : '#D9D9D5',
            padding: 2,
            justifyContent: 'center',
            opacity: !hasDarkStoreItems ? 0.6 : 1,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              alignSelf: hasDarkStoreItems && tryAndBuyEnabled ? 'flex-end' : 'flex-start',
            }}
          />
        </Pressable>
      </View>
    </View>
  );
});
