import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { UserCheck, Phone, ShieldCheck, CheckCircle2, Star } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';

export interface TrackingPilotCardProps {
  driver: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
  deliveryOtp: string;
  existingRating: {
    rating: number;
    tags: string[];
    comment: string;
  } | null;
  onCallDriver: () => void;
  onOpenRating: () => void;
}

export const TrackingPilotCard = React.memo(function TrackingPilotCard({
  driver,
  deliveryOtp,
  existingRating,
  onCallDriver,
  onOpenRating,
}: TrackingPilotCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FAF8F5',
              borderWidth: 1.5,
              borderColor: '#FF5A1F',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={20} color="#FF5A1F" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>{driver.name}</Text>
              <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#B45309' }}>
                  {driver.rating || 4.9} ★
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }}>
              {driver.vehicle || 'Ather 450X EV • KA 03 EV 4821'}
            </Text>
          </View>
        </View>

        <AnimatedPressable
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#111111',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={onCallDriver}
        >
          <Phone size={16} color="#FFFFFF" />
        </AnimatedPressable>
      </View>

      {/* Handshake Delivery OTP badge & Pilot Rating shortcut */}
      <View
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F4F1EA',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} color="#15803D" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A' }}>Delivery Handshake OTP:</Text>
          <View
            style={{
              backgroundColor: '#FAF8F5',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111', letterSpacing: 1.5 }}>
              {deliveryOtp}
            </Text>
          </View>
        </View>

        {existingRating ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} color="#15803D" />
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#15803D' }}>
              Rated {existingRating.rating}★
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onOpenRating}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#FFF7ED',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FFEDD5',
            }}
          >
            <Star size={12} color="#FF5A1F" fill="#FF5A1F" />
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#C2410C' }}>Rate Pilot</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});
