import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
import { CartPaymentSimModal } from '@/components/cart/cart-payment-sim-modal';

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
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>('call');
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');

  // Coupon Input State
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Simulation & Order State
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('KC-89241');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const successAnim = useRef(new Animated.Value(0)).current;

  const [isPaymentSimModalOpen, setIsPaymentSimModalOpen] = useState<boolean>(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);

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

  // Handlers
  const handleRemoveItem = useCallback(async (itemId: string, title?: string) => {
    await removeItem(itemId);
    showToast(title ? `Removed ${title} from bag` : 'Item removed from bag');
  }, [removeItem, showToast]);

  const handleUpdateItemQty = useCallback(async (itemId: string, delta: number, title?: string, currentQty?: number) => {
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
  }, [handleRemoveItem, updateQuantity, showToast]);

  const cartProductIds = useMemo(() => {
    return items.map((i) => i.productId);
  }, [items]);

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
    return items.reduce((acc, item) => {
      const orig = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : Math.round(item.price * 1.35);
      return acc + orig * item.quantity;
    }, 0);
  }, [items]);

  const discountOnMrp = Math.max(0, totalMrp - itemTotal);
  const finalPayable = grandTotal;

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

  // Card Formatter Handlers
  const handleCardNumberChange = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  }, []);

  const handleExpiryChange = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  }, []);

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

    // Serviceability check for 18-minute Dark Store items
    if (hasDarkStoreItems && !addressServiceability.isServiceable) {
      setPaymentError(
        `Instant 18-minute delivery is NOT AVAILABLE for ${selectedAddress?.locality || selectedAddress?.city || 'this location'} (${addressServiceability.distanceKm} km from Indiranagar Hub, max radius 8.0 km). Please select an address within 8.0 km or remove dark store items.`
      );
      showToast('Location not available for 18-min drop!');
      setIsLocationModalOpen(true);
      return;
    }

    setPaymentError(null);

    // Validate UPI
    if (selectedPaymentCategory === 'UPI' && selectedUpiApp === 'custom') {
      const trimmed = customUpiId.trim();
      if (!trimmed || !trimmed.includes('@') || trimmed.length < 5) {
        setPaymentError('Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank).');
        return;
      }
    }

    // Validate Card
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
        setPendingPaymentOrder({ ...order, snapshot: orderSnapshot });
        setIsPaymentSimModalOpen(true);
      }
    }
  };

  const handleSimulatePaymentSuccess = useCallback(async () => {
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
  }, [pendingPaymentOrder, confirmedOrder, successAnim]);

  const handleSimulatePaymentFailure = useCallback(() => {
    setIsPaymentSimModalOpen(false);
    setPaymentError(
      'Simulated payment failed (Bank declined/cancelled). Your bag items and delivery choices are preserved. You can retry online payment or choose Cash on Delivery (COD).',
    );
  }, []);

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
  if (items.length === 0) {
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
            onPress={() => safeBack(router)}
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
              <EditorialText text="Shopping Bag" style={{ fontSize: 17, color: '#1A1817' }} />
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
                  {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
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
              STEP 2 OF 2 • SECURE ENCRYPTED CHECKOUT
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
          items={items}
          isItemsExpanded={isItemsExpanded}
          setIsItemsExpanded={setIsItemsExpanded}
          handleRemoveItem={handleRemoveItem}
          handleUpdateItemQty={handleUpdateItemQty}
          formatPrice={formatPrice}
        />

        {/* 5. Coupons & Offers */}
        <CartCouponsSection
          couponCode={couponCode}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          couponFeedback={couponFeedback}
          handleApplyCouponCode={handleApplyCouponCode}
          handleRemoveCoupon={handleRemoveCoupon}
        />

        {/* 6. Payment Method Selector */}
        <CartPaymentSection
          selectedPaymentCategory={selectedPaymentCategory}
          setSelectedPaymentCategory={setSelectedPaymentCategory}
          selectedUpiApp={selectedUpiApp}
          setSelectedUpiApp={setSelectedUpiApp}
          customUpiId={customUpiId}
          setCustomUpiId={setCustomUpiId}
          cardNumber={cardNumber}
          handleCardNumberChange={handleCardNumberChange}
          cardExpiry={cardExpiry}
          handleExpiryChange={handleExpiryChange}
          cardCvv={cardCvv}
          setCardCvv={setCardCvv}
          cardName={cardName}
          setCardName={setCardName}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          isProduction={isProduction}
        />

        {/* 7. Bill Details Breakdown */}
        <CartBillDetailsSection
          items={items}
          giftWrap={giftWrap}
          toggleGiftWrap={toggleGiftWrap}
          donationAmount={donationAmount}
          setDonation={setDonation}
          totalMrp={totalMrp}
          discountOnMrp={discountOnMrp}
          discountAmount={discountAmount}
          couponCode={couponCode}
          deliveryFee={deliveryFee}
          taxes={taxes}
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
      <CartPaymentSimModal
        visible={isPaymentSimModalOpen}
        onClose={() => setIsPaymentSimModalOpen(false)}
        pendingPaymentOrder={pendingPaymentOrder}
        finalPayable={finalPayable}
        isSimulatingPayment={isSimulatingPayment}
        handleSimulatePaymentSuccess={handleSimulatePaymentSuccess}
        handleSimulatePaymentFailure={handleSimulatePaymentFailure}
        formatPrice={formatPrice}
      />

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
