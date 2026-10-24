import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import {
  Trash2,
  Heart,
  Plus,
  Minus,
  Check,
  RotateCcw,
  ChevronDown,
} from 'lucide-react-native';
import { formatPrice } from '@/data/homeData';
import { LocalCartItem } from '@/store/useCartStore';
import { AVAILABLE_SIZES } from './bag-data';

interface BagItemCardProps {
  item: LocalCartItem;
  isSelected: boolean;
  isWished: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleWishlist: (productId: string | number) => void;
  onOpenProduct?: (productId: string | number) => void;
}

export const BagItemCard = React.memo(function BagItemCard({
  item,
  isSelected,
  isWished,
  onToggleSelect,
  onUpdateQuantity,
  onRemoveItem,
  onToggleWishlist,
  onOpenProduct,
}: BagItemCardProps) {
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false);

  const itemMrp = item.originalPrice && item.originalPrice > item.price
    ? item.originalPrice
    : Math.round(item.price * 1.35);

  const discountPct = Math.round(((itemMrp - item.price) / itemMrp) * 100);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isSelected ? '#111111' : '#E8E5DF',
        padding: 12,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Selection Checkbox */}
        <Pressable
          onPress={() => onToggleSelect(item.id)}
          style={{ paddingTop: 4 }}
          hitSlop={8}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              backgroundColor: isSelected ? '#111111' : '#F7F5F0',
              borderWidth: 1.5,
              borderColor: isSelected ? '#111111' : '#C8C4BC',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </Pressable>

        {/* Thumbnail Image */}
        <Pressable
          onPress={() => onOpenProduct && onOpenProduct(item.productId)}
          style={{ width: 84, height: 108, borderRadius: 12, overflow: 'hidden', position: 'relative' }}
        >
          <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              backgroundColor: item.isTryAndBuy || item.fulfillmentType === 'DARK_STORE' ? '#C2410C' : '#111111',
              paddingHorizontal: 5,
              paddingVertical: 1.5,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>
              {item.isTryAndBuy || item.fulfillmentType === 'DARK_STORE' ? '18M DROP' : 'BOUTIQUE'}
            </Text>
          </View>
        </Pressable>

        {/* Details & Controls */}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '800',
                    color: '#8A8580',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.brand}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 13, fontWeight: '800', color: '#111111', marginTop: 1 }}
                >
                  {item.title}
                </Text>
              </View>

              {/* Delete Button */}
              <Pressable onPress={() => onRemoveItem(item.id)} hitSlop={8}>
                <Trash2 size={15} color="#A0A0A0" />
              </Pressable>
            </View>

            {/* Size & Quantity Control Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
              {/* Size Selector Trigger */}
              <Pressable
                onPress={() => setIsSizePickerOpen(!isSizePickerOpen)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#F7F5F0',
                  borderWidth: 1,
                  borderColor: '#E2DFD8',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3.5,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }}>
                  Size: {item.size || 'M'}
                </Text>
                <ChevronDown size={11} color="#666666" />
              </Pressable>

              {/* Quantity Stepper */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F7F5F0',
                  borderWidth: 1,
                  borderColor: '#E2DFD8',
                  borderRadius: 8,
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  gap: 6,
                }}
              >
                <Pressable onPress={() => onUpdateQuantity(item.id, -1)} hitSlop={6} style={{ padding: 2 }}>
                  <Minus size={12} color="#111111" strokeWidth={2.5} />
                </Pressable>
                <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#111111', minWidth: 14, textAlign: 'center' }}>
                  {item.quantity}
                </Text>
                <Pressable onPress={() => onUpdateQuantity(item.id, 1)} hitSlop={6} style={{ padding: 2 }}>
                  <Plus size={12} color="#111111" strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>

            {/* Trial Fit Check badge if available */}
            {item.trialSize && (
              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#9A3412' }}>
                    ⚡ Free Trial Backup: Size {item.trialSize}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Price Row */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#111111' }}>
              {formatPrice(item.price * item.quantity)}
            </Text>
            <Text style={{ fontSize: 11, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
              {formatPrice(itemMrp * item.quantity)}
            </Text>
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FF5A1F' }}>
              {discountPct}% OFF
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded Inline Size Picker */}
      {isSizePickerOpen && (
        <View
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#F0ECE4',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#71717A' }}>Select Size:</Text>
          {AVAILABLE_SIZES.map((sz) => {
            const isCurrentSize = (item.size || 'M') === sz;
            return (
              <Pressable
                key={sz}
                onPress={() => {
                  item.size = sz;
                  setIsSizePickerOpen(false);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isCurrentSize ? '#111111' : '#F7F5F0',
                  borderWidth: 1,
                  borderColor: isCurrentSize ? '#111111' : '#D9D9D5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '900', color: isCurrentSize ? '#FFFFFF' : '#111111' }}>
                  {sz}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Trust Footer Badges */}
      <View
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#F4F1EA',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <RotateCcw size={11} color="#10B981" />
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981' }}>
            Doorstep Try & Buy Eligible
          </Text>
        </View>

        <Pressable
          onPress={() => onToggleWishlist(item.productId)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Heart size={12} color={isWished ? '#EF4444' : '#71717A'} fill={isWished ? '#EF4444' : 'none'} />
          <Text style={{ fontSize: 10, fontWeight: '800', color: isWished ? '#EF4444' : '#71717A' }}>
            {isWished ? 'Saved' : 'Wishlist'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
