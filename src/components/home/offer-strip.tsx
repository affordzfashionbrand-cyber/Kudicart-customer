import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@/components/icon';

interface OfferStripProps {
  onPress?: () => void;
}

export function OfferStrip({ onPress }: OfferStripProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.container}
      >
        {/* Bank Logo / Badge */}
        <View style={styles.bankBadge}>
          <Icon name="account_balance" size={16} color="#ffffff" />
          <Text style={styles.bankBadgeText}>HDFC BANK</Text>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>10% INSTANT DISCOUNT*</Text>
          <Text style={styles.subtitle}>
            With HDFC Bank EasyEMI & Credit Cards • Min spend ₹1,999
          </Text>
        </View>

        {/* Action Icon */}
        <View style={styles.chevronWrap}>
          <Icon name="chevron_right" size={20} color="#71717a" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F7F5',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
    borderWidth: 1,
    borderColor: '#D9D9D5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  bankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bankBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1b1b1e',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 1,
  },
  chevronWrap: {
    padding: 2,
  },
});
