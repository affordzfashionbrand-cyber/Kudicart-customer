import React from 'react';
import { Text, Platform, StyleProp, TextStyle } from 'react-native';
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
