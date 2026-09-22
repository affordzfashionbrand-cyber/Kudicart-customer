import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Icon } from '@/components/icon';

interface BottomNavProps {
  cartCount?: number;
}

export function BottomNav({ cartCount = 3 }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isCatalog = pathname === '/' || pathname === '/index';
  const isOrders = pathname === '/orders' || pathname === '/tracking';
  const isCart = pathname === '/cart';
  const isSupport = pathname === '/support';

  const primaryColor = '#b80035';
  const variantColor = '#78716c';

  return (
    <View className="absolute bottom-0 left-0 right-0 w-full z-50 bg-white/95 border-t border-surface-container-high shadow-xl pb-1">
      <View className="flex flex-row items-center justify-around h-16 px-4">
        {/* Catalog Tab */}
        <TouchableOpacity
          onPress={() => router.push('/')}
          activeOpacity={0.7}
          className="flex flex-col items-center justify-center w-16 h-12"
        >
          <View
            className={`p-1.5 rounded-full ${
              isCatalog ? 'bg-primary-fixed/60' : 'bg-transparent'
            }`}
          >
            <Icon
              name="storefront"
              size={22}
              color={isCatalog ? primaryColor : variantColor}
            />
          </View>
          <Text
            className={`font-label-md text-[11px] tracking-tight mt-0.5 ${
              isCatalog ? 'text-primary font-extrabold' : 'text-on-surface-variant font-bold'
            }`}
          >
            Catalog
          </Text>
        </TouchableOpacity>

        {/* Orders Tab */}
        <TouchableOpacity
          onPress={() => router.push('/orders')}
          activeOpacity={0.7}
          className="flex flex-col items-center justify-center w-16 h-12"
        >
          <View
            className={`p-1.5 rounded-full ${
              isOrders ? 'bg-primary-fixed/60' : 'bg-transparent'
            }`}
          >
            <Icon
              name="receipt_long"
              size={22}
              color={isOrders ? primaryColor : variantColor}
            />
          </View>
          <Text
            className={`font-label-md text-[11px] tracking-tight mt-0.5 ${
              isOrders ? 'text-primary font-extrabold' : 'text-on-surface-variant font-bold'
            }`}
          >
            Orders
          </Text>
        </TouchableOpacity>

        {/* Cart Tab */}
        <TouchableOpacity
          onPress={() => router.push('/cart')}
          activeOpacity={0.7}
          className="relative flex flex-col items-center justify-center w-16 h-12"
        >
          <View
            className={`p-1.5 rounded-full relative ${
              isCart ? 'bg-primary-fixed/60' : 'bg-transparent'
            }`}
          >
            <Icon
              name="shopping_bag"
              size={22}
              color={isCart ? primaryColor : variantColor}
            />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded-full bg-primary text-white font-label-eyebrow text-[9px] leading-tight flex items-center justify-center min-w-[17px] shadow-sm">
                <Text className="text-white font-extrabold text-[9px] text-center">
                  {cartCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            className={`font-label-md text-[11px] tracking-tight mt-0.5 ${
              isCart ? 'text-primary font-extrabold' : 'text-on-surface-variant font-bold'
            }`}
          >
            Cart
          </Text>
        </TouchableOpacity>

        {/* Support Tab */}
        <TouchableOpacity
          onPress={() => router.push('/support')}
          activeOpacity={0.7}
          className="flex flex-col items-center justify-center w-16 h-12"
        >
          <View
            className={`p-1.5 rounded-full ${
              isSupport ? 'bg-primary-fixed/60' : 'bg-transparent'
            }`}
          >
            <Icon
              name="support_agent"
              size={22}
              color={isSupport ? primaryColor : variantColor}
            />
          </View>
          <Text
            className={`font-label-md text-[11px] tracking-tight mt-0.5 ${
              isSupport ? 'text-primary font-extrabold' : 'text-on-surface-variant font-bold'
            }`}
          >
            Support
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
