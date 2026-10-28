import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Package } from 'lucide-react-native';

export interface TrackingPackageCardProps {
  orderedItems: Array<{
    id?: string;
    title: string;
    brand?: string;
    size?: string;
    trialSize?: string | null;
    quantity?: number;
    price?: number;
    image?: string;
  }>;
  displayGrandTotal: number;
  formatPrice: (val: number) => string;
}

export const TrackingPackageCard = React.memo(function TrackingPackageCard({
  orderedItems,
  displayGrandTotal,
  formatPrice,
}: TrackingPackageCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 10, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase' }}>
          PACKAGE CONTENTS ({orderedItems.length})
        </Text>
        <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
          {formatPrice(displayGrandTotal)}
        </Text>
      </View>

      {orderedItems.map((item: any, idx: number) => (
        <View
          key={`${item.id || idx}-${idx}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 8,
            borderBottomWidth: idx !== orderedItems.length - 1 ? 1 : 0,
            borderBottomColor: '#F4F1EA',
          }}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: 44, height: 56, borderRadius: 8, backgroundColor: '#F4F1EA' }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 44,
                height: 56,
                borderRadius: 8,
                backgroundColor: '#F4F1EA',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={16} color="#6B6667" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }}>
              Size: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.size || 'M'}</Text> • Qty:{' '}
              <Text style={{ fontWeight: '800', color: '#111111' }}>{item.quantity || 1}</Text>
              {item.trialSize ? ` • Trial: ${item.trialSize}` : ''}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
            {formatPrice(item.price || 1299)}
          </Text>
        </View>
      ))}
    </View>
  );
});
