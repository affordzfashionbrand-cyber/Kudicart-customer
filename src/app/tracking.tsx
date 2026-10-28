import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  Linking,
  RefreshControl,
  BackHandler,
} from 'react-native';
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  ChevronRight,
  HelpCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOrderStore } from '@/store/useOrderStore';
import { safeBack } from '@/utils/navigation';
import { OrderStatus } from '@/services/api';
import { LiveTrackingMap, ALL_STAGES } from '@/components/tracking/live-tracking-map';
import { FontStyles } from '@/constants/theme';
import { AnimatedPressable } from '@/components/common/animated-pressable';

// Modular Tracking Components
import { TrackingEtaCard } from '@/components/tracking/tracking-eta-card';
import { TrackingPilotCard } from '@/components/tracking/tracking-pilot-card';
import { TrackingPilotRatingCard } from '@/components/tracking/tracking-pilot-rating-card';
import { TrackingProgressionStepper } from '@/components/tracking/tracking-progression-stepper';
import { TrackingPackageCard } from '@/components/tracking/tracking-package-card';

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

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

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadTracking(), fetchOrders()]);
    setIsRefreshing(false);
  }, [loadTracking, fetchOrders]);

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

  // Delivery Handshake OTP
  const deliveryOtp = useMemo(() => {
    const digits = (driver?.vehicle || effectiveOrderId).replace(/\D/g, '');
    return digits.slice(-4) || '4821';
  }, [driver, effectiveOrderId]);

  const handleSubmitRating = useCallback(async () => {
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
  }, [effectiveOrderId, isSubmittingReview, orderedItems, reviewComment, selectedRating, selectedTags, submitOrderRating]);

  const handleCallDriver = useCallback(() => {
    if (driver?.phone) {
      Linking.openURL(`tel:${driver.phone.replace(/\s+/g, '')}`);
    }
  }, [driver]);

  const handleNeedHelp = useCallback(() => {
    router.push({
      pathname: '/support',
      params: {
        orderId: effectiveOrderId,
        category: 'Delivery',
      },
    });
  }, [router, effectiveOrderId]);

  // Dynamic headline per stage
  const stageHeadline = useMemo(() => {
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
  }, [activeStatus, driver.name, deliveryAddress?.locality]);

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
        <TrackingEtaCard
          isDarkStore={isDarkStore}
          isTryAndBuy={isTryAndBuy}
          activeStatus={activeStatus}
          displayEta={displayEta}
          stageHeadline={stageHeadline}
        />

        {/* 3. Luxury Drop & Pilot Rating Experience */}
        <TrackingPilotRatingCard
          existingRating={existingRating}
          isEditingRating={isEditingRating}
          setIsEditingRating={setIsEditingRating}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          isSubmittingReview={isSubmittingReview}
          isRatingExpanded={isRatingExpanded}
          setIsRatingExpanded={setIsRatingExpanded}
          handleSubmitRating={handleSubmitRating}
          activeStatus={activeStatus}
          driverName={driver.name}
        />

        {/* 4. Assigned Pilot EV Card */}
        <TrackingPilotCard
          driver={driver}
          deliveryOtp={deliveryOtp}
          existingRating={existingRating}
          onCallDriver={handleCallDriver}
          onOpenRating={() => setIsRatingExpanded(true)}
        />

        {/* 5. 8-Milestone Drop Progression Stepper */}
        <TrackingProgressionStepper
          activeStatus={activeStatus}
          driverName={driver.name}
          locality={deliveryAddress.locality}
          isCod={currentOrder?.paymentMethod === 'COD' || activeTracking?.paymentMethod === 'COD'}
        />

        {/* 6. Delivery Destination Card */}
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

        {/* 7. Package Contents Card */}
        <TrackingPackageCard
          orderedItems={orderedItems}
          displayGrandTotal={displayGrandTotal}
          formatPrice={formatPrice}
        />

        {/* 8. Support Concierge Button */}
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
