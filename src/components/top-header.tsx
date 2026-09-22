import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Icon } from '@/components/icon';

interface TopHeaderProps {
  subtitle?: string;
}

export function TopHeader({ subtitle = 'Catalog' }: TopHeaderProps) {
  return (
    <View className="w-full z-50 bg-white/95 border-b border-surface-container-high shadow-xs">
      <View className="h-16 px-4 flex flex-row items-center justify-between">
        {/* Brand Logo & Badge */}
        <View className="flex flex-row items-center gap-1.5">
          <Text className="font-headline-sm text-headline-sm text-primary tracking-tight font-extrabold text-[22px]">
            Shoppe<Text className="text-on-surface font-extrabold">.</Text>
          </Text>
          <View className="flex flex-row items-center gap-1 ml-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/70 border border-primary/20">
            <View className="w-1.5 h-1.5 rounded-full bg-primary" />
            <Text className="font-label-eyebrow text-[10px] text-primary font-extrabold tracking-wider uppercase">
              KudiCart
            </Text>
          </View>
        </View>

        {/* Action Controls: Notifications & Profile */}
        <View className="flex flex-row items-center gap-2.5">
          {/* Notification Bell */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Notifications',
                'You have 2 new notifications:\n1. Your express order #KUDI-88421 is 12 mins away.\n2. Handloom Silk Edit is now 50% OFF!'
              )
            }
            activeOpacity={0.8}
            className="relative w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center"
          >
            <Icon name="notifications" size={20} color="#1b1b1e" />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </TouchableOpacity>

          {/* Profile Avatar */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 shadow-sm"
          >
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida/AEtjO1VWtKT1o8SeNnSo4l3FyyDwDHs_2VrqMmxcyY66IrRg9rL8LkbbnuL2TffL_CyEaqzkwfMMb8tXKb4wQTNtgTrqXO9l2Yi8Pq4du2CXnP7lmY5vWpGHBTWfweA4JAHjIOXuFa59STYjuuXipREO_RT3mGzoprfKCWe-WrMubapxuDZ2B7UA-MwnQfHcf1AtMn-UkuyrLssuYf_YUriU8q2jFN8qIrperLt43xS0h1vE3Hgb0dCyrts8bMA',
              }}
              className="w-full h-full object-cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
