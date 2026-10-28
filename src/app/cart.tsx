import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Tag,
  Gift,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  RotateCcw,
  Lock,
  Check,
  Info,
  Package,
  AlertCircle,
  AlertTriangle,
  X,
  Trash2,
  Minus,
  Plus,
} from 'lucide-react-native';

import { useCartStore } from '@/store/useCartStore';
import { useAddressStore, checkAddressServiceability } from '@/store/useAddressStore';
import { LocationOnboardingModal } from '@/components/location/location-onboarding-modal';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AddressModal } from '@/components/address-modal';
import { AuthModal } from '@/components/auth-modal';
import { CartTopDeals, DealProduct } from '@/components/cart/cart-top-deals';
import { CartFlashUrgencyTimer } from '@/components/cart/cart-flash-urgency-timer';
import { AnimatedPriceTicker } from '@/components/common/animated-price-ticker';
import { MotionEditorialShowcase } from '@/components/common/motion-editorial-showcase';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { safeBack } from '@/utils/navigation';
import { bespokeEasing, formatPrice } from '@/data/homeData';
import { Fonts } from '@/constants/theme';

// Delivery Instructions Options (Ajio / Myntra feature)
const DELIVERY_INSTRUCTIONS = [
  { id: 'door', label: 'Leave at Door', icon: '🚪' },
  { id: 'call', label: 'Call Before Delivery', icon: '📞' },
  { id: 'bell', label: 'Do Not Ring Bell', icon: '🔕' },
  { id: 'guard', label: 'Leave with Guard', icon: '🏢' },
];

// Popular UPI Apps (Ajio / Myntra feature)
const POPULAR_UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'https://cdn-icons-png.flaticon.com/128/6124/6124998.png' },
  { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn-icons-png.flaticon.com/128/825/825454.png' },
  { id: 'paytm', name: 'Paytm', icon: 'https://cdn-icons-png.flaticon.com/128/825/825484.png' },
  { id: 'cred', name: 'CRED UPI', icon: 'https://cdn-icons-png.flaticon.com/128/1177/1177577.png' },
];

// Popular Net Banking Banks
const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'sbi', name: 'SBI', code: 'SBI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak', code: 'KOTAK' },
];

// Available Coupons
const AVAILABLE_COUPONS = [
  { code: 'AFFORDZ10', label: '10% OFF', desc: 'Instant 10% discount on order above ₹999 (Max ₹300)' },
  { code: 'FIRSTDROP', label: '₹200 OFF', desc: 'Flat ₹200 off on your first atelier order above ₹799' },
  { code: 'VAULT50', label: '₹50 OFF', desc: 'Special vault member treat on any order' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 8 : insets.top;
  const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

  // Stores
  const {
    items,
    itemTotal,
    deliveryFee,
    taxes,
    grandTotal,
    couponCode,
    discountAmount,
    giftWrap,
    donationAmount,
    applyCoupon,
    removeCoupon,
    toggleGiftWrap,
    setDonation,
    removeItem,
    updateQuantity,
    addItem,
    wishlist,
    toggleWishlist,
  } = useCartStore();

  const { addresses, selectedAddressId, setSelectedAddressId } = useAddressStore();
  const { checkout, isCheckingOut } = useOrderStore();
  const { isAuthenticated, user } = useAuthStore();

  // Screen UI State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'COD'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('hdfc');
  const [tryAndBuyEnabled, setTryAndBuyEnabled] = useState<boolean>(true);
  const [selectedInstruction, setSelectedInstruction] = useState<string>('call');
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Dark Store vs Vendor Invariant
  const hasDarkStoreItems = useMemo(() => {
    return items.some((it) => it.fulfillmentType === 'DARK_STORE' || it.isTryAndBuy);
  }, [items]);

  useEffect(() => {
    if (!hasDarkStoreItems && items.length > 0) {
      setTryAndBuyEnabled(false);
    } else if (hasDarkStoreItems) {
      setTryAndBuyEnabled(true);
    }
  }, [hasDarkStoreItems, items.length]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(100)).current;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 100, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => setToastMessage(null));
  }, [toastAnim]);

  // Item Management Handlers
  const handleRemoveItem = async (itemId: string, title?: string) => {
    await removeItem(itemId);
    showToast(title ? `Removed ${title} from bag` : 'Item removed from bag');
  };

  const handleUpdateItemQty = async (itemId: string, delta: number, title?: string, currentQty?: number) => {
    if (delta < 0 && (currentQty || 1) <= 1) {
      await handleRemoveItem(itemId, title);
      return;
    }
    await updateQuantity(itemId, delta);
    if (delta > 0) {
      showToast(`Updated quantity to ${(currentQty || 1) + 1}`);
    } else {
      showToast(`Updated quantity to ${(currentQty || 1) - 1}`);
    }
  };

  // Top Deals & Recommendations Handlers
  const cartProductIds = useMemo(() => {
    return items.map((i) => i.productId);
  }, [items]);

  const handleDealAddToCart = async (deal: DealProduct) => {
    const productPayload: any = {
      id: deal.id,
      brand: deal.brand,
      title: deal.title,
      price: deal.price,
      originalPrice: deal.originalPrice,
      discount: deal.discountBadge,
      rating: deal.rating,
      reviewsCount: deal.reviewsCount,
      stockQuantity: 15,
      readyToShip: true,
      sizes: deal.sizes,
      image: deal.image,
      altText: deal.title,
      galleryImages: [deal.image],
      category: deal.category,
      tryAndBuyEligible: true,
    };
    await addItem(productPayload, deal.sizes[0] || 'M');
    showToast(`Added ${deal.brand} to Bag!`);
  };

  const handleOpenProduct = (productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId },
    });
  };

  // Card Form State
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');

  // Coupon Input State
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Order Success State
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('KC-89241');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    orderId?: string;
    totalPaid: number;
    itemTotal: number;
    deliveryFee: number;
    taxes: number;
    discountAmount: number;
    couponCode?: string | null;
    isDarkStore: boolean;
    isTryAndBuy: boolean;
    deliveryAddress: {
      label?: string;
      line1?: string;
      locality?: string;
      city?: string;
      pincode?: string;
    } | null;
    recipientName: string;
    recipientPhone: string;
    items: Array<{
      id: string;
      title: string;
      brand: string;
      size: string;
      trialSize?: string | null;
      quantity: number;
      price: number;
      originalPrice?: number;
      image: string;
      fulfillmentType?: string;
    }>;
    etaText: string;
    paymentMethod: string;
    placedAt: string;
  } | null>(null);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Payment Simulation State (AP-02)
  const [isPaymentSimModalOpen, setIsPaymentSimModalOpen] = useState<boolean>(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);

  // Selected Address
  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  const addressServiceability = useMemo(() => {
    return checkAddressServiceability(selectedAddress);
  }, [selectedAddress]);

  // Pricing calculations
  const totalMrp = useMemo(() => {
    return items.reduce((acc, item) => {
      const orig = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : Math.round(item.price * 1.35);
      return acc + orig * item.quantity;
    }, 0);
  }, [items]);

  const discountOnMrp = Math.max(0, totalMrp - itemTotal);
  const finalPayable = grandTotal;
  const totalSavings = discountOnMrp + discountAmount;

  // Coupon Handlers
  const handleApplyCouponCode = useCallback(async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;
    const res = await applyCoupon(cleanCode);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: `Saved ${formatPrice(res.discount || 0)} with ${cleanCode}!` });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  }, [applyCoupon]);

  const handleRemoveCoupon = useCallback(async () => {
    await removeCoupon();
    setCouponFeedback(null);
  }, [removeCoupon]);

  // Card Number Formatter
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  // Checkout Handler
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    // Instant Delivery Serviceability Validation (Indiranagar Hub 8.0 km radius)
    if (hasDarkStoreItems && !addressServiceability.isServiceable) {
      setPaymentError(
        `Instant 18-minute delivery is NOT AVAILABLE for ${selectedAddress?.locality || selectedAddress?.city || 'this location'} (${addressServiceability.distanceKm} km from Indiranagar Hub, max radius 8.0 km). Please select an address within 8.0 km or remove dark store items.`
      );
      showToast('Location not available for 18-min drop!');
      setIsLocationModalOpen(true);
      return;
    }

    setPaymentError(null);

    // Validate UPI payment input
    if (selectedPaymentCategory === 'UPI' && selectedUpiApp === 'custom') {
      const trimmed = customUpiId.trim();
      if (!trimmed || !trimmed.includes('@') || trimmed.length < 5) {
        setPaymentError('Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank).');
        return;
      }
    }

    // Validate Credit/Debit Card payment input
    if (selectedPaymentCategory === 'CARD') {
      const cleanNum = cardNumber.replace(/\D/g, '');
      if (cleanNum.length !== 16) {
        setPaymentError('Please enter a valid 16-digit debit or credit card number.');
        return;
      }
      const cleanExp = cardExpiry.replace(/\D/g, '');
      if (cleanExp.length !== 4) {
        setPaymentError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      const month = parseInt(cleanExp.slice(0, 2), 10);
      if (month < 1 || month > 12) {
        setPaymentError('Card expiry month must be between 01 and 12.');
        return;
      }
      const cleanCvv = cardCvv.replace(/\D/g, '');
      if (cleanCvv.length < 3 || cleanCvv.length > 4) {
        setPaymentError('Please enter a valid 3 or 4-digit CVV code.');
        return;
      }
    }

    const isCod = selectedPaymentCategory === 'COD';
    const effectiveTryAndBuy = hasDarkStoreItems && tryAndBuyEnabled;
    const isDark = hasDarkStoreItems;
    const isTry = effectiveTryAndBuy;

    const orderItemsSnapshot = items.map((it) => ({
      id: it.id,
      title: it.title,
      brand: it.brand,
      size: it.size,
      trialSize: it.trialSize || null,
      quantity: it.quantity,
      price: it.price,
      originalPrice: it.originalPrice,
      image: it.image,
      fulfillmentType: it.fulfillmentType,
    }));

    const orderSnapshot = {
      orderNumber: `AF-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: '',
      totalPaid: finalPayable,
      itemTotal,
      deliveryFee,
      taxes,
      discountAmount,
      couponCode: couponCode || null,
      isDarkStore: isDark,
      isTryAndBuy: isTry,
      deliveryAddress: selectedAddress
        ? {
            label: selectedAddress.label,
            line1: selectedAddress.line1,
            locality: selectedAddress.locality,
            city: selectedAddress.city,
            pincode: selectedAddress.pincode,
          }
        : null,
      recipientName: user?.name || 'Affordz Customer',
      recipientPhone: user?.phone || '+91 8124188999',
      items: orderItemsSnapshot,
      etaText: isDark
        ? (isTry ? '⚡ In 18 Minutes • Doorstep Try & Buy Concierge' : '⚡ In 18 Minutes • Express Drop')
        : '📦 In 2-4 Business Days • Insured Boutique Courier',
      paymentMethod: isCod ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay Sandbox)',
      placedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const order = await checkout({
      addressId: selectedAddress.id,
      paymentMethod: isCod ? 'COD' : 'RAZORPAY',
      couponCode: couponCode || undefined,
      isTryAndBuy: effectiveTryAndBuy,
      items: orderItemsSnapshot,
      itemTotal,
      deliveryFee,
      taxes,
      grandTotal: finalPayable,
    });

    if (order) {
      orderSnapshot.orderNumber = order.orderNumber || orderSnapshot.orderNumber;
      orderSnapshot.orderId = order.id || orderSnapshot.orderId;
      if (order.grandTotal) {
        orderSnapshot.totalPaid = order.grandTotal;
      }
      setConfirmedOrder(orderSnapshot);
      setConfirmedOrderNumber(orderSnapshot.orderNumber);

      if (isCod) {
        await useCartStore.getState().clearCart();
        setOrderSuccess(true);
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 500,
          easing: bespokeEasing,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      } else {
        // Deterministic simulated payment flow (AP-02)
        setPendingPaymentOrder({ ...order, snapshot: orderSnapshot });
        setIsPaymentSimModalOpen(true);
      }
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!pendingPaymentOrder) return;
    setIsSimulatingPayment(true);
    try {
      await useOrderStore.getState().verifyPayment({
        orderId: pendingPaymentOrder.id,
        paymentId: `pay_sim_${Date.now()}`,
        signature: 'sig_abc',
      });
      const snapshot = pendingPaymentOrder.snapshot || confirmedOrder;
      if (snapshot) {
        setConfirmedOrder(snapshot);
        setConfirmedOrderNumber(snapshot.orderNumber);
      }
      await useCartStore.getState().clearCart();
      setIsPaymentSimModalOpen(false);
      setPendingPaymentOrder(null);
      setOrderSuccess(true);
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        easing: bespokeEasing,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } catch (err: any) {
      setPaymentError(err?.message || 'Payment verification failed');
      setIsPaymentSimModalOpen(false);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handleSimulatePaymentFailure = () => {
    setIsPaymentSimModalOpen(false);
    setPaymentError(
      'Simulated payment failed (Bank declined/cancelled). Your bag items and delivery choices are preserved. You can retry online payment or choose Cash on Delivery (COD).',
    );
  };

  // -------------------------------------------------------------
  // SUCCESS SCREEN
  // -------------------------------------------------------------
  if (orderSuccess) {
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
              transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
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

            <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 12, paddingVertical: 4.5, borderRadius: 20, marginBottom: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#111111', letterSpacing: 1.5 }}>
                ORDER CONFIRMED • {orderNum}
              </Text>
            </View>

            <Text style={{ fontSize: 26, fontWeight: '900', color: '#111111', textAlign: 'center', letterSpacing: -0.5, marginBottom: 6 }}>
              Order Placed Successfully!
            </Text>

            <Text style={{ fontSize: 12.5, color: '#6B6667', textAlign: 'center', maxWidth: 320, lineHeight: 18, marginBottom: 20 }}>
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
                  <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#1D4ED8', letterSpacing: 0.5 }}>
                    DEMO PAYMENT — NO REAL CHARGE
                  </Text>
                  <Text style={{ fontSize: 10.5, color: '#2563EB', marginTop: 1.5 }}>
                    Simulated sandbox transaction verified with Affordz backend ledger.
                  </Text>
                </View>
              </View>
            )}

            {/* Delivery & Fulfillment Card */}
            <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F4F1EA', paddingBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
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
                      ? (isTry ? '18-MIN DOORSTEP TRY & BUY' : '18-MIN EXPRESS DROP')
                      : 'BOUTIQUE VENDOR STANDARD SHIPPING'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                  Paid {formatPrice(paidAmount)}
                </Text>
              </View>

              {/* Address Row */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <MapPin size={16} color="#FF5A1F" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>
                    Delivering to {addr?.label || 'Home'}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 2, lineHeight: 16 }} numberOfLines={2}>
                    {addr ? `${addr.line1}, ${addr.locality ? addr.locality + ', ' : ''}${addr.city} - ${addr.pincode}` : 'Registered Address'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#71717A', marginTop: 2, fontWeight: '600' }}>
                    {confirmedOrder?.recipientName || user?.name || 'Affordz Customer'} • {confirmedOrder?.recipientPhone || user?.phone || '+91 8124188999'}
                  </Text>
                </View>
              </View>

              {/* ETA Row */}
              <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: isDark ? '#22C55E' : '#3B82F6' }} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: isDark ? '#15803D' : '#1D4ED8' }}>
                    {confirmedOrder?.etaText || (isDark ? '⚡ Estimated: In 18 Minutes' : '📦 Estimated: 2-4 Business Days')}
                  </Text>
                </View>
                <Text style={{ fontSize: 10.5, color: '#71717A' }}>
                  {isDark ? 'Indiranagar Vault' : 'Insured Courier'}
                </Text>
              </View>
            </View>

            {/* Ordered Items Preview */}
            {orderItems.length > 0 && (
              <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 20 }}>
                <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#6B6667', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  ORDERED CAPSULE ({orderItems.reduce((acc, it) => acc + it.quantity, 0)} ITEMS)
                </Text>
                <View style={{ gap: 10 }}>
                  {orderItems.map((item, idx) => (
                    <View key={`${item.id}-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 44, height: 54, borderRadius: 8, backgroundColor: '#F0ECE4' }}
                        contentFit="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#6B6667' }}>
                          {item.brand}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <Text style={{ fontSize: 10.5, color: '#71717A' }}>
                            Size: {item.size} • Qty: {item.quantity}
                          </Text>
                          {item.trialSize && (
                            <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#C2410C' }}>
                                Trial: {item.trialSize}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
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
                <Text style={{ color: '#FFFFFF', fontSize: 12.5, fontWeight: '900', letterSpacing: 1.2 }}>
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
                <Text style={{ color: '#111111', fontSize: 12.5, fontWeight: '800', letterSpacing: 1 }}>
                  CONTINUE SHOPPING
                </Text>
              </AnimatedPressable>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------
  // EMPTY CART SCREEN
  // -------------------------------------------------------------
  if (items.length === 0 && !orderSuccess && !pendingPaymentOrder && !isPaymentSimModalOpen && !isSimulatingPayment) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
        <View style={{ paddingTop, backgroundColor: 'rgba(250, 248, 245, 0.96)', borderBottomWidth: 1, borderBottomColor: '#E8E5DF', flexDirection: 'row', alignItems: 'center', height: 60 + paddingTop, paddingHorizontal: 16 }}>
          <AnimatedPressable
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => safeBack(router)}
          >
            <ArrowLeft size={18} color="#111111" />
          </AnimatedPressable>
          <View style={{ flex: 1, alignItems: 'center', marginRight: 38 }}>
            <Text style={{ fontSize: 9.5, fontWeight: '800', letterSpacing: 1.5, color: '#6B6667', textTransform: 'uppercase' }}>
              CHECKOUT
            </Text>
            <EditorialText first="Order" second="payment." fontSize={17} lineHeight={20} singleLine withDot />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#F0ECE4', justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
              <Package size={32} color="#111111" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#111111', marginBottom: 4 }}>
              Your bag is empty
            </Text>
            <Text style={{ fontSize: 12.5, color: '#6B6667', textAlign: 'center', maxWidth: 280, lineHeight: 17, marginBottom: 18 }}>
              Explore our curated collections of artisanal wear or pick from trending top deals below.
            </Text>
            <AnimatedPressable
              style={{ backgroundColor: '#111111', borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 }}
              onPress={() => safeBack(router)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800', letterSpacing: 1.1 }}>
                EXPLORE ATELIER
              </Text>
            </AnimatedPressable>
          </View>

          {/* Top Deals Curated For You in Empty Bag */}
          <View style={{ paddingHorizontal: 16 }}>
            <CartTopDeals
              onAddToCart={handleDealAddToCart}
              onOpenProduct={handleOpenProduct}
              cartProductIds={cartProductIds}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              title="Top Deals Curated For You"
              subtitle="EXCLUSIVE ATELIER DISCOUNTS • 18-MIN EXPRESS DROP"
            />

            <View style={{ marginTop: 24, marginBottom: 12 }}>
              <MotionEditorialShowcase onSelectProduct={handleOpenProduct} />
            </View>
          </View>
        </ScrollView>

        {/* Floating Action Feedback Toast */}
        {toastMessage && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 40,
              alignSelf: 'center',
              backgroundColor: 'rgba(17, 17, 17, 0.95)',
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              zIndex: 99,
              transform: [{ translateY: toastAnim }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <CheckCircle2 size={14} color="#22C55E" />
            <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }}>{toastMessage}</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // -------------------------------------------------------------
  // MAIN CHECKOUT SCREEN (AJIO & MYNTRA FEATURE COMPLETE)
  // -------------------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* 1. Header with Progress Stepper (Ajio & Myntra Signature) */}
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
            onPress={() => safeBack(router)}
          >
            <ArrowLeft size={18} color="#111111" />
          </AnimatedPressable>

          {/* Stepper Pills */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' }}>
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#111111' }}>BAG</Text>
            </View>

            <View style={{ width: 14, height: 1.5, backgroundColor: '#111111' }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' }}>
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#111111' }}>ADDRESS</Text>
            </View>

            <View style={{ width: 14, height: 1.5, backgroundColor: '#111111' }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF' }}>3</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>PAYMENT</Text>
            </View>
          </View>

          {/* 100% Secure Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Lock size={12} color="#15803D" />
            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#15803D', letterSpacing: 0.5 }}>SECURE</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        removeClippedSubviews={Platform.OS !== 'web'}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
      >
        {/* 2. Top Banner: Total Savings Announcement (Myntra style) */}
        {totalSavings > 0 && (
          <View style={{ backgroundColor: '#ECFDF5', borderBottomWidth: 1, borderBottomColor: '#D1FAE5', paddingVertical: 9, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Sparkles size={14} color="#059669" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#065F46' }}>
              Yay! You are saving {formatPrice(totalSavings)} on this order!
            </Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          {/* Payment Simulation Error / Declined Banner (AP-02) */}
          {paymentError && (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: '#FCA5A5',
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <AlertCircle size={18} color="#DC2626" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#991B1B' }}>
                  Payment Simulation Declined / Cancelled
                </Text>
                <Text style={{ fontSize: 11, color: '#B91C1C', marginTop: 2, lineHeight: 16 }}>
                  {paymentError}
                </Text>
              </View>
              <Pressable onPress={() => setPaymentError(null)} hitSlop={8}>
                <X size={16} color="#991B1B" />
              </Pressable>
            </View>
          )}

          {/* Animated 18-Min Express Vault Urgency Progress Bar & Timer */}
          <View style={{ marginBottom: 12 }}>
            <CartFlashUrgencyTimer initialMinutes={18} />
          </View>

          {/* Guest Sign-In Notice if not authenticated */}
          {!isAuthenticated && (
            <Pressable
              onPress={() => setIsAuthModalOpen(true)}
              style={({ pressed }) => ({
                backgroundColor: '#111111',
                borderRadius: 16,
                padding: 14,
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1.5,
                borderColor: '#FF5A1F',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Lock size={15} color="#FF5A1F" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                    Sign In Required to Buy
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#A0A0A0', marginTop: 3, lineHeight: 15 }}>
                  Verify your phone number with instant OTP to access your saved delivery address and place order.
                </Text>
              </View>
              <View style={{ backgroundColor: '#FF5A1F', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>SIGN IN</Text>
              </View>
            </Pressable>
          )}

          {/* 3. Delivery Address Card (Ajio / Myntra format) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#6B6667', letterSpacing: 1, textTransform: 'uppercase' }}>
                  DELIVER TO
                </Text>
                <View style={{ backgroundColor: isAuthenticated ? '#111111' : '#FF5A1F', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase' }}>
                    {isAuthenticated ? selectedAddress?.label || 'HOME' : 'LOGIN REQUIRED'}
                  </Text>
                </View>
              </View>

              {/* Change / Sign In Action */}
              <Pressable
                onPress={() => (isAuthenticated ? setIsLocationModalOpen(true) : setIsAuthModalOpen(true))}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: '#111111',
                  borderRadius: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  backgroundColor: pressed ? '#F4F1EA' : '#FFFFFF',
                })}
              >
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>
                  {isAuthenticated ? (selectedAddress ? 'CHANGE' : 'ADD ADDRESS') : 'SIGN IN'}
                </Text>
              </Pressable>
            </View>

            {/* Address Details */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F4F1EA', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                <MapPin size={16} color="#111111" />
              </View>
              <View style={{ flex: 1 }}>
                {isAuthenticated ? (
                  <>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#111111' }}>
                      {user?.name || 'Affordz Customer'}{' '}
                      <Text style={{ fontSize: 12, color: '#71717A', fontWeight: '500' }}>
                        • {user?.phone || '+91 8124188999'}
                      </Text>
                    </Text>
                    <Text style={{ fontSize: 12, color: selectedAddress ? '#4A4A4A' : '#DC2626', marginTop: 3, lineHeight: 17, fontWeight: selectedAddress ? '400' : '700' }}>
                      {selectedAddress
                        ? `${selectedAddress.line1}, ${selectedAddress.locality || ''}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                        : 'No delivery address found. Please tap ADD ADDRESS above.'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626' }}>
                      Guest Client • Authentication Required
                    </Text>
                    <Text style={{ fontSize: 12, color: '#71717A', marginTop: 3, lineHeight: 17 }}>
                      Please sign in with your phone OTP to connect your delivery address and receive delivery updates.
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Serviceability Radius Banner */}
            {!addressServiceability.isServiceable ? (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1.5,
                  borderColor: '#FCA5A5',
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={15} color="#DC2626" />
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 0.5 }}>
                      NOT AVAILABLE FOR THIS PLACE
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 7, paddingVertical: 1.5, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#B91C1C' }}>
                      {addressServiceability.distanceKm} KM (MAX 8.0 KM)
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 11.5, color: '#991B1B', lineHeight: 16 }}>
                  {hasDarkStoreItems
                    ? `Our 18-minute quick drop and Try & Buy fleet only operates within 8.0 km of Indiranagar Hub. ${selectedAddress?.locality || selectedAddress?.city || 'Selected address'} is ${addressServiceability.distanceKm} km away.`
                    : 'Standard boutique delivery will arrive via insured courier in 2-4 business days.'}
                </Text>

                <Pressable
                  onPress={() => setIsLocationModalOpen(true)}
                  style={{
                    marginTop: 8,
                    backgroundColor: '#DC2626',
                    borderRadius: 10,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    alignSelf: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <MapPin size={12} color="#FFFFFF" />
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>
                    CHANGE TO SERVICEABLE LOCATION
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Zap size={12} color="#15803D" fill="#15803D" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>
                    ⚡ 18-Min Instant Drop Available
                  </Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#166534' }}>
                  {addressServiceability.distanceKm} km from Hub
                </Text>
              </View>
            )}

            {/* Delivery ETA Pill */}
            <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: !addressServiceability.isServiceable && hasDarkStoreItems ? '#DC2626' : (hasDarkStoreItems ? '#22C55E' : '#3B82F6') }} />
                <Text style={{ fontSize: 11.5, fontWeight: '800', color: !addressServiceability.isServiceable && hasDarkStoreItems ? '#DC2626' : (hasDarkStoreItems ? '#15803D' : '#1D4ED8') }}>
                  {!addressServiceability.isServiceable && hasDarkStoreItems
                    ? '⚠️ Instant Drop Not Serviceable at this Address'
                    : hasDarkStoreItems
                    ? '⚡ Estimated Delivery: In 18 Minutes'
                    : '📦 Boutique Dispatch: In 2-4 Business Days'}
                </Text>
              </View>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>
                {hasDarkStoreItems ? 'Indiranagar Vault' : 'Artisan Atelier'}
              </Text>
            </View>
          </View>

          {/* 4. Doorstep Try & Buy Feature Toggle (Ajio / Myntra Exclusive) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: hasDarkStoreItems ? '#FFF7ED' : '#F4F4F5',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Zap size={18} color={hasDarkStoreItems ? '#FF5A1F' : '#A1A1AA'} fill={hasDarkStoreItems ? '#FF5A1F' : '#A1A1AA'} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '900', color: hasDarkStoreItems ? '#111111' : '#71717A' }}>
                      Doorstep Try & Buy
                    </Text>
                    {hasDarkStoreItems ? (
                      <View style={{ backgroundColor: '#FF5A1F', paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 }}>
                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>FREE TRIAL</Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#E4E4E7', paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: '#71717A' }}>DARK STORE ONLY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                    {hasDarkStoreItems
                      ? 'Rider waits 15 mins while you try sizes. Keep what fits, return the rest on the spot!'
                      : 'Doorstep Try & Buy is exclusive to 18-minute Dark Store items. Boutique vendor orders are delivered via standard shipping with 7-day doorstep returns.'}
                  </Text>
                </View>
              </View>

              {/* Toggle Switch */}
              <Pressable
                disabled={!hasDarkStoreItems}
                onPress={() => hasDarkStoreItems && setTryAndBuyEnabled(!tryAndBuyEnabled)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: !hasDarkStoreItems ? '#E4E4E7' : tryAndBuyEnabled ? '#111111' : '#D9D9D5',
                  padding: 2,
                  justifyContent: 'center',
                  opacity: !hasDarkStoreItems ? 0.6 : 1,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    alignSelf: hasDarkStoreItems && tryAndBuyEnabled ? 'flex-end' : 'flex-start',
                  }}
                />
              </Pressable>
            </View>
          </View>

          {/* 5. Delivery Instructions / Preferences (Ajio / Myntra style) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#6B6667', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              DELIVERY PREFERENCES
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DELIVERY_INSTRUCTIONS.map((inst) => {
                const isSelected = selectedInstruction === inst.id;
                return (
                  <Pressable
                    key={inst.id}
                    onPress={() => setSelectedInstruction(inst.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? '#111111' : '#E8E5DF',
                      backgroundColor: isSelected ? '#F4F1EA' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{inst.icon}</Text>
                    <Text style={{ fontSize: 11, fontWeight: isSelected ? '800' : '600', color: '#111111' }}>
                      {inst.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 6. Order Items Preview (Collapsible Accordion) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14, overflow: 'hidden' }}>
            <Pressable
              onPress={() => setIsItemsExpanded(!isItemsExpanded)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Package size={17} color="#111111" />
                <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
                  Items in this order ({items.length})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 11, color: '#71717A', fontWeight: '600' }}>
                  {isItemsExpanded ? 'Hide' : 'View All'}
                </Text>
                {isItemsExpanded ? <ChevronUp size={16} color="#111111" /> : <ChevronDown size={16} color="#111111" />}
              </View>
            </Pressable>

            {/* Collapsed Preview Horizontal Strip */}
            {!isItemsExpanded && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                overScrollMode="never"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}
              >
                {items.map((item) => (
                  <View key={item.id} style={{ width: 66, height: 82, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E8E5DF', backgroundColor: '#F4F1EA', position: 'relative' }}>
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    <Pressable
                      onPress={() => handleRemoveItem(item.id, item.title)}
                      hitSlop={6}
                      style={({ pressed }) => ({
                        position: 'absolute',
                        top: 3,
                        right: 3,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: pressed ? '#DC2626' : 'rgba(17, 17, 17, 0.85)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.title}`}
                    >
                      <X size={11} color="#FFFFFF" strokeWidth={3} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Expanded Item List with Remove & Quantity Stepper */}
            {isItemsExpanded && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
                {items.map((item, idx) => (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      gap: 12,
                      paddingVertical: 14,
                      borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                      borderBottomColor: '#F4F1EA',
                    }}
                  >
                    <Image source={{ uri: item.image }} style={{ width: 68, height: 88, borderRadius: 10 }} contentFit="cover" />
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View>
                        {/* Brand & Remove Button Row */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#6B6667', textTransform: 'uppercase', flex: 1, marginRight: 8 }} numberOfLines={1}>
                            {item.brand}
                          </Text>

                          {/* Explicit Remove Item Button */}
                          <Pressable
                            onPress={() => handleRemoveItem(item.id, item.title)}
                            hitSlop={10}
                            style={({ pressed }) => ({
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 8,
                              backgroundColor: pressed ? '#FEE2E2' : '#F4F1EA',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: -2,
                            })}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${item.title} from cart`}
                          >
                            <Trash2 size={12} color="#EF4444" />
                            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 }}>
                              REMOVE
                            </Text>
                          </Pressable>
                        </View>

                        <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#111111', marginTop: 2 }} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>

                      {/* Size & Interactive Quantity Stepper Row */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ fontSize: 11, color: '#71717A' }}>
                          Size: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.size || 'M'}</Text>
                        </Text>

                        {/* Quantity Stepper with Minus/Trash & Plus */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#E5E0D8',
                            borderRadius: 14,
                            backgroundColor: '#FAF8F5',
                            height: 28,
                            paddingHorizontal: 4,
                            gap: 6,
                          }}
                        >
                          <Pressable
                            onPress={() => handleUpdateItemQty(item.id, -1, item.title, item.quantity)}
                            hitSlop={8}
                            style={({ pressed }) => ({
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: pressed ? '#E8E5DF' : 'transparent',
                              alignItems: 'center',
                              justifyContent: 'center',
                            })}
                            accessibilityRole="button"
                            accessibilityLabel="Decrease quantity"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 size={11} color="#EF4444" />
                            ) : (
                              <Minus size={11} color="#111111" strokeWidth={2.5} />
                            )}
                          </Pressable>

                          <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#111111', minWidth: 18, textAlign: 'center' }}>
                            {item.quantity}
                          </Text>

                          <Pressable
                            onPress={() => handleUpdateItemQty(item.id, 1, item.title, item.quantity)}
                            hitSlop={8}
                            style={({ pressed }) => ({
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: pressed ? '#E8E5DF' : 'transparent',
                              alignItems: 'center',
                              justifyContent: 'center',
                            })}
                            accessibilityRole="button"
                            accessibilityLabel="Increase quantity"
                          >
                            <Plus size={11} color="#111111" strokeWidth={2.5} />
                          </Pressable>
                        </View>
                      </View>

                      {/* Try & Buy / Delivery Badge */}
                      {item.fulfillmentType === 'DARK_STORE' || item.isTryAndBuy ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Zap size={9} color="#C2410C" fill="#C2410C" />
                            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#9A3412' }}>
                              ⚡ 18-MIN DROP • TRY & BUY {item.trialSize ? `• Trial: ${item.trialSize}` : ''}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Package size={9} color="#1D4ED8" />
                            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#1D4ED8' }}>
                              🛍️ BOUTIQUE VENDOR • 2-4 DAYS
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Price Row */}
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                          {formatPrice(item.price * item.quantity)}
                        </Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <Text style={{ fontSize: 11, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
                            {formatPrice(item.originalPrice * item.quantity)}
                          </Text>
                        )}
                        {item.quantity > 1 && (
                          <Text style={{ fontSize: 9.5, color: '#71717A' }}>
                            ({formatPrice(item.price)} each)
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Top Deals & Style Suggestions (Ajio & Myntra Signature Cross-Sell) */}
          <CartTopDeals
            onAddToCart={handleDealAddToCart}
            onOpenProduct={handleOpenProduct}
            cartProductIds={cartProductIds}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            title="Top Deals & Suggestions"
            subtitle="FREQUENTLY ADDED TOGETHER • 18-MIN EXPRESS DROP"
          />

          {/* 7. Apply Coupons & Bank Offers Section (Ajio / Myntra format) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Tag size={16} color="#111111" />
                <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
                  Coupons & Bank Offers
                </Text>
              </View>
              {couponCode && (
                <Pressable onPress={handleRemoveCoupon}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444' }}>REMOVE</Text>
                </Pressable>
              )}
            </View>

            {/* Coupon Code Input */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <View style={{ flex: 1, height: 42, borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: '#FAF8F5' }}>
                <TextInput
                  placeholder="Enter coupon code (e.g. KUDI10)"
                  placeholderTextColor="#A0A0A0"
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                  style={{ fontSize: 12, fontWeight: '700', color: '#111111' }}
                />
              </View>
              <Pressable
                onPress={() => handleApplyCouponCode(couponInput)}
                style={({ pressed }) => ({
                  backgroundColor: '#111111',
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '900', letterSpacing: 0.5 }}>
                  APPLY
                </Text>
              </Pressable>
            </View>

            {/* Coupon Feedback */}
            {couponFeedback && (
              <View style={{ marginBottom: 12, padding: 8, borderRadius: 8, backgroundColor: couponFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: couponFeedback.type === 'success' ? '#065F46' : '#991B1B' }}>
                  {couponFeedback.text}
                </Text>
              </View>
            )}

            {/* Quick Available Coupon Chips */}
            <View style={{ gap: 8 }}>
              {AVAILABLE_COUPONS.map((cpn) => {
                const isCurrent = couponCode === cpn.code;
                return (
                  <View
                    key={cpn.code}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 10,
                      borderRadius: 12,
                      backgroundColor: isCurrent ? '#ECFDF5' : '#FAF8F5',
                      borderWidth: 1,
                      borderColor: isCurrent ? '#A7F3D0' : '#E8E5DF',
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>{cpn.code}</Text>
                        <View style={{ backgroundColor: '#111111', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                          <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#FFFFFF' }}>{cpn.label}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2 }}>{cpn.desc}</Text>
                    </View>
                    <Pressable
                      onPress={() => (isCurrent ? handleRemoveCoupon() : handleApplyCouponCode(cpn.code))}
                      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '900', color: isCurrent ? '#059669' : '#111111' }}>
                        {isCurrent ? 'APPLIED' : 'APPLY'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 8. Payment Method Selection (The Core Myntra / Ajio Architecture) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} color="#111111" />
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>
                  Select Payment Option
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={14} color="#15803D" />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>100% SECURE</Text>
              </View>
            </View>

            {!isProduction && (
              <View
                style={{
                  backgroundColor: '#F0F9FF',
                  borderWidth: 1,
                  borderColor: '#FFEDD5',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Info size={14} color="#C2410C" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9A3412', flex: 1 }}>
                  DEMO MODE: Simulated test payments active — no real funds charged.
                </Text>
              </View>
            )}

            {/* Category 1: UPI (Recommended) */}
            <View style={{ marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: selectedPaymentCategory === 'UPI' ? '#111111' : '#E8E5DF', overflow: 'hidden' }}>
              <Pressable
                onPress={() => setSelectedPaymentCategory('UPI')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: selectedPaymentCategory === 'UPI' ? '#FAF8F5' : '#FFFFFF' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedPaymentCategory === 'UPI' ? '#111111' : '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedPaymentCategory === 'UPI' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />}
                  </View>
                  <Smartphone size={18} color="#111111" />
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>UPI (Instant & Free)</Text>
                      <View style={{ backgroundColor: '#22C55E', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>RECOMMENDED</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#71717A' }}>Google Pay, PhonePe, Paytm, CRED</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>FASTEST</Text>
              </Pressable>

              {/* Sub-options for UPI */}
              {selectedPaymentCategory === 'UPI' && (
                <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#6B6667', marginBottom: 10 }}>
                    SELECT UPI APP:
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                    {POPULAR_UPI_APPS.map((app) => {
                      const isChosen = selectedUpiApp === app.id;
                      return (
                        <Pressable
                          key={app.id}
                          onPress={() => setSelectedUpiApp(app.id)}
                          style={{
                            alignItems: 'center',
                            width: '23%',
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: isChosen ? '#111111' : '#E8E5DF',
                            backgroundColor: isChosen ? '#F4F1EA' : '#FFFFFF',
                          }}
                        >
                          <Image source={{ uri: app.icon }} style={{ width: 28, height: 28 }} contentFit="contain" />
                          <Text style={{ fontSize: 10, fontWeight: isChosen ? '800' : '600', color: '#111111', marginTop: 4 }}>
                            {app.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Or Custom UPI ID Input */}
                  <View style={{ borderTopWidth: 1, borderTopColor: '#F4F1EA', paddingTop: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 6 }}>
                      Or Pay using UPI ID / VPA
                    </Text>
                    <View style={{ height: 40, borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' }}>
                      <TextInput
                        placeholder="e.g. mobile@okhdfcbank"
                        placeholderTextColor="#A0A0A0"
                        value={customUpiId}
                        onChangeText={setCustomUpiId}
                        style={{ fontSize: 12, color: '#111111' }}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Category 2: Credit / Debit Cards (Visa, MasterCard, RuPay) */}
            <View style={{ marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: selectedPaymentCategory === 'CARD' ? '#111111' : '#E8E5DF', overflow: 'hidden' }}>
              <Pressable
                onPress={() => setSelectedPaymentCategory('CARD')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: selectedPaymentCategory === 'CARD' ? '#FAF8F5' : '#FFFFFF' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedPaymentCategory === 'CARD' ? '#111111' : '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedPaymentCategory === 'CARD' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />}
                  </View>
                  <CreditCard size={18} color="#111111" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Credit / Debit Cards</Text>
                    <Text style={{ fontSize: 10.5, color: '#71717A' }}>Visa, MasterCard, RuPay, Amex</Text>
                  </View>
                </View>
              </Pressable>

              {/* Sub-options for Card Form */}
              {selectedPaymentCategory === 'CARD' && (
                <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF', gap: 10 }}>
                  <View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>CARD NUMBER</Text>
                    <View style={{ height: 40, borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' }}>
                      <TextInput
                        placeholder="XXXX XXXX XXXX XXXX"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={handleCardNumberChange}
                        style={{ fontSize: 12.5, fontWeight: '700', color: '#111111' }}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>VALID THRU</Text>
                      <View style={{ height: 40, borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' }}>
                        <TextInput
                          placeholder="MM/YY"
                          placeholderTextColor="#A0A0A0"
                          keyboardType="numeric"
                          value={cardExpiry}
                          onChangeText={handleExpiryChange}
                          style={{ fontSize: 12.5, fontWeight: '700', color: '#111111' }}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>CVV</Text>
                      <View style={{ height: 40, borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' }}>
                        <TextInput
                          placeholder="•••"
                          placeholderTextColor="#A0A0A0"
                          keyboardType="numeric"
                          maxLength={4}
                          secureTextEntry
                          value={cardCvv}
                          onChangeText={setCardCvv}
                          style={{ fontSize: 12.5, fontWeight: '700', color: '#111111' }}
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>NAME ON CARD</Text>
                    <View style={{ height: 40, borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' }}>
                      <TextInput
                        placeholder="Name as on card"
                        placeholderTextColor="#A0A0A0"
                        value={cardName}
                        onChangeText={setCardName}
                        style={{ fontSize: 12, fontWeight: '600', color: '#111111' }}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Category 3: Net Banking */}
            <View style={{ marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: selectedPaymentCategory === 'NET_BANKING' ? '#111111' : '#E8E5DF', overflow: 'hidden' }}>
              <Pressable
                onPress={() => setSelectedPaymentCategory('NET_BANKING')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: selectedPaymentCategory === 'NET_BANKING' ? '#FAF8F5' : '#FFFFFF' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedPaymentCategory === 'NET_BANKING' ? '#111111' : '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedPaymentCategory === 'NET_BANKING' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />}
                  </View>
                  <Building2 size={18} color="#111111" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Net Banking</Text>
                    <Text style={{ fontSize: 10.5, color: '#71717A' }}>All major Indian banks supported</Text>
                  </View>
                </View>
              </Pressable>

              {/* Sub-options for Net Banking */}
              {selectedPaymentCategory === 'NET_BANKING' && (
                <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF' }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {POPULAR_BANKS.map((b) => {
                      const isChosen = selectedBank === b.id;
                      return (
                        <Pressable
                          key={b.id}
                          onPress={() => setSelectedBank(b.id)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 10,
                            borderWidth: 1.5,
                            borderColor: isChosen ? '#111111' : '#E8E5DF',
                            backgroundColor: isChosen ? '#F4F1EA' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: isChosen ? '900' : '600', color: '#111111' }}>
                            {b.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Category 4: Cash on Delivery (COD) */}
            <View style={{ borderRadius: 14, borderWidth: 1, borderColor: selectedPaymentCategory === 'COD' ? '#111111' : '#E8E5DF', overflow: 'hidden' }}>
              <Pressable
                onPress={() => setSelectedPaymentCategory('COD')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: selectedPaymentCategory === 'COD' ? '#FAF8F5' : '#FFFFFF' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedPaymentCategory === 'COD' ? '#111111' : '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedPaymentCategory === 'COD' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />}
                  </View>
                  <Banknote size={18} color="#111111" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Cash on Delivery (COD)</Text>
                    <Text style={{ fontSize: 10.5, color: '#71717A' }}>Pay cash or scan QR on arrival</Text>
                  </View>
                </View>
              </Pressable>

              {selectedPaymentCategory === 'COD' && (
                <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF' }}>
                  <View style={{ backgroundColor: '#F0ECE4', padding: 10, borderRadius: 10 }}>
                    <Text style={{ fontSize: 11, color: '#4A4A4A', lineHeight: 16 }}>
                      ℹ️ You can pay via Cash or UPI QR Code directly to the delivery concierge. Doorstep Try & Buy is fully supported!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* 9. Value-Add Addons: Gift Wrap & Donation (Myntra signature) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#6B6667', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
              ORDER VALUE ADDS
            </Text>

            {/* Gift Wrap */}
            <Pressable
              onPress={toggleGiftWrap}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F4F1EA' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: giftWrap ? '#FFF7ED' : '#F7F5F0', justifyContent: 'center', alignItems: 'center' }}>
                  <Gift size={16} color={giftWrap ? '#FF5A1F' : '#111111'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>Artisan Gift Wrap (₹35)</Text>
                  <Text style={{ fontSize: 10.5, color: '#71717A' }}>Hand-tied satin ribbon with personalized note</Text>
                </View>
              </View>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: giftWrap ? '#111111' : '#D9D9D5', backgroundColor: giftWrap ? '#111111' : '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                {giftWrap && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </Pressable>

            {/* Handloom Weaver Donation */}
            <View style={{ paddingTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Heart size={14} color="#EF4444" fill="#EF4444" />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>Support Indian Handloom Weavers</Text>
                </View>
                {donationAmount > 0 && (
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>+{formatPrice(donationAmount)}</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[10, 20, 50].map((amt) => {
                  const isSelected = donationAmount === amt;
                  return (
                    <Pressable
                      key={amt}
                      onPress={() => setDonation(isSelected ? 0 : amt)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: isSelected ? '#111111' : '#E8E5DF',
                        backgroundColor: isSelected ? '#111111' : '#FAF8F5',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: isSelected ? '#FFFFFF' : '#111111' }}>
                        ₹{amt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* 10. Detailed Price Breakdown (Myntra "Price Details" layout) */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#6B6667', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
              PRICE DETAILS ({items.length} {items.length === 1 ? 'Item' : 'Items'})
            </Text>

            <View style={{ gap: 11 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Total MRP</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(totalMrp)}</Text>
              </View>

              {discountOnMrp > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Discount on MRP</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>- {formatPrice(discountOnMrp)}</Text>
                </View>
              )}

              {discountAmount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Coupon Discount ({couponCode})</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>- {formatPrice(discountAmount)}</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Doorstep Try & Buy</Text>
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#065F46' }}>FREE</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>FREE</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#4A4A4A' }}>18-Min Express Vault Delivery</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: deliveryFee === 0 ? '#15803D' : '#111111' }}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </Text>
              </View>

              {giftWrap && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Artisan Gift Wrap</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>₹35</Text>
                </View>
              )}

              {donationAmount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Handloom Weavers Donation</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(donationAmount)}</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Taxes & GST (5%)</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(taxes)}</Text>
              </View>

              {/* Total Amount */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14, marginTop: 4, borderTopWidth: 1, borderTopColor: '#E8E5DF' }}>
                <Text style={{ fontSize: 15, fontWeight: '900', color: '#111111' }}>Total Amount</Text>
                <AnimatedPriceTicker
                  value={finalPayable}
                  style={{ fontSize: 20, fontWeight: '900', color: '#111111' }}
                />
              </View>
            </View>
          </View>

          {/* 11. Affordz & Trust Badges (Ajio & Myntra trust section) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, marginBottom: 20 }}>
            <View style={{ alignItems: 'center', width: '31%' }}>
              <ShieldCheck size={20} color="#111111" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', marginTop: 4, textAlign: 'center' }}>
                100% GENUINE
              </Text>
              <Text style={{ fontSize: 9, color: '#71717A', textAlign: 'center' }}>Direct from Ateliers</Text>
            </View>

            <View style={{ alignItems: 'center', width: '31%' }}>
              <RotateCcw size={20} color="#111111" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', marginTop: 4, textAlign: 'center' }}>
                7 DAYS RETURN
              </Text>
              <Text style={{ fontSize: 9, color: '#71717A', textAlign: 'center' }}>Instant Doorstep Pickup</Text>
            </View>

            <View style={{ alignItems: 'center', width: '31%' }}>
              <Lock size={20} color="#111111" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', marginTop: 4, textAlign: 'center' }}>
                SECURE PAY
              </Text>
              <Text style={{ fontSize: 9, color: '#71717A', textAlign: 'center' }}>256-Bit SSL Encrypted</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 12. Sticky Docked Bottom Checkout Bar (Myntra / Ajio Fixed Footer) */}
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
            <Text style={{ fontSize: 10.5, color: !addressServiceability.isServiceable && hasDarkStoreItems ? '#DC2626' : '#15803D', fontWeight: '800' }}>
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
            <Text style={{ color: '#FFFFFF', fontSize: 12.5, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' }}>
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

      {/* Deterministic Mock Payment Simulation Modal (AP-02) */}
      <Modal
        visible={isPaymentSimModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPaymentSimModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={16} color="#FF5A1F" />
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#FF5A1F', letterSpacing: 1, textTransform: 'uppercase' }}>
                    DEMO PAYMENT SIMULATOR
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111', marginTop: 2 }}>
                  Simulated Payment
                </Text>
              </View>
              <Pressable
                onPress={() => setIsPaymentSimModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F4F1EA', justifyContent: 'center', alignItems: 'center' }}
              >
                <X size={16} color="#6B6667" />
              </Pressable>
            </View>

            {/* Order Summary Strip */}
            <View style={{ backgroundColor: '#F7F5F0', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E8E5DF' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: '#6B6667' }}>Order Number</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>
                  #{pendingPaymentOrder?.orderNumber || pendingPaymentOrder?.id || 'AF-2026'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#6B6667' }}>Payable Amount</Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FF5A1F' }}>
                  {formatPrice(pendingPaymentOrder?.grandTotal || finalPayable)}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 11.5, color: '#6B6667', lineHeight: 17, marginBottom: 18 }}>
              Select payment outcome to test QA resilience, order state transition, and payment failure recovery paths:
            </Text>

            {/* Outcome Buttons */}
            <View style={{ gap: 10 }}>
              <AnimatedPressable
                style={{
                  backgroundColor: '#15803D',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
                onPress={handleSimulatePaymentSuccess}
                disabled={isSimulatingPayment}
              >
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                  {isSimulatingPayment ? 'Verifying...' : 'Simulate Success (Payment Verified)'}
                </Text>
              </AnimatedPressable>

              <AnimatedPressable
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: '#DC2626',
                  borderRadius: 14,
                  paddingVertical: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
                onPress={handleSimulatePaymentFailure}
                disabled={isSimulatingPayment}
              >
                <X size={16} color="#DC2626" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#DC2626' }}>
                  Simulate Failure (Bank Decline / Cancel)
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Address Selection Modal */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => {
          setSelectedAddressId(addr.id);
          setIsAddressModalOpen(false);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          handlePlaceOrder();
        }}
      />

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 90,
            alignSelf: 'center',
            backgroundColor: 'rgba(17, 17, 17, 0.95)',
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            zIndex: 99,
            transform: [{ translateY: toastAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <CheckCircle2 size={14} color="#22C55E" />
          <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}
