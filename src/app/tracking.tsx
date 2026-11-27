import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  Linking,
  RefreshControl,
  BackHandler,
  Alert,
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
import { useOrderStore, isOrderItemEligibleForReview } from '@/store/useOrderStore';
import { OrderStatus } from '@/services/api';
import { getCustomerOrderStatusLabel } from '@/contracts/order-contracts';
import { LiveTrackingMap, ALL_STAGES } from '@/components/tracking/live-tracking-map';
import { trackingSocketService } from '@/services/trackingSocket';
import { getAuthToken } from '@/services/api';
import { TryAndBuySelectionCard } from '@/components/orders/try-and-buy-selection-card';
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

  // Target order ID (honest resolution with no hardcoded fallback)
  const effectiveOrderId = useMemo(() => {
    return params.orderId || activeOrder?.id || activeTracking?.orderId || orders[0]?.id || '';
  }, [params.orderId, activeOrder, activeTracking, orders]);

  // Rating & Review State
  const existingRating = orderRatings[effectiveOrderId];
  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⚡ Blazing 19-Min Speed',
    '👔 Neatly Steamed & Pressed',
  ]);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isRatingExpanded, setIsRatingExpanded] = useState(true);
  const [isEditingRating, setIsEditingRating] = useState(false);

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
  const isTerminalStatus =
    activeStatus === 'DELIVERED' ||
    activeStatus === 'CANCELLED' ||
    activeStatus === 'RETURNED' ||
    activeStatus === 'FAILED';

  // Initial and polling fetch for live tracking
  const loadTracking = useCallback(
    async (signal?: AbortSignal) => {
      if (effectiveOrderId) {
        await fetchTracking(effectiveOrderId, signal);
      }
    },
    [effectiveOrderId, fetchTracking],
  );

  useEffect(() => {
    if (!effectiveOrderId) {
      trackingSocketService.disconnect();
      return;
    }

    const controller = new AbortController();
    const safeAbort = () => {
      try {
        controller.abort(new Error('Tracking effect cleaned up'));
      } catch {
        controller.abort();
      }
    };

    void loadTracking(controller.signal);
    if (isTerminalStatus) {
      trackingSocketService.disconnect();
      return () => {
        safeAbort();
      };
    }

    trackingSocketService.connect(effectiveOrderId, getAuthToken());

    const unsubLoc = trackingSocketService.subscribeLocation((loc, route) => {
      useOrderStore.getState().updateLiveLocation(effectiveOrderId, loc, route);
    });

    const unsubStatus = trackingSocketService.subscribeStatus((newStatus) => {
      useOrderStore.getState().updateLiveStatus(effectiveOrderId, newStatus as OrderStatus);
      void loadTracking(controller.signal);
    });

    const unsubTryBuy = trackingSocketService.subscribeTryAndBuy(() => {
      void loadTracking(controller.signal);
    });

    const unsubArrival = trackingSocketService.subscribeArrival((payload) => {
      useOrderStore.getState().updateLiveArrival(effectiveOrderId, payload?.arrivedAt, payload);
      void loadTracking(controller.signal);
    });

    const interval = setInterval(() => {
      void loadTracking(controller.signal);
    }, 15000); // 15-second live polling fallback per DCR-005

    return () => {
      safeAbort();
      unsubLoc();
      unsubStatus();
      unsubTryBuy();
      unsubArrival();
      clearInterval(interval);
      trackingSocketService.disconnect();
    };
  }, [loadTracking, isTerminalStatus, effectiveOrderId]);

  // Android hardware back handler -> always return to Home
  useEffect(() => {
    const onBackPress = () => {
      router.replace('/');
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

  // Instant 19-Min Hyperlocal Drop vs Standard Boutique
  const isDarkStore = useMemo(() => {
    const fulfillment = activeTracking?.fulfillmentType || currentOrder?.fulfillmentType;
    if (fulfillment === 'DARK_STORE') return true;
    if (fulfillment === 'VENDOR') return false;
    const eta = activeTracking?.etaMinutes ?? currentOrder?.etaMinutes;
    if (typeof eta === 'number' && eta > 60) {
      return false; // Multi-day courier
    }
    return true; // 19-min instant drop
  }, [activeTracking, currentOrder]);

  const isTryAndBuy = Boolean(activeTracking?.isTryAndBuy ?? currentOrder?.isTryAndBuy ?? false);

  // Dynamic realistic ETA countdown connected to live backend/WebSocket route duration
  const displayEta = useMemo(() => {
    if (!isDarkStore) {
      return '2-4 DAYS';
    }
    if (activeStatus === 'DELIVERED') {
      return 0;
    }
    const liveRouteEta = activeTracking?.route?.durationMinutes;
    if (typeof liveRouteEta === 'number' && liveRouteEta > 0) {
      return liveRouteEta;
    }
    const backendEta = activeTracking?.etaMinutes;
    if (typeof backendEta === 'number' && backendEta > 0 && backendEta <= 60) {
      return backendEta;
    }
    const stageMeta = ALL_STAGES.find((s) => s.key === activeStatus);
    return stageMeta ? stageMeta.eta : 19;
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
    if (!rawDriver) {
      return {
        id: '',
        name: 'Assigning delivery partner...',
        phone: '',
        vehicle: '',
        rating: null,
        currentLocation: null,
      };
    }
    return {
      id: rawDriver.id || '',
      name: rawDriver.name || rawDriver.fullName || 'Delivery Partner',
      phone: rawDriver.phone || '',
      vehicle: rawDriver.vehicle || rawDriver.vehicleModel || '',
      rating: typeof rawDriver.rating === 'number' ? rawDriver.rating : null,
      currentLocation: rawDriver.currentLocation || null,
    };
  }, [activeTracking, currentOrder]);

  // Authoritative Delivery Destination
  const deliveryAddress = useMemo(() => {
    return activeTracking?.deliveryAddress || currentOrder?.address || null;
  }, [activeTracking, currentOrder]);

  // Authoritative Ordered Items
  const orderedItems = useMemo(() => {
    if (activeTracking?.items && activeTracking.items.length > 0) {
      return activeTracking.items;
    }
    if (currentOrder?.items && currentOrder.items.length > 0) {
      return currentOrder.items;
    }
    return [];
  }, [activeTracking, currentOrder]);

  // Authoritative Grand Total
  const displayGrandTotal = useMemo(() => {
    return activeTracking?.grandTotal ?? currentOrder?.grandTotal ?? 0;
  }, [activeTracking, currentOrder]);

  // Authoritative server-generated Delivery Handshake OTP (never client-derived)
  const deliveryOtp = useMemo(() => {
    return (
      (activeTracking as any)?.handoverOtp ||
      currentOrder?.handoverOtp ||
      ''
    );
  }, [activeTracking, currentOrder]);

  const canRateOrder = useMemo(
    () => Boolean(currentOrder && isOrderItemEligibleForReview({ ...currentOrder, status: activeStatus })),
    [currentOrder, activeStatus],
  );

  const handleSubmitRating = useCallback(async () => {
    if (isSubmittingReview || !effectiveOrderId || !canRateOrder) return;
    setIsSubmittingReview(true);
    try {
      const orderSnapshot = currentOrder ? { ...currentOrder, status: activeStatus } : null;
      const eligibleItem = orderedItems.find((it: any) =>
        orderSnapshot
          ? isOrderItemEligibleForReview(orderSnapshot, String(it.productId || it.id))
          : false,
      );
      const targetProductId =
        (eligibleItem as any)?.productId ||
        eligibleItem?.id ||
        (orderedItems[0] as any)?.productId ||
        orderedItems[0]?.id;
      await submitOrderRating(
        effectiveOrderId,
        selectedRating,
        selectedTags,
        reviewComment,
        targetProductId || undefined,
      );
      setIsEditingRating(false);
    } catch (err: any) {
      Alert.alert(
        'Could Not Save Rating',
        err?.message || 'Unable to submit rating right now. Please try again.',
      );
    } finally {
      setIsSubmittingReview(false);
    }
  }, [
    activeStatus,
    canRateOrder,
    currentOrder,
    effectiveOrderId,
    isSubmittingReview,
    orderedItems,
    reviewComment,
    selectedRating,
    selectedTags,
    submitOrderRating,
  ]);

  const handleCallDriver = useCallback(() => {
    if (driver?.phone && driver.phone.trim().length > 0) {
      const telUri = `tel:${driver.phone.replace(/\s+/g, '')}`;
      Linking.openURL(telUri).catch(() => {
        Alert.alert('Unable to Dial', `Please call your pilot directly at ${driver.phone}.`);
      });
      return;
    }
    Alert.alert(
      'Pilot Contact Pending',
      'Your delivery partner phone number will appear once a rider is assigned to this drop.',
    );
  }, [driver]);

  const handleNeedHelp = useCallback(() => {
    router.push({
      pathname: '/support',
      params: {
        orderId: effectiveOrderId,
        category: 'Delivery & Rider Help',
      },
    });
  }, [router, effectiveOrderId]);

  // Dynamic headline per stage
  const stageHeadline = useMemo(() => {
    switch (activeStatus) {
      case 'PLACED':
        return 'Order placed. Awaiting confirmation.';
      case 'ACCEPTED':
      case 'PACKING':
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED':
        return 'Order is getting packed and prepared for dispatch.';
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return `Out for delivery — en route to ${deliveryAddress?.locality || 'your doorstep'} now.`;
      case 'TRY_AND_BUY':
        return 'Try & Buy active at your doorstep. Complete fitting & Confirm choices.';
      case 'DELIVERED':
        return 'Order delivered. Handover complete at your doorstep.';
      case 'RETURNING':
      case 'RETURNED':
        return activeStatus === 'RETURNING'
          ? 'Order return in progress — rider returning items to hub.'
          : 'Order return completed and reconciled.';
      case 'CANCELLED':
        return 'Order cancelled.';
      case 'FAILED':
        return 'Payment failed or expired before confirmation.';
      default:
        return getCustomerOrderStatusLabel(activeStatus);
    }
  }, [activeStatus, deliveryAddress?.locality]);

  if (!effectiveOrderId) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
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
            onPress={() => router.replace('/')}
          >
            <ArrowLeft size={18} color="#111111" />
          </AnimatedPressable>
          <Text style={[FontStyles.sansBold, { fontSize: 15, color: '#111111' }]}>
            Live Tracking
          </Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <Text style={[FontStyles.sansBold, { fontSize: 18, color: '#111111', marginBottom: 8, textAlign: 'center' }]}>
            No Active Order Selected
          </Text>
          <Text style={[FontStyles.sansRegular, { fontSize: 13, color: '#6B6667', textAlign: 'center', lineHeight: 19, marginBottom: 22 }]}>
            Place an order or pick one from your order history to view live rider status and delivery milestones.
          </Text>
          <AnimatedPressable
            onPress={() => router.replace('/orders')}
            style={{ backgroundColor: '#111111', borderRadius: 999, paddingHorizontal: 22, paddingVertical: 13 }}
          >
            <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#FFFFFF', letterSpacing: 0.8 }]}>
              VIEW MY ORDERS
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

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
          onPress={() => router.replace('/')}
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
        scrollEventThrottle={16}
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
        {/* 1. Hero Live Tracking Map with Real-Time Driver GPS */}
        <LiveTrackingMap
          status={activeStatus}
          etaMinutes={typeof displayEta === 'number' ? displayEta : 19}
          driver={driver}
          hubName={activeTracking?.hubName || (currentOrder as any)?.vendor?.storeName || 'Affordz Express Hub'}
          destinationAddress={
            deliveryAddress
              ? `${deliveryAddress.line1}, ${deliveryAddress.locality || ''}, ${deliveryAddress.city}`
              : 'Delivery destination loading...'
          }
          isDarkStore={isDarkStore}
          deliveryCoordinates={activeTracking?.deliveryCoordinates}
          pickupCoordinates={activeTracking?.pickupCoordinates}
          route={activeTracking?.route}
        />

        {/* Doorstep Try & Buy Interactive Selection Card (shown once arrived or active/settled) */}
        {currentOrder &&
          Boolean(
            isTryAndBuy &&
              (activeStatus === 'TRY_AND_BUY' ||
                currentOrder.isArrived ||
                currentOrder.arrivedAt ||
                activeTracking?.isArrived ||
                activeTracking?.arrivedAt ||
                (activeTracking?.tryAndBuySession &&
                  String(activeTracking.tryAndBuySession.stage || '').toUpperCase() !==
                    'HANDOVER_PENDING') ||
                activeStatus === 'DELIVERED' ||
                activeStatus === 'RETURNING' ||
                activeStatus === 'RETURNED'),
          ) && (
            <TryAndBuySelectionCard
              order={{
                ...currentOrder,
                status: activeStatus,
                isTryAndBuy: true,
                isArrived: Boolean(activeTracking?.isArrived ?? currentOrder.isArrived),
                arrivedAt: activeTracking?.arrivedAt ?? currentOrder.arrivedAt,
                handoverOtp: activeTracking?.handoverOtp ?? currentOrder.handoverOtp,
                tryAndBuySession:
                  activeTracking?.tryAndBuySession ?? currentOrder.tryAndBuySession,
              }}
              formatPrice={formatPrice}
              onUpdated={() => {
                void loadTracking();
                void fetchOrders();
              }}
            />
          )}

        {/* 2. Hero Countdown / ETA Card */}
        <TrackingEtaCard
          isDarkStore={isDarkStore}
          isTryAndBuy={isTryAndBuy}
          activeStatus={activeStatus}
          displayEta={displayEta}
          stageHeadline={stageHeadline}
        />

        {/* 3. Luxury Drop & Pilot Rating Experience (DCR-014 Eligible Delivered/Settled Drops Only) */}
        {canRateOrder && (
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
        )}

        {/* 4. Assigned Pilot EV Card */}
        <TrackingPilotCard
          driver={driver}
          deliveryOtp={deliveryOtp}
          existingRating={existingRating}
          onCallDriver={handleCallDriver}
          onOpenRating={() => setIsRatingExpanded(true)}
        />

        {/* 5. Collapsible Drop Progression Stepper */}
        <TrackingProgressionStepper
          activeStatus={activeStatus}
          driverName={driver.name}
          locality={deliveryAddress?.locality}
          isCod={currentOrder?.paymentMethod === 'COD' || activeTracking?.paymentMethod === 'COD'}
          isTryAndBuy={isTryAndBuy}
          milestones={activeTracking?.milestones}
        />

        {/* 6. Delivery Destination Card */}
        {deliveryAddress && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <MapPin size={14} color="#FF5A1F" />
              <Text style={[FontStyles.sansBold, { fontSize: 10, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }]}>
                DELIVERY DESTINATION
              </Text>
            </View>
            <Text style={[FontStyles.sansBold, { fontSize: 13.5, fontWeight: '900', color: '#111111' }]}>
              {deliveryAddress.label || 'Delivery Address'}
            </Text>
            <Text style={[FontStyles.sansRegular, { fontSize: 11.5, color: '#6B6667', marginTop: 2, lineHeight: 16 }]}>
              {deliveryAddress.line1}, {deliveryAddress.locality || ''}, {deliveryAddress.city} - {deliveryAddress.pincode}
            </Text>
          </View>
        )}

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
              <Text style={[FontStyles.sansBold, { fontSize: 12.5, fontWeight: '900', color: '#111111' }]}>Need Help with this Drop?</Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#6B6667', marginTop: 1 }]}>Doorstep exchanges, rider chat & concierge</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#6B6667" />
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}
