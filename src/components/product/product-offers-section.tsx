import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Tag, Copy, Check } from 'lucide-react-native';
import { useCatalogStore } from '@/store/useCatalogStore';

interface ProductOffersSectionProps {
  copiedCoupon: string | null;
  onCopyCoupon: (code: string) => void;
}

export function ProductOffersSection({
  copiedCoupon,
  onCopyCoupon,
}: ProductOffersSectionProps) {
  const activeCoupons = useCatalogStore((s) => s.activeCoupons);
  const fetchCoupons = useCatalogStore((s) => s.fetchCoupons);

  useEffect(() => {
    if (activeCoupons.length === 0) {
      fetchCoupons().catch(() => {});
    }
  }, [activeCoupons.length, fetchCoupons]);

  if (!activeCoupons || activeCoupons.length === 0) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 14,
          borderWidth: 1,
          borderColor: '#E8E5DF',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Tag size={14} color="#FF5A1F" />
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
              Available Offers &amp; Promo Codes
            </Text>
          </View>
          <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#71717A' }}>
              {activeCoupons.length} ELIGIBLE
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {activeCoupons.map((offer: any) => {
            const code = String(offer.code || '');
            const isCopied = copiedCoupon === code;
            const title =
              offer.discountType === 'PERCENTAGE'
                ? `${offer.discountValue}% Off`
                : `Flat ₹${offer.discountValue} Off`;
            const descParts: string[] = [];
            if (offer.minOrderValue) descParts.push(`Min order ₹${offer.minOrderValue}`);
            if (offer.maxDiscount) descParts.push(`Up to ₹${offer.maxDiscount} off`);
            const desc = descParts.join(' • ') || 'Apply at checkout';
            return (
              <View
                key={offer.id || code}
                style={{
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  borderStyle: 'dashed',
                  borderRadius: 14,
                  padding: 10,
                  backgroundColor: '#FAF8F5',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                      {title}
                    </Text>
                    <View style={{ backgroundColor: '#FFF0EA', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4 }}>
                      <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#FF5A1F' }}>COUPON</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 10, color: '#71717A', lineHeight: 13 }}>
                    {desc}
                  </Text>
                </View>

                <Pressable
                  onPress={() => onCopyCoupon(code)}
                  style={{
                    backgroundColor: isCopied ? '#22C55E' : '#111111',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }}>COPIED</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={11} color="#FFFFFF" />
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }}>{code}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
