import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Tag } from 'lucide-react-native';

export const AVAILABLE_COUPONS = [
  { code: 'AFFORDZ10', label: '10% OFF', desc: '10% instant discount (up to ₹300) on orders above ₹999' },
  { code: 'ATELIER500', label: '₹500 OFF', desc: 'Flat ₹500 off on designer drop orders above ₹2,499' },
  { code: 'EXPRESS18', label: 'FREE EXPRESS', desc: 'Flat ₹40 instant off for complimentary express drop' },
];

export interface CartCouponsSectionProps {
  activeCoupons?: any[];
  couponCode: string | null;
  couponInput: string;
  setCouponInput: (text: string) => void;
  couponFeedback: { text: string; type: 'success' | 'error' } | null;
  handleApplyCouponCode: (code: string) => void;
  handleRemoveCoupon: () => void;
}

export const CartCouponsSection = React.memo(function CartCouponsSection({
  activeCoupons,
  couponCode,
  couponInput,
  setCouponInput,
  couponFeedback,
  handleApplyCouponCode,
  handleRemoveCoupon,
}: CartCouponsSectionProps) {
  const displayedCoupons = React.useMemo(() => {
    if (Array.isArray(activeCoupons) && activeCoupons.length > 0) {
      return activeCoupons.map((c: any) => {
        const code = String(c.code || '').toUpperCase();
        const isPct = c.discountType === 'PERCENTAGE';
        const label =
          code === 'EXPRESS18'
            ? 'FREE EXPRESS'
            : isPct
            ? `${Math.round(Number(c.discountValue || 0))}% OFF`
            : `₹${Math.round(Number(c.discountValue || 0))} OFF`;
        const minText =
          Number(c.minOrderValue || 0) > 0
            ? ` on orders ₹${Math.round(Number(c.minOrderValue)).toLocaleString('en-IN')}+`
            : '';
        const capText =
          isPct && c.maxDiscount
            ? ` (up to ₹${Math.round(Number(c.maxDiscount))})`
            : '';
        const desc =
          code === 'EXPRESS18'
            ? 'Complimentary 19-minute express drop fee waiver (₹40 off)'
            : `${isPct ? `${Math.round(Number(c.discountValue))}% instant discount` : `Flat ₹${Math.round(Number(c.discountValue))} off`}${capText}${minText}`;
        return { code, label, desc };
      });
    }
    return AVAILABLE_COUPONS;
  }, [activeCoupons]);
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
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Tag size={16} color="#111111" />
          <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
            Coupons & Bank Offers
          </Text>
        </View>
        {couponCode && (
          <Pressable onPress={handleRemoveCoupon}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444' }}>REMOVE</Text>
          </Pressable>
        )}
      </View>

      {/* Coupon Code Input */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            height: 42,
            borderWidth: 1,
            borderColor: '#D9D9D5',
            borderRadius: 12,
            paddingHorizontal: 12,
            justifyContent: 'center',
            backgroundColor: '#FAF8F5',
          }}
        >
          <TextInput
            placeholder="Enter coupon code (e.g. AFFORDZ10)"
            placeholderTextColor="#A0A0A0"
            value={couponInput}
            onChangeText={setCouponInput}
            autoCapitalize="characters"
            style={{ fontSize: 12, fontWeight: '700', color: '#111111' }}
          />
        </View>
        <Pressable
          onPress={() => handleApplyCouponCode(couponInput)}
          style={({ pressed }) => ({
            backgroundColor: '#111111',
            borderRadius: 12,
            paddingHorizontal: 18,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '900', letterSpacing: 0.5 }}>
            APPLY
          </Text>
        </Pressable>
      </View>

      {/* Coupon Feedback */}
      {couponFeedback && (
        <View
          style={{
            marginBottom: 12,
            padding: 8,
            borderRadius: 8,
            backgroundColor: couponFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: couponFeedback.type === 'success' ? '#065F46' : '#991B1B',
            }}
          >
            {couponFeedback.text}
          </Text>
        </View>
      )}

      {/* Quick Available Coupon Chips */}
      <View style={{ gap: 8 }}>
        {displayedCoupons.map((cpn) => {
          const isCurrent = couponCode === cpn.code;
          return (
            <View
              key={cpn.code}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
                borderRadius: 12,
                backgroundColor: isCurrent ? '#ECFDF5' : '#FAF8F5',
                borderWidth: 1,
                borderColor: isCurrent ? '#A7F3D0' : '#E8E5DF',
              }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>{cpn.code}</Text>
                  <View style={{ backgroundColor: '#111111', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#FFFFFF' }}>{cpn.label}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2 }}>{cpn.desc}</Text>
              </View>
              <Pressable
                onPress={() => (isCurrent ? handleRemoveCoupon() : handleApplyCouponCode(cpn.code))}
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 11, fontWeight: '900', color: isCurrent ? '#059669' : '#111111' }}>
                  {isCurrent ? 'APPLIED' : 'APPLY'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
});
