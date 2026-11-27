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
import { useCatalogStore } from '@/store/useCatalogStore';
import { useAddressStore, checkAddressServiceability } from '@/store/useAddressStore';
import { LocationOnboardingModal } from '@/components/location/location-onboarding-modal';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AddressModal } from '@/components/address-modal';
import { AuthModal } from '@/components/auth-modal';
import { paymentsApi } from '@/services/api';
import { launchRazorpayCheckout } from '@/services/razorpay';
import { customerNotificationService } from '@/services/notificationService';

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
import { Fonts, FontStyles } from '@/constants/theme';

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
    grandTotal,
    giftWrapFee,
    splitOrderCount,
    couponCode,
    discountAmount,
    giftWrap,
    donationAmount,
    needGstInvoice,
    gstin,
    gstBusinessName,
    tryAndBuySlotExpiresAt,
    applyCoupon,
    removeCoupon,
    toggleGiftWrap,
    setDonation,
    setNeedGstInvoice,
    setGstin,
    setGstBusinessName,
    fetchCart,
    syncGuestCartToServer,
    removeItem,
    updateQuantity,
    addItem,
    wishlist,
    toggleWishlist,
    buyNowItem,
    clearBuyNowItem,
    updateBuyNowQuantity,
  } = useCartStore();
  const { activeCoupons, fetchCoupons, darkStores, fetchDarkStores } = useCatalogStore();

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

  // Pricing calculations: strictly isolated to checkoutItems (MRP is GST-inclusive -> taxes = 0)
  const activeItemTotal = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return buyNowItem.price * buyNowItem.quantity;
    }
    return itemTotal;
  }, [isBuyNowMode, buyNowItem, itemTotal]);

  const activeTaxes = 0;

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
        activeItemTotal - activeDiscountAmount + activeDeliveryFee + activeGiftWrapFee + donationAmount,
      );
    }
    return grandTotal;
  }, [
    isBuyNowMode,
    buyNowItem,
    activeItemTotal,
    activeDiscountAmount,
    activeDeliveryFee,
    activeGiftWrapFee,
    donationAmount,
    grandTotal,
  ]);

  const { addresses, selectedAddressId, previewAddress, setSelectedAddressId, addAddress } = useAddressStore();
  const { checkout, isCheckingOut } = useOrderStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (activeCoupons.length === 0) {
      fetchCoupons().catch(() => {});
    }
    if (darkStores.length === 0) {
      fetchDarkStores().catch(() => {});
    }
    if (isAuthenticated && !isBuyNowMode) {
      syncGuestCartToServer().catch(() => {});
    }
  }, [isAuthenticated, isBuyNowMode]);

  // Screen UI State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [tryAndBuyEnabled, setTryAndBuyEnabled] = useState<boolean>(true);
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>('Call Before Delivery');
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [gstinError, setGstinError] = useState<string | null>(null);

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

  // Selected Address & Serviceability (reactive to darkStores and address edits)
  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0] || previewAddress || null;
  }, [addresses, selectedAddressId, previewAddress]);

  const addressServiceability = useMemo(() => {
    void darkStores;
    return checkAddressServiceability(selectedAddress);
  }, [selectedAddress, darkStores]);

  // Dark Store vs Vendor Invariant & Try & Buy Eligibility
  const darkStoreItems = useMemo(() => {
    return checkoutItems.filter((it) => it.fulfillmentType === 'DARK_STORE');
  }, [checkoutItems]);
  const eligibleDarkStoreItems = useMemo(() => {
    return darkStoreItems.filter((it) => it.tryAndBuyEligible !== false && it.isTryAndBuy !== false);
  }, [darkStoreItems]);
  const hasDarkStoreItems = darkStoreItems.length > 0;
  const hasMixedCart = hasDarkStoreItems && darkStoreItems.length < checkoutItems.length;
  const hasIneligibleDarkStoreItem = hasDarkStoreItems && eligibleDarkStoreItems.length < darkStoreItems.length;
  const isTryAndBuyEligible =
    eligibleDarkStoreItems.length > 0 &&
    !hasIneligibleDarkStoreItem &&
    (!selectedAddress || addressServiceability.isServiceable);

  const tryAndBuyDisabledReason = useMemo(() => {
    if (!hasDarkStoreItems) return null;
    if (hasIneligibleDarkStoreItem) {
      return 'One or more Dark Store items in your bag are not eligible for Doorstep Try & Buy.';
    }
    if (selectedAddress && !addressServiceability.isServiceable) {
      return `Doorstep Try & Buy is unavailable outside the ${(addressServiceability.maxRadiusKm ?? 3).toFixed(1)} km Express Hub radius.`;
    }
    return null;
  }, [hasDarkStoreItems, hasIneligibleDarkStoreItem, selectedAddress, addressServiceability]);

  useEffect(() => {
    if (!isTryAndBuyEligible) {
      setTryAndBuyEnabled(false);
    } else {
      setTryAndBuyEnabled(true);
    }
  }, [isTryAndBuyEligible]);

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
      stockQuantity: typeof deal.stockQuantity === 'number' ? deal.stockQuantity : 1,
      readyToShip: deal.readyToShip !== false,
      sizes: deal.sizes,
      image: deal.image,
      altText: deal.title,
      galleryImages: [deal.image],
      category: deal.category,
      tryAndBuyEligible: deal.tryAndBuyEligible !== false,
    };
    const ok = await addItem(productPayload, deal.sizes[0] || 'M');
    if (ok) {
      showToast(`Added ${deal.brand} to Bag!`);
    } else {
      showToast('Could not update bag. Please try again.');
    }
  }, [addItem, showToast]);

  const handleOpenProduct = useCallback((productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId },
    });
  }, [router]);

  // Pricing calculations (remove duplicate selectedAddress/addressServiceability definitions below)
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

    let resolvedAddress = selectedAddress;
    if (!resolvedAddress.id) {
      try {
        resolvedAddress = await addAddress({
          label: resolvedAddress.label || 'Home',
          recipientName: resolvedAddress.recipientName || user?.name || 'Affordz Customer',
          recipientPhone: resolvedAddress.recipientPhone || user?.phone || '',
          line1: resolvedAddress.line1 || resolvedAddress.locality || 'Delivery Location',
          line2: resolvedAddress.line2,
          locality: resolvedAddress.locality || resolvedAddress.city || 'Bengaluru',
          city: resolvedAddress.city || 'Bengaluru',
          state: resolvedAddress.state,
          pincode: resolvedAddress.pincode || '560038',
          latitude: resolvedAddress.latitude,
          longitude: resolvedAddress.longitude,
          isDefault: addresses.length === 0,
        });
      } catch {
        setIsAddressModalOpen(true);
        return;
      }
    }

    if (hasDarkStoreItems && !addressServiceability.isServiceable) {
      setPaymentError(
        addressServiceability.reason ||
          addressServiceability.statusText ||
          '19-min Express Dark Store delivery is unavailable at this address. Please choose a serviceable address.',
      );
      return;
    }

    const cleanGstin = gstin?.trim().toUpperCase() || '';
    if (needGstInvoice && cleanGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(cleanGstin)) {
      const msg = 'Invalid GSTIN format. Please enter a valid 15-character GSTIN (e.g. 29AABCU9603R1ZM).';
      setGstinError(msg);
      setPaymentError(msg);
      return;
    }
    setGstinError(null);
    setPaymentError(null);

    const isCod = selectedPaymentCategory === 'COD';
    const effectiveTryAndBuy = isTryAndBuyEligible && tryAndBuyEnabled;
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
      recipientName: selectedAddress?.recipientName || user?.name || 'Affordz Customer',
      recipientPhone: selectedAddress?.recipientPhone || user?.phone || '',
      items: orderItemsSnapshot,
      etaText: isDark
        ? (isTry ? '⚡ In 19 Minutes • Doorstep Try & Buy concierge' : '⚡ In 19 Minutes • Express Drop')
        : '📦 In 2-4 Business Days • Insured Courier',
      paymentMethod: isCod ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay)',
      placedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const cartSignature = JSON.stringify({
      addressId: resolvedAddress.id,
      paymentMethod: isCod ? 'COD' : 'RAZORPAY',
      couponCode: activeCouponCode || '',
      giftWrap: Boolean(giftWrap),
      donationAmount: Number(donationAmount || 0),
      isTryAndBuy: Boolean(effectiveTryAndBuy),
      isBuyNow: isBuyNowMode,
      deliveryInstructions: selectedInstruction || '',
      needGstInvoice: Boolean(needGstInvoice),
      customerGstin: cleanGstin,
      gstBusinessName: gstBusinessName?.trim() || '',
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

    if (!isBuyNowMode) {
      await syncGuestCartToServer();
    }

    let order: any = pendingCheckoutRef.current.order;
    if (!order || isCod) {
      try {
        order = await checkout({
          addressId: resolvedAddress.id,
          paymentMethod: isCod ? 'COD' : 'RAZORPAY',
          couponCode: activeCouponCode || undefined,
          isTryAndBuy: effectiveTryAndBuy,
          isBuyNow: isBuyNowMode,
          giftWrap: Boolean(giftWrap),
          donationAmount: Number(donationAmount || 0),
          deliveryInstructions: selectedInstruction || undefined,
          needGstInvoice: Boolean(needGstInvoice),
          customerGstin: cleanGstin || undefined,
          gstBusinessName: gstBusinessName?.trim() || undefined,
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
      const storeErr = useOrderStore.getState().error;
      setPaymentError(storeErr || 'Failed to initialize order with server. Please try again.');
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
      void customerNotificationService.requestPermission().then((res) => {
        if (res.granted) void customerNotificationService.registerDeviceToken();
      });
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
          void customerNotificationService.requestPermission().then((res) => {
            if (res.granted) void customerNotificationService.registerDeviceToken();
          });
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
          void customerNotificationService.requestPermission().then((res) => {
            if (res.granted) void customerNotificationService.registerDeviceToken();
          });
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
      if (err?.status === 409 || err?.status === 404) {
        pendingCheckoutRef.current = null;
      }
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
          paddingBottom: 10,
          backgroundColor: 'rgba(250, 248, 245, 0.96)',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          minHeight: 62 + paddingTop,
          paddingHorizontal: 16,
          zIndex: 20,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AnimatedPressable
            onPress={() => {
              safeBack(router);
              if (isBuyNowMode) {
                setTimeout(() => clearBuyNowItem(), 0);
              }
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              flexShrink: 0,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <ArrowLeft size={18} color="#1A1817" />
          </AnimatedPressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
              <EditorialText
                first={isBuyNowMode ? 'Buy Now ' : 'Shopping '}
                second={isBuyNowMode ? 'Checkout' : 'Bag'}
                fontSize={17}
                lineHeight={22}
                singleLine
                numberOfLines={1}
                style={{ flexShrink: 1, color: '#1A1817' }}
              />
              <View
                style={{
                  backgroundColor: '#1A1817',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 10,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={[
                    FontStyles.sansBold,
                    {
                      color: '#FAF8F5',
                      fontSize: 10,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {checkoutItems.length} {checkoutItems.length === 1 ? 'ITEM' : 'ITEMS'}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={1}
              style={[
                FontStyles.sansMedium,
                {
                  fontSize: 10,
                  color: '#8A8580',
                  letterSpacing: 0.7,
                  marginTop: 2,
                },
              ]}
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
            flexShrink: 0,
            backgroundColor: '#F0ECE4',
            paddingHorizontal: 9,
            paddingVertical: 5,
            borderRadius: 20,
          }}
        >
          <Lock size={11} color="#6B6560" />
          <Text
            style={[
              FontStyles.sansBold,
              {
                fontSize: 10,
                color: '#6B6560',
                fontWeight: '600',
                letterSpacing: 0.5,
              },
            ]}
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
        {/* Reserved Try & Buy Slot Timer (only when eligible Dark Store items have Try & Buy enabled) */}
        {isTryAndBuyEligible && tryAndBuyEnabled && (
          <CartFlashUrgencyTimer expiresAt={tryAndBuySlotExpiresAt} />
        )}

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
              <Text style={[FontStyles.sansBold, { fontSize: 13, fontWeight: '700', color: '#991B1B', marginBottom: 2 }]}>
                Checkout Incomplete
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 12, color: '#B91C1C', lineHeight: 18 }]}>
                {paymentError}
              </Text>
            </View>
          </View>
        )}

        {/* 2. Try & Buy Toggle Card */}
        <CartTryBuySection
          hasDarkStoreItems={hasDarkStoreItems}
          hasMixedCart={hasMixedCart}
          isEligible={isTryAndBuyEligible}
          disabledReason={tryAndBuyDisabledReason}
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
            activeCoupons={activeCoupons}
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
          needGstInvoice={needGstInvoice}
          onToggleGstInvoice={() => {
            setNeedGstInvoice(!needGstInvoice);
            setGstinError(null);
          }}
          gstin={gstin}
          onChangeGstin={(value) => {
            setGstin(value);
            if (gstinError) setGstinError(null);
          }}
          gstBusinessName={gstBusinessName}
          onChangeGstBusinessName={setGstBusinessName}
          gstinError={gstinError}
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
          <Text style={[FontStyles.sansMedium, { color: '#FAF8F5', fontSize: 13, fontWeight: '600', flex: 1 }]}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
