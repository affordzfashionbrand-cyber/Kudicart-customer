import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Icon } from '@/components/icon';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (category: string, expressOnly: boolean, priceRange: string) => void;
  currentCategory: string;
}

export function FilterModal({
  visible,
  onClose,
  onApply,
  currentCategory,
}: FilterModalProps) {
  const [selectedCat, setSelectedCat] = useState(currentCategory || 'all');
  const [expressOnly, setExpressOnly] = useState(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const categories = [
    { id: 'all', label: 'All Wardrobes' },
    { id: 'kurtis', label: 'Kurtis' },
    { id: 'sarees', label: 'Sarees' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'fabrics', label: 'Fabrics' },
  ];

  const priceRanges = [
    { id: 'all', label: 'Any Price' },
    { id: 'under-1000', label: 'Under ₹1,000' },
    { id: '1000-2000', label: '₹1,000 - ₹2,000' },
    { id: 'above-2000', label: 'Above ₹2,000' },
  ];

  const handleApply = () => {
    onApply(selectedCat, expressOnly, selectedPriceRange);
    onClose();
  };

  const handleReset = () => {
    setSelectedCat('all');
    setExpressOnly(false);
    setSelectedPriceRange('all');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View style={{ backgroundColor: '#F7F7F5' }} className="rounded-t-3xl p-5 border-t border-[#D9D9D5] shadow-2xl">
          {/* Header */}
          <View className="flex flex-row items-center justify-between pb-3 border-b border-[#D9D9D5]">
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-[#F4F1EA] border border-[#D9D9D5] flex items-center justify-center">
                <Icon name="tune" size={18} color="#111111" />
              </View>
              <Text className="text-[17px] font-black tracking-tight text-[#111111]">
                FILTER DROP
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

          {/* Wardrobe Category Filter */}
          <View className="my-3">
            <Text className="text-[10px] uppercase font-extrabold text-[#6B6667] tracking-wider mb-2">
              Category
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = selectedCat.toLowerCase() === c.id.toLowerCase();
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCat(c.id)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: isSelected ? '#111111' : '#F4F1EA',
                      borderColor: isSelected ? '#111111' : '#D9D9D5',
                    }}
                    className="px-3.5 py-2 rounded-xl border"
                  >
                    <Text
                      style={{
                        color: isSelected ? '#ffffff' : '#353335',
                        fontWeight: '700',
                        fontSize: 12,
                      }}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 35-Min Express Drop Toggle */}
          <View className="py-3 border-t border-[#D9D9D5] flex flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex flex-row items-center gap-1.5">
                <Icon name="bolt" size={16} color="#111111" />
                <Text className="text-[13px] font-extrabold text-[#111111]">
                  Express Drop Only (35-Min)
                </Text>
              </View>
              <Text className="text-[11px] text-[#6B6667] mt-0.5">
                Show handlooms pre-packed for instantaneous dispatch
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setExpressOnly(!expressOnly)}
              activeOpacity={0.8}
              style={{
                backgroundColor: expressOnly ? '#111111' : '#D9D9D5',
              }}
              className="w-12 h-7 rounded-full p-1"
            >
              <View
                className={`w-5 h-5 rounded-full bg-white shadow-xs ${
                  expressOnly ? 'self-end' : 'self-start'
                }`}
              />
            </TouchableOpacity>
          </View>

          {/* Price Range Filter */}
          <View className="py-3 border-t border-[#D9D9D5]">
            <Text className="text-[10px] uppercase font-extrabold text-[#6B6667] tracking-wider mb-2">
              Price Range
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              {priceRanges.map((p) => {
                const isSelected = selectedPriceRange === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPriceRange(p.id)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: isSelected ? '#111111' : '#F4F1EA',
                      borderColor: isSelected ? '#111111' : '#D9D9D5',
                    }}
                    className="px-3 py-1.5 rounded-xl border"
                  >
                    <Text
                      style={{
                        color: isSelected ? '#ffffff' : '#353335',
                        fontWeight: '700',
                        fontSize: 12,
                      }}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action CTAs */}
          <View className="flex flex-row gap-3 pt-3 border-t border-[#D9D9D5]">
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#F4F1EA',
                borderColor: '#D9D9D5',
              }}
              className="flex-1 py-3 rounded-xl border items-center justify-center"
            >
              <Text className="text-[#353335] font-extrabold text-[12px] uppercase tracking-wider">
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#111111',
              }}
              className="flex-2 py-3 rounded-xl items-center justify-center shadow-sm"
            >
              <Text className="text-white font-extrabold text-[13px] uppercase tracking-wider">
                Apply Filter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
