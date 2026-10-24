import React from 'react';
import { View, Text } from 'react-native';
import { Zap, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';

const PROMISE_PILLARS = [
  {
    Icon: Zap,
    title: '18-Min Express Dispatch',
    desc: 'Instant delivery from neighborhood fashion dark stores directly to your door.',
  },
  {
    Icon: Sparkles,
    title: 'Doorstep Try & Buy',
    desc: 'Try multiple sizes inside your home. Keep what fits, return the rest on the spot.',
  },
  {
    Icon: ShieldCheck,
    title: '100% Genuine Ateliers',
    desc: 'Direct sourcing from verified fashion labels and certified artisan workshops.',
  },
  {
    Icon: RefreshCw,
    title: 'Instant 0₹ Exchanges',
    desc: 'No return tickets or courier waiting. Delivery valet exchanges sizes in minutes.',
  },
];

export const AffordzPromiseSection = React.memo(function AffordzPromiseSection() {
  return (
    <View style={{ marginHorizontal: 12, marginBottom: 36, backgroundColor: '#FAF8F3', borderRadius: 28, borderWidth: 1, borderColor: '#E8E5DD', padding: 20 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <SectionTitle
          label="AFFORDZ PROMISE"
          firstLine="Doorstep"
          secondLine="guarantee."
          align="center"
          marginBottom={0}
        />
      </View>

      {/* 4 Pillars Grid (2x2) */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {PROMISE_PILLARS.map((pillar) => (
          <View
            key={pillar.title}
            style={{
              width: '48%',
              backgroundColor: '#ffffff',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#E8E5DD',
              padding: 14,
            }}
          >
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <pillar.Icon size={16} color="#ffffff" strokeWidth={2.2} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111', marginBottom: 4, letterSpacing: -0.1 }}>
              {pillar.title}
            </Text>
            <Text style={{ fontSize: 10, color: '#6B6667', lineHeight: 14 }}>
              {pillar.desc}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});
