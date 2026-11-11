import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Sparkles,
  MapPin,
  RotateCcw,
  HelpCircle,
  CreditCard,
  Star,
  X,
  FileText,
  Download,
  XCircle,
  Printer,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore, isOrderItemEligibleForReview } from '@/store/useOrderStore';
import { OrderModel, reviewsApi, ordersApi } from '@/services/api';
import { LazyImage } from '@/components/common/lazy-image';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { TryAndBuySelectionCard } from '@/components/orders/try-and-buy-selection-card';

export interface OrderDetailViewProps {
  order: OrderModel;
  onBack: () => void;
  insets: any;
  formatPrice: (value: number) => string;
}

export const OrderDetailView = React.memo(function OrderDetailView({
  order,
  onBack,
  insets,
  formatPrice,
}: OrderDetailViewProps) {
  const router = useRouter();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const isDelivered = currentStatus === 'DELIVERED';
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'FAILED' || currentStatus === 'RETURNED';
  const canCancel = (currentStatus === 'PLACED' || currentStatus === 'ACCEPTED') && !isCancelled;
  const orderWithCurrentStatus: OrderModel = { ...order, status: currentStatus };
  const canReviewOrder = isOrderItemEligibleForReview(orderWithCurrentStatus);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleCancelOrder = () => {
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const updated = await useOrderStore.getState().cancelOrder(
        order.id,
        'Cancelled by customer',
      );
      setCurrentStatus(updated.status);
      setIsCancelModalOpen(false);
      Alert.alert('Drop Cancelled', 'Your order has been cancelled and any eligible refund initiated.');
    } catch (err: any) {
      setIsCancelModalOpen(false);
      Alert.alert(
        'Unable to Cancel',
        err?.message || 'This order can no longer be cancelled.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setIsInvoiceModalOpen(true);
    } else {
      try {
        const invoiceSummary = `AFFORDZ — OFFICIAL TAX INVOICE
Invoice No: INV-${order.orderNumber || order.id}
Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
GSTIN: 29AABCU9603R1ZM
Customer: ${order.address?.label || 'Valued Customer'}
Address: ${order.address?.line1 || ''}, ${order.address?.city || ''}

Items:
${order.items.map((i: any) => `• ${i.title} (${i.size}) x${i.quantity} - ${formatPrice(i.price)}`).join('\n')}

Subtotal: ${formatPrice(order.itemTotal)}
Taxes (GST 5%): ${formatPrice(order.taxes)}
Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
Grand Total: ${formatPrice(order.grandTotal)}
Payment Method: ${order.paymentMethod} (PAID)`;
        await Share.share({
          title: `Affordz Invoice #${order.orderNumber || order.id}`,
          message: invoiceSummary,
        });
      } catch {
        setIsInvoiceModalOpen(true);
      }
    }
  };

  const handleReorder = async () => {
    try {
      const cartStore = useCartStore.getState();
      for (const item of order.items) {
        const resolvedProductId = String((item as any).productId || item.id);
        const resolvedFulfillment =
          (item as any).fulfillmentType ||
          order.fulfillmentType ||
          (order.isTryAndBuy ? 'DARK_STORE' : 'VENDOR');
        await cartStore.addItem(
          {
            id: resolvedProductId,
            title: item.title,
            brand: item.brand,
            price: item.price,
            image: item.image,
            fulfillmentType: resolvedFulfillment,
            tryAndBuyEligible: resolvedFulfillment === 'DARK_STORE' && Boolean(order.isTryAndBuy),
          } as any,
          item.size || 'M',
          (item as any).color || 'Default',
          item.quantity || 1,
        );
      }
      Alert.alert(
        'Bag Updated',
        'Garments from this drop have been added to your bag.',
        [
          { text: 'Keep Browsing', style: 'cancel' },
          { text: 'View Bag', onPress: () => router.push('/cart') },
        ],
      );
    } catch {
      Alert.alert('Notice', 'Could not reorder all items. Please verify catalog availability.');
    }
  };

  const handleNeedHelp = () => {
    router.push({
      pathname: '/support',
      params: {
        orderId: order.id,
        category: 'Delivery & Rider Help',
      },
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Incomplete Review', 'Please write a brief comment describing your fitting experience.');
      return;
    }
    if (!canReviewOrder) {
      Alert.alert(
        'Review Unavailable',
        'Reviews unlock once your order is delivered or your Try & Buy selection is settled.',
      );
      return;
    }
    const eligibleItem = (order.items || []).find((it: any) =>
      isOrderItemEligibleForReview(orderWithCurrentStatus, String(it.productId || it.id)),
    );
    const targetProductId = (eligibleItem as any)?.productId || eligibleItem?.id;
    if (!targetProductId) {
      Alert.alert('Unable to Submit', 'No eligible kept garment found for this review.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        orderId: order.id,
        productId: String(targetProductId),
        rating: selectedRating,
        comment: reviewComment.trim(),
      });
      setReviewSubmitted(true);
      setIsReviewModalOpen(false);
      Alert.alert('Review Submitted', 'Thank you for rating your atelier garments! Your feedback helps our artisans.');
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.message || 'Unable to submit review right now. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* Header */}
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
          onPress={onBack}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }}>
            DROP BREAKDOWN
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
            {order.orderNumber || order.id}
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Status Announcement Hero */}
        <View style={{ alignItems: 'center', marginVertical: 22 }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
              backgroundColor: isCancelled ? '#FEF2F2' : isDelivered ? '#ECFDF5' : '#FFF7ED',
              borderWidth: 2,
              borderColor: isCancelled ? '#FCA5A5' : isDelivered ? '#A7F3D0' : '#FFEDD5',
            }}
          >
            {isCancelled ? (
              <XCircle size={36} color="#DC2626" />
            ) : isDelivered ? (
              <CheckCircle2 size={36} color="#059669" />
            ) : (
              <Truck size={34} color="#FF5A1F" />
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: isCancelled ? '#DC2626' : '#111111', letterSpacing: -0.3 }}>
            {currentStatus.replace(/_/g, ' ')}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 3 }}>
            Order #{order.orderNumber || order.id} •{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Live Track CTA for Active Orders */}
        {!isDelivered && !isCancelled && (
          <AnimatedPressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#111111',
              borderRadius: 999,
              paddingHorizontal: 20,
              paddingVertical: 14,
              marginBottom: 16,
              shadowColor: '#111',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4,
            }}
            onPress={() =>
              router.push({
                pathname: '/tracking',
                params: { orderId: order.id },
              })
            }
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#FF5A1F" />
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                TRACK LIVE DROP (ETA {order.etaMinutes || 18}M)
              </Text>
            </View>
            <ChevronRight size={17} color="#FFFFFF" />
          </AnimatedPressable>
        )}

        {/* Rate & Review Garments Action (DCR-014 Eligible Delivered/Settled Orders) */}
        {canReviewOrder && (
          <AnimatedPressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#FF5A1F',
              borderRadius: 999,
              paddingVertical: 14,
              marginBottom: 16,
              shadowColor: '#FF5A1F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 4,
            }}
            onPress={() => setIsReviewModalOpen(true)}
          >
            <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {reviewSubmitted ? 'REVIEW SUBMITTED (5★)' : 'RATE & REVIEW GARMENTS'}
            </Text>
          </AnimatedPressable>
        )}

        {/* Try & Buy Doorstep Selection & OTP */}
        {order.isTryAndBuy ? (
          <TryAndBuySelectionCard
            order={order}
            formatPrice={formatPrice}
            onUpdated={() => useOrderStore.getState().fetchOrders()}
          />
        ) : null}

        {/* Ordered Garments Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            ORDERED GARMENTS ({order.items.length})
          </Text>

          {order.items.map((item: any, idx: number) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 10,
                borderBottomWidth: idx !== order.items.length - 1 ? 1 : 0,
                borderBottomColor: '#F4F1EA',
              }}
            >
              {item.image ? (
                <LazyImage
                  source={{ uri: item.image }}
                  style={{ width: 56, height: 70, borderRadius: 10, backgroundColor: '#F4F1EA' }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ width: 56, height: 70, borderRadius: 10, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="#6B6667" />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#8E877E', textTransform: 'uppercase' }}>
                  {item.brand || 'AFFORDZ'}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111', marginTop: 2 }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 2 }}>
                  Size: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.size}</Text> • Qty: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.quantity}</Text>
                </Text>
              </View>

              <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>
                {formatPrice(item.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Invoice & Pricing Breakdown */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              INVOICE BREAKDOWN
            </Text>
            <Pressable
              onPress={handleDownloadInvoice}
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}
            >
              <FileText size={12} color="#111111" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', textTransform: 'uppercase' }}>
                TAX INVOICE
              </Text>
              <Download size={11} color="#FF5A1F" />
            </Pressable>
          </View>

          <View style={{ gap: 9 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Items Subtotal</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(order.itemTotal)}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Delivery Fee</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: order.deliveryFee === 0 ? '#15803D' : '#111111' }}>
                {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Taxes (GST 5%)</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(order.taxes)}</Text>
            </View>

            {order.discountAmount && order.discountAmount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, color: '#15803D' }}>Coupon Discount</Text>
                  {order.couponCode && (
                    <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: '#065F46' }}>{order.couponCode}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>
                  -{formatPrice(order.discountAmount)}
                </Text>
              </View>
            )}

            <View style={{ borderTopWidth: 1, borderTopColor: '#E8E5DF', paddingTop: 10, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>Grand Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111' }}>{formatPrice(order.grandTotal)}</Text>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: '#F4F1EA', paddingTop: 10, marginTop: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CreditCard size={14} color="#6B6667" />
                <Text style={{ fontSize: 12, color: '#6B6667' }}>Payment Mode</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111', textTransform: 'uppercase' }}>
                {order.paymentMethod === 'RAZORPAY' ? 'Razorpay Secure UPI' : 'Cash on Delivery (COD)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        {order.address && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <MapPin size={15} color="#FF5A1F" />
              <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                DELIVERED TO
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>{order.address.label || 'Home'}</Text>
            <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 3, lineHeight: 17 }}>
              {order.address.line1}, {order.address.locality}, {order.address.city} - {order.address.pincode}
            </Text>
          </View>
        )}

        {/* Self-Serve Cancellation Action for Orders in Placed / Accepted Status */}
        {canCancel && (
          <View style={{ marginBottom: 12 }}>
            <AnimatedPressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#FCA5A5',
                borderRadius: 999,
                paddingVertical: 13,
              }}
              onPress={handleCancelOrder}
              disabled={isCancelling}
            >
              <XCircle size={15} color="#DC2626" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {isCancelling ? 'CANCELLING DROP...' : 'CANCEL DROP'}
              </Text>
            </AnimatedPressable>
          </View>
        )}

        {/* Action Buttons: Reorder & Concierge Support */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <AnimatedPressable
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 999, paddingVertical: 13 }}
            onPress={handleReorder}
          >
            <RotateCcw size={15} color="#111111" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              REORDER ITEMS
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 999, paddingVertical: 13 }}
            onPress={handleNeedHelp}
          >
            <HelpCircle size={15} color="#6B6667" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ORDER HELP
            </Text>
          </AnimatedPressable>
        </View>
      </ScrollView>

      {/* Official Tax Invoice Modal */}
      <Modal
        visible={isInvoiceModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInvoiceModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ width: '100%', maxWidth: 440, maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0EDE8', paddingBottom: 14, marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#FF5A1F', textTransform: 'uppercase' }}>OFFICIAL TAX INVOICE</Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>INV-{order.orderNumber || order.id}</Text>
              </View>
              <Pressable
                onPress={() => setIsInvoiceModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAF8F5', justifyContent: 'center', alignItems: 'center' }}
              >
                <X size={16} color="#6B6667" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
              {/* Seller & GST Details */}
              <View style={{ backgroundColor: '#FAF8F5', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8E5DF' }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>AFFORDZ COMMERCE PVT LTD</Text>
                <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2 }}>GSTIN: 29AABCU9603R1ZM • Registered Bengaluru Atelier</Text>
                <Text style={{ fontSize: 10.5, color: '#6B6667' }}>Place of Supply: Karnataka (29)</Text>
              </View>

              {/* Customer & Date */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 10, color: '#8E877E', textTransform: 'uppercase', fontWeight: '800' }}>BILLED TO</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111', marginTop: 2 }}>{order.address?.label || 'Customer'}</Text>
                  <Text style={{ fontSize: 11, color: '#6B6667' }}>{order.address?.locality}, {order.address?.city}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: '#8E877E', textTransform: 'uppercase', fontWeight: '800' }}>INVOICE DATE</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111', marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#059669', fontWeight: '800' }}>PAID VIA {order.paymentMethod}</Text>
                </View>
              </View>

              {/* Items Table */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#E8E5DF', paddingTop: 10, marginBottom: 12 }}>
                <Text style={{ fontSize: 10, color: '#8E877E', textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 }}>PARTICULARS</Text>
                {order.items.map((it: any) => (
                  <View key={it.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>{it.title}</Text>
                      <Text style={{ fontSize: 10.5, color: '#6B6667' }}>HSN 6204 • Qty: {it.quantity} • Size: {it.size}</Text>
                    </View>
                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>{formatPrice(it.price * it.quantity)}</Text>
                  </View>
                ))}
              </View>

              {/* Summary Totals */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#E8E5DF', paddingTop: 10, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11.5, color: '#6B6667' }}>Subtotal</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{formatPrice(order.itemTotal)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11.5, color: '#6B6667' }}>CGST (2.5%)</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{formatPrice(Math.round(order.taxes / 2))}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11.5, color: '#6B6667' }}>SGST (2.5%)</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{formatPrice(Math.round(order.taxes / 2))}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11.5, color: '#6B6667' }}>Delivery Fee</Text>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</Text>
                </View>
                <View style={{ borderTopWidth: 1, borderTopColor: '#111111', paddingTop: 8, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>Grand Total Paid</Text>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#111111' }}>{formatPrice(order.grandTotal)}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Print / Save Action */}
            <View style={{ marginTop: 16 }}>
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.print();
                  } else {
                    Alert.alert('Invoice Saved', `Tax invoice for ${order.orderNumber || order.id} has been recorded.`);
                    setIsInvoiceModalOpen(false);
                  }
                }}
                style={{ backgroundColor: '#111111', borderRadius: 999, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Printer size={15} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  PRINT / SAVE INVOICE PDF
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verified 5-Star Rating & Review Modal */}
      <Modal
        visible={isReviewModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReviewModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111' }}>Rate Your Fit</Text>
                <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 2 }}>Order #{order.orderNumber || order.id}</Text>
              </View>
              <Pressable
                onPress={() => setIsReviewModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAF8F5', justifyContent: 'center', alignItems: 'center' }}
              >
                <X size={16} color="#6B6667" />
              </Pressable>
            </View>

            {/* Stars Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 14, marginBottom: 14, backgroundColor: '#FAF8F5', borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DF' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setSelectedRating(star)} hitSlop={8}>
                  <Star
                    size={28}
                    color={star <= selectedRating ? '#F59E0B' : '#D9D9D5'}
                    fill={star <= selectedRating ? '#F59E0B' : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Review Comment Input */}
            <TextInput
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="How was the textile quality, fit check, and stitching?"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', borderRadius: 16, padding: 14, fontSize: 13, color: '#111111', minHeight: 90, marginBottom: 16 }}
            />

            {/* Submit Action */}
            <Pressable
              onPress={handleSubmitReview}
              disabled={isSubmittingReview}
              style={{ backgroundColor: isSubmittingReview ? '#8E877E' : '#111111', borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {isSubmittingReview ? 'SUBMITTING...' : 'SUBMIT VERIFIED REVIEW'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Cross-platform Cancel Order Confirmation Modal */}
      <Modal
        visible={isCancelModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !isCancelling && setIsCancelModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111', marginBottom: 8 }}>
              Cancel Drop?
            </Text>
            <Text style={{ fontSize: 13, color: '#6B6667', lineHeight: 19, marginBottom: 20 }}>
              Are you sure you want to cancel this order? Any online payment will be refunded to your original payment method in 5-7 business days per RBI regulations.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                style={{ flex: 1, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', borderRadius: 999, paddingVertical: 13, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>Keep Order</Text>
              </Pressable>
              <Pressable
                onPress={confirmCancelOrder}
                disabled={isCancelling}
                style={{ flex: 1, backgroundColor: isCancelling ? '#FCA5A5' : '#DC2626', borderRadius: 999, paddingVertical: 13, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>
                  {isCancelling ? 'CANCELLING...' : 'Confirm Cancellation'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});
