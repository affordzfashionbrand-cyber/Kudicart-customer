import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { AddressModel } from '@/services/api';
import { Fonts } from '@/constants/theme';

interface CheckoutAddressCardProps {
  selectedAddress: AddressModel | null;
  onOpenAddressModal: () => void;
}

export const CheckoutAddressCard = React.memo(function CheckoutAddressCard({
  selectedAddress,
  onOpenAddressModal,
}: CheckoutAddressCardProps) {
  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11, color: '#6B6667', letterSpacing: 1, textTransform: 'uppercase' }}>
            DELIVER TO
          </Text>
          <View style={{ backgroundColor: '#111111', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: 8.5, color: '#FFFFFF', textTransform: 'uppercase' }}>
              {selectedAddress?.label || 'HOME'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onOpenAddressModal}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: '#111111',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 5,
            backgroundColor: pressed ? '#F4F1EA' : '#FFFFFF',
          })}
        >
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11, color: '#111111' }}>CHANGE</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F4F1EA', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
          <MapPin size={16} color="#111111" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: 14, color: '#111111' }}>
            Ananya Mathur <Text style={{ fontFamily: Fonts.sansMedium, fontSize: 12, color: '#71717A' }}>• +91 98765 43210</Text>
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: '#4A4A4A', marginTop: 3, lineHeight: 17 }}>
            {selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.locality || ''}, ${selectedAddress.city} - ${selectedAddress.pincode}` : 'Please choose an address'}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F4F1EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: 11.5, color: '#15803D' }}>
            ⚡ Estimated Delivery: In 18 Minutes
          </Text>
        </View>
        <Text style={{ fontFamily: Fonts.sans, fontSize: 10.5, color: '#71717A' }}>Indiranagar Vault</Text>
      </View>
    </View>
  );
});
