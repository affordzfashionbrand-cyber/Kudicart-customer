import React from 'react';
import { View, Text } from 'react-native';
import {
  Clock,
  Store,
  Package,
  CheckCircle2,
  UserCheck,
  Truck,
  Navigation,
  ShieldCheck,
} from 'lucide-react-native';
import { OrderStatus } from '@/services/api';

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
}

export const TrackingProgressionStepper = React.memo(function TrackingProgressionStepper({
  activeStatus,
  driverName,
  locality,
  isCod,
}: TrackingProgressionStepperProps) {
  const currentStatusIndex = statusHierarchy.indexOf(activeStatus);

  const getStepStatus = (index: number): 'COMPLETED' | 'ACTIVE' | 'PENDING' => {
    if (currentStatusIndex > index) return 'COMPLETED';
    if (currentStatusIndex === index) return 'ACTIVE';
    return 'PENDING';
  };

  const getMilestoneDescription = (key: OrderStatus) => {
    switch (key) {
      case 'PLACED':
        return isCod
          ? 'Order confirmed via Cash on Delivery (COD)'
          : 'Payment verified via Razorpay Secure UPI';
      case 'ACCEPTED':
        return 'Affordz Atelier confirmed garments';
      case 'PREPARING':
        return 'Hand-pressed, steamed & quality inspected in Vault';
      case 'READY_FOR_PICKUP':
        return 'Sealed in tamper-evident breathable sleeve';
      case 'ASSIGNED':
        return driverName ? `${driverName} assigned with Ather 450X EV` : 'Assigned to EV fleet pilot';
      case 'PICKED_UP':
        return 'Pilot collected garments from Vault counter';
      case 'OUT_FOR_DELIVERY':
        return locality
          ? `Cruising on 100ft Rd to ${locality}`
          : 'Cruising toward your doorstep now';
      case 'DELIVERED':
        return 'Handed over at doorstep & size verified';
      default:
        return '';
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 1.5,
          fontWeight: '900',
          color: '#FF5A1F',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        DROP PROGRESSION (8 STAGES)
      </Text>

      {MILESTONE_DEFINITIONS.map((step, idx) => {
        const stepStatus = getStepStatus(idx);
        const isLast = idx === MILESTONE_DEFINITIONS.length - 1;
        const Icon = step.icon;
        const desc = getMilestoneDescription(step.key);

        return (
          <View key={step.key} style={{ flexDirection: 'row' }}>
            {/* Stepper Node & Vertical Line */}
            <View style={{ alignItems: 'center', marginRight: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor:
                    stepStatus === 'COMPLETED'
                      ? '#111111'
                      : stepStatus === 'ACTIVE'
                      ? '#FF5A1F'
                      : '#F4F1EA',
                  borderWidth: stepStatus === 'ACTIVE' ? 3 : 1,
                  borderColor:
                    stepStatus === 'ACTIVE'
                      ? '#FED7AA'
                      : stepStatus === 'COMPLETED'
                      ? '#111111'
                      : '#E8E5DF',
                }}
              >
                <Icon
                  size={15}
                  color={stepStatus === 'PENDING' ? '#8E877E' : '#FFFFFF'}
                />
              </View>

              {!isLast && (
                <View
                  style={{
                    width: 2,
                    height: 30,
                    marginVertical: 2,
                    backgroundColor: stepStatus === 'COMPLETED' ? '#111111' : '#E8E5DF',
                  }}
                />
              )}
            </View>

            {/* Milestone Details */}
            <View style={{ flex: 1, paddingTop: 1, paddingBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text
                  style={{
                    fontSize: 13,
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
                      paddingVertical: 2,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#FFEDD5',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8.5,
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
              <Text style={{ fontSize: 11, color: '#6B6667', lineHeight: 15 }}>{desc}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
});
