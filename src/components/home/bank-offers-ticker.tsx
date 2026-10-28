import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { BANK_OFFERS, bespokeEasing } from '@/data/homeData';

export interface BankOffersTickerProps {
  onPress: () => void;
  selectedIndex?: number;
}

export const BankOffersTicker = React.memo(function BankOffersTicker({
  onPress,
  selectedIndex,
}: BankOffersTickerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const bankSlideAnim = useRef(new Animated.Value(0)).current;
  const bankOpacityAnim = useRef(new Animated.Value(1)).current;
  const isNative = Platform.OS !== 'web';

  const activeIndex = selectedIndex !== undefined ? selectedIndex : internalIndex;
  const currentBankOffer = BANK_OFFERS[activeIndex] || BANK_OFFERS[0];

  useEffect(() => {
    if (selectedIndex !== undefined) {
      setInternalIndex(selectedIndex);
    }
  }, [selectedIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(bankSlideAnim, {
          toValue: -14,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: isNative,
        }),
        Animated.timing(bankOpacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: isNative,
        }),
      ]).start(() => {
        setInternalIndex((prev) => (prev + 1) % BANK_OFFERS.length);
        bankSlideAnim.setValue(14);
        Animated.parallel([
          Animated.timing(bankSlideAnim, {
            toValue: 0,
            duration: 250,
            easing: bespokeEasing,
            useNativeDriver: isNative,
          }),
          Animated.timing(bankOpacityAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: isNative,
          }),
        ]).start();
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [bankSlideAnim, bankOpacityAnim, isNative]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#F4F1EA',
        borderWidth: 1.2,
        borderColor: '#D9D9D5',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#111111',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        opacity: pressed ? 0.96 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ flex: 1, overflow: 'hidden', height: 42, justifyContent: 'center' }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            transform: [{ translateY: bankSlideAnim }],
            opacity: bankOpacityAnim,
          }}
        >
          {/* Animated Bank Badge with Specific Bank Brand Color */}
          <View
            style={{
              backgroundColor: currentBankOffer.badgeBg,
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 76,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 9.5, fontWeight: '900', letterSpacing: 0.8 }}>
              {currentBankOffer.bankName}
            </Text>
          </View>

          {/* Animated Offer Title and Terms */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111', letterSpacing: -0.2 }}>
              {currentBankOffer.title}
            </Text>
            <Text style={{ fontSize: 10, color: '#6B6667', marginTop: 1 }} numberOfLines={1}>
              {currentBankOffer.subtitle}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Offer Count Badge and Next Arrow */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
        <View
          style={{
            backgroundColor: '#111111',
            borderWidth: 0.5,
            borderColor: '#111111',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#ffffff' }}>
            {activeIndex + 1}/{BANK_OFFERS.length}
          </Text>
        </View>
        <ChevronRight size={16} color="#6B6667" />
      </View>
    </Pressable>
  );
});
