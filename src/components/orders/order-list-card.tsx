import React from 'react';
import { View, Text } from 'react-native';
import { Package, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { LazyImage } from '@/components/common/lazy-image';
import { OrderModel, OrderStatus } from '@/services/api';

export interface OrderListCardProps {
  order: OrderModel;
  onPress: () => void;
  formatPrice: (val: number) => string;
}

export const OrderListCard = React.memo(function OrderListCard({
  order,
  onPress,
  formatPrice,
}: OrderListCardProps) {
  const isDelivered = order.status === 'DELIVERED';

  const renderStatusBadge = (status: OrderStatus) => {
    if (status === 'DELIVERED') {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#ECFDF5',
            borderWidth: 1,
            borderColor: '#A7F3D0',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <CheckCircle2 size={11} color="#059669" />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '900',
              color: '#065F46',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            DELIVERED
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: '#FFF7ED',
          borderWidth: 1,
          borderColor: '#FFEDD5',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5A1F' }} />
        <Text
          style={{
            fontSize: 10,
            fontWeight: '900',
            color: '#C2410C',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {status.replace(/_/g, ' ')}
        </Text>
      </View>
    );
  };

  return (
    <AnimatedPressable
      style={{ marginBottom: 14 }}
      onPress={onPress}
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
          Placed on{' '}
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          • Deliver to {order.address?.locality || order.address?.label || 'Indiranagar'}
        </Text>

        {/* Thumbnail Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          {order.items.slice(0, 4).map((it) => (
            <View
              key={it.id}
              style={{
                width: 52,
                height: 64,
                borderRadius: 12,
                backgroundColor: '#F4F1EA',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                overflow: 'hidden',
              }}
            >
              {it.image ? (
                <LazyImage
                  source={{ uri: it.image }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  priority="low"
                />
              ) : (
                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#6B6667" />
                </View>
              )}
            </View>
          ))}
          {order.items.length > 4 && (
            <View
              style={{
                width: 52,
                height: 64,
                borderRadius: 12,
                backgroundColor: '#FAF8F5',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#6B6667' }}>
                +{order.items.length - 4}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom divider and action */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#F4F1EA',
            paddingTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{ fontSize: 9.5, color: '#8E877E', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' }}>
              Total Payable
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
              {formatPrice(order.grandTotal)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#111111',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {isDelivered ? 'VIEW DETAILS' : 'TRACK LIVE'}
            </Text>
            <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
});
