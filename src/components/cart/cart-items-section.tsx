import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import {
  Package,
  ChevronUp,
  ChevronDown,
  X,
  Trash2,
  Minus,
  Plus,
  Zap,
} from 'lucide-react-native';

export interface CartItemsSectionProps {
  items: any[];
  isItemsExpanded: boolean;
  setIsItemsExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  handleRemoveItem: (id: string, title: string) => void;
  handleUpdateItemQty: (id: string, delta: number, title: string, currentQty: number) => void;
  formatPrice: (price: number) => string;
}

export const CartItemsSection = React.memo(function CartItemsSection({
  items,
  isItemsExpanded,
  setIsItemsExpanded,
  handleRemoveItem,
  handleUpdateItemQty,
  formatPrice,
}: CartItemsSectionProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => setIsItemsExpanded((prev) => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Package size={17} color="#111111" />
          <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
            Items in this order ({items.length})
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, color: '#71717A', fontWeight: '600' }}>
            {isItemsExpanded ? 'Hide' : 'View All'}
          </Text>
          {isItemsExpanded ? <ChevronUp size={16} color="#111111" /> : <ChevronDown size={16} color="#111111" />}
        </View>
      </Pressable>

      {/* Collapsed Preview Horizontal Strip */}
      {!isItemsExpanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}
        >
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                width: 66,
                height: 82,
                borderRadius: 10,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                backgroundColor: '#F4F1EA',
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <Pressable
                onPress={() => handleRemoveItem(item.id, item.title)}
                hitSlop={6}
                style={({ pressed }) => ({
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: pressed ? '#DC2626' : 'rgba(17, 17, 17, 0.85)',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title}`}
              >
                <X size={11} color="#FFFFFF" strokeWidth={3} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Expanded Item List with Remove & Quantity Stepper */}
      {isItemsExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
          {items.map((item, idx) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                gap: 12,
                paddingVertical: 14,
                borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                borderBottomColor: '#F4F1EA',
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: 68, height: 88, borderRadius: 10 }}
                contentFit="cover"
              />
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  {/* Brand & Remove Button Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontWeight: '900',
                        color: '#6B6667',
                        textTransform: 'uppercase',
                        flex: 1,
                        marginRight: 8,
                      }}
                      numberOfLines={1}
                    >
                      {item.brand}
                    </Text>

                    {/* Explicit Remove Item Button */}
                    <Pressable
                      onPress={() => handleRemoveItem(item.id, item.title)}
                      hitSlop={10}
                      style={({ pressed }) => ({
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: pressed ? '#FEE2E2' : '#F4F1EA',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: -2,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.title} from cart`}
                    >
                      <Trash2 size={12} color="#EF4444" />
                      <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 }}>
                        REMOVE
                      </Text>
                    </Pressable>
                  </View>

                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '700',
                      color: '#111111',
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </View>

                {/* Size & Interactive Quantity Stepper Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: '#71717A' }}>
                    Size: <Text style={{ fontWeight: '800', color: '#111111' }}>{item.size || 'M'}</Text>
                  </Text>

                  {/* Quantity Stepper with Minus/Trash & Plus */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#E5E0D8',
                      borderRadius: 14,
                      backgroundColor: '#FAF8F5',
                      height: 28,
                      paddingHorizontal: 4,
                      gap: 6,
                    }}
                  >
                    <Pressable
                      onPress={() => handleUpdateItemQty(item.id, -1, item.title, item.quantity)}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: pressed ? '#E8E5DF' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                      accessibilityRole="button"
                      accessibilityLabel="Decrease quantity"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={11} color="#EF4444" />
                      ) : (
                        <Minus size={11} color="#111111" strokeWidth={2.5} />
                      )}
                    </Pressable>

                    <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#111111', minWidth: 18, textAlign: 'center' }}>
                      {item.quantity}
                    </Text>

                    <Pressable
                      onPress={() => handleUpdateItemQty(item.id, 1, item.title, item.quantity)}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: pressed ? '#E8E5DF' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                      accessibilityRole="button"
                      accessibilityLabel="Increase quantity"
                    >
                      <Plus size={11} color="#111111" strokeWidth={2.5} />
                    </Pressable>
                  </View>
                </View>

                {/* Try & Buy / Delivery Badge */}
                {item.fulfillmentType === 'DARK_STORE' || item.isTryAndBuy ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <View
                      style={{
                        backgroundColor: '#FFF7ED',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Zap size={9} color="#C2410C" fill="#C2410C" />
                      <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#9A3412' }}>
                        ⚡ 18-MIN DROP • TRY & BUY {item.trialSize ? `• Trial: ${item.trialSize}` : ''}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <View
                      style={{
                        backgroundColor: '#EFF6FF',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Package size={9} color="#1D4ED8" />
                      <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#1D4ED8' }}>
                        🛍️ BOUTIQUE VENDOR • 2-4 DAYS
                      </Text>
                    </View>
                  </View>
                )}

                {/* Price Row */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <Text style={{ fontSize: 11, color: '#A0A0A0', textDecorationLine: 'line-through' }}>
                      {formatPrice(item.originalPrice * item.quantity)}
                    </Text>
                  )}
                  {item.quantity > 1 && (
                    <Text style={{ fontSize: 9.5, color: '#71717A' }}>
                      ({formatPrice(item.price)} each)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});
