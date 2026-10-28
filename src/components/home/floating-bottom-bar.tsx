import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Platform,
} from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import {
  Home,
  LayoutGrid,
  Heart,
  ShoppingCart,
  Zap,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { useDarkStore } from '@/store/useDarkStore';
import { Fonts } from '@/constants/theme';

interface FloatingBottomBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  totalBagCount: number;
  wishlistCount?: number;
  onOpenDarkStoreModal?: () => void;
}

// 3 Regular Left Tabs (Home, Categories, Wishlist)
const REGULAR_TABS = [
  { id: 'HOME', label: 'Home', Icon: Home },
  { id: 'SHOP', label: 'Categories', Icon: LayoutGrid },
  { id: 'WISHLIST', label: 'Wishlist', Icon: Heart },
];

// Curated Dark Store Items that cycle in the animated pill showcase
const DARK_STORE_SHOWCASE_ITEMS = [
  {
    id: 1,
    name: 'Minimal Tote',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Leather Sneaker',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Silk Kurta',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 4,
    name: 'Linen Shirt',
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 5,
    name: 'Wool Coat',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=200&q=80',
  },
];

// Catchy prefixes matching the Dark Store feature icon
const CATCHY_PREFIXES = ['select', 'express', 'atelier', 'curated'];

export const FloatingBottomBar = React.memo(function FloatingBottomBar({
  currentTab,
  onSelectTab,
  totalBagCount,
  wishlistCount = 0,
}: FloatingBottomBarProps) {
  const { selectedDarkStore } = useDarkStore();
  const isNative = Platform.OS !== 'web';

  // Cycling product index for animated multi-item showcase
  const [productIndex, setProductIndex] = useState(0);
  const [prefixIndex, setPrefixIndex] = useState(0);

  // Animation values for product transition
  const productTranslateY = useRef(new Animated.Value(0)).current;
  const productOpacity = useRef(new Animated.Value(1)).current;
  const productScale = useRef(new Animated.Value(1)).current;

  // Animation values for prefix text cross-fade
  const prefixOpacity = useRef(new Animated.Value(1)).current;
  const prefixTranslateY = useRef(new Animated.Value(0)).current;

  // Pulse animation for live lightning/beacon
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Pulse animation for Add to Cart small bar
  const bagScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (totalBagCount > 0) {
      Animated.sequence([
        Animated.timing(bagScale, { toValue: 1.12, duration: 140, useNativeDriver: isNative }),
        Animated.spring(bagScale, { toValue: 1, friction: 4, tension: 70, useNativeDriver: isNative }),
      ]).start();
    }
  }, [totalBagCount, bagScale, isNative]);

  // Cycle products smoothly every 2.4s
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Slide and fade out current item
      Animated.parallel([
        Animated.timing(productTranslateY, {
          toValue: -10,
          duration: 220,
          useNativeDriver: isNative,
        }),
        Animated.timing(productOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: isNative,
        }),
        Animated.timing(productScale, {
          toValue: 0.88,
          duration: 220,
          useNativeDriver: isNative,
        }),
      ]).start(() => {
        // Switch to next product
        setProductIndex((prev) => (prev + 1) % DARK_STORE_SHOWCASE_ITEMS.length);

        // Prep entrance from bottom
        productTranslateY.setValue(10);
        productScale.setValue(0.88);

        // 2. Slide and fade in next item
        Animated.parallel([
          Animated.spring(productTranslateY, {
            toValue: 0,
            friction: 7,
            tension: 50,
            useNativeDriver: isNative,
          }),
          Animated.timing(productOpacity, {
            toValue: 1,
            duration: 240,
            useNativeDriver: isNative,
          }),
          Animated.spring(productScale, {
            toValue: 1,
            friction: 7,
            useNativeDriver: isNative,
          }),
        ]).start();
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [productTranslateY, productOpacity, productScale, isNative]);

  // Cycle catchy prefix smoothly every 4.8s
  useEffect(() => {
    const prefixInterval = setInterval(() => {
      Animated.parallel([
        Animated.timing(prefixOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: isNative,
        }),
        Animated.timing(prefixTranslateY, {
          toValue: -6,
          duration: 200,
          useNativeDriver: isNative,
        }),
      ]).start(() => {
        setPrefixIndex((prev) => (prev + 1) % CATCHY_PREFIXES.length);
        prefixTranslateY.setValue(6);
        Animated.parallel([
          Animated.timing(prefixOpacity, {
            toValue: 1,
            duration: 240,
            useNativeDriver: isNative,
          }),
          Animated.timing(prefixTranslateY, {
            toValue: 0,
            duration: 240,
            useNativeDriver: isNative,
          }),
        ]).start();
      });
    }, 4800);

    return () => clearInterval(prefixInterval);
  }, [prefixOpacity, prefixTranslateY, isNative]);

  // Subtle live pulse for the lightning / beacon
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: isNative,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: isNative,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseScale, isNative]);

  const isDarkStoreActive = currentTab === 'DARK_STORE';
  const currentItem = DARK_STORE_SHOWCASE_ITEMS[productIndex];
  // Next item in queue for stacked background look
  const nextItem =
    DARK_STORE_SHOWCASE_ITEMS[
      (productIndex + 1) % DARK_STORE_SHOWCASE_ITEMS.length
    ];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        width: '95%',
        maxWidth: 410,
        zIndex: 50,
      }}
    >
      {/* Floating 'Add to Cart' Icon Button - At Right End Above Bottom Navbar */}
      {currentTab !== 'CART' && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 74,
            right: 8,
            zIndex: 60,
            transform: [{ scale: bagScale }],
          }}
        >
          <AnimatedPressable
            onPress={() => onSelectTab('CART')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#FF5A1F',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.35)',
              shadowColor: '#FF5A1F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <ShoppingCart size={22} color="#FFFFFF" strokeWidth={2.3} />

            {totalBagCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: '#111111',
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                  borderWidth: 1.5,
                  borderColor: '#FFFFFF',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.35,
                  shadowRadius: 4,
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 9.5,
                    fontWeight: '900',
                  }}
                >
                  {totalBagCount}
                </Text>
              </View>
            )}
          </AnimatedPressable>
        </Animated.View>
      )}

      {/* Outer Floating Bar Container */}
      <View
        style={{
          width: '100%',
          height: 64,
          backgroundColor: '#111111',
          borderRadius: 32,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 8,
          paddingRight: 6,
          borderWidth: 1.2,
          borderColor: '#2A2A2A',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 12,
        }}
      >
        {/* Left Section: 3 Compact Nav Tabs */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            flex: 1,
            paddingRight: 6,
          }}
        >
          {REGULAR_TABS.map(({ id, label, Icon }) => {
            const isActive = currentTab === id;

            return (
              <AnimatedPressable
                key={id}
                onPress={() => onSelectTab(id)}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  minWidth: 44,
                }}
              >
                <View style={{ position: 'relative', alignItems: 'center' }}>
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    color={isActive ? '#FFFFFF' : '#888888'}
                  />

                  {/* Badge for Wishlist if > 0 */}
                  {id === 'WISHLIST' && wishlistCount > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -7,
                        backgroundColor: '#FF5A1F',
                        borderRadius: 7,
                        minWidth: 14,
                        height: 14,
                        paddingHorizontal: 2.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#111111',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900' }}>
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </Text>
                    </View>
                  )}

                  {/* Tab Label */}
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: isActive ? '800' : '600',
                      color: isActive ? '#FFFFFF' : '#888888',
                      marginTop: 2.5,
                      letterSpacing: 0.2,
                    }}
                  >
                    {label}
                  </Text>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <View
                      style={{
                        width: 3.5,
                        height: 3.5,
                        borderRadius: 2,
                        backgroundColor: '#FF5A1F',
                        marginTop: 2,
                      }}
                    />
                  )}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Right Section: The 'select DARK STORE' Banner Pill */}
        <AnimatedPressable
          onPress={() => onSelectTab('DARK_STORE')}
          style={{
            backgroundColor: isDarkStoreActive ? '#B3471A' : '#943813',
            height: 52,
            width: 148,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: isDarkStoreActive ? '#FFFFFF' : '#C45728',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 10,
            paddingRight: 6,
            shadowColor: '#FF5A1F',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkStoreActive ? 0.6 : 0.25,
            shadowRadius: 8,
            elevation: 8,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Subtle Warm Gradient Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            }}
          />

          {/* Left Text Column */}
          <View style={{ flex: 1, justifyContent: 'center', zIndex: 2 }}>
            {/* Catchy Prefix (e.g. 'select' / 'express') */}
            <Animated.View
              style={{
                opacity: prefixOpacity,
                transform: [{ translateY: prefixTranslateY }],
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.serifItalic,
                  fontStyle: 'italic',
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  lineHeight: 15,
                }}
              >
                {CATCHY_PREFIXES[prefixIndex]}
              </Text>

              {/* Pulsing Lightning Bolt Feature Icon */}
              <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
                <Zap size={9.5} color="#FFD700" fill="#FFD700" />
              </Animated.View>
            </Animated.View>

            {/* Mandatory Main Line: DARK STORE */}
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '900',
                color: '#FFE2D1',
                letterSpacing: 0.9,
                textTransform: 'uppercase',
                marginTop: 1,
              }}
            >
              DARK STORE
            </Text>

            {/* Micro Delivery Tag */}
            <Text
              style={{
                fontSize: 7.5,
                fontWeight: '800',
                color: 'rgba(255, 255, 255, 0.85)',
                letterSpacing: 0.5,
                marginTop: 0.5,
              }}
            >
              {selectedDarkStore ? `${selectedDarkStore.deliveryMinutes}M DROP` : '18M DROP'}
            </Text>
          </View>

          {/* Right Column: Animated Multi-Product Showcase */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              backgroundColor: 'rgba(0, 0, 0, 0.28)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            {/* Background stacked item peek (giving the "multiple ones" look) */}
            <View
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 22,
                height: 22,
                borderRadius: 6,
                opacity: 0.45,
                overflow: 'hidden',
              }}
            >
              <LazyImage
                source={nextItem.image}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>

            {/* Foreground Animated Cycling Item */}
            <Animated.View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#1E1E1E',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.35)',
                transform: [
                  { translateY: productTranslateY },
                  { scale: productScale },
                ],
                opacity: productOpacity,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <LazyImage
                source={currentItem.image}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </Animated.View>

            {/* Live Indicator Dot in corner */}
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#4ADE80',
                borderWidth: 1,
                borderColor: '#111111',
              }}
            />
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
});
