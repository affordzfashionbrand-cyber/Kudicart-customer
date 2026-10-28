import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/icon';
import { NotificationModal } from '@/components/notification-modal';

interface TopHeaderProps {
  subtitle?: string;
  onProfilePress?: () => void;
}

export function TopHeader({ subtitle = 'Catalog', onProfilePress }: TopHeaderProps) {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  return (
    <View className="w-full z-50 bg-[#FAF8F5] border-b border-[#E8E5DF] shadow-xs">
      <View className="h-16 px-4 flex flex-row items-center justify-between">
        {/* Brand Logo & Badge */}
        <View className="flex flex-row items-center gap-2">
          <Image
            source={require('@/assets/images/logo-removebg-preview.png')}
            style={{ width: 34, height: 34 }}
            contentFit="contain"
            transition={150}
          />
          <View className="flex flex-row items-baseline">
            <Text className="font-extrabold text-[#111111] tracking-tight text-[19px]">
              AFFORDZ<Text className="text-[#FF5A1F] font-black">.</Text>
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-[#111111]">
            <View className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
            <Text className="text-[8.5px] text-white font-extrabold tracking-wider uppercase">
              NOW DROP
            </Text>
          </View>
        </View>

        {/* Action Controls: Notifications & Profile */}
        <View className="flex flex-row items-center gap-2.5">
          {/* Notification Bell */}
          <TouchableOpacity
            onPress={() => setIsNotificationModalOpen(true)}
            activeOpacity={0.8}
            className="relative w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#D9D9D5] flex items-center justify-center"
          >
            <Icon name="notifications" size={20} color="#111111" />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5A1F]" />
          </TouchableOpacity>

          {/* Profile Avatar */}
          <TouchableOpacity
            onPress={onProfilePress}
            activeOpacity={0.8}
            className="w-9 h-9 rounded-full overflow-hidden border border-[#D9D9D5] shadow-sm"
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
            />
          </TouchableOpacity>
        </View>
      </View>

      <NotificationModal
        visible={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </View>
  );
}
