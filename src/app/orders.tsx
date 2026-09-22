import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TopHeader } from '@/components/top-header';
import { BottomNav } from '@/components/bottom-nav';
import { Icon } from '@/components/icon';

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface relative">
      <TopHeader subtitle="Orders" />

      <ScrollView
        className="flex-1 px-4 pt-4 pb-28"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row items-center justify-between mb-4">
          <View>
            <Text className="font-headline-lg-mobile text-[22px] text-on-surface font-extrabold tracking-tight">
              Your Orders
            </Text>
            <Text className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
              Track active deliveries & order history
            </Text>
          </View>
        </View>

        {/* Active Order Card */}
        <View className="bg-white rounded-2xl p-4 shadow-xs mb-4">
          <View className="flex flex-row items-center justify-between mb-2">
            <View className="flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed">
              <Icon name="local_shipping" size={14} color="#b80035" />
              <Text className="font-label-eyebrow text-[10px] text-primary font-bold uppercase">
                Out for Delivery (12 mins)
              </Text>
            </View>
            <Text className="font-label-eyebrow text-[11px] text-on-surface-variant font-bold">
              #KUDI-88421
            </Text>
          </View>

          <Text className="font-title-md text-[15px] text-on-surface font-bold">
            Embroidered Anarkali Kurta Set + 2 items
          </Text>
          <Text className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
            Express 15-Min Drop to Indiranagar, Blr
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/')}
            className="mt-3 py-2 px-3 rounded-xl bg-surface-container-low flex flex-row items-center justify-between"
          >
            <Text className="font-label-md text-[12px] text-primary font-bold">
              Track Live Rider Location
            </Text>
            <Icon name="arrow_forward" size={16} color="#b80035" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav cartCount={3} />
    </View>
  );
}
