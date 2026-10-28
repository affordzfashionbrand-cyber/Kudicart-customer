import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, Share2, ShoppingBag } from 'lucide-react-native';
import { UniversalSearchBar } from '@/components/home/search-bar';
import { Fonts } from '@/constants/theme';

interface ProductHeaderProps {
  topInset: number;
  cartCount?: number;
  onBack: () => void;
  onSearchPress?: () => void;
  onOpenSearchOverlay?: () => void;
  onShare: () => void;
  onOpenBag: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function ProductHeader({
  topInset,
  cartCount = 0,
  onBack,
  onSearchPress,
  onOpenSearchOverlay,
  onShare,
  onOpenBag,
  searchQuery = '',
  onClearSearch,
}: ProductHeaderProps) {
  const handleOpenSearch = onOpenSearchOverlay || onSearchPress;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(250, 248, 245, 0.96)',
        borderBottomWidth: 1,
        borderBottomColor: '#ECE8DF',
        paddingTop: Math.max(topInset, 10),
        paddingBottom: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => ({
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: pressed ? '#E8E5DF' : '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E0D8',
          alignItems: 'center',
          justifyContent: 'center',
        })}
        accessibilityRole="button"
        accessibilityLabel="Go Back"
      >
        <ArrowLeft size={18} color="#111111" />
      </Pressable>

      {/* Universal Search Bar with Logo inside */}
      <View style={{ flex: 1 }}>
        <UniversalSearchBar
          query={searchQuery}
          showLogoInside={true}
          onOpenOverlay={handleOpenSearch}
          onClear={onClearSearch}
          onBack={onClearSearch}
          containerStyle={{ height: 38, borderRadius: 19 }}
          placeholder="Search couture, kurtis..."
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Pressable
          onPress={onShare}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: pressed ? '#E8E5DF' : '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E0D8',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityRole="button"
          accessibilityLabel="Share Product"
        >
          <Share2 size={16} color="#111111" />
        </Pressable>

        {/* Bag Icon with Live Badge (Replaces Like/Wishlist) */}
        <Pressable
          onPress={onOpenBag}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: pressed ? '#E8E5DF' : '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E0D8',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          })}
          accessibilityRole="button"
          accessibilityLabel="Open Bag"
        >
          <ShoppingBag size={17} color="#111111" />
          {cartCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                backgroundColor: '#FF5A1F',
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: '#FFFFFF',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.sansBold,
                  color: '#FFFFFF',
                  fontSize: 9.5,
                  lineHeight: 11,
                }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
