import React from 'react';
import { View, Text } from 'react-native';
import { ChevronRight, LogOut } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';

interface AccountViewProps {
  user: any;
  onOrders: () => void;
  onAddresses: () => void;
  onTracking: () => void;
  onSupport: () => void;
  onAuth: () => void;
  onLogout?: () => void;
}

export const AccountView = React.memo(function AccountView({
  user,
  onOrders,
  onAddresses,
  onTracking,
  onSupport,
  onAuth,
  onLogout,
}: AccountViewProps) {
  const accountOptions = [
    { title: 'My orders', action: onOrders },
    { title: 'Live tracking', action: onTracking },
    { title: 'My addresses', action: onAddresses },
    { title: 'Client Concierge & Support', action: onSupport },
    { title: 'Login / Switch Account', action: onAuth },
  ];

  return (
    <View className="px-5 py-[40px]">
      <SectionTitle
        label="CLIENT PROFILE"
        firstLine="My"
        secondLine="account."
        marginBottom={28}
      />

      <View className="p-[4px] bg-[#F4F1EA] border border-[#D9D9D5] rounded-[32px]">
        <View className="bg-white rounded-[28px] p-[24px]">
          <View className="flex-row gap-[20px] items-center pb-[30px] border-b border-[#D9D9D5]">
            <View className="w-[72px] h-[72px] rounded-full bg-[#111111] justify-center items-center">
              <Text className="text-[20px] font-bold text-white">
                {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'AS'}
              </Text>
            </View>
            <View>
              <Text className="text-[20px] font-black tracking-tight text-[#111111] mb-[4px]">{user?.name || 'Ananya Sharma'}</Text>
              <Text className="text-[13px] text-[#6B6667]">{user?.phone || '+91 98450 12890'}</Text>
            </View>
          </View>

          <View className="pt-[16px]">
            {accountOptions.map((item) => (
              <AnimatedPressable key={item.title} className="flex-row justify-between items-center py-[22px]" onPress={item.action}>
                <Text className="text-[15px] font-bold text-[#111111]">{item.title}</Text>
                <View className="w-[32px] h-[32px] rounded-full bg-[#F4F1EA] border border-[#D9D9D5] items-center justify-center">
                  <ChevronRight size={16} color="#111111" />
                </View>
              </AnimatedPressable>
            ))}

            {onLogout && user && (
              <AnimatedPressable
                className="flex-row justify-between items-center py-[22px] border-t border-[#F0ECE1]"
                onPress={onLogout}
              >
                <Text className="text-[15px] font-bold text-[#DC2626]">Sign Out</Text>
                <View className="w-[32px] h-[32px] rounded-full bg-[#FEF2F2] border border-[#FCA5A5] items-center justify-center">
                  <LogOut size={15} color="#DC2626" />
                </View>
              </AnimatedPressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});
