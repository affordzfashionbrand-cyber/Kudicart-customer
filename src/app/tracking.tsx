import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
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
  MapPin,
  ChevronRight,
  Zap,
  Star,
  Sparkles,
  ThumbsUp,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOrderStore } from '@/store/useOrderStore';
import { safeBack } from '@/utils/navigation';
import { OrderStatus } from '@/services/api';
import { LiveTrackingMap, ALL_STAGES } from '@/components/tracking/live-tracking-map';
import { Fonts, FontStyles } from '@/constants/theme';
import { AnimatedPressable } from '@/components/common/animated-pressable';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);
const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

// 8 authoritative milestones defined in Affordz State Machine
const MILESTONE_DEFINITIONS: {
  key: OrderStatus;
  title: string;
  icon: any;
}[] = [
  { key: 'PLACED', title: 'Order Placed', icon: Clock },
  { key: 'ACCEPTED', title: 'Vendor Accepted', icon: Store },
  { key: 'PREPARING', title: 'Preparing Garment', icon: Package },
  { key: 'READY_FOR_PICKUP', title: 'Ready for Pickup', icon: CheckCircle2 },
  { key: 'ASSIGNED', title: 'Rider Assigned', icon: UserCheck },
  { key: 'PICKED_UP', title: 'Picked Up', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', icon: Navigation },
  { key: 'DELIVERED', title: 'Delivered', icon: ShieldCheck },
];

const FEEDBACK_TAGS = [
  '⚡ Blazing 18-Min Speed',
  '👔 Neatly Steamed & Pressed',
  '🛵 Polite EV Pilot',
  '📦 Tamper-Proof Vault Box',
  '👗 Perfect Doorstep Fit',
  '⏱️ Smooth 10-Min Try Window',
];

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const {
    orders,
    activeOrder,
    activeTracking,
    fetchTracking,
    fetchOrders,
    orderRatings,
    submitOrderRating,
  } = useOrderStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback target order ID
  const effectiveOrderId = useMemo(() => {
    return params.orderId || activeOrder?.id || activeTracking?.orderId || orders[0]?.id || 'ord-1793086189135';
  }, [params.orderId, activeOrder, activeTracking, orders]);

  // Rating & Review State
  const existingRating = orderRatings[effectiveOrderId];
  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⚡ Blazing 18-Min Speed',
    '👔 Neatly Steamed & Pressed',
  ]);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isRatingExpanded, setIsRatingExpanded] = useState(true);
  const [isEditingRating, setIsEditingRating] = useState(false);

  // Initial and polling fetch for live tracking
  const loadTracking = useCallback(async () => {
    if (effectiveOrderId) {
      await fetchTracking(effectiveOrderId);
    }
  }, [effectiveOrderId, fetchTracking]);

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

  // Target order resolution
  const currentOrder = useMemo(() => {
    if (params.orderId) {
      const match = orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
      if (match) return match;
    }
    if (activeOrder && (!params.orderId || activeOrder.id === params.orderId || activeOrder.orderNumber === params.orderId)) {
      return activeOrder;
    }
    return orders[0] || null;
  }, [params.orderId, orders, activeOrder]);

  // Authoritative live status from backend tracking / order
  const activeStatus = (activeTracking?.status || currentOrder?.status || 'PLACED') as OrderStatus;

  // Instant 18-Min Hyperlocal Drop vs Standard Boutique
  // In Affordz, express quick-commerce drops are 18-minute instant delivery
  const isDarkStore = useMemo(() => {
    const eta = activeTracking?.etaMinutes ?? currentOrder?.etaMinutes;
    if (typeof eta === 'number' && eta > 60) {
      return false; // Multi-day courier
    }
    return true; // 18-min instant drop
  }, [activeTracking, currentOrder]);

  const isTryAndBuy = Boolean(activeTracking?.isTryAndBuy ?? currentOrder?.isTryAndBuy ?? false);

  // Dynamic realistic ETA countdown for express 18-min drops
  const displayEta = useMemo(() => {
    if (!isDarkStore) {
      return '2-4 DAYS';
    }
    const stageMeta = ALL_STAGES.find((s) => s.key === activeStatus);
    return stageMeta ? stageMeta.eta : (activeTracking?.etaMinutes || 18);
  }, [activeStatus, isDarkStore, activeTracking]);

  // Authoritative Order Number
  const displayOrderNumber = useMemo(() => {
    return (
      activeTracking?.orderNumber ||
      currentOrder?.orderNumber ||
      (effectiveOrderId.startsWith('ord-') ? `AF-${effectiveOrderId.slice(-5)}` : effectiveOrderId)
    );
  }, [activeTracking, currentOrder, effectiveOrderId]);

  // Authoritative Driver Details
  const driver = useMemo(() => {
    const rawDriver: any = activeTracking?.driver || currentOrder?.driver;
    return {
      id: rawDriver?.id || 'drv-1',
      name: rawDriver?.name || 'Rajesh Kumar',
      phone: rawDriver?.phone || '+91 98765 43210',
      vehicle: rawDriver?.vehicle || 'Ather 450X EV • KA 03 EV 4821',
      rating: typeof rawDriver?.rating === 'number' ? rawDriver.rating : 4.9,
      currentLocation: rawDriver?.currentLocation || {
        latitude: 12.9716,
        longitude: 77.5946,
        heading: 45,
      },
    };
  }, [activeTracking, currentOrder]);

  // Authoritative Delivery Destination
  const deliveryAddress = useMemo(() => {
    return activeTracking?.deliveryAddress || currentOrder?.address || {
      label: 'Home Sanctuary',
      line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
    };
  }, [activeTracking, currentOrder]);

  // Authoritative Ordered Items
  const orderedItems = useMemo(() => {
    if (activeTracking?.items && activeTracking.items.length > 0) {
      return activeTracking.items;
    }
    if (currentOrder?.items && currentOrder.items.length > 0) {
      return currentOrder.items;
    }
    return [
      {
        id: 'oi-1',
        title: 'Embroidered Anarkali Kurta Set',
        brand: 'Avanya Ethnic',
        size: 'M',
        price: 1299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
      },
    ];
  }, [activeTracking, currentOrder]);

  // Authoritative Grand Total
  const displayGrandTotal = useMemo(() => {
    return activeTracking?.grandTotal ?? currentOrder?.grandTotal ?? 1404;
  }, [activeTracking, currentOrder]);

  // Delivery Handshake OTP (Last 4 digits of vehicle or order)
  const deliveryOtp = useMemo(() => {
    const digits = (driver?.vehicle || effectiveOrderId).replace(/\D/g, '');
    return digits.slice(-4) || '4821';
  }, [driver, effectiveOrderId]);

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '★★★★★ Exceptional 18-Min Speed & Service';
      case 4:
        return '★★★★☆ Very Good Delivery & Fit';
      case 3:
        return '★★★☆☆ Satisfactory Experience';
      case 2:
        return '★★☆☆☆ Needs Improvement';
      case 1:
        return '★☆☆☆☆ Poor Service';
      default:
        return '★★★★★ Tap stars to rate';
    }
  };

  const handleSubmitRating = async () => {
    if (isSubmittingReview) return;
    setIsSubmittingReview(true);
    try {
      const targetProductId = (orderedItems[0] as any)?.productId || orderedItems[0]?.id || 'prod-1';
      await submitOrderRating(
        effectiveOrderId,
        selectedRating,
        selectedTags,
        reviewComment,
        targetProductId,
      );
      setIsEditingRating(false);
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
        return currentOrder?.paymentMethod === 'COD' || activeTracking?.paymentMethod === 'COD'
          ? 'Order confirmed via Cash on Delivery (COD)'
          : 'Payment verified via Razorpay Secure UPI';
      case 'ACCEPTED':
        return 'Affordz Atelier confirmed garments';
      case 'PREPARING':
        return 'Hand-pressed, steamed & quality inspected in Vault';
      case 'READY_FOR_PICKUP':
        return 'Sealed in tamper-evident breathable sleeve';
      case 'ASSIGNED':
        return driver?.name ? `${driver.name} assigned with Ather 450X EV` : 'Assigned to EV fleet pilot';
      case 'PICKED_UP':
        return 'Pilot collected garments from Vault counter';
      case 'OUT_FOR_DELIVERY':
        return deliveryAddress?.locality
          ? `Cruising on 100ft Rd to ${deliveryAddress.locality}`
          : 'Cruising toward your doorstep now';
      case 'DELIVERED':
        return 'Handed over at doorstep & size verified';
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
        orderId: effectiveOrderId,
        category: 'Delivery',
      },
    });
  };

  // Dynamic headline per stage
  const getStageHeadline = () => {
    switch (activeStatus) {
      case 'PLACED':
        return 'Order placed. Awaiting merchant confirmation at Indiranagar Atelier.';
      case 'ACCEPTED':
        return 'Atelier confirmed garments. Hand-pressing & prep initiated.';
      case 'PREPARING':
        return 'Garment hand-pressed, steamed & quality inspected in Vault.';
      case 'READY_FOR_PICKUP':
        return 'Sealed in tamper-evident breathable sleeve for pilot pickup.';
      case 'ASSIGNED':
        return `${driver.name} assigned with Ather 450X EV fleet.`;
      case 'PICKED_UP':
        return 'Pilot collected garments from Indiranagar Vault counter.';
      case 'OUT_FOR_DELIVERY':
        return `Pilot is cruising on 100ft Rd to ${deliveryAddress?.locality || 'your doorstep'} now.`;
      case 'DELIVERED':
        return 'Garment handover complete at your doorstep. Size verified and accepted.';
      default:
        return 'Garments dispatched from Indiranagar Express Hub.';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* Top Navigation Bar */}
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
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#FAF8F5',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => safeBack(router, '/orders')}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: activeStatus === 'DELIVERED' ? '#22C55E' : '#FF5A1F',
              }}
            />
            <Text style={[FontStyles.sansBold, { fontSize: 9.5, letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }]}>
              LIVE DROP TRACKING
            </Text>
          </View>
          <Text style={[FontStyles.sansBold, { fontSize: 16, color: '#111111' }]}>
            {displayOrderNumber}
          </Text>
        </View>

        <AnimatedPressable
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#FAF8F5',
            borderWidth: 1,
            borderColor: '#D9D9D5',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={onRefresh}
        >
          <RefreshCw size={16} color={isRefreshing ? '#FF5A1F' : '#6B6667'} />
        </AnimatedPressable>
      </View>

      {/* Main Single-Column Mobile-First Stream */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS !== 'web'}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#FF5A1F"
            colors={['#FF5A1F']}
          />
        }
      >
        {/* 1. Hero Live Tracking Map with Radar Telemetry */}
        <LiveTrackingMap
          status={activeStatus}
          etaMinutes={typeof displayEta === 'number' ? displayEta : 18}
          driver={driver}
          hubName={(currentOrder as any)?.vendor?.storeName || 'Indiranagar Express Hub'}
          destinationAddress={`${deliveryAddress.line1}, ${deliveryAddress.locality || ''}, ${deliveryAddress.city}`}
          isDarkStore={isDarkStore}
        />

        {/* 2. Hero Countdown / ETA Card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            padding: 18,
            borderWidth: 1,
            borderColor: '#E8E5DF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: 14,
          }}
        >
          {/* Badge Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: isDarkStore ? '#FFF7ED' : '#EFF6FF',
                borderWidth: 1,
                borderColor: isDarkStore ? '#FFEDD5' : '#DBEAFE',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              {isDarkStore ? (
                <Zap size={12} color="#FF5A1F" fill="#FF5A1F" />
              ) : (
                <Package size={12} color="#1D4ED8" />
              )}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '900',
                  color: isDarkStore ? '#C2410C' : '#1D4ED8',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                {isDarkStore
                  ? isTryAndBuy
                    ? 'TRY & BUY DOORSTEP DROP'
                    : '18-MIN HYPERLOCAL DROP'
                  : 'BOUTIQUE VENDOR DISPATCH'}
              </Text>
            </View>

            <View style={{ backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#6B6667', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {activeStatus.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {/* Countdown Headline */}
          {activeStatus === 'DELIVERED' ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={30} color="#15803D" />
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#15803D', letterSpacing: -0.5 }}>
                  DELIVERED.
                </Text>
              </View>
              <Text style={{ fontSize: 12.5, color: '#6B6667', marginTop: 4, lineHeight: 17 }}>
                Garment handover complete at your doorstep. Size verified and accepted.
              </Text>
            </View>
          ) : (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 44, fontWeight: '900', color: '#111111', letterSpacing: -1, lineHeight: 48 }}>
                  {displayEta}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: isDarkStore ? '#FF5A1F' : '#1D4ED8', letterSpacing: 0.5 }}>
                  {isDarkStore ? 'MINS' : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#4A4A4A', marginTop: 4, lineHeight: 17 }}>
                {getStageHeadline()}
              </Text>
            </View>
          )}

          {/* Try & Buy Doorstep Notice */}
          {isTryAndBuy && activeStatus !== 'DELIVERED' && (
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} color="#C2410C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#9A3412' }}>10-Minute Doorstep Fitting Window</Text>
                <Text style={{ fontSize: 10.5, color: '#7C2D12', marginTop: 1 }}>
                  Try sizes while our pilot waits. Keep what fits, return the rest on the spot.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 3. Luxury Drop & Pilot Rating Experience */}
        {existingRating && !isEditingRating ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 22,
              padding: 18,
              borderWidth: 1.5,
              borderColor: '#22C55E',
              shadowColor: '#16A34A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
              marginBottom: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <CheckCircle2 size={12} color="#15803D" />
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#15803D', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  VERIFIED DROP REVIEW
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setSelectedRating(existingRating.rating);
                  setSelectedTags(existingRating.tags);
                  setReviewComment(existingRating.comment);
                  setIsEditingRating(true);
                  setIsRatingExpanded(true);
                }}
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF5A1F' }}>
                  Edit Review
                </Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <Star
                    key={starNum}
                    size={18}
                    color={starNum <= existingRating.rating ? '#F59E0B' : '#D1D5DB'}
                    fill={starNum <= existingRating.rating ? '#F59E0B' : 'transparent'}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>
                {existingRating.rating}.0 ★
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: '#4B5563', lineHeight: 17, marginTop: 4 }}>
              Thank you! {driver.name} and the Indiranagar Vault team have been notified of your review.
            </Text>

            {existingRating.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {existingRating.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: '#FFF7ED',
                      borderWidth: 1,
                      borderColor: '#FFEDD5',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#C2410C' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {Boolean(existingRating.comment) && (
              <View style={{ marginTop: 10, padding: 10, backgroundColor: '#FAF8F5', borderRadius: 10, borderWidth: 1, borderColor: '#E8E5DF' }}>
                <Text style={{ fontSize: 11.5, color: '#374151', fontStyle: 'italic' }}>
                  "{existingRating.comment}"
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 22,
              padding: 18,
              borderWidth: 1.5,
              borderColor: activeStatus === 'DELIVERED' ? '#FF5A1F' : '#FED7AA',
              shadowColor: '#FF5A1F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 3,
              marginBottom: 14,
            }}
          >
            {/* Header Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#FFF7ED',
                  borderWidth: 1,
                  borderColor: '#FFEDD5',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Sparkles size={12} color="#FF5A1F" />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '900',
                    color: '#C2410C',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  {activeStatus === 'DELIVERED' ? 'HOW WAS YOUR DROP?' : 'PILOT & DROP FEEDBACK'}
                </Text>
              </View>

              <Pressable
                onPress={() => setIsRatingExpanded(!isRatingExpanded)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2 }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#6B6667' }}>
                  {isRatingExpanded ? 'Collapse' : 'Rate Drop'}
                </Text>
                {isRatingExpanded ? <ChevronUp size={14} color="#6B6667" /> : <ChevronDown size={14} color="#6B6667" />}
              </Pressable>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
              Rate Your 18-Min Drop Experience
            </Text>
            <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 3, lineHeight: 16 }}>
              How was your Ather EV pilot {driver.name} and your doorstep garment trial?
            </Text>

            {isRatingExpanded && (
              <View>
                {/* 5 Interactive Stars */}
                <View style={{ marginTop: 14, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const isFilled = starNum <= selectedRating;
                      return (
                        <Pressable
                          key={starNum}
                          onPress={() => setSelectedRating(starNum)}
                          style={{ padding: 4 }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Star
                            size={32}
                            color={isFilled ? '#F59E0B' : '#D1D5DB'}
                            fill={isFilled ? '#F59E0B' : 'transparent'}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#B45309', marginTop: 6 }}>
                    {getRatingLabel(selectedRating)}
                  </Text>
                </View>

                {/* Quick Praise Chips */}
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '900',
                      color: '#8E877E',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    WHAT STOOD OUT? (TAP TO SELECT)
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {FEEDBACK_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <Pressable
                          key={tag}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter((t) => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: isSelected ? '#FFF7ED' : '#FAF8F5',
                            borderWidth: 1,
                            borderColor: isSelected ? '#FF5A1F' : '#E8E5DF',
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 14,
                          }}
                        >
                          {isSelected && <Check size={11} color="#FF5A1F" strokeWidth={3} />}
                          <Text
                            style={{
                              fontSize: 10.5,
                              fontWeight: isSelected ? '800' : '600',
                              color: isSelected ? '#C2410C' : '#4B5563',
                            }}
                          >
                            {tag}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Optional Feedback Notes */}
                <View style={{ marginTop: 14 }}>
                  <TextInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder={`Add details about pilot ${driver.name} or garment sizing (optional)...`}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: '#FAF8F5',
                      borderWidth: 1,
                      borderColor: '#E8E5DF',
                      borderRadius: 14,
                      padding: 10,
                      fontSize: 12,
                      color: '#111111',
                      minHeight: 64,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>

                {/* Submit Rating CTA */}
                <View style={{ marginTop: 14 }}>
                  <AnimatedPressable
                    onPress={handleSubmitRating}
                    style={{
                      backgroundColor: '#111111',
                      borderRadius: 14,
                      paddingVertical: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                    }}
                  >
                    {isSubmittingReview ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 }}>
                          SUBMIT RATING & REVIEW
                        </Text>
                      </>
                    )}
                  </AnimatedPressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 4. Assigned Pilot EV Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#FAF8F5', borderWidth: 1.5, borderColor: '#FF5A1F', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} color="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>{driver.name}</Text>
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#B45309' }}>{driver.rating || 4.9} ★</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }}>
                  {driver.vehicle || 'Ather 450X EV • KA 03 EV 4821'}
                </Text>
              </View>
            </View>

            <AnimatedPressable
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' }}
              onPress={handleCallDriver}
            >
              <Phone size={16} color="#FFFFFF" />
            </AnimatedPressable>
          </View>

          {/* Handshake Delivery OTP badge & Pilot Rating shortcut */}
          <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#15803D" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A' }}>Delivery Handshake OTP:</Text>
              <View style={{ backgroundColor: '#FAF8F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E8E5DF' }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111', letterSpacing: 1.5 }}>{deliveryOtp}</Text>
              </View>
            </View>

            {existingRating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} color="#15803D" />
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#15803D' }}>Rated {existingRating.rating}★</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsRatingExpanded(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#FFEDD5' }}
              >
                <Star size={12} color="#FF5A1F" fill="#FF5A1F" />
                <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#C2410C' }}>Rate Pilot</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* 4. 8-Milestone Drop Progression Stepper */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <Text style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#FF5A1F', textTransform: 'uppercase', marginBottom: 16 }}>
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
                <View style={{ alignItems: 'center', marginRight: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
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
                      size={15}
                      color={stepStatus === 'PENDING' ? '#8E877E' : '#FFFFFF'}
                    />
                  </View>

                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        height: 30,
                        marginVertical: 2,
                        backgroundColor: stepStatus === 'COMPLETED' ? '#111111' : '#E8E5DF',
                      }}
                    />
                  )}
                </View>

                {/* Milestone Details */}
                <View style={{ flex: 1, paddingTop: 1, paddingBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text
                      style={{
                        fontSize: 13,
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
                      <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFEDD5' }}>
                        <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#C2410C', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                          IN PROGRESS
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: '#6B6667', lineHeight: 15 }}>{desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 5. Delivery Destination Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <MapPin size={14} color="#FF5A1F" />
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              DELIVERY DESTINATION
            </Text>
          </View>
          <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
            {deliveryAddress.label || 'Home Sanctuary'}
          </Text>
          <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 2, lineHeight: 16 }}>
            {deliveryAddress.line1}, {deliveryAddress.locality || ''}, {deliveryAddress.city} - {deliveryAddress.pincode}
          </Text>
        </View>

        {/* 6. Package Contents Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              PACKAGE CONTENTS ({orderedItems.length})
            </Text>
            <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
              {formatPrice(displayGrandTotal)}
            </Text>
          </View>

          {orderedItems.map((item: any, idx: number) => (
            <View
              key={`${item.id || idx}-${idx}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 8,
                borderBottomWidth: idx !== orderedItems.length - 1 ? 1 : 0,
                borderBottomColor: '#F4F1EA',
              }}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 44, height: 56, borderRadius: 8, backgroundColor: '#F4F1EA' }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ width: 44, height: 56, borderRadius: 8, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#6B6667" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }}>
                  Size: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.size || 'M'}</Text> • Qty: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.quantity || 1}</Text>
                  {item.trialSize ? ` • Trial: ${item.trialSize}` : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>{formatPrice(item.price || 1299)}</Text>
            </View>
          ))}
        </View>

        {/* 7. Support Concierge Button */}
        <AnimatedPressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E8E5DF',
            borderRadius: 18,
            padding: 14,
            marginBottom: 20,
          }}
          onPress={handleNeedHelp}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={16} color="#FF5A1F" />
            </View>
            <View>
              <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#111111' }}>Need Help with this Drop?</Text>
              <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 1 }}>Doorstep exchanges, rider chat & concierge</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#6B6667" />
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}
