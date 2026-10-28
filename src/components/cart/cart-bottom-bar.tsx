import React from 'react';
import { View, Text } from 'react-native';
import { Lock, ArrowRight } from 'lucide-react-native';
import { AnimatedPriceTicker } from '@/components/common/animated-price-ticker';
import { AnimatedPressable } from '@/components/common/animated-pressable';

export interface CartBottomBarProps {
  insets: any;
  finalPayable: number;
  totalMrp: number;
  addressServiceability: {
    isServiceable: boolean;
    distanceKm: number;
  };
  hasDarkStoreItems: boolean;
  selectedAddress: any;
  isCheckingOut: boolean;
  isAuthenticated: boolean;
  selectedPaymentCategory: string;
  handlePlaceOrder: () => void;
  formatPrice: (price: number) => string;
}

export const CartBottomBar = React.memo(function CartBottomBar({
  insets,
  finalPayable,
  totalMrp,
  addressServiceability,
  hasDarkStoreItems,
  selectedAddress,
  isCheckingOut,
  isAuthenticated,
  selectedPaymentCategory,
  handlePlaceOrder,
  formatPrice,
}: CartBottomBarProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8E5DF',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <AnimatedPriceTicker
              value={finalPayable}
              style={{ fontSize: 20, fontWeight: '900', color: '#111111' }}
            />
            {totalMrp > finalPayable && (
              <Text style={{ fontSize: 12, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
                {formatPrice(totalMrp)}
              </Text>
            )}
          </View>
          <Text
            style={{
              fontSize: 10.5,
              color: !addressServiceability.isServiceable && hasDarkStoreItems ? '#DC2626' : '#15803D',
              fontWeight: '800',
            }}
          >
            {!addressServiceability.isServiceable && hasDarkStoreItems
              ? `⚠️ Outside 8.0 km radius (${addressServiceability.distanceKm} km)`
              : `Deliver to: ${selectedAddress?.locality || selectedAddress?.city || 'Indiranagar'}`}
          </Text>
        </View>

        {/* Place Order CTA Button */}
        <AnimatedPressable
          disabled={isCheckingOut}
          onPress={handlePlaceOrder}
          style={{
            backgroundColor: isCheckingOut
              ? '#71717A'
              : !isAuthenticated
              ? '#FF5A1F'
              : !selectedAddress
              ? '#059669'
              : hasDarkStoreItems && !addressServiceability.isServiceable
              ? '#DC2626'
              : '#111111',
            borderRadius: 999,
            paddingVertical: 13,
            paddingHorizontal: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            shadowColor: '#111111',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Lock size={13} color="#FFFFFF" />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: '900',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            {isCheckingOut
              ? 'PROCESSING...'
              : !isAuthenticated
              ? 'LOGIN TO PLACE ORDER'
              : !selectedAddress
              ? 'ADD DELIVERY ADDRESS'
              : hasDarkStoreItems && !addressServiceability.isServiceable
              ? 'NOT AVAILABLE FOR THIS PLACE'
              : selectedPaymentCategory === 'COD'
              ? 'PLACE ORDER (COD)'
              : 'PAY & PLACE ORDER'}
          </Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </AnimatedPressable>
      </View>
    </View>
  );
});
