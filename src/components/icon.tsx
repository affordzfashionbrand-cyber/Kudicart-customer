import React from 'react';
import { Text, StyleProp, TextStyle, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Zap,
  BadgeCheck,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Ruler,
  Info,
  Store,
  Compass,
  LayoutGrid,
  User,
  Bell,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShoppingCart,
  ShoppingBag,
  Camera,
  Heart,
  Landmark,
  Layers,
  Sparkles,
} from 'lucide-react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
}

const LUCIDE_WEB_MAP: Record<string, React.ComponentType<any>> = {
  bolt: Zap,
  verified: BadgeCheck,
  published_with_changes: RefreshCw,
  sync: RefreshCw,
  shield: ShieldCheck,
  tune: SlidersHorizontal,
  close: X,
  straighten: Ruler,
  info: Info,
  storefront: Store,
  explore: Compass,
  grid_view: LayoutGrid,
  person: User,
  notifications: Bell,
  star: Star,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  arrow_forward: ArrowRight,
  add_shopping_cart: ShoppingCart,
  shopping_bag: ShoppingBag,
  photo_camera: Camera,
  camera_alt: Camera,
  favorite_border: Heart,
  account_balance: Landmark,
  filter_none: Layers,
  styler: Sparkles,
};

// Special overrides for icon names if MaterialIcons name differs from Google Material Symbols
const NAME_MAP: { [key: string]: keyof typeof MaterialIcons.glyphMap } = {
  styler: 'style',
  favorite_border: 'favorite-border',
  published_with_changes: 'cached',
  grid_view: 'grid-view',
  account_balance: 'account-balance',
  chevron_right: 'chevron-right',
  chevron_left: 'chevron-left',
  arrow_forward: 'arrow-forward',
  add_shopping_cart: 'add-shopping-cart',
  shopping_bag: 'shopping-bag',
  photo_camera: 'photo-camera',
  camera_alt: 'camera-alt',
  filter_none: 'filter-none',
  bolt: 'bolt',
  verified: 'verified',
  shield: 'security',
  tune: 'tune',
  close: 'close',
  straighten: 'straighten',
  info: 'info',
  storefront: 'storefront',
  explore: 'explore',
  person: 'person',
  notifications: 'notifications',
  sync: 'sync',
  star: 'star',
};

export function Icon({
  name,
  size = 24,
  color = '#111111',
  className = '',
  style,
}: IconProps) {
  // On Web, render crisp Lucide SVGs directly so @expo/vector-icons never triggers
  // ExpoFontLoader.web.js's 12s "material" font network/CORS timeout.
  if (Platform.OS === 'web') {
    const LucideComp = LUCIDE_WEB_MAP[name];
    if (LucideComp) {
      return <LucideComp size={size} color={color} style={style as any} />;
    }
    return (
      <Text
        className={`material-symbols-outlined ${className}`}
        style={[{ fontSize: size, color }, style]}
      >
        {name}
      </Text>
    );
  }

  // Native (iOS / Android): use bundled MaterialIcons glyph map
  const mappedName = (NAME_MAP[name] || name.replace(/_/g, '-')) as keyof typeof MaterialIcons.glyphMap;
  if (MaterialIcons.glyphMap[mappedName]) {
    return (
      <MaterialIcons
        name={mappedName}
        size={size}
        color={color}
        className={className}
        style={style}
      />
    );
  }

  return (
    <MaterialIcons
      name="circle"
      size={Math.max(8, Math.round(size * 0.5))}
      color={color}
      className={className}
      style={style}
    />
  );
}
