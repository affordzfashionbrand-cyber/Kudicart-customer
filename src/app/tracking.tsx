import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  Platform,
  Linking,
  RefreshControl,
  BackHandler,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Package,
  Clock,
  Navigation,
  Phone,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  Store,
  UserCheck,
  Sparkles,
  MapPin,
  ChevronRight,
  ArrowRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOrderStore } from '@/store/useOrderStore';
import { safeBack } from '@/utils/navigation';
import { OrderStatus } from '@/services/api';
import { Fonts } from '@/constants/theme';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);
const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const AnimatedPressable = ({ children, style, className, onPress, scaleTo = 0.97 }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.timing(scale, { toValue: scaleTo, duration: 250, easing: bespokeEasing, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: 250, easing: bespokeEasing, useNativeDriver: true }).start();
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]} className={className}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// 8 authoritative milestones defined in Affordz State Machine & Sprint Demo Plan
const MILESTONE_DEFINITIONS: {
  key: OrderStatus;
  title: string;
  icon: any;
}[] = [
  { key: 'PLACED', title: 'Order Placed', icon: Clock },
  { key: 'ACCEPTED', title: 'Vendor Accepted', icon: Store },
  { key: 'PREPARING', title: 'Preparing', icon: Package },
  { key: 'READY_FOR_PICKUP', title: 'Ready for Pickup', icon: CheckCircle2 },
  { key: 'ASSIGNED', title: 'Rider Assigned', icon: UserCheck },
  { key: 'PICKED_UP', title: 'Picked Up', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', icon: Navigation },
  { key: 'DELIVERED', title: 'Delivered', icon: ShieldCheck },
];

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const { orders, activeOrder, activeTracking, fetchTracking, fetchOrders } = useOrderStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Resolve target order: param orderId -> activeOrder -> most recent order
  const currentOrder =
    (params.orderId ? orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId) : null) ||
    activeOrder ||
    orders[0];

  const currentOrderId = currentOrder?.id;

  // Initial and polling fetch for live tracking
  const loadTracking = useCallback(async () => {
    if (currentOrderId) {
      await fetchTracking(currentOrderId);
    }
  }, [currentOrderId, fetchTracking]);

  useEffect(() => {
    loadTracking();
    const interval = setInterval(() => {
      loadTracking();
    }, 15000); // 15-second live polling
    return () => clearInterval(interval);
  }, [loadTracking]);

  // Android hardware back handler
  useEffect(() => {
    const onBackPress = () => {
      safeBack(router, '/orders');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadTracking(), fetchOrders()]);
    setIsRefreshing(false);
  };

  if (!currentOrder) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Package size={32} color="#FF5A1F" />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111' }}>No active drops to track</Text>
        <Text style={{ fontSize: 13, color: '#6B6667', marginTop: 6, textAlign: 'center', maxWidth: 260, lineHeight: 18 }}>
          Discover hyper-curated styles with 18-minute doorstep delivery.
        </Text>
        <AnimatedPressable
          style={{ marginTop: 24, backgroundColor: '#111111', paddingHorizontal: 24, paddingVertical: 13, borderRadius: 999 }}
          onPress={() => router.push('/')}
        >
          <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' }}>
            DISCOVER DROPS
          </Text>
        </AnimatedPressable>
      </View>
    );
  }

  // Authoritative status resolution
  const activeStatus = (activeTracking?.status || currentOrder.status) as OrderStatus;
  const etaMinutes = activeTracking?.etaMinutes ?? currentOrder.etaMinutes ?? 18;
  const isTryAndBuy = currentOrder.isTryAndBuy ?? false;
  const driver = activeTracking?.driver || currentOrder.driver;

  // Status index for milestone progression
  const statusHierarchy: OrderStatus[] = [
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'ASSIGNED',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];
  const currentStatusIndex = statusHierarchy.indexOf(activeStatus);

  const getStepStatus = (index: number): 'COMPLETED' | 'ACTIVE' | 'PENDING' => {
    if (currentStatusIndex > index) return 'COMPLETED';
    if (currentStatusIndex === index) return 'ACTIVE';
    return 'PENDING';
  };

  const getMilestoneDescription = (key: OrderStatus) => {
    switch (key) {
      case 'PLACED':
        return currentOrder.paymentMethod === 'COD'
          ? 'Order confirmed via Cash on Delivery (COD)'
          : 'Payment verified via Razorpay Secure UPI';
      case 'ACCEPTED':
        return 'Affordz Atelier confirmed garments';
      case 'PREPARING':
        return 'Hand-pressed & quality checked';
      case 'READY_FOR_PICKUP':
        return 'Sealed in tamper-evident sleeve';
      case 'ASSIGNED':
        return driver?.name ? `${driver.name} assigned` : 'Assigned to EV fleet pilot';
      case 'PICKED_UP':
        return 'Rider collected garment from counter';
      case 'OUT_FOR_DELIVERY':
        return currentOrder.address?.locality
          ? `En route to ${currentOrder.address.locality}`
          : 'En route to your doorstep';
      case 'DELIVERED':
        return 'Handed over & size verified';
      default:
        return '';
    }
  };

  const handleCallDriver = () => {
    if (driver?.phone) {
      Linking.openURL(`tel:${driver.phone.replace(/\s+/g, '')}`);
    }
  };

  const handleNeedHelp = () => {
    router.push({
      pathname: '/support',
      params: {
        orderId: currentOrder.id,
        category: 'Delivery',
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* Editorial Header */}
      <View
        style={{
          paddingTop,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 12,
          zIndex: 40,
        }}
      >
        <AnimatedPressable
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => safeBack(router, '/orders')}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF5A1F' }} />
            <Text style={{ fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }}>
              LIVE DROP TRACKING
            </Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
            {currentOrder.orderNumber || currentOrder.id}
          </Text>
        </View>

        <AnimatedPressable
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}
          onPress={onRefresh}
        >
          <RefreshCw size={16} color={isRefreshing ? '#FF5A1F' : '#6B6667'} />
        </AnimatedPressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#FF5A1F"
            colors={['#FF5A1F']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero ETA Card */}
        <View style={{ marginTop: 18, marginBottom: 14 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: '#E8E5DF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {/* Try & Buy or Express Hub Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <Sparkles size={12} color="#FF5A1F" />
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#C2410C', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {isTryAndBuy ? 'TRY & BUY DOORSTEP DROP' : '18-MIN HYPERLOCAL DROP'}
                </Text>
              </View>

              <View style={{ backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#6B6667', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {activeStatus.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            {/* Countdown / Status headline */}
            {activeStatus === 'DELIVERED' ? (
              <View>
                <Text style={{ fontSize: 28, fontWeight: '900', color: '#15803D', letterSpacing: -0.5 }}>
                  DELIVERED.
                </Text>
                <Text style={{ fontSize: 13, color: '#6B6667', marginTop: 4, lineHeight: 18 }}>
                  Enjoy your curated garments. You can rate and review your pieces anytime.
                </Text>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={{ fontSize: 48, fontWeight: '900', color: '#111111', letterSpacing: -1, lineHeight: 52 }}>
                    {etaMinutes}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#FF5A1F', letterSpacing: 0.5 }}>
                    MINS
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#4A4A4A', marginTop: 4 }}>
                  {activeStatus === 'OUT_FOR_DELIVERY'
                    ? `Rider is cruising to ${currentOrder.address?.locality || 'your doorstep'} now.`
                    : 'Garments dispatched from Indiranagar Express Hub.'}
                </Text>
              </View>
            )}

            {/* Try & Buy Doorstep Notice */}
            {isTryAndBuy && activeStatus !== 'DELIVERED' && (
              <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} color="#C2410C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#9A3412' }}>10-Minute Doorstep Fitting Window</Text>
                  <Text style={{ fontSize: 11, color: '#7C2D12', marginTop: 1 }}>
                    Try sizes while our pilot waits. Keep what fits, return the rest on the spot.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Assigned Rider Card */}
        {driver && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAF8F5', borderWidth: 1.5, borderColor: '#FF5A1F', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={22} color="#FF5A1F" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>{driver.name}</Text>
                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#B45309' }}>4.9 ★</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 2 }}>
                    {driver.vehicle || 'Ather 450X EV • KA 03 EV 4821'}
                  </Text>
                </View>
              </View>

              <AnimatedPressable
                style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' }}
                onPress={handleCallDriver}
              >
                <Phone size={18} color="#FFFFFF" />
              </AnimatedPressable>
            </View>

            {/* Handshake Delivery OTP badge */}
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={15} color="#15803D" />
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#4A4A4A' }}>Delivery Handshake OTP:</Text>
              </View>
              <View style={{ backgroundColor: '#FAF8F5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E8E5DF' }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111', letterSpacing: 2 }}>4821</Text>
              </View>
            </View>
          </View>
        )}

        {/* 8-Milestone Timeline */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <Text style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#FF5A1F', textTransform: 'uppercase', marginBottom: 18 }}>
            DROP PROGRESSION (8 STAGES)
          </Text>

          {MILESTONE_DEFINITIONS.map((step, idx) => {
            const stepStatus = getStepStatus(idx);
            const isLast = idx === MILESTONE_DEFINITIONS.length - 1;
            const Icon = step.icon;
            const desc = getMilestoneDescription(step.key);

            return (
              <View key={step.key} style={{ flexDirection: 'row' }}>
                {/* Stepper Node & Vertical Line */}
                <View style={{ alignItems: 'center', marginRight: 14 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor:
                        stepStatus === 'COMPLETED'
                          ? '#111111'
                          : stepStatus === 'ACTIVE'
                          ? '#FF5A1F'
                          : '#F4F1EA',
                      borderWidth: stepStatus === 'ACTIVE' ? 3 : 1,
                      borderColor: stepStatus === 'ACTIVE' ? '#FED7AA' : stepStatus === 'COMPLETED' ? '#111111' : '#E8E5DF',
                    }}
                  >
                    <Icon
                      size={16}
                      color={stepStatus === 'PENDING' ? '#8E877E' : '#FFFFFF'}
                    />
                  </View>

                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        height: 34,
                        marginVertical: 3,
                        backgroundColor: stepStatus === 'COMPLETED' ? '#111111' : '#E8E5DF',
                      }}
                    />
                  )}
                </View>

                {/* Milestone Details */}
                <View style={{ flex: 1, paddingTop: 2, paddingBottom: 22 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text
                      style={{
                        fontSize: 13.5,
                        fontWeight: '900',
                        color:
                          stepStatus === 'PENDING'
                            ? '#8E877E'
                            : stepStatus === 'ACTIVE'
                            ? '#FF5A1F'
                            : '#111111',
                      }}
                    >
                      {step.title}
                    </Text>

                    {stepStatus === 'ACTIVE' && (
                      <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#FFEDD5' }}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: '#C2410C', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                          IN PROGRESS
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11.5, color: '#6B6667', lineHeight: 16 }}>{desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Address Card */}
        {currentOrder.address && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <MapPin size={15} color="#FF5A1F" />
              <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                DELIVERY DESTINATION
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>{currentOrder.address.label || 'Home'}</Text>
            <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 3, lineHeight: 18 }}>
              {currentOrder.address.line1}, {currentOrder.address.locality}, {currentOrder.address.city} -{' '}
              {currentOrder.address.pincode}
            </Text>
          </View>
        )}

        {/* Ordered Items Preview */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              PACKAGE CONTENTS ({currentOrder.items?.length || 0})
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>
              {formatPrice(currentOrder.grandTotal)}
            </Text>
          </View>

          {currentOrder.items?.map((item: any, idx: number) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 10,
                borderBottomWidth: idx !== (currentOrder.items?.length || 1) - 1 ? 1 : 0,
                borderBottomColor: '#F4F1EA',
              }}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 48, height: 60, borderRadius: 10, backgroundColor: '#F4F1EA' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: 48, height: 60, borderRadius: 10, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#6B6667" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 2 }}>
                  Size: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.size}</Text> • Qty: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.quantity}</Text>
                  {item.trialSize ? ` • Trial: ${item.trialSize}` : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>{formatPrice(item.price)}</Text>
            </View>
          ))}
        </View>

        {/* Support Concierge Trigger */}
        <AnimatedPressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E8E5DF',
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
          }}
          onPress={handleNeedHelp}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={18} color="#FF5A1F" />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Need Help with this Drop?</Text>
              <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }}>Doorstep exchanges, rider chat & concierge</Text>
            </View>
          </View>
          <ChevronRight size={17} color="#6B6667" />
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}
