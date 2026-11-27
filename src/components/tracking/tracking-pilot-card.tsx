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
    rating: number | null;
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
  const hasPhone = Boolean(driver.phone && driver.phone.trim().length > 0);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 10 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }} numberOfLines={1}>
                {driver.name}
              </Text>
              {typeof driver.rating === 'number' && (
                <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                  <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#B45309' }}>
                    {driver.rating} ★
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 2 }} numberOfLines={1}>
              {driver.vehicle || 'Authorized Delivery Partner'}
              {hasPhone ? ` • ${driver.phone}` : ''}
            </Text>
          </View>
        </View>

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={hasPhone ? `Call ${driver.name}` : 'Driver phone pending'}
          style={{
            paddingHorizontal: 14,
            height: 40,
            borderRadius: 20,
            backgroundColor: hasPhone ? '#111111' : '#E8E5DF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onPress={onCallDriver}
        >
          <Phone size={15} color={hasPhone ? '#FFFFFF' : '#8E877E'} />
          <Text style={{ fontSize: 11, fontWeight: '900', color: hasPhone ? '#FFFFFF' : '#8E877E' }}>
            CALL
          </Text>
        </AnimatedPressable>
      </View>

      {/* Large Prominent Delivery Handshake OTP Card */}
      <View
        style={{
          marginTop: 14,
          backgroundColor: deliveryOtp ? '#111111' : '#FAF8F5',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: deliveryOtp ? '#111111' : '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color={deliveryOtp ? '#4ADE80' : '#8E877E'} />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '900',
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: deliveryOtp ? '#FFFFFF' : '#6B6667',
              }}
            >
              DELIVERY HANDSHAKE OTP
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: deliveryOtp ? '#D4D4D8' : '#8E877E',
              marginTop: 3,
            }}
          >
            {deliveryOtp
              ? 'Share this 4-digit code with your pilot upon delivery'
              : 'Your secure handover code appears once assigned'}
          </Text>
        </View>

        {deliveryOtp ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#FF5A1F',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              selectable
              style={{
                fontSize: 24,
                fontWeight: '900',
                color: '#111111',
                letterSpacing: 5,
                lineHeight: 28,
              }}
            >
              {deliveryOtp}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#F0ECE4',
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#8E877E', letterSpacing: 2 }}>
              • • • •
            </Text>
          </View>
        )}
      </View>

      {/* Pilot Rating Shortcut Footer */}
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
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B6667' }}>
          Verified Affordz Fleet Partner
        </Text>

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
              paddingHorizontal: 9,
              paddingVertical: 4,
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
