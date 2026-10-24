import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/icon';

export function ExpressTicker() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 45, seconds: 12 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <View style={{ backgroundColor: '#F4F1EA', borderColor: '#D9D9D5' }} className="my-2.5 p-3.5 rounded-2xl border flex flex-row items-center justify-between shadow-xs">
      <View className="flex flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center shadow-xs">
          <Icon name="bolt" size={20} color="#FFFFFF" />
        </View>

        <View>
          <View className="flex flex-row items-center gap-1.5">
            <Text style={{ color: '#111111' }} className="text-[10px] uppercase font-black tracking-wider">
              DROP_04 EXPRESS
            </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
          </View>
          <Text className="text-[14px] text-[#111111] font-black tracking-tight">
            35-Min Guaranteed Doorstep
          </Text>
        </View>
      </View>

      {/* Countdown Timer Badges */}
      <View className="flex flex-row items-center gap-1">
        <View className="px-2 py-1 rounded-lg bg-[#ffffff] border border-[#D9D9D5]">
          <Text className="text-[12px] text-[#111111] font-black">
            {formatNum(timeLeft.hours)}
          </Text>
        </View>
        <Text className="text-[12px] text-[#111111] font-bold">:</Text>
        <View className="px-2 py-1 rounded-lg bg-[#ffffff] border border-[#D9D9D5]">
          <Text className="text-[12px] text-[#111111] font-black">
            {formatNum(timeLeft.minutes)}
          </Text>
        </View>
        <Text className="text-[12px] text-[#111111] font-bold">:</Text>
        <View className="px-2 py-1 rounded-lg bg-[#111111]">
          <Text className="text-[12px] text-white font-black">
            {formatNum(timeLeft.seconds)}
          </Text>
        </View>
      </View>
    </View>
  );
}
