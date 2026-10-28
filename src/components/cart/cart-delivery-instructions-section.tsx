import React from 'react';
import { View, Text, Pressable } from 'react-native';

export const DELIVERY_INSTRUCTIONS = [
  { id: 'door', label: 'Leave at Door', icon: '🚪' },
  { id: 'call', label: 'Call Before Delivery', icon: '📞' },
  { id: 'bell', label: 'Do Not Ring Bell', icon: '🔕' },
  { id: 'guard', label: 'Leave with Guard', icon: '🏢' },
];

export interface CartDeliveryInstructionsSectionProps {
  selectedInstruction: string | null;
  onSelectInstruction: (id: string | null) => void;
}

export const CartDeliveryInstructionsSection = React.memo(function CartDeliveryInstructionsSection({
  selectedInstruction,
  onSelectInstruction,
}: CartDeliveryInstructionsSectionProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '900',
          color: '#6B6667',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        DELIVERY PREFERENCES
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DELIVERY_INSTRUCTIONS.map((inst) => {
          const isSelected = selectedInstruction === inst.id;
          return (
            <Pressable
              key={inst.id}
              onPress={() => onSelectInstruction(isSelected ? null : inst.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: isSelected ? '#111111' : '#E8E5DF',
                backgroundColor: isSelected ? '#F4F1EA' : '#FFFFFF',
              }}
            >
              <Text style={{ fontSize: 13 }}>{inst.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: isSelected ? '900' : '600', color: '#111111' }}>
                {inst.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
