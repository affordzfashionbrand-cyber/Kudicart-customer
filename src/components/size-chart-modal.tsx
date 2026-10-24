import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon } from '@/components/icon';

interface SizeChartModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SizeChartModal({ visible, onClose }: SizeChartModalProps) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  const chart = [
    {
      size: 'S',
      bust: unit === 'in' ? '36 in' : '91 cm',
      waist: unit === 'in' ? '32 in' : '81 cm',
      hip: unit === 'in' ? '38 in' : '96 cm',
      length: unit === 'in' ? '46 in' : '117 cm',
    },
    {
      size: 'M',
      bust: unit === 'in' ? '38 in' : '96 cm',
      waist: unit === 'in' ? '34 in' : '86 cm',
      hip: unit === 'in' ? '40 in' : '101 cm',
      length: unit === 'in' ? '46 in' : '117 cm',
    },
    {
      size: 'L',
      bust: unit === 'in' ? '40 in' : '101 cm',
      waist: unit === 'in' ? '36 in' : '91 cm',
      hip: unit === 'in' ? '42 in' : '106 cm',
      length: unit === 'in' ? '47 in' : '119 cm',
    },
    {
      size: 'XL',
      bust: unit === 'in' ? '42 in' : '106 cm',
      waist: unit === 'in' ? '38 in' : '96 cm',
      hip: unit === 'in' ? '44 in' : '112 cm',
      length: unit === 'in' ? '47 in' : '119 cm',
    },
    {
      size: 'XXL',
      bust: unit === 'in' ? '44 in' : '112 cm',
      waist: unit === 'in' ? '40 in' : '101 cm',
      hip: unit === 'in' ? '46 in' : '117 cm',
      length: unit === 'in' ? '48 in' : '122 cm',
    },
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 items-center justify-center p-4">
        <View style={{ backgroundColor: '#F7F7F5' }} className="rounded-3xl w-full max-w-md p-5 border border-[#D9D9D5] shadow-xl">
          {/* Header */}
          <View className="flex flex-row items-center justify-between pb-3 border-b border-[#D9D9D5]">
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-[#F4F1EA] border border-[#D9D9D5] flex items-center justify-center">
                <Icon name="straighten" size={18} color="#111111" />
              </View>
              <Text className="text-[17px] font-black tracking-tight text-[#111111]">
                SIZE & FIT GUIDE
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-[#F4F1EA] border border-[#D9D9D5] flex items-center justify-center"
            >
              <Icon name="close" size={16} color="#353335" />
            </TouchableOpacity>
          </View>

          {/* Unit Toggle */}
          <View className="flex flex-row items-center justify-between my-3">
            <Text className="text-[11px] text-[#6B6667] font-medium">
              Drop sizing measurements
            </Text>
            <View className="flex flex-row bg-[#F4F1EA] p-1 rounded-xl border border-[#D9D9D5]">
              <TouchableOpacity
                onPress={() => setUnit('in')}
                activeOpacity={0.8}
                style={{ backgroundColor: unit === 'in' ? '#111111' : 'transparent' }}
                className="px-3 py-1 rounded-lg"
              >
                <Text
                  style={{ color: unit === 'in' ? '#ffffff' : '#6B6667' }}
                  className="text-[11px] font-extrabold"
                >
                  Inches
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUnit('cm')}
                activeOpacity={0.8}
                style={{ backgroundColor: unit === 'cm' ? '#111111' : 'transparent' }}
                className="px-3 py-1 rounded-lg"
              >
                <Text
                  style={{ color: unit === 'cm' ? '#ffffff' : '#6B6667' }}
                  className="text-[11px] font-extrabold"
                >
                  CM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Measurements Table */}
          <View className="rounded-xl border border-[#D9D9D5] overflow-hidden my-1">
            {/* Table Header */}
            <View className="flex flex-row bg-[#F4F1EA] py-2.5 px-3 border-b border-[#D9D9D5]">
              <Text className="w-12 font-bold text-[11px] text-[#111111]">Size</Text>
              <Text className="flex-1 font-bold text-[11px] text-[#111111] text-center">Bust</Text>
              <Text className="flex-1 font-bold text-[11px] text-[#111111] text-center">Waist</Text>
              <Text className="flex-1 font-bold text-[11px] text-[#111111] text-center">Hip</Text>
              <Text className="flex-1 font-bold text-[11px] text-[#111111] text-center">Length</Text>
            </View>

            {/* Table Rows */}
            <ScrollView style={{ maxHeight: 220 }}>
              {chart.map((row, i) => (
                <View
                  key={row.size}
                  className={`flex flex-row py-2.5 px-3 items-center ${
                    i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#F4F1EA]/60'
                  } ${i < chart.length - 1 ? 'border-b border-[#D9D9D5]/60' : ''}`}
                >
                  <Text style={{ color: '#111111' }} className="w-12 font-extrabold text-[12px]">
                    {row.size}
                  </Text>
                  <Text className="flex-1 text-[12px] text-[#353335] text-center">
                    {row.bust}
                  </Text>
                  <Text className="flex-1 text-[12px] text-[#353335] text-center">
                    {row.waist}
                  </Text>
                  <Text className="flex-1 text-[12px] text-[#353335] text-center">
                    {row.hip}
                  </Text>
                  <Text className="flex-1 text-[12px] text-[#353335] text-center">
                    {row.length}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Micro Footer Notice */}
          <View className="flex flex-row items-center gap-2 mt-3 p-2.5 rounded-xl bg-[#F4F1EA] border border-[#D9D9D5]">
            <Icon name="info" size={16} color="#111111" />
            <Text className="text-[11px] text-[#6B6667] flex-1 leading-4">
              Need custom fit? Rider delivers with 10-minute doorstep try & return.
            </Text>
          </View>

          {/* Close CTA */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={{ backgroundColor: '#111111' }}
            className="w-full mt-4 py-3 rounded-xl items-center justify-center shadow-xs"
          >
            <Text className="text-white font-extrabold text-[12px] uppercase tracking-wider">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
