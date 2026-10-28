import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Gift, Check, Heart, ShieldCheck, RotateCcw, Lock } from 'lucide-react-native';
import { AnimatedPriceTicker } from '@/components/common/animated-price-ticker';

export interface CartBillDetailsSectionProps {
  items: any[];
  giftWrap: boolean;
  toggleGiftWrap: () => void;
  donationAmount: number;
  setDonation: (amount: number) => void;
  totalMrp: number;
  discountOnMrp: number;
  discountAmount: number;
  couponCode: string | null;
  deliveryFee: number;
  taxes: number;
  finalPayable: number;
  formatPrice: (val: number) => string;
}

export const CartBillDetailsSection = React.memo(function CartBillDetailsSection({
  items,
  giftWrap,
  toggleGiftWrap,
  donationAmount,
  setDonation,
  totalMrp,
  discountOnMrp,
  discountAmount,
  couponCode,
  deliveryFee,
  taxes,
  finalPayable,
  formatPrice,
}: CartBillDetailsSectionProps) {
  return (
    <>
      {/* 9. Value-Add Addons: Gift Wrap & Donation */}
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
        <Text
          style={{
            fontSize: 11,
            fontWeight: '900',
            color: '#6B6667',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          ORDER VALUE ADDS
        </Text>

        {/* Gift Wrap */}
        <Pressable
          onPress={toggleGiftWrap}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F4F1EA',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: giftWrap ? '#FFF7ED' : '#F7F5F0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Gift size={16} color={giftWrap ? '#FF5A1F' : '#111111'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>
                Artisan Gift Wrap (₹35)
              </Text>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>
                Hand-tied satin ribbon with personalized note
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: giftWrap ? '#111111' : '#D9D9D5',
              backgroundColor: giftWrap ? '#111111' : '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {giftWrap && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </Pressable>

        {/* Handloom Weaver Donation */}
        <View style={{ paddingTop: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Heart size={14} color="#EF4444" fill="#EF4444" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>
                Support Indian Handloom Weavers
              </Text>
            </View>
            {donationAmount > 0 && (
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>
                +{formatPrice(donationAmount)}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[10, 20, 50].map((amt) => {
              const isSelected = donationAmount === amt;
              return (
                <Pressable
                  key={amt}
                  onPress={() => setDonation(isSelected ? 0 : amt)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isSelected ? '#111111' : '#E8E5DF',
                    backgroundColor: isSelected ? '#111111' : '#FAF8F5',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: isSelected ? '#FFFFFF' : '#111111' }}>
                    ₹{amt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 10. Detailed Price Breakdown */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: '#E8E5DF',
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '900',
            color: '#6B6667',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          PRICE DETAILS ({items.length} {items.length === 1 ? 'Item' : 'Items'})
        </Text>

        <View style={{ gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Total MRP</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(totalMrp)}</Text>
          </View>

          {discountOnMrp > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Discount on MRP</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>- {formatPrice(discountOnMrp)}</Text>
            </View>
          )}

          {discountAmount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Coupon Discount ({couponCode})</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>- {formatPrice(discountAmount)}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Doorstep Try & Buy</Text>
              <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#065F46' }}>FREE</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>FREE</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#4A4A4A' }}>18-Min Express Vault Delivery</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: deliveryFee === 0 ? '#15803D' : '#111111' }}>
              {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
            </Text>
          </View>

          {giftWrap && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Artisan Gift Wrap</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>₹35</Text>
            </View>
          )}

          {donationAmount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Handloom Weavers Donation</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(donationAmount)}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#4A4A4A' }}>Taxes & GST (5%)</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(taxes)}</Text>
          </View>

          {/* Total Amount */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 14,
              marginTop: 4,
              borderTopWidth: 1,
              borderTopColor: '#E8E5DF',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#111111' }}>Total Amount</Text>
            <AnimatedPriceTicker
              value={finalPayable}
              style={{ fontSize: 20, fontWeight: '900', color: '#111111' }}
            />
          </View>
        </View>
      </View>

      {/* 11. Affordz & Trust Badges */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, marginBottom: 20 }}>
        <View style={{ alignItems: 'center', width: '31%' }}>
          <ShieldCheck size={20} color="#111111" />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', marginTop: 4, textAlign: 'center' }}>
            100% GENUINE
          </Text>
          <Text style={{ fontSize: 9, color: '#71717A', textAlign: 'center' }}>Direct from Ateliers</Text>
        </View>

        <View style={{ alignItems: 'center', width: '31%' }}>
          <RotateCcw size={20} color="#111111" />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', marginTop: 4, textAlign: 'center' }}>
            7 DAYS RETURN
          </Text>
          <Text style={{ fontSize: 9, color: '#71717A', textAlign: 'center' }}>Instant Doorstep Pickup</Text>
        </View>

        <View style={{ alignItems: 'center', width: '31%' }}>
          <Lock size={20} color="#111111" />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111', marginTop: 4, textAlign: 'center' }}>
            SECURE PAY
          </Text>
          <Text style={{ fontSize: 9, color: '#71717A', textAlign: 'center' }}>256-Bit SSL Encrypted</Text>
        </View>
      </View>
    </>
  );
});
