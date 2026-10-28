import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Fonts, FontStyles } from '@/constants/theme';

export type BrandTextVariant =
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'price'
  | 'badge'
  | 'caption'
  | 'meta'
  | 'serif'
  | 'serifRegular'
  | 'serifMedium'
  | 'serifSemiBold'
  | 'serifBold'
  | 'serifItalic'
  | 'mono';

export interface BrandTextProps extends TextProps {
  variant?: BrandTextVariant;
}

/**
 * BrandText provides unified typography across iOS, Android, and Web.
 * It eliminates font fallback mismatches by mapping each variant to
 * verified loaded fonts and clean platform weight styles.
 */
export const BrandText = React.forwardRef<Text, BrandTextProps>(function BrandText(
  { variant = 'regular', style, children, className, ...props },
  ref
) {
  const variantStyle = variantStyles[variant] || variantStyles.regular;
  const isSerif = variant.startsWith('serif');

  return (
    <Text
      ref={ref}
      className={`${isSerif ? 'font-serif editorial-text ' : ''}${className || ''}`}
      style={[variantStyle, style]}
      {...props}
    >
      {children}
    </Text>
  );
});

const variantStyles = StyleSheet.create({
  regular: {
    ...FontStyles.sansRegular,
    fontSize: 14,
    color: '#111111',
  },
  medium: {
    ...FontStyles.sansMedium,
    fontSize: 14,
    color: '#111111',
  },
  semibold: {
    ...FontStyles.sansSemiBold,
    fontSize: 14,
    color: '#111111',
  },
  bold: {
    ...FontStyles.sansBold,
    fontSize: 14,
    color: '#111111',
  },
  extrabold: {
    ...FontStyles.sansExtraBold,
    fontSize: 14,
    color: '#111111',
  },
  price: {
    ...FontStyles.sansBold,
    fontSize: 15,
    letterSpacing: -0.3,
    color: '#111111',
  },
  badge: {
    ...FontStyles.sansBold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    ...FontStyles.sansMedium,
    fontSize: 11,
    color: '#6B6667',
  },
  meta: {
    ...FontStyles.sansRegular,
    fontSize: 12,
    color: '#71717A',
    lineHeight: 16,
  },
  serif: {
    ...FontStyles.serifSemiBold,
    color: '#111111',
  },
  serifRegular: {
    ...FontStyles.serifRegular,
    color: '#111111',
  },
  serifMedium: {
    ...FontStyles.serifMedium,
    color: '#111111',
  },
  serifSemiBold: {
    ...FontStyles.serifSemiBold,
    color: '#111111',
  },
  serifBold: {
    ...FontStyles.serifBold,
    color: '#111111',
  },
  serifItalic: {
    ...FontStyles.serifItalic,
    color: '#111111',
  },
  mono: {
    ...FontStyles.mono,
    fontSize: 12,
    color: '#111111',
  },
});
