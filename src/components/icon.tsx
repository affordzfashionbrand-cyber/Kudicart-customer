import React from 'react';
import { Text, StyleProp, TextStyle, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
}

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
  color,
  className = '',
  style,
}: IconProps) {
  // Check explicit override or replace underscores with hyphens
  const mappedName = (NAME_MAP[name] || name.replace(/_/g, '-')) as keyof typeof MaterialIcons.glyphMap;

  // If valid glyph in MaterialIcons, use vector icon for universal native & web compatibility
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

  // Fallback for native platforms so raw ligature text is never rendered
  if (Platform.OS !== 'web') {
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

  // Fallback for Web / Material Symbols Outlined font
  return (
    <Text
      className={`material-symbols-outlined ${className}`}
      style={[{ fontSize: size, color }, style]}
    >
      {name}
    </Text>
  );
}
