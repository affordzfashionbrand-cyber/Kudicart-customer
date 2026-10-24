import React from 'react';
import { View, Text } from 'react-native';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';
import { SectionTitle } from './section-title';
import { AnimatedPressable } from './animated-pressable';

export interface EmptyStateProps {
  title: string;
  body: string;
  action: string;
  onClick?: () => void;
}

export const EmptyState = React.memo(function EmptyState({
  title,
  body,
  action,
  onClick,
}: EmptyStateProps) {
  return (
    <View className="py-[60px] items-center justify-center">
      <View className="w-[80px] h-[80px] rounded-full bg-[#F4F1EA] border border-[#D9D9D5] justify-center items-center mb-[24px]">
        <ShoppingBag size={30} color="#111111" />
      </View>
      <SectionTitle
        label="EMPTY SELECTION"
        title={title}
        align="center"
        marginBottom={12}
      />
      <Text className="text-[14px] text-[#6B6667] mb-[32px]">{body}</Text>

      <AnimatedPressable
        className="flex-row items-center bg-[#111111] rounded-full pl-[24px] pr-[8px] py-[8px]"
        onPress={onClick}
      >
        <Text className="text-[11px] font-black text-white uppercase tracking-[0.15em] mr-[16px]">{action}</Text>
        <View className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center">
          <ArrowRight size={16} color="#111111" strokeWidth={2.5} />
        </View>
      </AnimatedPressable>
    </View>
  );
});
