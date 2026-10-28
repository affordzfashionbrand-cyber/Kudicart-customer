import React from 'react';
import { View, Text, TextStyle, StyleProp } from 'react-native';
import { Fonts, FontStyles } from '@/constants/theme';

export function splitEditorial(rawText: string): { first: string; second: string } {
  if (!rawText) return { first: '', second: '' };
  const words = rawText.trim().split(/\s+/);
  if (words.length <= 1) {
    return { first: '', second: words[0].toLowerCase() };
  }
  const first = words.slice(0, -1).join(' ');
  const second = words[words.length - 1].toLowerCase();
  return { first, second };
}

export interface EditorialTextProps {
  first?: string;
  second?: string;
  text?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  singleLine?: boolean;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  withDot?: boolean;
}

export const EditorialText = React.memo(function EditorialText({
  first: customFirst,
  second: customSecond,
  text: rawText,
  fontSize = 32,
  lineHeight,
  color = '#111111',
  singleLine = false,
  align = 'left',
  style,
  numberOfLines,
  withDot = true,
}: EditorialTextProps) {
  let first = customFirst || '';
  let second = customSecond || '';

  if (!customFirst && !customSecond && rawText) {
    const split = splitEditorial(rawText);
    first = split.first;
    second = split.second;
  }

  const secondFormatted = second
    ? withDot
      ? second.endsWith('.')
        ? second
        : `${second}.`
      : second.replace(/\.$/, '')
    : '';

  const effectiveLineHeight = lineHeight || Math.round(fontSize * 1.08);

  return (
    <Text
      numberOfLines={numberOfLines}
      className="font-serif editorial-text"
      style={[
        {
          fontFamily: Fonts.serifSemiBold,
          fontSize,
          lineHeight: effectiveLineHeight,
          letterSpacing: -0.5,
          color,
          textAlign: align,
        },
        style,
      ]}
    >
      {first ? (
        <Text style={FontStyles.serifRegular}>
          {first}
        </Text>
      ) : null}
      {first && secondFormatted ? (singleLine ? ' ' : '\n') : null}
      {secondFormatted ? (
        <Text
          style={[
            FontStyles.serifSemiBold,
            {
              color,
            },
          ]}
        >
          {secondFormatted}
        </Text>
      ) : null}
    </Text>
  );
});

export interface SectionTitleProps {
  label?: string;
  title?: string;
  firstLine?: string;
  secondLine?: string;
  align?: 'left' | 'center';
  inverted?: boolean;
  marginBottom?: number;
  fontSize?: number;
  lineHeight?: number;
  singleLine?: boolean;
}

export const SectionTitle = React.memo(function SectionTitle({
  label,
  title,
  firstLine: customFirst,
  secondLine: customSecond,
  align = 'left',
  inverted = false,
  marginBottom = 20,
  fontSize = 34,
  lineHeight,
  singleLine = false,
}: SectionTitleProps) {
  let firstLine = customFirst || '';
  let secondLine = customSecond || '';

  if (!customFirst && title) {
    const words = title.trim().split(/\s+/);
    firstLine = words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
    secondLine = words.length > 1 ? words[words.length - 1] : '';
  }

  const secondLineFormatted = secondLine
    ? secondLine.endsWith('.')
      ? secondLine
      : `${secondLine}.`
    : '';

  const textColor = inverted ? '#ffffff' : '#000000';
  const labelColor = inverted ? 'rgba(255, 255, 255, 0.65)' : '#888888';
  const effectiveLineHeight = lineHeight || Math.round(fontSize * 1.06);

  return (
    <View style={{ marginBottom, alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {label ? (
        <Text
          style={[
            FontStyles.sansBold,
            {
              fontSize: 11,
              letterSpacing: 2.5,
              color: labelColor,
              textTransform: 'uppercase',
              marginBottom: 8,
              textAlign: align,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <Text
        className="font-serif editorial-text"
        style={[
          {
            fontFamily: Fonts.serifSemiBold,
            fontSize,
            lineHeight: effectiveLineHeight,
            letterSpacing: -0.5,
            color: textColor,
            textAlign: align,
          },
        ]}
      >
        <Text style={FontStyles.serifRegular}>{firstLine}</Text>
        {secondLineFormatted ? (
          <>
            {singleLine ? ' ' : '\n'}
            <Text
              style={[
                FontStyles.serifSemiBold,
                {
                  color: textColor,
                },
              ]}
            >
              {secondLineFormatted}
            </Text>
          </>
        ) : null}
      </Text>
    </View>
  );
});
