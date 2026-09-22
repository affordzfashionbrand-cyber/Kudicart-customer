import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TopHeader } from '@/components/top-header';
import { BottomNav } from '@/components/bottom-nav';
import { Icon } from '@/components/icon';
import { AddressModal, Address, INITIAL_ADDRESSES } from '@/components/address-modal';

interface CartItem {
  id: string;
  brand: string;
  title: string;
  size: string;
  color: string;
  price: number;
  originalPrice: number;
  discountBadge: string;
  qty: number;
  image: string;
}

export default function CartScreen() {
  const router = useRouter();

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address>(INITIAL_ADDRESSES[0]);

  const [items, setItems] = useState<CartItem[]>([
    {
      id: 'item-1',
      brand: 'AURA STUDIO',
      title: 'Oversized Berry Heavyweight Hoodie',
      size: 'Size L',
      color: 'Crimson',
      price: 48,
      originalPrice: 68,
      discountBadge: '30% OFF',
      qty: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAekMLrVoAyuYOSjh6IMQJ56pPgkCCqfaNkRa5xe9VuQlTnZUt6jzaQDpDqqX1yFZyYDwrw2ODjQWG3KXwGcELLJ-qRfI0JD9j9cemk0YZBqX7R4iqkkIdVxfQloDlDpXJveigrZrnnigDaNJ1Lt9GBA7O7yX-UcXf85ipPHbChLwkEn8IgoXeN9Cavn29fLUUPoJBVS4zRlYEZDXOGbOh9nq30VJKMu0rgQCHXVPl-7TZXLcKQzfcyIw',
    },
    {
      id: 'item-2',
      brand: 'KUDI CORE',
      title: 'Tactile Relaxed Utility Trouser',
      size: '32W',
      color: 'Bone',
      price: 54,
      originalPrice: 72,
      discountBadge: '25% OFF',
      qty: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBTs6-ZqrlCWEJVbPDPREz0wpb5KSte4RfbM_CFWtYByj1Qc_k44_GCyF1iH4BGfJnWitJDsFkbG5QdTkr1lWbmeRjm4Sjw1-H24gH-93XY9maRVKsweEwf47isp-cXHwTuC01nyYYwhghENAssQln3RbbqPdr5ZU7vbKVIAZzaBN3nCBPzrEWX99MdjRBISiVH6LhmgYy1UufvPL6FavGOUabgo-pl4fxAqy5IIErLKuy3XyzrqnSLzg',
    },
    {
      id: 'item-3',
      brand: 'DAILY EDITIONS',
      title: 'Ribbed Merino Wool Knit Beanie',
      size: 'One Size',
      color: 'Rose Dust',
      price: 18,
      originalPrice: 24,
      discountBadge: 'SAVE $6',
      qty: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCDxj9qJ4rjOXEvz3V6zfl19DxQXEbbEWw_QYLO5CIyooXurrCEoz26n4Ap5-gXK2jOHfrqWTMVBprdXjwQhbIOn2RxUXpCI07pnEoVqzLSstv9c8rSmZQbB8oD1rzO-PeymawCnUIlxzVgXZZR2KmroE6OLT2MAKSAocBZyiOj37d4-WoHcSqU3SEVit5U_EZG0Y5TYqeRHYQ960WCk6-gJGgxel3HpjeP4FxQJBqDjC3NB2w76D_ymw',
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const totalSavings = items.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.qty,
    0
  );

  return (
    <View className="flex-1 bg-surface relative">
      <TopHeader subtitle="Cart" />

      <ScrollView
        className="flex-1 px-4 pt-3 pb-36"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Bar */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push('/')}
              activeOpacity={0.8}
              className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center"
            >
              <Icon name="arrow_back" size={20} color="#1b1b1e" />
            </TouchableOpacity>
            <View>
              <Text className="font-headline-lg-mobile text-[22px] text-on-surface font-extrabold tracking-tight">
                Your Cart
              </Text>
              <Text className="font-body-sm text-[12px] text-on-surface-variant">
                {items.length} {items.length === 1 ? 'item' : 'items'} ready for express drop
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/50">
            <Icon name="bolt" size={15} color="#b80035" />
            <Text className="font-label-eyebrow text-[10px] text-primary font-bold tracking-wider uppercase">
              15 Min Drop
            </Text>
          </View>
        </View>

        {/* Cart Items */}
        <View className="flex flex-col gap-3 mb-4">
          {items.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center justify-center my-4 shadow-xs">
              <Icon name="shopping_bag" size={48} color="#e11d48" className="mb-2" />
              <Text className="font-title-md text-[16px] text-on-surface font-bold">
                Your cart is empty
              </Text>
              <Text className="font-body-sm text-[12px] text-on-surface-variant mt-1 text-center">
                Explore our curated catalog to add beautiful apparel.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/')}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-label-md text-[13px] font-bold"
              >
                <Text className="text-white font-bold">Explore Catalog</Text>
              </TouchableOpacity>
            </View>
          ) : (
            items.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-2xl p-3.5 shadow-xs flex flex-row gap-3"
              >
                {/* Image */}
                <View className="w-20 h-24 rounded-xl overflow-hidden bg-surface-container-low">
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full object-cover"
                  />
                </View>

                {/* Details */}
                <View className="flex-1 flex flex-col justify-between">
                  <View>
                    <View className="flex flex-row items-center justify-between">
                      <Text className="font-label-eyebrow text-[10px] uppercase text-primary font-bold tracking-wider">
                        {item.brand}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeItem(item.id)}
                        activeOpacity={0.7}
                        className="p-0.5"
                      >
                        <Icon name="delete" size={18} color="#906f70" />
                      </TouchableOpacity>
                    </View>

                    <Text
                      numberOfLines={1}
                      className="font-title-md text-[14px] text-on-surface font-bold mt-0.5"
                    >
                      {item.title}
                    </Text>

                    <View className="flex flex-row items-center gap-1.5 mt-1">
                      <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
                        <Text className="font-label-md text-[10px] text-on-surface font-bold">
                          {item.size}
                        </Text>
                      </View>
                      <View className="px-2 py-0.5 rounded-full bg-primary-fixed/40">
                        <Text className="font-label-md text-[10px] text-primary font-bold">
                          {item.color}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Pricing & Quantity */}
                  <View className="flex flex-row items-end justify-between mt-2">
                    <View className="flex flex-row items-baseline gap-1">
                      <Text className="font-headline-sm text-[15px] text-on-surface font-extrabold">
                        ${(item.price * item.qty).toFixed(2)}
                      </Text>
                      <Text className="font-body-sm text-[11px] text-on-surface-variant line-through">
                        ${(item.originalPrice * item.qty).toFixed(2)}
                      </Text>
                      <View className="px-1.5 py-0.2 rounded-full bg-primary-fixed ml-1">
                        <Text className="font-label-eyebrow text-[9px] text-primary font-bold">
                          {item.discountBadge}
                        </Text>
                      </View>
                    </View>

                    {/* Quantity controls */}
                    <View className="flex flex-row items-center bg-surface-container-low rounded-xl px-1.5 py-1 gap-2">
                      <TouchableOpacity
                        onPress={() => updateQty(item.id, -1)}
                        activeOpacity={0.8}
                        className="w-5 h-5 rounded-lg bg-white flex items-center justify-center shadow-xs"
                      >
                        <Icon name="remove" size={13} color="#1b1b1e" />
                      </TouchableOpacity>

                      <Text className="font-label-lg text-[13px] text-on-surface font-bold px-1">
                        {item.qty}
                      </Text>

                      <TouchableOpacity
                        onPress={() => updateQty(item.id, 1)}
                        activeOpacity={0.8}
                        className="w-5 h-5 rounded-lg bg-white flex items-center justify-center shadow-xs"
                      >
                        <Icon name="add" size={13} color="#1b1b1e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Delivery Location Section */}
        <View className="bg-white rounded-2xl p-4 shadow-xs mb-3">
          <View className="flex flex-row items-center justify-between mb-3">
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center">
                <Icon name="location_on" size={18} color="#b80035" />
              </View>
              <Text className="font-title-md text-[15px] text-on-surface font-bold">
                Delivery Location
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
              <Text className="font-label-eyebrow text-[10px] text-on-surface font-bold uppercase">
                {currentAddress.tag}
              </Text>
            </View>
          </View>

          <View className="p-3 rounded-xl bg-surface-container-low">
            <View className="flex flex-row items-center justify-between mb-1">
              <View className="flex flex-row items-center gap-2">
                <Text className="font-label-lg text-[14px] text-on-surface font-bold">
                  {currentAddress.name}
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-primary-container">
                  <Text className="font-label-eyebrow text-[9px] text-white font-bold uppercase">
                    DELIVER HERE
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsAddressModalOpen(true)}>
                <Text className="font-label-md text-[12px] text-primary font-bold">
                  Change
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              {currentAddress.addressLine}
            </Text>
            <Text className="font-body-sm text-[11px] text-on-surface-variant/80">
              {currentAddress.cityPin}
            </Text>

            <View className="flex flex-row items-center gap-3 mt-2 pt-2 border-t border-surface-container-high">
              <View className="flex flex-row items-center gap-1">
                <Icon name="person" size={14} color="#5c3f40" />
                <Text className="font-body-sm text-[11px] text-on-surface font-bold">
                  {currentAddress.recipient}
                </Text>
              </View>
              <View className="flex flex-row items-center gap-1">
                <Icon name="call" size={14} color="#5c3f40" />
                <Text className="font-body-sm text-[11px] text-on-surface-variant">
                  {currentAddress.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View className="bg-white rounded-2xl p-4 shadow-xs mb-3">
          <View className="flex flex-row items-center justify-between mb-3">
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center">
                <Icon name="payments" size={18} color="#b80035" />
              </View>
              <Text className="font-title-md text-[15px] text-on-surface font-bold">
                Payment Method
              </Text>
            </View>
            <View className="flex flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-green-100">
              <Icon name="lock" size={12} color="#15803d" />
              <Text className="font-label-eyebrow text-[9px] text-green-700 font-bold">
                256-Bit Encrypted
              </Text>
            </View>
          </View>

          {/* Option 1: Online Payment */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('online')}
            activeOpacity={0.9}
            className={`p-3 rounded-xl mb-2 flex flex-col ${
              paymentMethod === 'online'
                ? 'bg-primary-fixed/20 border-2 border-primary'
                : 'bg-surface-container-low border border-transparent'
            }`}
          >
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-2">
                <View
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'online'
                      ? 'border-primary bg-primary'
                      : 'border-on-surface-variant/40'
                  }`}
                >
                  {paymentMethod === 'online' && (
                    <View className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </View>
                <Text className="font-label-lg text-[14px] text-on-surface font-bold">
                  Online Payment
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-secondary-fixed">
                <Text className="font-label-eyebrow text-[9px] text-primary font-bold">
                  Razorpay SDK
                </Text>
              </View>
            </View>

            <Text className="font-body-sm text-[11px] text-on-surface-variant ml-6 mt-1">
              UPI (GPay / PhonePe / Paytm), Debit/Credit Cards & NetBanking
            </Text>

            <View className="flex flex-row items-center gap-2 ml-6 mt-2">
              <View className="px-2 py-0.5 rounded-md bg-white border border-surface-container-high">
                <Text className="font-label-eyebrow text-[9px] text-on-surface font-bold">
                  UPI FAST
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-md bg-white border border-surface-container-high">
                <Text className="font-label-eyebrow text-[9px] text-on-surface font-bold">
                  VISA / MASTERCARD
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-md bg-white border border-surface-container-high">
                <Text className="font-label-eyebrow text-[9px] text-primary font-bold">
                  INSTANT CASHBACK
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Option 2: Cash on Delivery */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.9}
            className={`p-3 rounded-xl flex flex-col ${
              paymentMethod === 'cod'
                ? 'bg-primary-fixed/20 border-2 border-primary'
                : 'bg-surface-container-low border border-transparent'
            }`}
          >
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-2">
                <View
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary'
                      : 'border-on-surface-variant/40'
                  }`}
                >
                  {paymentMethod === 'cod' && (
                    <View className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </View>
                <Text className="font-label-lg text-[14px] text-on-surface font-bold">
                  Cash on Delivery
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
                <Text className="font-label-eyebrow text-[9px] text-on-surface font-bold">
                  Pay at Door
                </Text>
              </View>
            </View>

            <Text className="font-body-sm text-[11px] text-on-surface-variant ml-6 mt-1">
              Doorstep cash handover or instant UPI QR scan upon courier arrival
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bill Summary Section */}
        <View className="bg-white rounded-2xl p-4 shadow-xs mb-4">
          <View className="flex flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center">
              <Icon name="receipt" size={18} color="#b80035" />
            </View>
            <Text className="font-title-md text-[15px] text-on-surface font-bold">
              Bill Summary
            </Text>
          </View>

          <View className="flex flex-col gap-2 border-b border-surface-container-high pb-3">
            <View className="flex flex-row items-center justify-between">
              <Text className="font-body-sm text-[13px] text-on-surface-variant">
                Cart Subtotal
              </Text>
              <Text className="font-label-lg text-[13px] text-on-surface font-bold">
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-1">
                <Text className="font-body-sm text-[13px] text-on-surface-variant">
                  Delivery Fee
                </Text>
                <Icon name="info" size={14} color="#5c3f40" />
              </View>
              <View className="flex flex-row items-center gap-1.5">
                <Text className="font-body-sm text-[11px] text-on-surface-variant line-through">
                  $4.99
                </Text>
                <Text className="font-label-lg text-[13px] text-green-700 font-bold">
                  FREE
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="font-body-sm text-[13px] text-on-surface-variant">
                Taxes & GST (5%)
              </Text>
              <Text className="font-label-lg text-[13px] text-on-surface font-bold">
                ${tax.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between pt-3">
            <View>
              <Text className="font-title-md text-[15px] text-on-surface font-bold">
                Total Payable
              </Text>
              <Text className="font-label-eyebrow text-[9px] text-primary font-bold uppercase tracking-wider">
                INCLUSIVE OF ALL LOCAL TAXES
              </Text>
            </View>

            <Text className="font-headline-sm text-[20px] text-primary font-extrabold">
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      {items.length > 0 && (
        <View className="absolute bottom-16 left-0 right-0 w-full bg-white/95 border-t border-surface-container-high px-4 py-3 flex flex-row items-center justify-between shadow-xl z-40">
          <View>
            <Text className="font-label-eyebrow text-[10px] text-on-surface-variant font-bold uppercase">
              GRAND TOTAL
            </Text>
            <View className="flex flex-row items-baseline gap-1.5">
              <Text className="font-headline-sm text-[20px] text-on-surface font-extrabold">
                ${total.toFixed(2)}
              </Text>
              {totalSavings > 0 && (
                <View className="px-2 py-0.5 rounded-full bg-secondary-fixed">
                  <Text className="font-label-eyebrow text-[9px] text-primary font-bold">
                    SAVED ${totalSavings}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Order Confirmed!',
                `Thank you for shopping with KudiCart! Your 15-minute express delivery to ${currentAddress.name} is on its way.`,
                [{ text: 'OK', onPress: () => router.push('/') }]
              )
            }
            activeOpacity={0.9}
            className="py-3 px-5 rounded-2xl bg-primary flex flex-row items-center gap-2 shadow-md"
          >
            <Text className="text-white font-label-lg text-[14px] font-bold">
              Proceed to Pay
            </Text>
            <Icon name="arrow_forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Shared Bottom Navigation Tab Bar */}
      <BottomNav cartCount={items.length} />

      {/* Address Selection Modal */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={currentAddress.id}
        onSelectAddress={(selected: Address) => setCurrentAddress(selected)}
      />
    </View>
  );
}
