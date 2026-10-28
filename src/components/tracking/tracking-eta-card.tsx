import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Zap, Package, Clock } from 'lucide-react-native';
import { OrderStatus } from '@/services/api';

export interface TrackingEtaCardProps {
  isDarkStore: boolean;
  isTryAndBuy: boolean;
  activeStatus: OrderStatus;
  displayEta: string | number;
  stageHeadline: string;
}

export const TrackingEtaCard = React.memo(function TrackingEtaCard({
  isDarkStore,
  isTryAndBuy,
  activeStatus,
  displayEta,
  stageHeadline,
}: TrackingEtaCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 14,
      }}
    >
      {/* Badge Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: isDarkStore ? '#FFF7ED' : '#EFF6FF',
            borderWidth: 1,
            borderColor: isDarkStore ? '#FFEDD5' : '#DBEAFE',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          {isDarkStore ? (
            <Zap size={12} color="#FF5A1F" fill="#FF5A1F" />
          ) : (
            <Package size={12} color="#1D4ED8" />
          )}
          <Text
            style={{
              fontSize: 10,
              fontWeight: '900',
              color: isDarkStore ? '#C2410C' : '#1D4ED8',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            {isDarkStore
              ? isTryAndBuy
                ? 'TRY & BUY DOORSTEP DROP'
                : '18-MIN HYPERLOCAL DROP'
              : 'BOUTIQUE VENDOR DISPATCH'}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#FAF8F5',
            borderWidth: 1,
            borderColor: '#E8E5DF',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 9.5,
              fontWeight: '800',
              color: '#6B6667',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            {activeStatus.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      {/* Countdown Headline */}
      {activeStatus === 'DELIVERED' ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={30} color="#15803D" />
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#15803D', letterSpacing: -0.5 }}>
              DELIVERED.
            </Text>
          </View>
          <Text style={{ fontSize: 12.5, color: '#6B6667', marginTop: 4, lineHeight: 17 }}>
            Garment handover complete at your doorstep. Size verified and accepted.
          </Text>
        </View>
      ) : (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ fontSize: 44, fontWeight: '900', color: '#111111', letterSpacing: -1, lineHeight: 48 }}>
              {displayEta}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: isDarkStore ? '#FF5A1F' : '#1D4ED8', letterSpacing: 0.5 }}>
              {isDarkStore ? 'MINS' : ''}
            </Text>
          </View>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#4A4A4A', marginTop: 4, lineHeight: 17 }}>
            {stageHeadline}
          </Text>
        </View>
      )}

      {/* Try & Buy Doorstep Notice */}
      {isTryAndBuy && activeStatus !== 'DELIVERED' && (
        <View
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#F4F1EA',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#FFF7ED',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={15} color="#C2410C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#9A3412' }}>
              10-Minute Doorstep Fitting Window
            </Text>
            <Text style={{ fontSize: 10.5, color: '#7C2D12', marginTop: 1 }}>
              Try sizes while our pilot waits. Keep what fits, return the rest on the spot.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});
