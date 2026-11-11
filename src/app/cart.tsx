import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  AlertCircle,
} from 'lucide-react-native';

import { useCartStore } from '@/store/useCartStore';
import { useAddressStore, checkAddressServiceability } from '@/store/useAddressStore';
import { LocationOnboardingModal } from '@/components/location/location-onboarding-modal';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AddressModal } from '@/components/address-modal';
import { AuthModal } from '@/components/auth-modal';
import { paymentsApi } from '@/services/api';
import { launchRazorpayCheckout } from '@/services/razorpay';

import { CartTopDeals, DealProduct } from '@/components/cart/cart-top-deals';
import { CartFlashUrgencyTimer } from '@/components/cart/cart-flash-urgency-timer';
import { CartSuccessView } from '@/components/cart/cart-success-view';
import { CartEmptyView } from '@/components/cart/cart-empty-view';
import { CartDeliveryAddressSection } from '@/components/cart/cart-delivery-address-section';
import { CartTryBuySection } from '@/components/cart/cart-try-buy-section';
import { CartDeliveryInstructionsSection } from '@/components/cart/cart-delivery-instructions-section';
import { CartItemsSection } from '@/components/cart/cart-items-section';
import { CartCouponsSection } from '@/components/cart/cart-coupons-section';
import { CartPaymentSection } from '@/components/cart/cart-payment-section';
import { CartBillDetailsSection } from '@/components/cart/cart-bill-details-section';
import { CartBottomBar } from '@/components/cart/cart-bottom-bar';

import { MotionEditorialShowcase } from '@/components/common/motion-editorial-showcase';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { safeBack } from '@/utils/navigation';
import { bespokeEasing, formatPrice } from '@/data/homeData';
import { Fonts } from '@/constants/theme';

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
    giftWrapFee,
    splitOrderCount,
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
    buyNowItem,
    clearBuyNowItem,
    updateBuyNowQuantity,
  } = useCartStore();

  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isBuyNowMode = mode === 'buyNow' && Boolean(buyNowItem);
  const pendingCheckoutRef = useRef<{
    cartSignature: string;
    idempotencyKey: string;
    order: any;
  } | null>(null);

  // Active items for this checkout session
  const checkoutItems = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return [buyNowItem];
    }
    return items;
  }, [isBuyNowMode, buyNowItem, items]);

  // Pricing calculations: strictly isolated to checkoutItems
  const activeItemTotal = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return buyNowItem.price * buyNowItem.quantity;
    }
    return itemTotal;
  }, [isBuyNowMode, buyNowItem, itemTotal]);

  const activeTaxes = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return Math.round(activeItemTotal * 0.05);
    }
    return taxes;
  }, [isBuyNowMode, buyNowItem, activeItemTotal, taxes]);

  const activeDeliveryFee = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return activeItemTotal > 0 ? (activeItemTotal >= 1499 ? 0 : 40) : 0;
    }
    return deliveryFee;
  }, [isBuyNowMode, buyNowItem, activeItemTotal, deliveryFee]);

  const activeGiftWrapFee = isBuyNowMode ? (giftWrap ? 35 : 0) : giftWrapFee;
  const activeSplitOrderCount = isBuyNowMode ? (buyNowItem ? 1 : 0) : splitOrderCount;
  const activeDiscountAmount = isBuyNowMode ? 0 : discountAmount;
  const activeCouponCode = isBuyNowMode ? null : couponCode;

  const activeGrandTotal = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return Math.max(
        0,
        activeItemTotal - activeDiscountAmount + activeTaxes + activeDeliveryFee + activeGiftWrapFee + donationAmount,
      );
    }
    return grandTotal;
  }, [
    isBuyNowMode,
    buyNowItem,
    activeItemTotal,
    activeDiscountAmount,
    activeTaxes,
    activeDeliveryFee,
    activeGiftWrapFee,
    donationAmount,
    grandTotal,
  ]);

  const { addresses, selectedAddressId, setSelectedAddressId } = useAddressStore();
  const { checkout, isCheckingOut } = useOrderStore();
  const { isAuthenticated, user } = useAuthStore();

  // Screen UI State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [tryAndBuyEnabled, setTryAndBuyEnabled] = useState<boolean>(true);
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>('call');
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Coupon Input State
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment & Order State
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const successAnim = useRef(new Animated.Value(0)).current;

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Dark Store vs Vendor Invariant (strictly isolate DARK_STORE items in mixed bags)
  const darkStoreItems = useMemo(() => {
    return checkoutItems.filter((it) => it.fulfillmentType === 'DARK_STORE');
  }, [checkoutItems]);
  const hasDarkStoreItems = darkStoreItems.length > 0;
  const hasMixedCart = hasDarkStoreItems && darkStoreItems.length < checkoutItems.length;

  useEffect(() => {
    if (!hasDarkStoreItems && checkoutItems.length > 0) {
      setTryAndBuyEnabled(false);
    } else if (hasDarkStoreItems) {
      setTryAndBuyEnabled(true);
    }
  }, [hasDarkStoreItems, checkoutItems.length]);

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

  // Handlers
  const handleRemoveItem = useCallback(async (itemId: string, title?: string) => {
    if (isBuyNowMode) {
      clearBuyNowItem();
      showToast(title ? `Cancelled Buy Now for ${title}` : 'Cancelled Buy Now');
      safeBack(router, '/');
      return;
    }
    await removeItem(itemId);
    showToast(title ? `Removed ${title} from bag` : 'Item removed from bag');
  }, [isBuyNowMode, clearBuyNowItem, removeItem, showToast, router]);

  const handleUpdateItemQty = useCallback(async (itemId: string, delta: number, title?: string, currentQty?: number) => {
    if (isBuyNowMode) {
      if (delta < 0 && (currentQty || 1) <= 1) {
        await handleRemoveItem(itemId, title);
        return;
      }
      updateBuyNowQuantity(delta);
      if (delta > 0) {
        showToast(`Updated quantity to ${(currentQty || 1) + 1}`);
      } else {
        showToast(`Updated quantity to ${(currentQty || 1) - 1}`);
      }
      return;
    }
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
  }, [isBuyNowMode, handleRemoveItem, updateBuyNowQuantity, updateQuantity, showToast]);

  const cartProductIds = useMemo(() => {
    return checkoutItems.map((i) => i.productId);
  }, [checkoutItems]);

  const handleDealAddToCart = useCallback(async (deal: DealProduct) => {
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
  }, [addItem, showToast]);

  const handleOpenProduct = useCallback((productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId },
    });
  }, [router]);

  // Selected Address & Serviceability
  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  const addressServiceability = useMemo(() => {
    return checkAddressServiceability(selectedAddress);
  }, [selectedAddress]);

  // Pricing calculations
  const totalMrp = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      const orig = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : Math.round(item.price * 1.35);
      return acc + orig * item.quantity;
    }, 0);
  }, [checkoutItems]);

  const discountOnMrp = Math.max(0, totalMrp - activeItemTotal);
  const finalPayable = activeGrandTotal;

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

  // Checkout Placement Handler
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    if (hasDarkStoreItems && !addressServiceability.isServiceable) {
      setPaymentError(
        addressServiceability.reason ||
          addressServiceability.statusText ||
          '18-min Express Dark Store delivery is unavailable at this address. Please choose a serviceable address.',
      );
      return;
    }

    setPaymentError(null);

    const isCod = selectedPaymentCategory === 'COD';
    const effectiveTryAndBuy = hasDarkStoreItems && tryAndBuyEnabled;
    const isDark = hasDarkStoreItems;
    const isTry = effectiveTryAndBuy;

    const orderItemsSnapshot = checkoutItems.map((it) => ({
      id: it.id,
      productId: it.productId || it.id,
      title: it.title,
      brand: it.brand,
      size: it.size,
      trialSize: it.trialSize || undefined,
      quantity: it.quantity,
      price: it.price,
      originalPrice: it.originalPrice,
      image: it.image,
      fulfillmentType: it.fulfillmentType,
    }));

    const orderSnapshot = {
      orderNumber: `AFZ-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: '',
      totalPaid: finalPayable,
      itemTotal: activeItemTotal,
      deliveryFee: activeDeliveryFee,
      taxes: activeTaxes,
      discountAmount: activeDiscountAmount,
      couponCode: activeCouponCode,
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
      recipientPhone: user?.phone || '',
      items: orderItemsSnapshot,
      etaText: isDark
        ? (isTry ? '⚡ In 18 Minutes • Doorstep Try & Buy concierge' : '⚡ In 18 Minutes • Express Drop')
        : '📦 In 2-4 Business Days • Insured Courier',
      paymentMethod: isCod ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay)',
      placedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const cartSignature = JSON.stringify({
      addressId: selectedAddress.id,
      paymentMethod: isCod ? 'COD' : 'RAZORPAY',
      couponCode: activeCouponCode || '',
      giftWrap: Boolean(giftWrap),
      donationAmount: Number(donationAmount || 0),
      isTryAndBuy: Boolean(effectiveTryAndBuy),
      isBuyNow: isBuyNowMode,
      deliveryInstructions: selectedInstruction || '',
      items: orderItemsSnapshot.map((i) => `${i.productId}:${i.size}:${i.quantity}`),
    });

    if (
      !pendingCheckoutRef.current ||
      pendingCheckoutRef.current.cartSignature !== cartSignature
    ) {
      pendingCheckoutRef.current = {
        cartSignature,
        idempotencyKey: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        order: null,
      };
    }

    setIsProcessingPayment(true);
    let order: any = pendingCheckoutRef.current.order;
    if (!order || isCod) {
      try {
        order = await checkout({
          addressId: selectedAddress.id,
          paymentMethod: isCod ? 'COD' : 'RAZORPAY',
          couponCode: activeCouponCode || undefined,
          isTryAndBuy: effectiveTryAndBuy,
          isBuyNow: isBuyNowMode,
          giftWrap: Boolean(giftWrap),
          donationAmount: Number(donationAmount || 0),
          deliveryInstructions: selectedInstruction || undefined,
          idempotencyKey: pendingCheckoutRef.current.idempotencyKey,
          items: orderItemsSnapshot,
        });
        if (order && !isCod) {
          pendingCheckoutRef.current.order = order;
        }
      } catch (err: any) {
        setIsProcessingPayment(false);
        setPaymentError(err?.message || 'Failed to place order. Please try again.');
        return;
      }
    }

    if (!order) {
      setIsProcessingPayment(false);
      setPaymentError('Failed to initialize order with server. Please try again.');
      return;
    }

    orderSnapshot.orderNumber = order.orderNumber || orderSnapshot.orderNumber;
    orderSnapshot.orderId = order.id || orderSnapshot.orderId;
    (orderSnapshot as any).splitOrders = order.splitOrders || [order];
    (orderSnapshot as any).groupNumber = order.groupNumber || order.checkoutGroup?.groupNumber;
    if (order.grandTotal) {
      orderSnapshot.totalPaid = order.grandTotal;
    }
    setConfirmedOrder(orderSnapshot);
    setConfirmedOrderNumber(orderSnapshot.orderNumber);

    if (isCod) {
      pendingCheckoutRef.current = null;
      setIsProcessingPayment(false);
      if (isBuyNowMode) {
        clearBuyNowItem();
      } else {
        await useCartStore.getState().clearCart();
      }
      setOrderSuccess(true);
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        easing: bespokeEasing,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      return;
    }

    // Razorpay Online Flow (reuse CheckoutGroup razorpayOrderId or create if needed)
    try {
      const targetPaymentOrderId = order.checkoutGroupId || order.id;
      const orderHasHostedSession =
        Boolean(order.razorpayOrderId && order.razorpayKeyId) &&
        Boolean(order.checkoutSessionUrl || order.checkoutSessionToken);

      const rzpDetails = orderHasHostedSession
        ? {
            razorpayOrderId: order.razorpayOrderId,
            keyId: order.razorpayKeyId,
            amountInPaisa: Math.round((order.grandTotal || finalPayable) * 100),
            amount: Math.round((order.grandTotal || finalPayable) * 100),
            currency: 'INR',
            checkoutSessionToken: order.checkoutSessionToken,
            checkoutSessionUrl: order.checkoutSessionUrl,
          }
        : await paymentsApi.createRazorpayOrder(
            order.grandTotal || finalPayable,
            targetPaymentOrderId,
          );

      if (!rzpDetails || !rzpDetails.razorpayOrderId || !rzpDetails.keyId) {
        throw new Error('Backend did not return valid Razorpay credentials.');
      }

      const rzpResult = await launchRazorpayCheckout({
        key: rzpDetails.keyId,
        amount: rzpDetails.amountInPaisa || rzpDetails.amount || Math.round((order.grandTotal || finalPayable) * 100),
        currency: rzpDetails.currency || 'INR',
        name: 'Affordz',
        description: `Order #${order.groupNumber || order.orderNumber || order.id}`,
        order_id: rzpDetails.razorpayOrderId,
        orderId: targetPaymentOrderId,
        checkoutSessionToken: rzpDetails.checkoutSessionToken,
        checkoutSessionUrl: rzpDetails.checkoutSessionUrl,
        prefill: {
          name: user?.name || orderSnapshot.recipientName,
          email: user?.email || 'concierge@affordz.in',
          contact: user?.phone || orderSnapshot.recipientPhone,
        },
        theme: {
          color: '#0D9488',
        },
      });

      if (rzpResult.type === 'cancelled') {
        setIsProcessingPayment(false);
        setPaymentError(
          rzpResult.reason ||
            'Payment was cancelled. Tap Pay again to retry safely without duplicating your order.',
        );
        return;
      }

      if (rzpResult.type === 'genuine_callback') {
        const verifyRes = await useOrderStore.getState().verifyPayment({
          orderId: order.id,
          checkoutGroupId: order.checkoutGroupId || undefined,
          paymentId: rzpResult.razorpay_payment_id,
          signature: rzpResult.razorpay_signature,
          razorpayOrderId: rzpResult.razorpay_order_id,
          isBuyNow: isBuyNowMode,
        });

        if (verifyRes?.verified) {
          pendingCheckoutRef.current = null;
          if (isBuyNowMode) {
            clearBuyNowItem();
          } else {
            await useCartStore.getState().clearCart();
          }
          setOrderSuccess(true);
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            easing: bespokeEasing,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        } else {
          throw new Error('Payment signature verification failed on server.');
        }
      } else if (rzpResult.type === 'hosted_session_completed') {
        const statusRes = await useOrderStore.getState().confirmPaymentStatus(order.id, isBuyNowMode);
        if (statusRes?.paymentStatus === 'COMPLETED') {
          pendingCheckoutRef.current = null;
          if (isBuyNowMode) {
            clearBuyNowItem();
          } else {
            await useCartStore.getState().clearCart();
          }
          setOrderSuccess(true);
          Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            easing: bespokeEasing,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        } else {
          throw new Error(
            'Payment could not be verified by server. If amount was deducted, it will be refunded automatically.',
          );
        }
      }
    } catch (err: any) {
      setPaymentError(
        err?.message || 'Payment initiation or verification failed. Your bag items are preserved.',
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 1. Order Success Screen
  if (orderSuccess) {
    return (
      <CartSuccessView
        confirmedOrder={confirmedOrder}
        confirmedOrderNumber={confirmedOrderNumber}
        finalPayable={finalPayable}
        selectedAddress={selectedAddress}
        user={user}
        insets={insets}
        isProduction={isProduction}
        router={router}
        successAnim={successAnim}
        formatPrice={formatPrice}
      />
    );
  }

  // 2. Empty Cart Screen
  if (checkoutItems.length === 0) {
    return (
      <CartEmptyView
        paddingTop={paddingTop}
        router={router}
        safeBack={safeBack}
        handleDealAddToCart={handleDealAddToCart}
        handleOpenProduct={handleOpenProduct}
        cartProductIds={cartProductIds}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        toastMessage={toastMessage}
        toastAnim={toastAnim}
      />
    );
  }

  // 3. Active Checkout Screen
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* Editorial Header */}
      <View
        style={{
          paddingTop,
          backgroundColor: 'rgba(250, 248, 245, 0.96)',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60 + paddingTop,
          paddingHorizontal: 16,
          zIndex: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AnimatedPressable
            onPress={() => {
              if (isBuyNowMode) {
                clearBuyNowItem();
              }
              safeBack(router);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <ArrowLeft size={18} color="#1A1817" />
          </AnimatedPressable>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <EditorialText
                text={isBuyNowMode ? 'Buy Now Checkout' : 'Shopping Bag'}
                style={{ fontSize: 17, color: '#1A1817' }}
              />
              <View
                style={{
                  backgroundColor: '#1A1817',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: '#FAF8F5',
                    fontSize: 10,
                    fontFamily: Fonts.mono,
                    fontWeight: '700',
                  }}
                >
                  {checkoutItems.length} {checkoutItems.length === 1 ? 'ITEM' : 'ITEMS'}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 10,
                fontFamily: Fonts.mono,
                color: '#8A8580',
                letterSpacing: 0.8,
                marginTop: 2,
              }}
            >
              {isBuyNowMode
                ? 'EXPRESS SINGLE-ITEM DIRECT CHECKOUT'
                : 'STEP 2 OF 2 • SECURE ENCRYPTED CHECKOUT'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#F0ECE4',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
          }}
        >
          <Lock size={11} color="#6B6560" />
          <Text
            style={{
              fontSize: 10,
              fontFamily: Fonts.mono,
              color: '#6B6560',
              fontWeight: '600',
              letterSpacing: 0.5,
            }}
          >
            256-BIT SSL
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 110,
          gap: 16,
        }}
      >
        {/* Flash Urgency Timer */}
        <CartFlashUrgencyTimer />

        {/* 1. Delivery Address Card */}
        <CartDeliveryAddressSection
          isAuthenticated={isAuthenticated}
          selectedAddress={selectedAddress}
          user={user}
          addressServiceability={addressServiceability}
          hasDarkStoreItems={hasDarkStoreItems}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Payment Error Feedback Alert */}
        {paymentError && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: '#FEE2E2',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <AlertCircle size={18} color="#DC2626" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#991B1B', marginBottom: 2 }}>
                Checkout Incomplete
              </Text>
              <Text style={{ fontSize: 12, color: '#B91C1C', lineHeight: 18 }}>
                {paymentError}
              </Text>
            </View>
          </View>
        )}

        {/* 2. Try & Buy Toggle Card */}
        <CartTryBuySection
          hasDarkStoreItems={hasDarkStoreItems}
          hasMixedCart={hasMixedCart}
          tryAndBuyEnabled={tryAndBuyEnabled}
          onToggleTryAndBuy={() => setTryAndBuyEnabled((v) => !v)}
        />

        {/* 3. Delivery Instructions */}
        <CartDeliveryInstructionsSection
          selectedInstruction={selectedInstruction}
          onSelectInstruction={setSelectedInstruction}
        />

        {/* 4. Bag Items Accordion */}
        <CartItemsSection
          items={checkoutItems}
          isItemsExpanded={isItemsExpanded}
          setIsItemsExpanded={setIsItemsExpanded}
          handleRemoveItem={handleRemoveItem}
          handleUpdateItemQty={handleUpdateItemQty}
          formatPrice={formatPrice}
        />

        {/* 5. Coupons & Offers (Hidden during direct Buy Now checkout) */}
        {!isBuyNowMode && (
          <CartCouponsSection
            couponCode={couponCode}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            couponFeedback={couponFeedback}
            handleApplyCouponCode={handleApplyCouponCode}
            handleRemoveCoupon={handleRemoveCoupon}
          />
        )}

        {/* 6. Payment Method Selector */}
        <CartPaymentSection
          selectedPaymentCategory={selectedPaymentCategory}
          setSelectedPaymentCategory={setSelectedPaymentCategory}
          payableAmount={finalPayable}
          isProcessingPayment={isProcessingPayment}
          paymentError={paymentError}
          onRetryPayment={handlePlaceOrder}
        />

        {/* 7. Bill Details Breakdown */}
        <CartBillDetailsSection
          items={checkoutItems}
          giftWrap={giftWrap}
          giftWrapFee={activeGiftWrapFee}
          splitOrderCount={activeSplitOrderCount}
          toggleGiftWrap={toggleGiftWrap}
          donationAmount={donationAmount}
          setDonation={setDonation}
          totalMrp={totalMrp}
          discountOnMrp={discountOnMrp}
          discountAmount={activeDiscountAmount}
          couponCode={activeCouponCode}
          deliveryFee={activeDeliveryFee}
          taxes={activeTaxes}
          finalPayable={finalPayable}
          formatPrice={formatPrice}
        />

        {/* Top Deals Recommendation Carousel */}
        <CartTopDeals
          cartProductIds={cartProductIds}
          onAddToCart={handleDealAddToCart}
          onOpenProduct={handleOpenProduct}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
        />

        {/* Editorial Showcase */}
        <MotionEditorialShowcase onSelectProduct={handleOpenProduct} />

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Bottom Dock Action Bar */}
      <CartBottomBar
        insets={insets}
        finalPayable={finalPayable}
        totalMrp={totalMrp}
        addressServiceability={addressServiceability}
        hasDarkStoreItems={hasDarkStoreItems}
        selectedAddress={selectedAddress}
        isCheckingOut={isCheckingOut}
        isAuthenticated={isAuthenticated}
        selectedPaymentCategory={selectedPaymentCategory}
        handlePlaceOrder={handlePlaceOrder}
        formatPrice={formatPrice}
      />

      {/* Modals */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => setSelectedAddressId(addr.id)}
      />

      <LocationOnboardingModal
        visible={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={(addr) => setSelectedAddressId(addr.id)}
      />

      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 90,
            left: 20,
            right: 20,
            backgroundColor: '#1A1817',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 8,
            transform: [{ translateY: toastAnim }],
            zIndex: 999,
          }}
        >
          <ShieldCheck size={18} color="#C5A059" />
          <Text style={{ color: '#FAF8F5', fontSize: 13, fontWeight: '600', flex: 1 }}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
