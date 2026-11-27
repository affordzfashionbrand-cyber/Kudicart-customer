import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Clock,
  Store,
  Package,
  CheckCircle2,
  UserCheck,
  Truck,
  Navigation,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { OrderStatus, OrderTrackingMilestone } from '@/services/api';

const MILESTONE_DEFINITIONS: {
  key: OrderStatus;
  title: string;
  icon: any;
}[] = [
  { key: 'PLACED', title: 'Order Placed', icon: Clock },
  { key: 'ACCEPTED', title: 'Vendor Accepted', icon: Store },
  { key: 'PREPARING', title: 'Preparing Garment', icon: Package },
  { key: 'READY_FOR_PICKUP', title: 'Ready for Pickup', icon: CheckCircle2 },
  { key: 'ASSIGNED', title: 'Rider Assigned', icon: UserCheck },
  { key: 'PICKED_UP', title: 'Picked Up', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', icon: Navigation },
  { key: 'DELIVERED', title: 'Delivered', icon: ShieldCheck },
];

const statusHierarchy: OrderStatus[] = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export interface TrackingProgressionStepperProps {
  activeStatus: OrderStatus;
  driverName?: string;
  locality?: string;
  isCod?: boolean;
  milestones?: OrderTrackingMilestone[];
}

export const TrackingProgressionStepper = React.memo(function TrackingProgressionStepper({
  activeStatus,
  driverName,
  locality,
  isCod,
  milestones,
}: TrackingProgressionStepperProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawIndex = statusHierarchy.indexOf(activeStatus);
  const currentStatusIndex =
    rawIndex >= 0
      ? rawIndex
      : activeStatus === 'RETURNING' || activeStatus === 'RETURNED'
        ? statusHierarchy.length - 1
        : 0;

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
          ? 'Order confirmed via Cash on Delivery (COD)'
          : 'Payment verified via Razorpay Secure UPI';
      case 'ACCEPTED':
        return 'Affordz Atelier partner confirmed garments';
      case 'PREPARING':
        return 'Hand-pressed, steamed & quality inspected';
      case 'READY_FOR_PICKUP':
        return 'Sealed in tamper-evident breathable sleeve';
      case 'ASSIGNED':
        return driverName ? `${driverName} assigned by dispatch` : 'Assigned to delivery partner';
      case 'PICKED_UP':
        return 'Delivery partner collected garments from pickup hub';
      case 'OUT_FOR_DELIVERY':
        return locality
          ? `On the way to ${locality}`
          : 'On the way to your doorstep now';
      case 'DELIVERED':
        return 'Handed over at doorstep & size verified';
      default:
        return '';
    }
  };

  const activeDef = MILESTONE_DEFINITIONS[currentStatusIndex] || MILESTONE_DEFINITIONS[0];
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
            DROP PROGRESSION • STAGE {Math.min(currentStatusIndex + 1, 8)} OF 8
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
                  ? 'Order Cancelled'
                  : activeStatus === 'FAILED'
                    ? 'Payment Failed / Expired'
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
                  {activeStatus.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }} numberOfLines={1}>
              {getMilestoneDescription(activeDef.key)}
            </Text>
          </View>
        </View>

        {/* Compact 8-Segment Progress Bar */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {MILESTONE_DEFINITIONS.map((step, idx) => {
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

      {/* Expanded 8-Stage Dropdown Timeline */}
      {isExpanded && (
        <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
          {MILESTONE_DEFINITIONS.map((step, idx) => {
            const stepStatus = getStepStatus(idx);
            const isLast = idx === MILESTONE_DEFINITIONS.length - 1;
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
