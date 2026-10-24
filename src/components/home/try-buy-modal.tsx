import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ArrowRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';

const { height } = Dimensions.get('window');

const TRY_BUY_STEPS = [
  {
    step: '01',
    title: 'Order Multiple Sizes with 0₹ Trial Fee',
    desc: 'Unsure between Size M or L? Add both to your bag. No extra booking charge or upfront commitment.',
    badge: 'ZERO RISK',
  },
  {
    step: '02',
    title: 'Delivery Valet Arrives in 24 Mins',
    desc: 'Our dedicated valet arrives at your door with fresh boutique packaging and waits up to 10 minutes.',
    badge: 'EXPRESS DISPATCH',
  },
  {
    step: '03',
    title: 'Try On, Pay Only For What You Keep',
    desc: 'Keep the pieces you love, hand back what does not fit immediately. Zero courier returns, instant refund.',
    badge: 'INSTANT SETTLEMENT',
  },
];

export interface TryBuyModalProps {
  visible: boolean;
  onClose: () => void;
  onExplore: () => void;
}

export const TryBuyModal = React.memo(function TryBuyModal({
  visible,
  onClose,
  onExplore,
}: TryBuyModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 18,
            paddingBottom: insets.bottom + 20,
            maxHeight: height * 0.85,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Grab Handle */}
          <View style={{ width: 44, height: 4.5, backgroundColor: '#e5e7eb', borderRadius: 3, alignSelf: 'center', marginBottom: 16 }} />

          {/* Modal Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5A1F' }} />
                <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#6B6667', textTransform: 'uppercase' }}>
                  SIGNATURE EXPERIENCE
                </Text>
              </View>
              <EditorialText
                first="Doorstep"
                second="try & buy"
                fontSize={22}
                lineHeight={25}
                singleLine={true}
              />
              <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 2 }}>
                Try multiple sizes inside your home • Keep what fits, return the rest on the spot
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} color="#374151" />
            </Pressable>
          </View>

          {/* 3 Step Process */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
            {TRY_BUY_STEPS.map((item) => (
              <View
                key={item.step}
                style={{
                  backgroundColor: '#FAF8F3',
                  borderRadius: 18,
                  borderWidth: 1.2,
                  borderColor: '#E8E5DD',
                  padding: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '900' }}>{item.step}</Text>
                  </View>
                  <View style={{ backgroundColor: '#111111', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>{item.badge}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#111111', marginBottom: 4 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B6667', lineHeight: 18 }}>
                  {item.desc}
                </Text>
              </View>
            ))}

            {/* Action Button */}
            <AnimatedPressable
              onPress={onExplore}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111111',
                borderRadius: 999,
                paddingVertical: 14,
                marginTop: 6,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                EXPLORE TRY & BUY CATALOG
              </Text>
              <ArrowRight size={14} color="#ffffff" strokeWidth={2.5} style={{ marginLeft: 8 }} />
            </AnimatedPressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});
