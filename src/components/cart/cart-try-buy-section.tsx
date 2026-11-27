import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';

export interface CartTryBuySectionProps {
  hasDarkStoreItems: boolean;
  hasMixedCart?: boolean;
  isEligible?: boolean;
  disabledReason?: string | null;
  tryAndBuyEnabled: boolean;
  onToggleTryAndBuy: () => void;
}

export const CartTryBuySection = React.memo(function CartTryBuySection({
  hasDarkStoreItems,
  hasMixedCart = false,
  isEligible,
  disabledReason = null,
  tryAndBuyEnabled,
  onToggleTryAndBuy,
}: CartTryBuySectionProps) {
  const effectiveEligible = isEligible !== undefined ? isEligible : hasDarkStoreItems;
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
              backgroundColor: effectiveEligible ? '#FFF7ED' : '#F4F4F5',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Zap
              size={18}
              color={effectiveEligible ? '#FF5A1F' : '#A1A1AA'}
              fill={effectiveEligible ? '#FF5A1F' : '#A1A1AA'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: '900',
                  color: effectiveEligible ? '#111111' : '#71717A',
                }}
              >
                Doorstep Try & Buy
              </Text>
              {effectiveEligible ? (
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
                  <Text style={{ fontSize: 8, fontWeight: '800', color: '#71717A' }}>
                    {hasDarkStoreItems ? 'UNAVAILABLE' : 'DARK STORE ONLY'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
              {disabledReason
                ? disabledReason
                : hasMixedCart && effectiveEligible
                ? 'Mixed bag split: Doorstep Try & Buy applies exclusively to your 19-min Dark Store items. Boutique items ship separately via standard courier.'
                : effectiveEligible
                ? 'Rider waits 15 mins while you try sizes. Keep what fits, return the rest on the spot!'
                : 'Doorstep Try & Buy is exclusive to eligible 19-minute Dark Store items. Boutique vendor orders are delivered via standard shipping with 7-day doorstep returns.'}
            </Text>
          </View>
        </View>

        {/* Toggle Switch */}
        <Pressable
          disabled={!effectiveEligible}
          onPress={onToggleTryAndBuy}
          accessibilityRole="switch"
          accessibilityState={{ checked: effectiveEligible && tryAndBuyEnabled, disabled: !effectiveEligible }}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: !effectiveEligible ? '#E4E4E7' : tryAndBuyEnabled ? '#111111' : '#D9D9D5',
            padding: 2,
            justifyContent: 'center',
            opacity: !effectiveEligible ? 0.6 : 1,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              alignSelf: effectiveEligible && tryAndBuyEnabled ? 'flex-end' : 'flex-start',
            }}
          />
        </Pressable>
      </View>
    </View>
  );
});
