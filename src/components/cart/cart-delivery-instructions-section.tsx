import React from 'react';
import { View, Text, Pressable } from 'react-native';

export const DELIVERY_INSTRUCTIONS = [
  { id: 'door', label: 'Leave at Door', icon: '🚪' },
  { id: 'call', label: 'Call Before Delivery', icon: '📞' },
  { id: 'bell', label: 'Do Not Ring Bell', icon: '🔕' },
  { id: 'guard', label: 'Leave with Guard', icon: '🏢' },
];

function parseSelectedLabels(raw: string | null): string[] {
  if (!raw) return [];
  const legacyMap: Record<string, string> = {
    door: 'Leave at Door',
    call: 'Call Before Delivery',
    bell: 'Do Not Ring Bell',
    guard: 'Leave with Guard',
  };
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => legacyMap[part] || part);
}

export interface CartDeliveryInstructionsSectionProps {
  selectedInstruction: string | null;
  onSelectInstruction: (val: string | null) => void;
}

export const CartDeliveryInstructionsSection = React.memo(function CartDeliveryInstructionsSection({
  selectedInstruction,
  onSelectInstruction,
}: CartDeliveryInstructionsSectionProps) {
  const selectedLabels = parseSelectedLabels(selectedInstruction);

  const handleToggle = (label: string) => {
    const exists = selectedLabels.includes(label);
    const next = exists
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label];
    onSelectInstruction(next.length > 0 ? next.join(', ') : null);
  };

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
          const isSelected = selectedLabels.includes(inst.label);
          return (
            <Pressable
              key={inst.id}
              onPress={() => handleToggle(inst.label)}
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
