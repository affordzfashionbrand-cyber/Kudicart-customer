import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Trash2,
  ShieldCheck,
  Zap,
  RotateCcw,
  CreditCard,
  Plus,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { EmptyState } from '@/components/common/empty-state';
import { useCartStore, LocalCartItem } from '@/store/useCartStore';
import { useAddressStore } from '@/store/useAddressStore';
import { AddressModal } from '@/components/address-modal';
import { formatPrice } from '@/data/homeData';
import { CartTopDeals } from '@/components/cart/cart-top-deals';

import {
  BagProductItem,
  VAULT_EXCLUSIVE_DEALS,
  ENSEMBLE_ADDONS,
  PROMO_CODES,
} from '@/components/bag/bag-data';
import { BagItemCard } from '@/components/bag/bag-item-card';
import { BagBillSummary } from '@/components/bag/bag-bill-summary';

export { BagProductItem };

interface BagViewProps {
  products?: BagProductItem[];
  onShop: () => void;
  onPayNow: () => void;
  onOpenProduct?: (productId: string | number) => void;
  onBack?: () => void;
}

export const BagView = React.memo(function BagView({
  products: dummyProducts,
  onShop,
  onPayNow,
  onOpenProduct,
  onBack,
}: BagViewProps) {
  const insets = useSafeAreaInsets();
  const {
    items,
    itemTotal,
    deliveryFee: storeDeliveryFee,
    taxes: storeTaxes,
    discountAmount: storeDiscountAmount,
    couponCode: storeCouponCode,
    grandTotal: storeGrandTotal,
    updateQuantity,
    removeItem,
    toggleWishlist,
    wishlist,
    addItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const { addresses, selectedAddressId, setSelectedAddressId } = useAddressStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  // Selected item IDs for checkout
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      initial[item.id] = true;
    });
    return initial;
  });

  const toggleSelectItem = useCallback((id: string) => {
    setSelectedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const selectAll = useCallback(() => {
    const allSelected = items.every((i) => selectedItemIds[i.id]);
    const next: Record<string, boolean> = {};
    items.forEach((i) => {
      next[i.id] = !allSelected;
    });
    setSelectedItemIds(next);
  }, [items, selectedItemIds]);

  const removeSelected = useCallback(() => {
    items.forEach((i) => {
      if (selectedItemIds[i.id]) removeItem(i.id);
    });
  }, [items, selectedItemIds, removeItem]);

  // Promo code & add-ons state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(storeCouponCode);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);

  // Financial calculations
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedItemIds[item.id] !== false);
  }, [items, selectedItemIds]);

  const totalMrp = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const orig = item.originalPrice && item.originalPrice > item.price
        ? item.originalPrice
        : Math.round(item.price * 1.35);
      return acc + orig * item.quantity;
    }, 0);
  }, [selectedItems]);

  const totalSellingPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedItems]);

  const totalBagDiscount = Math.max(0, totalMrp - totalSellingPrice);
  const couponDiscount = storeDiscountAmount;
  const deliveryFee = storeDeliveryFee;
  const taxes = storeTaxes;
  const giftWrapFee = giftWrap ? 35 : 0;
  const grandTotal = Math.max(
    0,
    storeGrandTotal + giftWrapFee + donationAmount,
  );
  const overallSavings = totalBagDiscount + couponDiscount;

  const handleApplyPromo = useCallback(async () => {
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;
    const res = await applyCoupon(clean);
    if (res.success) {
      setAppliedPromo(clean);
      setPromoError(null);
    } else {
      setPromoError(res.message);
    }
  }, [promoCode, applyCoupon]);

  const handleRemovePromo = useCallback(async () => {
    await removeCoupon();
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
  }, [removeCoupon]);

  const handleAddVaultDeal = useCallback((deal: typeof VAULT_EXCLUSIVE_DEALS[0]) => {
    addItem(
      {
        id: deal.productId,
        brand: deal.brand,
        title: deal.title,
        description: '',
        price: deal.price,
        originalPrice: deal.originalPrice,
        discount: deal.discountBadge,
        rating: 4.9,
        reviewsCount: 140,
        stockQuantity: 5,
        readyToShip: true,
        sizes: ['One Size'],
        image: deal.image,
        altText: deal.title,
        galleryImages: [deal.image],
        category: deal.category,
      },
      'One Size',
      'Default',
      1
    );
  }, [addItem]);

  const handleBack = onBack || onShop;

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
        {/* Top Header Bar with Back Button */}
        <View
          style={{
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: 12,
            paddingHorizontal: 16,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E8E5DF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E5E0D8',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} color="#111111" />
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9.5, fontWeight: '800', letterSpacing: 1.4, color: '#888888', textTransform: 'uppercase' }}>
              CURATED CAPSULE
            </Text>
            <EditorialText
              first="Shopping"
              second="bag."
              fontSize={18}
              lineHeight={21}
              singleLine
              withDot
            />
          </View>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          <EmptyState
            title="YOUR BAG IS EMPTY"
            body="Your curated atelier capsule awaits. Discover exclusive garments with instant 18-minute doorstep try & buy."
            action="EXPLORE ATELIER"
            onClick={onShop}
          />
          <View style={{ paddingHorizontal: 16 }}>
            <CartTopDeals
              onAddToCart={(deal) => {
                const productPayload: any = {
                  id: deal.id,
                  brand: deal.brand,
                  title: deal.title,
                  price: deal.price,
                  originalPrice: deal.originalPrice,
                  discount: deal.discountBadge,
                  rating: deal.rating,
                  reviewsCount: deal.reviewsCount,
                  stockQuantity: 15,
                  readyToShip: true,
                  sizes: deal.sizes,
                  image: deal.image,
                  altText: deal.title,
                  galleryImages: [deal.image],
                  category: deal.category,
                  tryAndBuyEligible: true,
                };
                addItem(productPayload, deal.sizes[0] || 'M');
              }}
              onOpenProduct={(id) => onOpenProduct && onOpenProduct(id)}
              cartProductIds={items.map((i) => i.productId)}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              title="Top Deals Curated For You"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const isAllSelected = items.length > 0 && items.every((i) => selectedItemIds[i.id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
      {/* Top Header Bar with Back Button & Item Count */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E0D8',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} color="#111111" />
        </Pressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9.5, fontWeight: '800', letterSpacing: 1.4, color: '#888888', textTransform: 'uppercase' }}>
            DOORSTEP TRIAL & BUY
          </Text>
          <EditorialText
            first="Shopping"
            second="bag."
            fontSize={18}
            lineHeight={21}
            singleLine
            withDot
          />
        </View>

        <View style={{ width: 38, alignItems: 'flex-end' }}>
          <View style={{ backgroundColor: '#111111', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FFFFFF' }}>{items.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS !== 'web'}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 1. Header with Selected Delivery Address Bar */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E8E5DF',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Pressable
            onPress={() => setIsAddressModalOpen(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F7F5F0',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: '#E2DFD8',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <MapPin size={15} color="#FF5A1F" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }} numberOfLines={1}>
                  Deliver to: <Text style={{ fontWeight: '900' }}>{selectedAddress?.label || 'Selected Atelier'}</Text>, {selectedAddress?.pincode || '560038'}
                </Text>
                <Text style={{ fontSize: 9.5, color: '#8A8580' }} numberOfLines={1}>
                  {selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : '100ft Road, Indiranagar'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#FF5A1F' }}>CHANGE</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          {/* 2. Free Delivery Countdown Banner */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E8E5DF',
              padding: 12,
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Zap size={14} color="#FF5A1F" fill="#FF5A1F" />
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>
                  {totalSellingPrice >= 999
                    ? 'CONGRATS! FREE 18-MIN EXPRESS DELIVERY UNLOCKED'
                    : `ADD ₹${999 - totalSellingPrice} MORE FOR FREE 18-MIN DELIVERY`}
                </Text>
              </View>
            </View>

            <View style={{ width: '100%', height: 5, borderRadius: 3, backgroundColor: '#F0ECE4', overflow: 'hidden' }}>
              <View
                style={{
                  width: `${Math.min(100, (totalSellingPrice / 999) * 100)}%`,
                  height: '100%',
                  backgroundColor: totalSellingPrice >= 999 ? '#10B981' : '#FF5A1F',
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          {/* 3. Items Selection Header Strip */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              paddingHorizontal: 2,
            }}
          >
            <Pressable onPress={selectAll} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  backgroundColor: isAllSelected ? '#111111' : '#F7F5F0',
                  borderWidth: 1.5,
                  borderColor: isAllSelected ? '#111111' : '#C8C4BC',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isAllSelected && <View style={{ width: 8, height: 8, backgroundColor: '#FFFFFF', borderRadius: 2 }} />}
              </View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }}>
                {selectedItems.length}/{items.length} ITEMS SELECTED
              </Text>
            </Pressable>

            {selectedItems.length > 0 && (
              <Pressable onPress={removeSelected} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Trash2 size={12} color="#A0A0A0" />
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#8A8580' }}>REMOVE SELECTED</Text>
              </Pressable>
            )}
          </View>

          {/* 4. Cart Product Items */}
          {items.map((item) => (
            <BagItemCard
              key={item.id}
              item={item}
              isSelected={selectedItemIds[item.id] !== false}
              isWished={wishlist.includes(String(item.productId))}
              onToggleSelect={toggleSelectItem}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onToggleWishlist={(productId) => toggleWishlist(String(productId))}
              onOpenProduct={onOpenProduct}
            />
          ))}

          {/* 5. Special Vault Member Unlocked Deals */}
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FF5A1F', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  MEMBERSHIP PRIVILEGE
                </Text>
                <EditorialText first="Unlocked Vault" second="drops." fontSize={18} lineHeight={22} singleLine withDot />
              </View>
              <View style={{ backgroundColor: 'rgba(255, 90, 31, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FF5A1F' }}>1 PER ORDER</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              overScrollMode="never"
              contentContainerStyle={{ gap: 10 }}
            >
              {VAULT_EXCLUSIVE_DEALS.map((deal) => (
                <View
                  key={deal.id}
                  style={{
                    width: 210,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    padding: 10,
                  }}
                >
                  <View style={{ position: 'relative', width: '100%', height: 110, borderRadius: 12, overflow: 'hidden' }}>
                    <Image source={{ uri: deal.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: '#FF5A1F',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#FFFFFF' }}>{deal.discountBadge}</Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 9, fontWeight: '900', color: '#8A8580', textTransform: 'uppercase', marginTop: 8 }}>
                    {deal.brand}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11.5, fontWeight: '800', color: '#111111', marginTop: 1 }}>
                    {deal.title}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>{formatPrice(deal.price)}</Text>
                      <Text style={{ fontSize: 10, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
                        {formatPrice(deal.originalPrice)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleAddVaultDeal(deal)}
                      style={{
                        backgroundColor: '#111111',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Plus size={10} color="#FFFFFF" strokeWidth={3} />
                      <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF' }}>ADD</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 6. Complete Price Breakdown */}
          <BagBillSummary
            totalMrp={totalMrp}
            totalBagDiscount={totalBagDiscount}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            appliedPromo={appliedPromo}
            couponDiscount={couponDiscount}
            promoError={promoError}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            giftWrap={giftWrap}
            setGiftWrap={setGiftWrap}
            donationAmount={donationAmount}
            setDonationAmount={setDonationAmount}
            deliveryFee={deliveryFee}
            taxes={taxes}
            grandTotal={grandTotal}
            overallSavings={overallSavings}
          />

          {/* 7. Affordz Trust Pillars */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              paddingVertical: 14,
              borderTopWidth: 1,
              borderTopColor: '#E8E5DF',
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={18} color="#111111" />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#666666' }}>100% Authentic</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Zap size={18} color="#FF5A1F" />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#666666' }}>18-Min Drop</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <RotateCcw size={18} color="#111111" />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#666666' }}>Try & Buy</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <CreditCard size={18} color="#111111" />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#666666' }}>Secure Pay</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 8. Static Docked Bottom Checkout Bar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E5DF',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 24) : 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>
            {selectedItems.length} {selectedItems.length === 1 ? 'ITEM' : 'ITEMS'} SELECTED
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111' }}>
              {formatPrice(grandTotal)}
            </Text>
            {overallSavings > 0 && (
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981' }}>
                Save {formatPrice(overallSavings)}
              </Text>
            )}
          </View>
        </View>

        <AnimatedPressable
          onPress={onPayNow}
          style={{
            backgroundColor: '#111111',
            borderRadius: 24,
            paddingVertical: 12,
            paddingHorizontal: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            PLACE ORDER
          </Text>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: '#FF5A1F',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </AnimatedPressable>
      </View>

      {/* Address Selection Modal */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => setSelectedAddressId(addr.id)}
      />
    </View>
  );
});
