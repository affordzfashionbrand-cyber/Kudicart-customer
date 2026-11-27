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
import { OrderModel, OrderInvoiceModel, reviewsApi, ordersApi } from '@/services/api';
import { LazyImage } from '@/components/common/lazy-image';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { TryAndBuySelectionCard } from '@/components/orders/try-and-buy-selection-card';

export interface OrderDetailViewProps {
  order: OrderModel;
  onBack: () => void;
  insets: any;
  formatPrice: (value: number) => string;
  initialOpenInvoice?: boolean;
}

export const OrderDetailView = React.memo(function OrderDetailView({
  order,
  onBack,
  insets,
  formatPrice,
  initialOpenInvoice = false,
}: OrderDetailViewProps) {
  const router = useRouter();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(initialOpenInvoice);
  const [invoiceData, setInvoiceData] = useState<OrderInvoiceModel | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  React.useEffect(() => {
    if (initialOpenInvoice) {
      setIsLoadingInvoice(true);
      ordersApi
        .getInvoice(order.id)
        .then((fetched) => setInvoiceData(fetched))
        .catch(() => {})
        .finally(() => setIsLoadingInvoice(false));
    }
  }, [initialOpenInvoice, order.id]);

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

  const buildFallbackInvoice = (): OrderInvoiceModel => {
    const grossMerchandise = Math.max(0, Number(order.itemTotal || 0) - Number(order.discountAmount || 0));
    const taxableMerchandise = Math.round(grossMerchandise / 1.05);
    const totalGst = Math.max(0, grossMerchandise - taxableMerchandise);
    const cgst = Math.round(totalGst / 2);
    const sgst = Math.max(0, totalGst - cgst);
    const addressLine = [
      order.address?.line1,
      order.address?.locality,
      order.address?.city,
      order.address?.pincode,
    ]
      .filter(Boolean)
      .join(', ');
    return {
      invoiceNumber: `INV-${order.orderNumber || order.id}`,
      invoiceDate: order.createdAt,
      orderId: order.id,
      orderNumber: order.orderNumber || order.id,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'PENDING',
      mrpGstInclusive: true,
      seller: {
        name: 'AFFORDZ COMMERCE PVT LTD',
        address: 'Bengaluru Atelier Fulfillment Centre, Karnataka',
        gstin: '29AABCU9603R1ZM',
        placeOfSupply: 'Karnataka (29)',
      },
      buyer: {
        name: order.address?.recipientName || order.address?.label || 'Valued Customer',
        phone: order.address?.recipientPhone || null,
        address: addressLine,
        needGstInvoice: Boolean(order.needGstInvoice),
        gstin: order.customerGstin || null,
        businessName: order.gstBusinessName || null,
      },
      items: (order.items || []).map((item: any, idx: number) => {
        const lineGross = Number(item.price || 0) * Number(item.quantity || 1);
        const taxableValue = Math.round(lineGross / 1.05);
        const gstAmt = Math.max(0, lineGross - taxableValue);
        const cgstAmount = Math.round(gstAmt / 2);
        const sgstAmount = Math.max(0, gstAmt - cgstAmount);
        return {
          id: String(item.id || `item-${idx}`),
          productId: String(item.productId || item.id || ''),
          title: item.title,
          brand: item.brand || 'Affordz',
          size: item.size || 'Free Size',
          hsnCode: '6204',
          quantity: Number(item.quantity || 1),
          unitMrp: Number(item.price || 0),
          lineGross,
          taxableValue,
          cgstRate: 2.5,
          cgstAmount,
          sgstRate: 2.5,
          sgstAmount,
          totalGst: gstAmt,
        };
      }),
      totals: {
        itemTotal: Number(order.itemTotal || 0),
        discountAmount: Number(order.discountAmount || 0),
        couponCode: order.couponCode || null,
        deliveryFee: Number(order.deliveryFee || 0),
        giftWrapFee: Number(order.giftWrapFee || 0),
        donationAmount: Number(order.donationAmount || 0),
        taxableSubtotal: taxableMerchandise,
        cgstTotal: cgst,
        sgstTotal: sgst,
        totalGstIncluded: totalGst,
        grandTotal: Number(order.grandTotal || 0),
      },
      html: '',
    };
  };

  const fetchOrBuildInvoice = async (): Promise<OrderInvoiceModel> => {
    if (invoiceData) return invoiceData;
    setIsLoadingInvoice(true);
    try {
      const fetched = await ordersApi.getInvoice(order.id);
      setInvoiceData(fetched);
      return fetched;
    } catch {
      const fallback = buildFallbackInvoice();
      setInvoiceData(fallback);
      return fallback;
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const triggerWebHtmlDownload = (inv: OrderInvoiceModel) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!inv.html) {
      window.print();
      return;
    }
    const blob = new Blob([inv.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadInvoice = async () => {
    const inv = await fetchOrBuildInvoice();
    setIsInvoiceModalOpen(true);
    if (Platform.OS !== 'web') {
      try {
        const invoiceSummary = `${inv.seller.name} — OFFICIAL TAX INVOICE
Invoice No: ${inv.invoiceNumber}
Order No: ${inv.orderNumber}
Date: ${new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
Seller GSTIN: ${inv.seller.gstin}
${inv.buyer.gstin ? `Buyer GSTIN: ${inv.buyer.gstin}\n` : ''}${inv.buyer.businessName ? `Business: ${inv.buyer.businessName}\n` : ''}Customer: ${inv.buyer.name}
Address: ${inv.buyer.address}

Items:
${inv.items.map((i) => `• ${i.title} (${i.size}) x${i.quantity} — ${formatPrice(i.lineGross)}`).join('\n')}

Taxable Value: ${formatPrice(inv.totals.taxableSubtotal)}
Included CGST (2.5%): ${formatPrice(inv.totals.cgstTotal)}
Included SGST (2.5%): ${formatPrice(inv.totals.sgstTotal)}
Delivery Fee: ${inv.totals.deliveryFee === 0 ? 'FREE' : formatPrice(inv.totals.deliveryFee)}
Grand Total: ${formatPrice(inv.totals.grandTotal)}
(Prices inclusive of applicable GST)
Payment Method: ${inv.paymentMethod} (${inv.paymentStatus})`;
        await Share.share({
          title: `Affordz Invoice ${inv.invoiceNumber}`,
          message: invoiceSummary,
        });
      } catch {
        // Modal remains visible as fallback
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
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>
                {order.taxes > 0 ? 'Taxes (GST)' : 'Included GST'}
              </Text>
              <Text
                style={{
                  fontSize: order.taxes > 0 ? 13 : 12,
                  fontWeight: '700',
                  color: order.taxes > 0 ? '#111111' : '#15803D',
                }}
              >
                {order.taxes > 0 ? formatPrice(order.taxes) : 'Inclusive in MRP'}
              </Text>
            </View>

            {order.needGstInvoice && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12.5, color: '#4A4A4A' }}>Tax Invoice Request</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#111111' }}>
                  {order.customerGstin
                    ? `GSTIN: ${order.customerGstin}`
                    : order.gstBusinessName || 'Requested (B2C MRP)'}
                </Text>
              </View>
            )}

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
            {order.deliveryInstructions && (
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#8E877E', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  DELIVERY PREFERENCES
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#111111', marginTop: 2 }}>
                  {order.deliveryInstructions}
                </Text>
              </View>
            )}
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
            {(() => {
              const activeInvoice = invoiceData ?? buildFallbackInvoice();
              return (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0EDE8', paddingBottom: 14, marginBottom: 14 }}>
                    <View>
                      <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#FF5A1F', textTransform: 'uppercase' }}>
                        OFFICIAL TAX INVOICE {isLoadingInvoice ? '(SYNCING...)' : ''}
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>{activeInvoice.invoiceNumber}</Text>
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
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>{activeInvoice.seller.name}</Text>
                      <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2 }}>
                        Seller GSTIN: {activeInvoice.seller.gstin} • Place of Supply: {activeInvoice.seller.placeOfSupply}
                      </Text>
                      <Text style={{ fontSize: 10.5, color: '#15803D', marginTop: 2, fontWeight: '700' }}>
                        MRP-inclusive GST breakdown (no additional GST charged above MRP)
                      </Text>
                    </View>

                    {/* Customer & Date */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: '#8E877E', textTransform: 'uppercase', fontWeight: '800' }}>BILLED TO</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111', marginTop: 2 }}>
                          {activeInvoice.buyer.businessName || activeInvoice.buyer.name}
                        </Text>
                        {activeInvoice.buyer.gstin && (
                          <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#FF5A1F', marginTop: 1 }}>
                            Buyer GSTIN: {activeInvoice.buyer.gstin}
                          </Text>
                        )}
                        <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 2 }}>{activeInvoice.buyer.address}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, color: '#8E877E', textTransform: 'uppercase', fontWeight: '800' }}>INVOICE DATE</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111', marginTop: 2 }}>
                          {new Date(activeInvoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                        <Text style={{ fontSize: 10.5, color: '#059669', fontWeight: '800', marginTop: 2 }}>
                          {activeInvoice.paymentMethod} • {activeInvoice.paymentStatus}
                        </Text>
                      </View>
                    </View>

                    {/* Items Table */}
                    <View style={{ borderTopWidth: 1, borderTopColor: '#E8E5DF', paddingTop: 10, marginBottom: 12 }}>
                      <Text style={{ fontSize: 10, color: '#8E877E', textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 }}>PARTICULARS</Text>
                      {activeInvoice.items.map((it, idx) => (
                        <View key={`${it.title}-${idx}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>{it.title}</Text>
                            <Text style={{ fontSize: 10.5, color: '#6B6667' }}>
                              HSN {it.hsnCode} • Qty: {it.quantity} • Size: {it.size} • Taxable {formatPrice(it.taxableValue)}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>{formatPrice(it.lineGross)}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Summary Totals */}
                    <View style={{ borderTopWidth: 1, borderTopColor: '#E8E5DF', paddingTop: 10, gap: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11.5, color: '#6B6667' }}>Taxable Value (Excl. GST)</Text>
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{formatPrice(activeInvoice.totals.taxableSubtotal)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11.5, color: '#6B6667' }}>Included CGST (2.5%)</Text>
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{formatPrice(activeInvoice.totals.cgstTotal)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11.5, color: '#6B6667' }}>Included SGST (2.5%)</Text>
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>{formatPrice(activeInvoice.totals.sgstTotal)}</Text>
                      </View>
                      {activeInvoice.totals.discountAmount > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 11.5, color: '#15803D' }}>Coupon Discount</Text>
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#15803D' }}>-{formatPrice(activeInvoice.totals.discountAmount)}</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11.5, color: '#6B6667' }}>Delivery Fee</Text>
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#111111' }}>
                          {activeInvoice.totals.deliveryFee === 0 ? 'FREE' : formatPrice(activeInvoice.totals.deliveryFee)}
                        </Text>
                      </View>
                      <View style={{ borderTopWidth: 1, borderTopColor: '#111111', paddingTop: 8, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>Grand Total (GST Inclusive)</Text>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: '#111111' }}>{formatPrice(activeInvoice.totals.grandTotal)}</Text>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Download / Print Actions */}
                  <View style={{ marginTop: 16, gap: 8 }}>
                    <Pressable
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          triggerWebHtmlDownload(activeInvoice);
                        } else {
                          void handleDownloadInvoice();
                        }
                      }}
                      style={{ backgroundColor: '#111111', borderRadius: 999, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <Download size={15} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        {Platform.OS === 'web' ? 'DOWNLOAD GST INVOICE' : 'SHARE / SAVE TAX INVOICE'}
                      </Text>
                    </Pressable>
                    {Platform.OS === 'web' && typeof window !== 'undefined' && (
                      <Pressable
                        onPress={() => window.print()}
                        style={{ backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#D9D9D5', borderRadius: 999, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <Printer size={14} color="#111111" />
                        <Text style={{ color: '#111111', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                          PRINT / SAVE AS PDF
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </>
              );
            })()}
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
        onRequestClose={() => {
          if (!isCancelling) setIsCancelModalOpen(false);
        }}
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
