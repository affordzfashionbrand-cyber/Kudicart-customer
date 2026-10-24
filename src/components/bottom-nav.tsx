import { Icon } from '@/components/icon';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

interface BottomNavProps {
  cartCount?: number;
}

export function BottomNav({ cartCount = 3 }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Determine active tab index:
  // 0: Catalog, 1: Orders, 2: Cart, 3: Support
  const getActiveIndex = () => {
    if (pathname === '/orders' || pathname === '/tracking') return 1;
    if (pathname === '/cart') return 2;
    if (pathname === '/support') return 3;
    return 0; // default Catalog
  };

  const activeIndex = getActiveIndex();
  const tabWidth = width / 4;
  const initialCenter = (activeIndex + 0.5) * tabWidth;

  // Animated position for the active circle and curve notch
  const animatedX = useRef(new Animated.Value(initialCenter)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetX = (activeIndex + 0.5) * tabWidth;

    // Animate horizontal slide with spring physics
    Animated.spring(animatedX, {
      toValue: targetX,
      useNativeDriver: false,
      bounciness: 6,
      speed: 14,
    }).start();

    // Subtle bounce/pop animation for the floating circle
    animatedScale.setValue(0.85);
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
      speed: 16,
    }).start();
  }, [activeIndex, tabWidth]);

  const navItems = [
    { name: 'storefront', label: 'Catalog', path: '/' },
    { name: 'receipt_long', label: 'Orders', path: '/orders' },
    { name: 'shopping_bag', label: 'Cart', path: '/cart', badge: cartCount },
    { name: 'support_agent', label: 'Support', path: '/support' },
  ];

  // SVG curved bar parameters
  const barHeight = 64;
  const notchRadius = 40; // width of scooped notch from center
  const notchDepth = 30; // depth of the concave dip
  const cornerRadius = 24; // top corner radius of the bar

  // Generate the curved path for the navbar notch around cx
  const generatePath = (cx: number) => {
    const p1 = Math.max(cornerRadius, cx - notchRadius);
    const p2 = Math.min(width - cornerRadius, cx + notchRadius);

    return [
      `M 0 ${cornerRadius}`,
      `Q 0 0 ${cornerRadius} 0`,
      `L ${p1} 0`,
      `C ${cx - 24} 0, ${cx - 26} ${notchDepth}, ${cx} ${notchDepth}`,
      `C ${cx + 26} ${notchDepth}, ${cx + 24} 0, ${p2} 0`,
      `L ${width - cornerRadius} 0`,
      `Q ${width} 0 ${width} ${cornerRadius}`,
      `L ${width} ${barHeight + insets.bottom}`,
      `L 0 ${barHeight + insets.bottom}`,
      `Z`,
    ].join(' ');
  };

  // State to force re-render SVG path on animated value change
  const [currentX, setCurrentX] = React.useState(initialCenter);

  useEffect(() => {
    const listenerId = animatedX.addListener(({ value }) => {
      setCurrentX(value);
    });
    return () => {
      animatedX.removeListener(listenerId);
    };
  }, [animatedX]);

  const circleSize = 56;

  return (
    <View
      style={[
        styles.container,
        {
          height: barHeight + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Curved SVG Background with Smooth Notch */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width={width}
          height={barHeight + insets.bottom}
          style={styles.svgShadow}
        >
          <Path
            d={generatePath(currentX)}
            fill="#ffffff"
          />
        </Svg>
      </View>

      {/* Floating Active Elevated Circle Button (Pinterest style) */}
      <Animated.View
        style={[
          styles.floatingCircle,
          {
            left: Animated.subtract(animatedX, circleSize / 2),
            transform: [{ scale: animatedScale }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.floatingCircleInner}>
          <Icon
            name={navItems[activeIndex].name}
            size={26}
            color="#ffffff"
          />
        </View>
      </Animated.View>

      {/* Tab Items Row */}
      <View style={[styles.tabsRow, { height: barHeight }]}>
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              {/* Only show inactive icon (active icon is inside the floating circle above) */}
              {!isActive ? (
                <View style={styles.iconContainer}>
                  <Icon
                    name={item.name}
                    size={24}
                    color="#6B6667"
                  />
                  {item.badge && item.badge > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                /* Invisible placeholder space to keep layout balanced */
                <View style={styles.activePlaceholder}>
                  {item.badge && item.badge > 0 ? (
                    <View style={[styles.badge, styles.activeBadge]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  svgShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 16,
      },
      default: {
        filter: 'drop-shadow(0px -4px 14px rgba(0,0,0,0.06))',
      },
    }),
  },
  floatingCircle: {
    position: 'absolute',
    top: -18,
    width: 56,
    height: 56,
    zIndex: 99,
  },
  floatingCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111111',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      default: {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activePlaceholder: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5A1F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  activeBadge: {
    top: 2,
    right: 4,
    zIndex: 100,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});
