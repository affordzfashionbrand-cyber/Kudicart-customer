import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';

export interface FlashDropSectionProps {
  onExplore: () => void;
}

export const FlashDropSection = React.memo(function FlashDropSection({
  onExplore,
}: FlashDropSectionProps) {
  // Live Countdown Timer isolated within this component
  const [flashTimeLeft, setFlashTimeLeft] = useState(2 * 3600 + 14 * 60 + 38);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTimeLeft((prev) => (prev > 0 ? prev - 1 : 24 * 3600 - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashHours = String(Math.floor(flashTimeLeft / 3600)).padStart(2, '0');
  const flashMinutes = String(Math.floor((flashTimeLeft % 3600) / 60)).padStart(2, '0');
  const flashSeconds = String(flashTimeLeft % 60).padStart(2, '0');

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 32, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: '#353335' }}>
      <LinearGradient
        colors={['#111111', '#1a191a', '#111111']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center' }}
      >
        {/* Drop Pill Badge */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.16)',
          marginBottom: 12,
        }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF5A1F' }} />
          <Text style={{ fontSize: 9.5, fontWeight: '900', letterSpacing: 1.8, color: '#ffffff', textTransform: 'uppercase' }}>
            DROP_04 • 00:28
          </Text>
        </View>

        {/* Heading & Subtitle */}
        <SectionTitle
          label="FLASH ATELIER"
          firstLine="New drop"
          secondLine="live now."
          align="center"
          inverted={true}
          marginBottom={8}
        />
        <Text style={{ fontSize: 13, color: '#D9D9D5', textAlign: 'center', marginBottom: 22, letterSpacing: 0.2 }}>
          SEEN IT. WANTED IT. WEAR IT. <Text style={{ color: '#ffffff', fontWeight: '900' }}>NOW.</Text>
        </Text>

        {/* Live Countdown Timer with Micro-Labels */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          {[
            { val: flashHours, label: 'HOURS' },
            { val: flashMinutes, label: 'MINUTES' },
            { val: flashSeconds, label: 'SECONDS' },
          ].map((item, idx) => (
            <React.Fragment key={item.label}>
              <View style={{
                width: 62,
                height: 62,
                borderRadius: 14,
                backgroundColor: '#1E1D1E',
                borderWidth: 1,
                borderColor: '#353335',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 21, fontWeight: '900', color: '#ffffff', lineHeight: 23 }}>
                  {item.val}
                </Text>
                <Text style={{ fontSize: 7.5, fontWeight: '900', letterSpacing: 1.2, color: '#A3A39E', marginTop: 2 }}>
                  {item.label}
                </Text>
              </View>
              {idx < 2 && (
                <Text style={{ fontSize: 20, fontWeight: '700', color: 'rgba(255, 255, 255, 0.35)', marginBottom: 4 }}>
                  :
                </Text>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Prominent CTA Button */}
        <AnimatedPressable
          onPress={onExplore}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 999,
            paddingLeft: 22,
            paddingRight: 6,
            paddingVertical: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '900', letterSpacing: 1.5, color: '#111111', textTransform: 'uppercase', marginRight: 12 }}>
            ORDER. CHANGE. GO.
          </Text>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#111111',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRight size={14} color="#ffffff" strokeWidth={2.5} />
          </View>
        </AnimatedPressable>
      </LinearGradient>
    </View>
  );
});
