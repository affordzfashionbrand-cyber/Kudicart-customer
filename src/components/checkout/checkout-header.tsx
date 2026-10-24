import React from 'react';
import { View, Text } from 'react-native';
import { ArrowLeft, Check, Lock } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { Fonts } from '@/constants/theme';

interface CheckoutHeaderProps {
  paddingTop: number;
  onBack: () => void;
}

export const CheckoutHeader = React.memo(function CheckoutHeader({
  paddingTop,
  onBack,
}: CheckoutHeaderProps) {
  return (
    <View
      style={{
        paddingTop,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E5DF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
        zIndex: 40,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 }}>
        <AnimatedPressable
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F1EA', justifyContent: 'center', alignItems: 'center' }}
          onPress={onBack}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        {/* 3-Step Checkout Stepper (Ajio & Myntra Standard) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' }}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11, color: '#111111' }}>BAG</Text>
          </View>

          <View style={{ width: 14, height: 1.5, backgroundColor: '#111111' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' }}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11, color: '#111111' }}>ADDRESS</Text>
          </View>

          <View style={{ width: 14, height: 1.5, backgroundColor: '#111111' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontFamily: Fonts.sansBold, fontSize: 9, color: '#FFFFFF' }}>3</Text>
            </View>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11, color: '#111111' }}>PAYMENT</Text>
          </View>
        </View>

        {/* 100% Secure Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Lock size={12} color="#15803D" />
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: 9.5, color: '#15803D', letterSpacing: 0.5 }}>SECURE</Text>
        </View>
      </View>
    </View>
  );
});
