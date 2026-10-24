import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/icon';

interface PromoBannerProps {
  onPress?: () => void;
}

export function PromoBanner({ onPress }: PromoBannerProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.container}
      >
        {/* Background Image */}
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
          }}
          style={styles.bgImage}
          resizeMode="cover"
        />

        {/* Gradient Scrim */}
        <View style={styles.scrim} />

        {/* Content Box */}
        <View style={styles.contentBox}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>DROP_04 • LIMITED EDITORIAL</Text>
          </View>

          <Text style={styles.title}>URBAN EDITORIAL.</Text>
          <Text style={styles.subtitle}>
            High-contrast monochrome & structural silhouettes. Delivered now with 10-min doorstep fitting.
          </Text>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>ORDER. CHANGE. GO.</Text>
            <Icon name="arrow_forward" size={14} color="#111111" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F7F7F5',
  },
  container: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 17, 17, 0.72)',
  },
  contentBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: '85%',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#F7F7F5',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#D9D9D5',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  ctaText: {
    color: '#111111',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
