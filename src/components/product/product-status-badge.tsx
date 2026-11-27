import React from 'react';
import { View, Text } from 'react-native';

interface ProductStatusBadgeProps {
  isDarkStoreProduct: boolean;
  brand: string;
  darkStoreName?: string | null;
  vendorName?: string | null;
  distanceKm?: number;
}

export function ProductStatusBadge({
  isDarkStoreProduct,
  brand,
  darkStoreName = 'Affordz Express Hub',
  vendorName,
  distanceKm,
}: ProductStatusBadgeProps) {
  const distanceLabel = typeof distanceKm === 'number' && Number.isFinite(distanceKm)
    ? ` (${distanceKm.toFixed(1)} km)`
    : '';

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {isDarkStoreProduct ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E8E5DF',
            flexShrink: 1,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' }} />
          <Text numberOfLines={1} style={{ fontSize: 9.5, fontWeight: '800', color: '#111111', textTransform: 'uppercase' }}>
            {brand} • {darkStoreName || 'Express Hub'}{distanceLabel}
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E8E5DF',
            flexShrink: 1,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37' }} />
          <Text numberOfLines={1} style={{ fontSize: 9.5, fontWeight: '800', color: '#111111', textTransform: 'uppercase' }}>
            {brand}{vendorName ? ` • ${vendorName}` : ''}
          </Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: '#111111',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 10,
          marginLeft: 8,
        }}
      >
        <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 }}>
          {isDarkStoreProduct ? '19M EXPRESS' : 'DIRECT DISPATCH'}
        </Text>
      </View>
    </View>
  );
}
