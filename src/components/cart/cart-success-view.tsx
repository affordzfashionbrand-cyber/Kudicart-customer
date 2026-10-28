import React from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { Image } from 'expo-image';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Package,
  MapPin,
  ArrowRight,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';

export interface CartSuccessViewProps {
  confirmedOrder: any;
  confirmedOrderNumber: string;
  finalPayable: number;
  selectedAddress: any;
  user: any;
  insets: any;
  isProduction: boolean;
  router: any;
  successAnim: Animated.Value;
  formatPrice: (price: number) => string;
}

export const CartSuccessView = React.memo(function CartSuccessView({
  confirmedOrder,
  confirmedOrderNumber,
  finalPayable,
  selectedAddress,
  user,
  insets,
  isProduction,
  router,
  successAnim,
  formatPrice,
}: CartSuccessViewProps) {
  const isDark = confirmedOrder?.isDarkStore ?? false;
  const isTry = confirmedOrder?.isTryAndBuy ?? false;
  const orderNum = confirmedOrder?.orderNumber || confirmedOrderNumber;
  const paidAmount = confirmedOrder?.totalPaid ?? finalPayable;
  const addr = confirmedOrder?.deliveryAddress || selectedAddress;
  const orderItems = confirmedOrder?.items || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 24) + 20,
          paddingBottom: Math.max(insets.bottom, 24) + 30,
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Animated.View
          style={{
            opacity: successAnim,
            transform: [
              {
                scale: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1],
                }),
              },
            ],
            width: '100%',
            maxWidth: 440,
            alignItems: 'center',
          }}
        >
          {/* Animated Halo Check */}
          <View
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              backgroundColor: '#111111',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 18,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.16,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <CheckCircle2 size={44} color="#22C55E" />
          </View>

          <View
            style={{
              backgroundColor: '#F0ECE4',
              paddingHorizontal: 12,
              paddingVertical: 4.5,
              borderRadius: 20,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                color: '#111111',
                letterSpacing: 1.5,
              }}
            >
              ORDER CONFIRMED • {orderNum}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 26,
              fontWeight: '900',
              color: '#111111',
              textAlign: 'center',
              letterSpacing: -0.5,
              marginBottom: 6,
            }}
          >
            Order Placed Successfully!
          </Text>

          <Text
            style={{
              fontSize: 12.5,
              color: '#6B6667',
              textAlign: 'center',
              maxWidth: 320,
              lineHeight: 18,
              marginBottom: 20,
            }}
          >
            {isDark
              ? 'Your curated capsule is steam-pressed and being dispatched for 18-minute doorstep delivery.'
              : 'Your curated atelier pieces have been confirmed and will be dispatched in 2-4 business days via insured boutique courier.'}
          </Text>

          {/* Demo Simulated Payment Notice (AP-02) */}
          {!isProduction && (
            <View
              style={{
                width: '100%',
                backgroundColor: '#EFF6FF',
                borderRadius: 16,
                padding: 13,
                borderWidth: 1,
                borderColor: '#BFDBFE',
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <ShieldCheck size={20} color="#1D4ED8" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: '900',
                    color: '#1D4ED8',
                    letterSpacing: 0.5,
                  }}
                >
                  DEMO PAYMENT — NO REAL CHARGE
                </Text>
                <Text
                  style={{
                    fontSize: 10.5,
                    color: '#2563EB',
                    marginTop: 1.5,
                  }}
                >
                  Simulated sandbox transaction verified with Affordz backend ledger.
                </Text>
              </View>
            </View>
          )}

          {/* Delivery & Fulfillment Card */}
          <View
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: '#E8E5DF',
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#F4F1EA',
                paddingBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  flex: 1,
                  paddingRight: 8,
                }}
              >
                {isDark ? (
                  <Zap size={14} color="#15803D" fill="#15803D" />
                ) : (
                  <Package size={14} color="#1D4ED8" />
                )}
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '900',
                    color: isDark ? '#15803D' : '#1D4ED8',
                    letterSpacing: 0.3,
                  }}
                  numberOfLines={1}
                >
                  {isDark
                    ? isTry
                      ? '18-MIN DOORSTEP TRY & BUY'
                      : '18-MIN EXPRESS DROP'
                    : 'BOUTIQUE VENDOR STANDARD SHIPPING'}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '900',
                  color: '#111111',
                }}
              >
                Paid {formatPrice(paidAmount)}
              </Text>
            </View>

            {/* Address Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <MapPin size={16} color="#FF5A1F" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: '800',
                    color: '#111111',
                  }}
                >
                  Delivering to {addr?.label || 'Home'}
                </Text>
                <Text
                  style={{
                    fontSize: 11.5,
                    color: '#6B6667',
                    marginTop: 2,
                    lineHeight: 16,
                  }}
                  numberOfLines={2}
                >
                  {addr
                    ? `${addr.line1}, ${addr.locality ? addr.locality + ', ' : ''}${addr.city} - ${addr.pincode}`
                    : 'Registered Address'}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#71717A',
                    marginTop: 2,
                    fontWeight: '600',
                  }}
                >
                  {confirmedOrder?.recipientName || user?.name || 'Affordz Customer'} •{' '}
                  {confirmedOrder?.recipientPhone || user?.phone || '+91 8124188999'}
                </Text>
              </View>
            </View>

            {/* ETA Row */}
            <View
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: '#F4F1EA',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: isDark ? '#22C55E' : '#3B82F6',
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: isDark ? '#15803D' : '#1D4ED8',
                  }}
                >
                  {confirmedOrder?.etaText ||
                    (isDark ? '⚡ Estimated: In 18 Minutes' : '📦 Estimated: 2-4 Business Days')}
                </Text>
              </View>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>
                {isDark ? 'Indiranagar Vault' : 'Insured Courier'}
              </Text>
            </View>
          </View>

          {/* Ordered Items Preview */}
          {orderItems.length > 0 && (
            <View
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E8E5DF',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 10.5,
                  fontWeight: '900',
                  color: '#6B6667',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                ORDERED CAPSULE ({orderItems.reduce((acc: number, it: any) => acc + it.quantity, 0)} ITEMS)
              </Text>
              <View style={{ gap: 10 }}>
                {orderItems.map((item: any, idx: number) => (
                  <View
                    key={`${item.id}-${idx}`}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{
                        width: 44,
                        height: 54,
                        borderRadius: 8,
                        backgroundColor: '#F0ECE4',
                      }}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '800',
                          color: '#6B6667',
                        }}
                      >
                        {item.brand}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: '#111111',
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 2,
                        }}
                      >
                        <Text style={{ fontSize: 10.5, color: '#71717A' }}>
                          Size: {item.size} • Qty: {item.quantity}
                        </Text>
                        {item.trialSize && (
                          <View
                            style={{
                              backgroundColor: '#FFF7ED',
                              paddingHorizontal: 5,
                              paddingVertical: 1,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: '800',
                                color: '#C2410C',
                              }}
                            >
                              Trial: {item.trialSize}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '900',
                        color: '#111111',
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons with 100% Full Width */}
          <View style={{ width: '100%', gap: 10, marginTop: 4 }}>
            <AnimatedPressable
              containerStyle={{ width: '100%' }}
              style={{
                width: '100%',
                backgroundColor: '#111111',
                borderRadius: 999,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={() =>
                router.push({
                  pathname: '/tracking',
                  params: { orderId: confirmedOrder?.orderId || orderNum },
                })
              }
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: '900',
                  letterSpacing: 1.2,
                }}
              >
                TRACK YOUR DROP
              </Text>
              <ArrowRight size={15} color="#FFFFFF" />
            </AnimatedPressable>

            <AnimatedPressable
              containerStyle={{ width: '100%' }}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#D9D9D5',
                borderRadius: 999,
                paddingVertical: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => router.push('/')}
            >
              <Text
                style={{
                  color: '#111111',
                  fontSize: 12.5,
                  fontWeight: '800',
                  letterSpacing: 1,
                }}
              >
                CONTINUE SHOPPING
              </Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
});
