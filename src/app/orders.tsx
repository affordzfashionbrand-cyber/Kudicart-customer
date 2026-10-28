import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
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

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        insets={insets}
        formatPrice={formatPrice}
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
        <View style={{ paddingTop: 18, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Sparkles size={13} color="#FF5A1F" />
            <Text style={[FontStyles.sansBold, { fontSize: 10, letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }]}>
              CURATED WARDROBE
            </Text>
          </View>
          <Text
            className="font-serif editorial-text"
            style={{ fontFamily: Fonts.serifSemiBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: '#111111' }}
          >
            <Text style={FontStyles.serifRegular}>Active & past</Text>{' '}
            <Text style={FontStyles.serifItalic}>drops.</Text>
          </Text>
        </View>

        {isLoading && orders.length === 0 ? (
          <View style={{ gap: 12, marginTop: 8 }}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        ) : orders.length === 0 ? (
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
          orders.map((order) => (
            <OrderListCard
              key={order.id}
              order={order}
              onPress={() => setSelectedOrder(order)}
              formatPrice={formatPrice}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
