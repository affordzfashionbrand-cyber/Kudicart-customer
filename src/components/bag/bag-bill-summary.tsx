import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Tag, Gift, Check, X, ReceiptText, Building2 } from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';
import { formatPrice } from '@/data/homeData';

interface BagBillSummaryProps {
  totalMrp: number;
  totalBagDiscount: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: string | null;
  couponDiscount: number;
  promoError: string | null;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  giftWrap: boolean;
  setGiftWrap: (wrap: boolean | ((prev: boolean) => boolean)) => void;
  donationAmount: number;
  setDonationAmount: (amount: number) => void;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
  overallSavings: number;
}

export const BagBillSummary = React.memo(function BagBillSummary({
  totalMrp,
  totalBagDiscount,
  promoCode,
  setPromoCode,
  appliedPromo,
  couponDiscount,
  promoError,
  onApplyPromo,
  onRemovePromo,
  giftWrap,
  setGiftWrap,
  donationAmount,
  setDonationAmount,
  deliveryFee,
  taxes,
  grandTotal,
  overallSavings,
}: BagBillSummaryProps) {
  return (
    <View style={{ gap: 14 }}>
      {/* 1. Coupos & Offers Section */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#E8E5DF',
          padding: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Tag size={15} color="#FF5A1F" />
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            APPLY COUPONS & OFFERS
          </Text>
        </View>

        {appliedPromo ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ECFDF5',
              borderWidth: 1,
              borderColor: '#A7F3D0',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#065F46' }}>{appliedPromo} APPLIED</Text>
                <Text style={{ fontSize: 10, color: '#047857' }}>You saved {formatPrice(couponDiscount)}</Text>
              </View>
            </View>
            <Pressable onPress={onRemovePromo} hitSlop={8} style={{ padding: 4 }}>
              <X size={16} color="#065F46" />
            </Pressable>
          </View>
        ) : (
          <View>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F7F5F0',
                borderWidth: 1,
                borderColor: '#E2DFD8',
                borderRadius: 12,
                paddingHorizontal: 10,
                alignItems: 'center',
              }}
            >
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter coupon code (e.g. KUDI100)"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="characters"
                style={{ flex: 1, paddingVertical: 10, fontSize: 12, fontWeight: '700', color: '#111111' }}
              />
              <Pressable
                onPress={onApplyPromo}
                style={{
                  backgroundColor: '#111111',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>APPLY</Text>
              </Pressable>
            </View>
            {promoError && (
              <Text style={{ fontSize: 10.5, color: '#EF4444', fontWeight: '700', marginTop: 4, marginLeft: 2 }}>
                {promoError}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 2. Artisan Gift Wrap Option */}
      <Pressable
        onPress={() => setGiftWrap((prev: boolean) => !prev)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: giftWrap ? '#FF5A1F' : '#E8E5DF',
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: giftWrap ? '#FFF7ED' : '#F7F5F0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Gift size={16} color={giftWrap ? '#FF5A1F' : '#111111'} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>Artisan Gift Wrap (₹35)</Text>
            <Text style={{ fontSize: 10, color: '#8A8580' }}>Handmade recycled cotton paper with wax seal</Text>
          </View>
        </View>

        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: giftWrap ? '#FF5A1F' : '#C8C4BC',
            backgroundColor: giftWrap ? '#FF5A1F' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {giftWrap && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
        </View>
      </Pressable>

      {/* 3. Weavers Community Support Pledge */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E8E5DF',
          padding: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Building2 size={13} color="#FF5A1F" />
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111', textTransform: 'uppercase' }}>
            SUPPORT HANDLOOM WEAVERS
          </Text>
        </View>
        <Text style={{ fontSize: 10.5, color: '#8A8580', lineHeight: 14, marginBottom: 8 }}>
          Donate towards the health & silk loom welfare fund of artisan clusters across India.
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[10, 20, 50].map((amt) => {
            const isSelected = donationAmount === amt;
            return (
              <Pressable
                key={amt}
                onPress={() => setDonationAmount(isSelected ? 0 : amt)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: isSelected ? '#111111' : '#F7F5F0',
                  borderWidth: 1,
                  borderColor: isSelected ? '#111111' : '#E2DFD8',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '900', color: isSelected ? '#FFFFFF' : '#111111' }}>
                  ₹{amt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 4. Complete Bill Details */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#E8E5DF',
          padding: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <ReceiptText size={15} color="#111111" />
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            PRICE DETAILS
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#666666' }}>Total MRP</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(totalMrp)}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#666666' }}>Bag Discount</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#10B981' }}>
              - {formatPrice(totalBagDiscount)}
            </Text>
          </View>

          {couponDiscount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#666666' }}>Coupon Discount</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#10B981' }}>
                - {formatPrice(couponDiscount)}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#666666' }}>Platform Fee</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#10B981' }}>FREE</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#666666' }}>18-Min Express Vault Delivery</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: deliveryFee === 0 ? '#10B981' : '#111111' }}>
              {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
            </Text>
          </View>

          {giftWrap && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#666666' }}>Artisan Gift Wrap</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>₹35</Text>
            </View>
          )}

          {donationAmount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#666666' }}>Weavers Fund Support</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>
                {formatPrice(donationAmount)}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#666666' }}>Estimated GST (5%)</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111111' }}>{formatPrice(taxes)}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#F0ECE4',
              marginTop: 4,
            }}
          >
            <View>
              <EditorialText first="Total" second="amount." fontSize={16} lineHeight={20} singleLine withDot />
              <Text style={{ fontSize: 10, color: '#8A8580', marginTop: 1 }}>Includes all applicable taxes</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#111111' }}>
              {formatPrice(grandTotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
