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
    <View className="my-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#ffdada] via-surface-container-low to-[#ffdada] border border-primary/20 flex flex-row items-center justify-between shadow-xs">
      <View className="flex flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs">
          <Icon name="bolt" size={20} color="#ffffff" />
        </View>

        <View>
          <View className="flex flex-row items-center gap-1">
            <Text className="font-label-eyebrow text-[10px] uppercase text-primary font-extrabold tracking-wider">
              FLASH EXPRESS DROP
            </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-primary" />
          </View>
          <Text className="font-headline-sm text-[14px] text-on-surface font-extrabold tracking-tight">
            35-Min Guaranteed Doorstep
          </Text>
        </View>
      </View>

      {/* Countdown Timer Badges */}
      <View className="flex flex-row items-center gap-1">
        <View className="px-2 py-1 rounded-lg bg-white border border-primary/20 shadow-2xs">
          <Text className="font-headline-sm text-[12px] text-primary font-extrabold">
            {formatNum(timeLeft.hours)}
          </Text>
        </View>
        <Text className="font-headline-sm text-[12px] text-primary font-extrabold">:</Text>
        <View className="px-2 py-1 rounded-lg bg-white border border-primary/20 shadow-2xs">
          <Text className="font-headline-sm text-[12px] text-primary font-extrabold">
            {formatNum(timeLeft.minutes)}
          </Text>
        </View>
        <Text className="font-headline-sm text-[12px] text-primary font-extrabold">:</Text>
        <View className="px-2 py-1 rounded-lg bg-primary shadow-2xs">
          <Text className="font-headline-sm text-[12px] text-white font-extrabold">
            {formatNum(timeLeft.seconds)}
          </Text>
        </View>
      </View>
    </View>
  );
}
