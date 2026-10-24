import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Animated, Platform } from 'react-native';
import { MapPin, ChevronDown, UserRound, Search, X, Mic, Zap, Sparkles } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { SEARCH_PLACEHOLDERS, bespokeEasing } from '@/data/homeData';
import { useDarkStore } from '@/store/useDarkStore';
import { useCatalogStore, FulfillmentFilterType } from '@/store/useCatalogStore';
import { Fonts } from '@/constants/theme';

export interface HomeHeaderProps {
  paddingTop: number;
  selectedAddressText: string;
  onOpenAddressModal: () => void;
  onOpenAccount: () => void;
  query: string;
  onQueryChange: (text: string) => void;
  onSelectSearchQuery: (text: string) => void;
}

export const HomeHeader = React.memo(function HomeHeader({
  paddingTop,
  selectedAddressText,
  onOpenAddressModal,
  onOpenAccount,
  query,
  onQueryChange,
  onSelectSearchQuery,
}: HomeHeaderProps) {
  const { selectedDarkStore, openDarkStoreModal } = useDarkStore();
  const { fulfillmentFilter, setFulfillmentFilter } = useCatalogStore();

  // Dynamic Search Placeholder Animation Ticker isolated inside header
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderTranslateAnim = useRef(new Animated.Value(0)).current;
  const placeholderOpacityAnim = useRef(new Animated.Value(1)).current;

  // Search Focus Animations
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const searchChipsAnim = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(placeholderTranslateAnim, {
          toValue: -14,
          duration: 250,
          easing: bespokeEasing,
          useNativeDriver: true,
        }),
        Animated.timing(placeholderOpacityAnim, {
          toValue: 0,
          duration: 200,
          easing: bespokeEasing,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
        placeholderTranslateAnim.setValue(14);
        Animated.parallel([
          Animated.timing(placeholderTranslateAnim, {
            toValue: 0,
            duration: 280,
            easing: bespokeEasing,
            useNativeDriver: true,
          }),
          Animated.timing(placeholderOpacityAnim, {
            toValue: 1,
            duration: 260,
            easing: bespokeEasing,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(searchFocusAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
    Animated.stagger(40, searchChipsAnim.map(anim =>
      Animated.timing(anim, { toValue: 1, duration: 180, easing: bespokeEasing, useNativeDriver: true })
    )).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.timing(searchFocusAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    searchChipsAnim.forEach(anim => anim.setValue(0));
  };

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
          <View
            style={{
              width: 36,
              height: 36,
              backgroundColor: '#FF5A1F',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#FF5A1F',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#ffffff', fontFamily: Fonts.serifBold, fontSize: 21, fontWeight: '800' }}>
              A
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 17.5, fontWeight: '900', letterSpacing: -0.4, color: '#111111', lineHeight: 19 }}>
              AFFORDZ<Text style={{ color: '#FF5A1F' }}>.</Text>
            </Text>
            <Pressable
              onPress={onOpenAddressModal}
              hitSlop={6}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}
            >
              <MapPin size={10} color="#FF5A1F" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B6667', maxWidth: 140 }} numberOfLines={1}>
                {selectedAddressText}
              </Text>
              <ChevronDown size={11} color="#6B6667" style={{ marginLeft: 2 }} />
            </Pressable>
          </View>
        </View>

        {/* Right Action Icons: Express Drop Badge and Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AnimatedPressable onPress={openDarkStoreModal}>
            <View
              style={{
                backgroundColor: '#111111',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#111111',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5A1F', marginRight: 5 }} />
              <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {selectedDarkStore ? `${selectedDarkStore.deliveryMinutes}M DROP` : '18M DROP'}
              </Text>
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
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: '#FF5A1F',
                  borderRadius: 4,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  borderWidth: 1.5,
                  borderColor: '#ffffff',
                }}
              />
            </View>
          </AnimatedPressable>
        </View>
      </View>

      {/* Row 2: Full Width Search Bar */}
      <Animated.View
        style={{
          height: 44,
          borderRadius: 22,
          borderWidth: 1.5,
          borderColor: searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: ['#D9D9D5', '#FF5A1F'] }),
          backgroundColor: searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: ['#F7F7F5', '#ffffff'] }),
          shadowColor: '#FF5A1F',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.08] }),
          shadowRadius: 6,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Search size={17} color={isSearchFocused ? '#FF5A1F' : '#6B6667'} />

        {/* Dynamic Rolling Animated Placeholder */}
        {query.length === 0 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 41,
              right: isSearchFocused ? 75 : 20,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                opacity: placeholderOpacityAnim,
                transform: [{ translateY: placeholderTranslateAnim }],
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text numberOfLines={1} style={{ fontSize: 13.5, color: '#6B6667' }}>
                Search <Text style={{ fontWeight: '600', color: isSearchFocused ? '#111111' : '#353335' }}>{`"${SEARCH_PLACEHOLDERS[placeholderIndex]}"`}</Text>
              </Text>
            </Animated.View>
          </View>
        )}

        <TextInput
          className="flex-1 ml-[10px] text-[14px] text-black h-full"
          style={[
            {
              borderWidth: 0,
              backgroundColor: 'transparent',
              paddingVertical: 0,
            },
            Platform.OS === 'web' ? ({ outline: 'none', outlineWidth: 0, outlineStyle: 'none', boxShadow: 'none' } as any) : {}
          ]}
          placeholder=""
          value={query}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onChangeText={onQueryChange}
          selectionColor="#FF5A1F"
        />
        {isSearchFocused && (
          <View className="flex-row items-center gap-[10px]">
            {query.length > 0 && (
              <Pressable onPress={() => onQueryChange('')}>
                <X size={17} color="#6B6667" />
              </Pressable>
            )}
            <Mic size={17} color="#FF5A1F" />
          </View>
        )}
      </Animated.View>

      {/* Row 3: Dynamic Fulfillment Switcher (All Styles / 18-Min Express Hub / Boutique Artisans) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
        }}
      >
        <Pressable
          onPress={() => setFulfillmentFilter('ALL')}
          style={{
            flex: 1,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: fulfillmentFilter === 'ALL' ? '#111111' : '#F4F1EA',
            borderWidth: 1,
            borderColor: fulfillmentFilter === 'ALL' ? '#111111' : '#E8E5DF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: fulfillmentFilter === 'ALL' ? '#ffffff' : '#4A4647',
            }}
          >
            All Styles
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFulfillmentFilter('DARK_STORE')}
          style={{
            flex: 1.25,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: fulfillmentFilter === 'DARK_STORE' ? '#C2410C' : '#F0F9FF',
            borderWidth: 1,
            borderColor: fulfillmentFilter === 'DARK_STORE' ? '#C2410C' : '#FFEDD5',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Zap size={11} color={fulfillmentFilter === 'DARK_STORE' ? '#ffffff' : '#C2410C'} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: fulfillmentFilter === 'DARK_STORE' ? '#ffffff' : '#9A3412',
            }}
          >
            18-Min Express
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFulfillmentFilter('VENDOR')}
          style={{
            flex: 1.25,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: fulfillmentFilter === 'VENDOR' ? '#111111' : '#FDFBF7',
            borderWidth: 1,
            borderColor: fulfillmentFilter === 'VENDOR' ? '#111111' : '#E8E5DF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Sparkles size={11} color={fulfillmentFilter === 'VENDOR' ? '#F59E0B' : '#B45309'} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: fulfillmentFilter === 'VENDOR' ? '#ffffff' : '#78350F',
            }}
          >
            Boutique Artisans
          </Text>
        </Pressable>
      </View>

      {/* Animated Chips row for active search */}
      {isSearchFocused && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, overflow: 'hidden' }}>
          <Animated.View style={{ opacity: searchChipsAnim[0], transform: [{ translateY: searchChipsAnim[0].interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }], marginRight: 8 }}>
            <Pressable
              onPress={() => onSelectSearchQuery('Handloom Silk Sarees')}
              className="bg-[#111111] px-[14px] py-[6px] rounded-full border border-[#111111]"
            >
              <Text className="text-white text-[12px] font-medium">Silk Sarees</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={{ opacity: searchChipsAnim[1], transform: [{ translateY: searchChipsAnim[1].interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }], marginRight: 8 }}>
            <Pressable
              onPress={() => onSelectSearchQuery(SEARCH_PLACEHOLDERS[placeholderIndex])}
              className="bg-[#F4F1EA] border border-[#D9D9D5] px-[14px] py-[6px] rounded-full"
            >
              <Text className="text-[#111111] text-[12px] font-medium">
                <Text className="text-[#6B6667]">Trending: </Text>{SEARCH_PLACEHOLDERS[placeholderIndex]}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
});

