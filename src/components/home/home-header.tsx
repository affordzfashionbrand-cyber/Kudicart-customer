import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, ChevronDown, UserRound, Bell } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { useDarkStore } from '@/store/useDarkStore';
import { Fonts } from '@/constants/theme';
import { UniversalSearchBar } from '@/components/home/search-bar';
import { Alert } from 'react-native';

export interface HomeHeaderProps {
  paddingTop: number;
  selectedAddressText: string;
  onOpenAddressModal: () => void;
  onOpenAccount: () => void;
  onOpenNotifications?: () => void;
  query: string;
  onQueryChange: (text: string) => void;
  onSelectSearchQuery: (text: string) => void;
  onOpenSearchOverlay?: () => void;
  isServiceable?: boolean;
}

export const HomeHeader = React.memo(function HomeHeader({
  paddingTop,
  selectedAddressText,
  onOpenAddressModal,
  onOpenAccount,
  onOpenNotifications,
  query,
  onQueryChange,
  onSelectSearchQuery,
  onOpenSearchOverlay,
  isServiceable = true,
}: HomeHeaderProps) {
  const { selectedDarkStore, openDarkStoreModal } = useDarkStore();

  return (
    <View
      style={{
        paddingTop,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0ede8',
        paddingHorizontal: 16,
        paddingBottom: 10,
        zIndex: 40,
      }}
    >
      {/* Row 1: Logo & Delivery on Left, Try & Buy & Account on Right */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        {/* Affordz 3D Cyan Letter "A" Branding & Delivery selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={require('@/assets/images/logo-removebg-preview.png')}
            style={{ width: 38, height: 38 }}
            contentFit="contain"
            transition={150}
          />
          <View>
            <Text style={{ fontSize: 17.5, fontFamily: Fonts.sansBold, letterSpacing: -0.4, color: '#111111', lineHeight: 19 }}>
              AFFORDZ<Text style={{ color: '#FF5A1F', fontFamily: Fonts.sansBold }}>.</Text>
            </Text>
            <Pressable
              onPress={onOpenAddressModal}
              hitSlop={6}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}
            >
              <MapPin size={10} color="#FF5A1F" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 11, fontFamily: Fonts.sansMedium, color: '#6B6667', maxWidth: 140 }} numberOfLines={1}>
                {selectedAddressText}
              </Text>
              <ChevronDown size={11} color="#6B6667" style={{ marginLeft: 2 }} />
            </Pressable>
          </View>
        </View>

        {/* Right Action Icons: Express Drop Badge, Notifications & Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AnimatedPressable onPress={openDarkStoreModal}>
            <View
              style={{
                backgroundColor: isServiceable === false ? '#FEF2F2' : '#111111',
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isServiceable === false ? '#FCA5A5' : '#111111',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isServiceable === false ? '#DC2626' : '#FF5A1F',
                  marginRight: 5,
                }}
              />
              <Text
                style={{
                  fontSize: 9.5,
                  fontFamily: Fonts.sansBold,
                  color: isServiceable === false ? '#DC2626' : '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                {isServiceable === false
                  ? 'NOT AVAILABLE'
                  : selectedDarkStore
                  ? `${selectedDarkStore.deliveryMinutes}M DROP`
                  : '18M DROP'}
              </Text>
            </View>
          </AnimatedPressable>

          {/* Notification Bell */}
          <AnimatedPressable
            onPress={
              onOpenNotifications ||
              (() =>
                Alert.alert(
                  'Atelier Notifications',
                  'You have no unread alerts. All active drops are on schedule.',
                  [{ text: 'Dismiss', style: 'cancel' }],
                ))
            }
          >
            <View
              style={{
                width: 34,
                height: 34,
                backgroundColor: '#F4F1EA',
                borderRadius: 17,
                borderWidth: 1,
                borderColor: '#D9D9D5',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Bell size={16} color="#111111" />
              <View
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: '#FF5A1F',
                  borderRadius: 3.5,
                  position: 'absolute',
                  top: 1,
                  right: 1,
                  borderWidth: 1.5,
                  borderColor: '#ffffff',
                }}
              />
            </View>
          </AnimatedPressable>

          <AnimatedPressable onPress={onOpenAccount}>
            <View
              style={{
                width: 34,
                height: 34,
                backgroundColor: '#F4F1EA',
                borderRadius: 17,
                borderWidth: 1,
                borderColor: '#D9D9D5',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <UserRound size={17} color="#111111" />
            </View>
          </AnimatedPressable>
        </View>
      </View>

      {/* Row 2: Full Width Universal Search Bar */}
      <UniversalSearchBar
        query={query}
        onQueryChange={onQueryChange}
        onOpenOverlay={onOpenSearchOverlay}
        onClear={() => onQueryChange('')}
        onBack={() => onQueryChange('')}
      />
    </View>
  );
});

