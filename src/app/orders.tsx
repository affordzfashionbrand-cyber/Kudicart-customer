import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  RefreshControl,
  BackHandler,
} from 'react-native';
import {
  ArrowLeft,
  Package,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrderStore } from '@/store/useOrderStore';
import { TERMINAL_ORDER_STATUSES } from '@/contracts/order-contracts';
import { safeBack } from '@/utils/navigation';
import { OrderModel } from '@/services/api';
import { Fonts, FontStyles } from '@/constants/theme';
import { OrderCardSkeleton } from '@/components/common/skeleton';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { OrderListCard } from '@/components/orders/order-list-card';
import { OrderDetailView } from '@/components/orders/order-detail-view';

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);
  const [openInvoiceOnDetail, setOpenInvoiceOnDetail] = useState(false);
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

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  }, [fetchOrders]);

  const sortedOrders = useMemo(() => {
    const active: OrderModel[] = [];
    const past: OrderModel[] = [];
    for (const o of orders) {
      if (TERMINAL_ORDER_STATUSES.includes(o.status as any)) {
        past.push(o);
      } else {
        active.push(o);
      }
    }
    return [...active, ...past];
  }, [orders]);

  const renderOrderItem = useCallback(
    ({ item: order }: { item: OrderModel }) => (
      <OrderListCard
        order={order}
        onPress={() => {
          setOpenInvoiceOnDetail(false);
          setSelectedOrder(order);
        }}
        onPressInvoice={() => {
          setOpenInvoiceOnDetail(true);
          setSelectedOrder(order);
        }}
        formatPrice={formatPrice}
      />
    ),
    [],
  );

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          setOpenInvoiceOnDetail(false);
        }}
        insets={insets}
        formatPrice={formatPrice}
        initialOpenInvoice={openInvoiceOnDetail}
      />
    );
  }

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
          onPress={() => safeBack(router, '/')}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={[FontStyles.sansBold, { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }]}>
            MY ATELIER DROPS
          </Text>
          <Text style={[FontStyles.sansBold, { fontSize: 17, fontWeight: '900', color: '#111111', letterSpacing: -0.3 }]}>
            Order History
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={isLoading && orders.length === 0 ? [] : sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS !== 'web'}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
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
        ListHeaderComponent={
          <View style={{ paddingTop: 18, paddingBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Sparkles size={13} color="#FF5A1F" />
              <Text style={[FontStyles.sansBold, { fontSize: 10, letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }]}>
                CURATED WARDROBE
              </Text>
            </View>
            <Text
              className="font-sans"
              style={{ fontFamily: Fonts.sansBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: '#111111' }}
            >
              <Text style={FontStyles.sansRegular}>Active & past</Text>{' '}
              <Text style={FontStyles.sansBold}>drops.</Text>
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading && orders.length === 0 ? (
            <View style={{ gap: 12, marginTop: 8 }}>
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </View>
          ) : (
            <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#F4F1EA', borderWidth: 1, borderColor: '#E8E5DF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Package size={32} color="#111111" />
              </View>
              <Text style={[FontStyles.sansBold, { fontSize: 18, fontWeight: '900', color: '#111111', marginBottom: 6 }]}>
                No orders placed yet
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 13, color: '#6B6667', textAlign: 'center', maxWidth: 260, lineHeight: 18, marginBottom: 20 }]}>
                Explore handcrafted designer wear with express 19-minute doorstep delivery.
              </Text>
              <AnimatedPressable
                style={{ backgroundColor: '#111111', paddingHorizontal: 24, paddingVertical: 13, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                onPress={() => router.push('/')}
              >
                <Text style={[FontStyles.sansBold, { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' }]}>
                  START EXPLORING
                </Text>
              </AnimatedPressable>
            </View>
          )
        }
      />
    </View>
  );
}
