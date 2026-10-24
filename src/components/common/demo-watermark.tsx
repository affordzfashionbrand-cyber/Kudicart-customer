import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function DemoWatermark() {
  const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';
  const insets = useSafeAreaInsets();

  if (isProduction) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { top: Platform.OS === 'android' ? Math.max(insets.top, 8) : Math.max(insets.top - 4, 4) },
      ]}
    >
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.text}>SIMULATED DEMO MODE — TEST DATA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5A1F',
    marginRight: 6,
  },
  text: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF7ED',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'web' ? 'Plus Jakarta Sans, sans-serif' : undefined,
  },
});
