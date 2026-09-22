import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TopHeader } from '@/components/top-header';
import { BottomNav } from '@/components/bottom-nav';
import { Icon } from '@/components/icon';

export default function SupportScreen() {
  return (
    <View className="flex-1 bg-surface relative">
      <TopHeader subtitle="Support" />

      <ScrollView
        className="flex-1 px-4 pt-4 pb-28"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text className="font-headline-lg-mobile text-[22px] text-on-surface font-extrabold tracking-tight">
            Customer Care
          </Text>
          <Text className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
            24/7 Doorstep fitting & instant refund assistance
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-xs mb-3">
          <View className="flex flex-row items-center gap-3 mb-2">
            <View className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
              <Icon name="support_agent" size={22} color="#b80035" />
            </View>
            <View className="flex-1">
              <Text className="font-title-md text-[15px] text-on-surface font-bold">
                Chat with Concierge
              </Text>
              <Text className="font-body-sm text-[12px] text-on-surface-variant">
                Average response time: &lt; 1 minute
              </Text>
            </View>
          </View>
          <TouchableOpacity className="mt-2 py-2 px-4 rounded-xl bg-primary text-white items-center">
            <Text className="text-white font-bold font-label-md text-[13px]">
              Start Instant Live Chat
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-xs">
          <Text className="font-title-md text-[14px] text-on-surface font-bold mb-2">
            Frequently Asked Questions
          </Text>
          <View className="py-2 border-b border-surface-container-high">
            <Text className="font-label-md text-[13px] text-on-surface font-bold">
              How does doorstep fitting try-on work?
            </Text>
            <Text className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              The delivery rider waits 10 minutes outside while you try on your items. Any items that don't fit are returned immediately with no hassle.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav cartCount={3} />
    </View>
  );
}
