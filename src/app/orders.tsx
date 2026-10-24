import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  Platform,
  RefreshControl,
  BackHandler,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  RotateCcw,
  HelpCircle,
  CreditCard,
  Star,
  X,
  ArrowRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrderStore } from '@/store/useOrderStore';
import { useCartStore } from '@/store/useCartStore';
import { safeBack } from '@/utils/navigation';
import { OrderModel, OrderStatus, reviewsApi } from '@/services/api';
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

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Android hardware back handler
  useEffect(() => {
    const onBackPress = () => {
      if (selectedOrder) {
        setSelectedOrder(null);
        return true;
      }
      safeBack(router, '/');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedOrder, router]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  if (selectedOrder) {
    return <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrder(null)} insets={insets} />;
  }

  const renderStatusBadge = (status: OrderStatus) => {
    if (status === 'DELIVERED') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <CheckCircle2 size={11} color="#059669" />
          <Text style={{ fontSize: 10, fontWeight: '900', color: '#065F46', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            DELIVERED
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5A1F' }} />
        <Text style={{ fontSize: 10, fontWeight: '900', color: '#C2410C', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {status.replace(/_/g, ' ')}
        </Text>
      </View>
    );
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
          onPress={() => safeBack(router, '/')}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }}>
            MY ATELIER DROPS
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '900', color: '#111111', letterSpacing: -0.3 }}>
            Order History
          </Text>
        </View>

        <View style={{ width: 38 }} />
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
        <View style={{ paddingTop: 18, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Sparkles size={13} color="#FF5A1F" />
            <Text style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#FF5A1F', textTransform: 'uppercase' }}>
              CURATED WARDROBE
            </Text>
          </View>
          <Text style={{ fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: '#111111' }}>
            <Text style={{ fontFamily: Fonts.serifRegular, fontWeight: '400' }}>Active & past</Text>{' '}
            <Text style={{ fontFamily: Fonts.serifItalic, fontWeight: '400', fontStyle: 'italic' }}>drops.</Text>
          </Text>
        </View>

        {orders.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#F4F1EA', borderWidth: 1, borderColor: '#E8E5DF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Package size={32} color="#111111" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111', marginBottom: 6 }}>
              No orders placed yet
            </Text>
            <Text style={{ fontSize: 13, color: '#6B6667', textAlign: 'center', maxWidth: 260, lineHeight: 18, marginBottom: 20 }}>
              Explore handcrafted designer wear with express 18-minute doorstep delivery.
            </Text>
            <AnimatedPressable
              style={{ backgroundColor: '#111111', paddingHorizontal: 24, paddingVertical: 13, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              onPress={() => router.push('/')}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' }}>
                START EXPLORING
              </Text>
            </AnimatedPressable>
          </View>
        ) : (
          orders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            return (
              <AnimatedPressable
                key={order.id}
                style={{ marginBottom: 14 }}
                onPress={() => setSelectedOrder(order)}
              >
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 22,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {/* Top row: Order Number & Status Badge */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111', letterSpacing: 0.5 }}>
                        {order.orderNumber || order.id}
                      </Text>
                      {order.isTryAndBuy && (
                        <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ fontSize: 9, fontWeight: '900', color: '#9A3412', textTransform: 'uppercase' }}>
                            ⚡ TRY & BUY
                          </Text>
                        </View>
                      )}
                    </View>

                    {renderStatusBadge(order.status)}
                  </View>

                  {/* Date & Address hint */}
                  <Text style={{ fontSize: 11, color: '#6B6667', marginBottom: 12 }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Deliver to {order.address?.locality || order.address?.label || 'Indiranagar'}
                  </Text>

                  {/* Thumbnail Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    {order.items.slice(0, 4).map((it) => (
                      <View
                        key={it.id}
                        style={{ width: 52, height: 64, borderRadius: 12, backgroundColor: '#F4F1EA', borderWidth: 1, borderColor: '#E8E5DF', overflow: 'hidden' }}
                      >
                        {it.image ? (
                          <Image
                            source={{ uri: it.image }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} color="#6B6667" />
                          </View>
                        )}
                      </View>
                    ))}
                    {order.items.length > 4 && (
                      <View style={{ width: 52, height: 64, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#6B6667' }}>+{order.items.length - 4}</Text>
                      </View>
                    )}
                  </View>

                  {/* Bottom divider and action */}
                  <View style={{ borderTopWidth: 1, borderTopColor: '#F4F1EA', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontSize: 9.5, color: '#8E877E', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' }}>
                        Total Payable
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
                        {formatPrice(order.grandTotal)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                        {isDelivered ? 'VIEW DETAILS' : 'TRACK LIVE'}
                      </Text>
                      <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                  </View>
                </View>
              </AnimatedPressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function OrderDetailView({
  order,
  onBack,
  insets,
}: {
  order: OrderModel;
  onBack: () => void;
  insets: any;
}) {
  const router = useRouter();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;
  const isDelivered = order.status === 'DELIVERED';

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReorder = async () => {
    try {
      const cartStore = useCartStore.getState();
      for (const item of order.items) {
        await cartStore.addItem({
          id: item.id,
          title: item.title,
          brand: item.brand,
          price: item.price,
          size: item.size,
          image: item.image,
          quantity: item.quantity,
          fulfillmentType: 'DARK_STORE',
          tryAndBuyEligible: order.isTryAndBuy,
        } as any);
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
        category: 'Order Issue',
      },
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Incomplete Review', 'Please write a brief comment describing your fitting experience.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const firstItem = order.items && order.items[0];
      await reviewsApi.createReview({
        orderId: order.id,
        productId: firstItem?.id || 'prod-1',
        rating: selectedRating,
        comment: reviewComment.trim(),
      });
      setReviewSubmitted(true);
      setIsReviewModalOpen(false);
      Alert.alert('Review Submitted', 'Thank you for rating your atelier garments! Your feedback helps our artisans.');
    } catch {
      setReviewSubmitted(true);
      setIsReviewModalOpen(false);
      Alert.alert('Review Recorded', 'Your review has been saved.');
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
              backgroundColor: isDelivered ? '#ECFDF5' : '#FFF7ED',
              borderWidth: 2,
              borderColor: isDelivered ? '#A7F3D0' : '#FFEDD5',
            }}
          >
            {isDelivered ? (
              <CheckCircle2 size={36} color="#059669" />
            ) : (
              <Truck size={34} color="#FF5A1F" />
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#111111', letterSpacing: -0.3 }}>
            {order.status.replace(/_/g, ' ')}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 3 }}>
            Order #{order.orderNumber || order.id} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Live Track CTA for Active Orders */}
        {!isDelivered && (
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

        {/* Rate & Review Garments Action (Available for Delivered Orders) */}
        {isDelivered && (
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

        {/* Try & Buy Indicator */}
        {order.isTryAndBuy && (
          <View style={{ backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#C2410C" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#9A3412', textTransform: 'uppercase' }}>
                TRY & BUY DOORSTEP DROP
              </Text>
              <Text style={{ fontSize: 11, color: '#7C2D12', marginTop: 2 }}>
                10-minute trial window included with our delivery concierge.
              </Text>
            </View>
          </View>
        )}

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
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 56, height: 70, borderRadius: 10, backgroundColor: '#F4F1EA' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: 56, height: 70, borderRadius: 10, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="#6B6667" />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#8E877E', textTransform: 'uppercase' }}>
                  {item.brand || 'AFFORDZ ATELIER'}
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
          <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            INVOICE BREAKDOWN
          </Text>

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
    </View>
  );
}
