import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';
import { SIZE_CHART } from './product-constants';

interface ProductSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductSizeModal({ isOpen, onClose }: ProductSizeModalProps) {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E8E5DF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <EditorialText first="Atelier" second="size guide." fontSize={18} lineHeight={22} singleLine withDot />
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color="#111111" />
            </Pressable>
          </View>

          <View style={{ backgroundColor: '#F7F5F0', borderRadius: 12, padding: 8, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2DFD8', paddingBottom: 6 }}>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#111111' }}>SIZE</Text>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#111111' }}>BUST</Text>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#111111' }}>WAIST</Text>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#111111' }}>HIP</Text>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#111111' }}>LENGTH</Text>
            </View>
            {SIZE_CHART.map((row) => (
              <View key={row.size} style={{ flexDirection: 'row', paddingVertical: 5 }}>
                <Text style={{ flex: 1, fontSize: 10, fontWeight: '800', color: '#FF5A1F' }}>{row.size}</Text>
                <Text style={{ flex: 1, fontSize: 10, color: '#4A4A4A' }}>{row.bust}</Text>
                <Text style={{ flex: 1, fontSize: 10, color: '#4A4A4A' }}>{row.waist}</Text>
                <Text style={{ flex: 1, fontSize: 10, color: '#4A4A4A' }}>{row.hip}</Text>
                <Text style={{ flex: 1, fontSize: 10, color: '#4A4A4A' }}>{row.length}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 10, color: '#71717A', lineHeight: 14, textAlign: 'center' }}>
            All measurements in inches. If you fall between sizes, select your standard size and opt for Affordz&apos;s free adjacent size trial.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
