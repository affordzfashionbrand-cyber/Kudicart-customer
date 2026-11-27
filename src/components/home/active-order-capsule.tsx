import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Zap, Package } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { useOrderStore } from '@/store/useOrderStore';
import {
  TERMINAL_ORDER_STATUSES,
  getCustomerOrderStatusLabel,
} from '@/contracts/order-contracts';
import { FontStyles } from '@/constants/theme';

export interface ActiveOrderCapsuleProps {
  style?: any;
}

export const ActiveOrderCapsule = React.memo(function ActiveOrderCapsule({
  style,
}: ActiveOrderCapsuleProps) {
  const router = useRouter();
  const orders = useOrderStore((s) => s.orders);
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isNative = Platform.OS !== 'web';

  const currentActiveOrder = useMemo(() => {
    const candidates = activeOrder ? [activeOrder, ...orders] : orders;
    return (
      candidates.find(
        (o) =>
          o &&
          o.id &&
          !TERMINAL_ORDER_STATUSES.includes(o.status as any),
      ) || null
    );
  }, [orders, activeOrder]);

  useEffect(() => {
    if (!currentActiveOrder) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 850,
          useNativeDriver: isNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: isNative,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [currentActiveOrder, pulseAnim, isNative]);

  if (!currentActiveOrder) {
    return null;
  }

  const isEnRoute =
    currentActiveOrder.status === 'PICKED_UP' ||
    currentActiveOrder.status === 'OUT_FOR_DELIVERY' ||
    currentActiveOrder.status === 'TRY_AND_BUY';
  const isDark =
    currentActiveOrder.fulfillmentType === 'DARK_STORE' ||
    (typeof currentActiveOrder.etaMinutes === 'number' &&
      currentActiveOrder.etaMinutes > 0 &&
      currentActiveOrder.etaMinutes <= 60);
  const statusText =
    currentActiveOrder.customerStatusLabel ||
    getCustomerOrderStatusLabel(currentActiveOrder.status);
  const etaLabel = isDark
    ? `${currentActiveOrder.etaMinutes && currentActiveOrder.etaMinutes > 0 ? currentActiveOrder.etaMinutes : 19}m`
    : '2-4d';

  return (
    <View pointerEvents="box-none" style={style}>
      <AnimatedPressable
        onPress={() =>
          router.push({
            pathname: '/tracking',
            params: { orderId: currentActiveOrder.id },
          })
        }
        style={{
          backgroundColor: '#111111',
          borderRadius: 24,
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: isEnRoute ? '#22C55E' : '#FF5A1F',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 8 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: isEnRoute ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 90, 31, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {isDark ? (
              <Zap size={14} color={isEnRoute ? '#4ADE80' : '#FF5A1F'} fill={isEnRoute ? '#4ADE80' : '#FF5A1F'} />
            ) : (
              <Package size={14} color="#60A5FA" />
            )}
            <Animated.View
              style={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isEnRoute ? '#22C55E' : '#FF5A1F',
                borderWidth: 1.5,
                borderColor: '#111111',
                opacity: pulseAnim,
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  FontStyles.sansExtraBold,
                  { color: '#FFFFFF', fontSize: 11.5, letterSpacing: 0.2 },
                ]}
              >
                {statusText}
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  borderRadius: 6,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={[FontStyles.sansBold, { color: '#FDE68A', fontSize: 9 }]}
                >
                  {etaLabel}
                </Text>
              </View>
            </View>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                FontStyles.sansMedium,
                { color: '#A1A1AA', fontSize: 10, marginTop: 1 },
              ]}
            >
              Drop #{currentActiveOrder.orderNumber || currentActiveOrder.id} • Tap to track live
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#FF5A1F',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </AnimatedPressable>
    </View>
  );
});
