import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Search, Share2, Heart } from 'lucide-react-native';

interface ProductHeaderProps {
  topInset: number;
  isWished: boolean;
  onBack: () => void;
  onSearchPress: () => void;
  onShare: () => void;
  onToggleWishlist: () => void;
}

export function ProductHeader({
  topInset,
  isWished,
  onBack,
  onSearchPress,
  onShare,
  onToggleWishlist,
}: ProductHeaderProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(250, 248, 245, 0.92)',
        borderBottomWidth: 1,
        borderBottomColor: '#ECE8DF',
        paddingTop: Math.max(topInset, 10),
        paddingBottom: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={10}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E0D8',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowLeft size={18} color="#111111" />
      </Pressable>

      {/* Search Bar with Affordz Favicon */}
      <Pressable
        onPress={onSearchPress}
        style={{
          flex: 1,
          height: 38,
          backgroundColor: '#FFFFFF',
          borderRadius: 19,
          borderWidth: 1,
          borderColor: '#E5E0D8',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          marginHorizontal: 8,
          gap: 7,
        }}
      >
        <Image
          source={require('@/assets/images/favicon.png')}
          style={{ width: 22, height: 22, borderRadius: 5 }}
          contentFit="contain"
        />
        <Search size={14} color="#71717A" />
        <Text
          style={{
            fontSize: 12,
            color: '#8A8580',
            fontWeight: '600',
            flex: 1,
          }}
          numberOfLines={1}
        >
          Search couture, kurtis...
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={onShare}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E0D8',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share2 size={16} color="#111111" />
        </Pressable>

        <Pressable
          onPress={onToggleWishlist}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E0D8',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart
            size={16}
            color={isWished ? '#FF5A1F' : '#111111'}
            fill={isWished ? '#FF5A1F' : 'none'}
          />
        </Pressable>
      </View>
    </View>
  );
}
