import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Clock,
  Store,
  Package,
  Truck,
  Navigation,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { OrderStatus, OrderTrackingMilestone } from '@/services/api';
import { getCustomerOrderStatusLabel } from '@/contracts/order-contracts';

const BASE_MILESTONES: {
  key: OrderStatus;
  title: string;
  icon: any;
}[] = [
  { key: 'PLACED', title: 'Order placed', icon: Clock },
  { key: 'PACKING', title: 'Order is getting packed', icon: Package },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for delivery', icon: Navigation },
];

export interface TrackingProgressionStepperProps {
  activeStatus: OrderStatus;
  driverName?: string;
  locality?: string;
  isCod?: boolean;
  isTryAndBuy?: boolean;
  milestones?: OrderTrackingMilestone[];
}

function normalizeCustomerStageKey(status: OrderStatus): OrderStatus {
  switch (status) {
    case 'ACCEPTED':
    case 'PACKING':
    case 'PREPARING':
    case 'READY_FOR_PICKUP':
    case 'ASSIGNED':
      return 'PACKING';
    case 'PICKED_UP':
    case 'OUT_FOR_DELIVERY':
      return 'OUT_FOR_DELIVERY';
    case 'RETURNING':
    case 'RETURNED':
      return 'RETURNED';
    default:
      return status;
  }
}

export const TrackingProgressionStepper = React.memo(function TrackingProgressionStepper({
  activeStatus,
  driverName,
  locality,
  isCod,
  isTryAndBuy,
  milestones,
}: TrackingProgressionStepperProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isReturnFlow = activeStatus === 'RETURNING' || activeStatus === 'RETURNED';
  const showTryAndBuy = Boolean(
    isTryAndBuy ||
      activeStatus === 'TRY_AND_BUY' ||
      isReturnFlow ||
      milestones?.some((m) => m.key === 'TRY_AND_BUY'),
  );

  const activeMilestones = useMemo(() => {
    const steps = [...BASE_MILESTONES];
    if (showTryAndBuy) {
      steps.push({ key: 'TRY_AND_BUY', title: 'Try & Buy', icon: Sparkles });
    }
    if (isReturnFlow) {
      steps.push({ key: 'RETURNED', title: 'Order return', icon: RotateCcw });
    } else {
      steps.push({ key: 'DELIVERED', title: 'Order delivered', icon: ShieldCheck });
    }
    return steps;
  }, [showTryAndBuy, isReturnFlow]);

  const normalizedKey = normalizeCustomerStageKey(activeStatus);
  const rawIndex = activeMilestones.findIndex((m) => m.key === normalizedKey);
  const currentStatusIndex = rawIndex >= 0 ? rawIndex : 0;

  const backendMilestoneMap = useMemo(() => {
    const map = new Map<string, OrderTrackingMilestone>();
    if (Array.isArray(milestones)) {
      for (const m of milestones) {
        if (m?.key) map.set(m.key, m);
      }
    }
    return map;
  }, [milestones]);

  const getStepStatus = (index: number): 'COMPLETED' | 'ACTIVE' | 'PENDING' => {
    if (activeStatus === 'CANCELLED' || activeStatus === 'FAILED') {
      return index === 0 ? 'COMPLETED' : 'PENDING';
    }
    if (currentStatusIndex > index) return 'COMPLETED';
    if (currentStatusIndex === index) return 'ACTIVE';
    return 'PENDING';
  };

  const getMilestoneDescription = (key: OrderStatus) => {
    const liveMilestone = backendMilestoneMap.get(key);
    if (liveMilestone?.description) {
      return liveMilestone.description;
    }
    switch (key) {
      case 'PLACED':
        return isCod
          ? 'Order placed via Cash on Delivery (COD)'
          : 'Order placed & payment verified';
      case 'ACCEPTED':
      case 'PACKING':
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
      case 'ASSIGNED':
        return 'Order is getting packed and prepared for dispatch';
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return locality
          ? `Out for delivery to ${locality}`
          : 'Out for delivery to your doorstep';
      case 'TRY_AND_BUY':
        return '10-minute Try & Buy doorstep fitting in progress';
      case 'DELIVERED':
        return 'Order delivered at your doorstep';
      case 'RETURNING':
      case 'RETURNED':
        return activeStatus === 'RETURNING'
          ? 'Return items collected. Partner returning items to store'
          : 'Order return completed and reconciled';
      default:
        return '';
    }
  };

  const activeDef = activeMilestones[currentStatusIndex] || activeMilestones[0];
  const ActiveIcon = activeDef.icon;

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      {/* Compact Collapsible Summary Header */}
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel="Toggle drop progression stages"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 10,
              letterSpacing: 1.4,
              fontWeight: '900',
              color: '#FF5A1F',
              textTransform: 'uppercase',
            }}
          >
            DROP PROGRESSION • STAGE {Math.min(currentStatusIndex + 1, activeMilestones.length)} OF {activeMilestones.length}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#6B6667' }}>
              {isExpanded ? 'Hide' : 'View All'}
            </Text>
            {isExpanded ? (
              <ChevronUp size={15} color="#111111" />
            ) : (
              <ChevronDown size={15} color="#111111" />
            )}
          </View>
        </View>

        {/* Active Stage Summary Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: activeStatus === 'DELIVERED' ? '#15803D' : '#FF5A1F',
            }}
          >
            <ActiveIcon size={15} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
                {activeStatus === 'CANCELLED'
                  ? 'Order cancelled'
                  : activeStatus === 'FAILED'
                    ? 'Payment failed / expired'
                    : activeDef.title}
              </Text>
              <View
                style={{
                  backgroundColor: activeStatus === 'DELIVERED' ? '#ECFDF5' : '#FFF7ED',
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 8.5,
                    fontWeight: '900',
                    color: activeStatus === 'DELIVERED' ? '#15803D' : '#C2410C',
                  }}
                >
                  {getCustomerOrderStatusLabel(activeStatus)}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }} numberOfLines={1}>
              {getMilestoneDescription(activeDef.key)}
            </Text>
          </View>
        </View>

        {/* Compact Segment Progress Bar */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {activeMilestones.map((step, idx) => {
            const st = getStepStatus(idx);
            return (
              <View
                key={step.key}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor:
                    st === 'COMPLETED'
                      ? '#111111'
                      : st === 'ACTIVE'
                        ? '#FF5A1F'
                        : '#EAE6DF',
                }}
              />
            );
          })}
        </View>
      </Pressable>

      {/* Expanded Stage Dropdown Timeline */}
      {isExpanded && (
        <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
          {activeMilestones.map((step, idx) => {
            const stepStatus = getStepStatus(idx);
            const isLast = idx === activeMilestones.length - 1;
            const Icon = step.icon;
            const desc = getMilestoneDescription(step.key);
            const liveMilestone = backendMilestoneMap.get(step.key);

            return (
              <View key={step.key} style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', marginRight: 12 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor:
                        stepStatus === 'COMPLETED'
                          ? '#111111'
                          : stepStatus === 'ACTIVE'
                            ? '#FF5A1F'
                            : '#F4F1EA',
                      borderWidth: stepStatus === 'ACTIVE' ? 2.5 : 1,
                      borderColor:
                        stepStatus === 'ACTIVE'
                          ? '#FED7AA'
                          : stepStatus === 'COMPLETED'
                            ? '#111111'
                            : '#E8E5DF',
                    }}
                  >
                    <Icon
                      size={14}
                      color={stepStatus === 'PENDING' ? '#8E877E' : '#FFFFFF'}
                    />
                  </View>

                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        height: 26,
                        marginVertical: 2,
                        backgroundColor: stepStatus === 'COMPLETED' ? '#111111' : '#E8E5DF',
                      }}
                    />
                  )}
                </View>

                <View style={{ flex: 1, paddingTop: 1, paddingBottom: isLast ? 2 : 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          fontSize: 12.5,
                          fontWeight: '900',
                          color:
                            stepStatus === 'PENDING'
                              ? '#8E877E'
                              : stepStatus === 'ACTIVE'
                                ? '#FF5A1F'
                                : '#111111',
                        }}
                      >
                        {step.title}
                      </Text>

                      {stepStatus === 'ACTIVE' && (
                        <View
                          style={{
                            backgroundColor: '#FFF7ED',
                            paddingHorizontal: 6,
                            paddingVertical: 1.5,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#FFEDD5',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 8,
                              fontWeight: '900',
                              color: '#C2410C',
                              letterSpacing: 0.5,
                              textTransform: 'uppercase',
                            }}
                          >
                            IN PROGRESS
                          </Text>
                        </View>
                      )}
                    </View>

                    {liveMilestone?.timestamp ? (
                      <Text style={{ fontSize: 9.5, fontWeight: '600', color: '#8E877E' }}>
                        {new Date(liveMilestone.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 11, color: '#6B6667', lineHeight: 15 }}>{desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
});
