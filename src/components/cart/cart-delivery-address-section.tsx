import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin, AlertTriangle, Zap } from 'lucide-react-native';

export interface CartDeliveryAddressSectionProps {
  isAuthenticated: boolean;
  selectedAddress: any;
  user: any;
  addressServiceability: {
    isServiceable: boolean;
    distanceKm: number;
  };
  hasDarkStoreItems: boolean;
  onOpenLocationModal: () => void;
  onOpenAuthModal: () => void;
}

export const CartDeliveryAddressSection = React.memo(function CartDeliveryAddressSection({
  isAuthenticated,
  selectedAddress,
  user,
  addressServiceability,
  hasDarkStoreItems,
  onOpenLocationModal,
  onOpenAuthModal,
}: CartDeliveryAddressSectionProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '900',
              color: '#6B6667',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            DELIVER TO
          </Text>
          <View
            style={{
              backgroundColor: isAuthenticated ? '#111111' : '#FF5A1F',
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 8.5,
                fontWeight: '900',
                color: '#FFFFFF',
                textTransform: 'uppercase',
              }}
            >
              {isAuthenticated ? selectedAddress?.label || 'HOME' : 'LOGIN REQUIRED'}
            </Text>
          </View>
        </View>

        {/* Change / Sign In Action */}
        <Pressable
          onPress={() => (isAuthenticated ? onOpenLocationModal() : onOpenAuthModal())}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: '#111111',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 5,
            backgroundColor: pressed ? '#F4F1EA' : '#FFFFFF',
          })}
        >
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>
            {isAuthenticated ? (selectedAddress ? 'CHANGE' : 'ADD ADDRESS') : 'SIGN IN'}
          </Text>
        </Pressable>
      </View>

      {/* Address Details */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#F4F1EA',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2,
          }}
        >
          <MapPin size={16} color="#111111" />
        </View>
        <View style={{ flex: 1 }}>
          {isAuthenticated ? (
            <>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#111111' }}>
                {user?.name || 'Affordz Customer'}{' '}
                <Text style={{ fontSize: 12, color: '#71717A', fontWeight: '500' }}>
                  • {user?.phone || '+91 8124188999'}
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: selectedAddress ? '#4A4A4A' : '#DC2626',
                  marginTop: 3,
                  lineHeight: 17,
                  fontWeight: selectedAddress ? '400' : '700',
                }}
              >
                {selectedAddress
                  ? `${selectedAddress.line1}, ${selectedAddress.locality || ''}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                  : 'No delivery address found. Please tap ADD ADDRESS above.'}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626' }}>
                Guest Client • Authentication Required
              </Text>
              <Text style={{ fontSize: 12, color: '#71717A', marginTop: 3, lineHeight: 17 }}>
                Please sign in with your phone OTP to connect your delivery address and receive delivery updates.
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Serviceability Radius Banner */}
      {!addressServiceability.isServiceable ? (
        <View
          style={{
            marginTop: 12,
            backgroundColor: '#FEF2F2',
            borderWidth: 1.5,
            borderColor: '#FCA5A5',
            borderRadius: 14,
            padding: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={15} color="#DC2626" />
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#DC2626', letterSpacing: 0.5 }}>
                NOT AVAILABLE FOR THIS PLACE
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 7,
                paddingVertical: 1.5,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#FECACA',
              }}
            >
              <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#B91C1C' }}>
                {addressServiceability.distanceKm} KM (MAX 8.0 KM)
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 11.5, color: '#991B1B', lineHeight: 16 }}>
            {hasDarkStoreItems
              ? `Our 18-minute quick drop and Try & Buy fleet only operates within 8.0 km of Indiranagar Hub. ${selectedAddress?.locality || selectedAddress?.city || 'Selected address'} is ${addressServiceability.distanceKm} km away.`
              : 'Standard boutique delivery will arrive via insured courier in 2-4 business days.'}
          </Text>

          <Pressable
            onPress={onOpenLocationModal}
            style={{
              marginTop: 8,
              backgroundColor: '#DC2626',
              borderRadius: 10,
              paddingVertical: 7,
              paddingHorizontal: 12,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MapPin size={12} color="#FFFFFF" />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>
              CHANGE TO SERVICEABLE LOCATION
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            marginTop: 10,
            backgroundColor: '#F0FDF4',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Zap size={12} color="#15803D" fill="#15803D" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>
              ⚡ 18-Min Instant Drop Available
            </Text>
          </View>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#166534' }}>
            {addressServiceability.distanceKm} km from Hub
          </Text>
        </View>
      )}

      {/* Delivery ETA Pill */}
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
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                !addressServiceability.isServiceable && hasDarkStoreItems
                  ? '#DC2626'
                  : hasDarkStoreItems
                  ? '#22C55E'
                  : '#3B82F6',
            }}
          />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: '800',
              color:
                !addressServiceability.isServiceable && hasDarkStoreItems
                  ? '#DC2626'
                  : hasDarkStoreItems
                  ? '#15803D'
                  : '#1D4ED8',
            }}
          >
            {!addressServiceability.isServiceable && hasDarkStoreItems
              ? '⚠️ Instant Drop Not Serviceable at this Address'
              : hasDarkStoreItems
              ? '⚡ Estimated Delivery: In 18 Minutes'
              : '📦 Boutique Dispatch: In 2-4 Business Days'}
          </Text>
        </View>
        <Text style={{ fontSize: 10.5, color: '#71717A' }}>
          {hasDarkStoreItems ? 'Indiranagar Vault' : 'Artisan Atelier'}
        </Text>
      </View>
    </View>
  );
});
