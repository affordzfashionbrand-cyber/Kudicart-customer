import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/icon';

export function Footer() {
  return (
    <View style={styles.container}>
      {/* Trust Guarantee Pods */}
      <View style={styles.trustGrid}>
        <View style={styles.trustCard}>
          <View style={styles.trustIconWrap}>
            <Icon name="bolt" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.trustTitle}>35-Min Express Drop</Text>
          <Text style={styles.trustDesc}>
            Hyperlocal delivery from neighborhood fashion hubs
          </Text>
        </View>

        <View style={styles.trustCard}>
          <View style={styles.trustIconWrap}>
            <Icon name="verified" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.trustTitle}>10-Min Doorstep Fit</Text>
          <Text style={styles.trustDesc}>
            Try before you finalize with courier waiting
          </Text>
        </View>

        <View style={styles.trustCard}>
          <View style={styles.trustIconWrap}>
            <Icon name="published_with_changes" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.trustTitle}>Instant UPI Refunds</Text>
          <Text style={styles.trustDesc}>
            Zero hassle returns credited back in 60 seconds
          </Text>
        </View>

        <View style={styles.trustCard}>
          <View style={styles.trustIconWrap}>
            <Icon name="shield" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.trustTitle}>Authentic Drops Only</Text>
          <Text style={styles.trustDesc}>
            Direct brand and designer archive certifications
          </Text>
        </View>
      </View>

      {/* Brand Mission */}
      <View style={styles.brandRow}>
        <Image
          source={require('@/assets/images/logo-removebg-preview.png')}
          style={styles.logo}
          contentFit="contain"
          transition={150}
        />
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.brandTitle}>AFFORDZ</Text>
            <Text style={[styles.brandTitle, { color: '#FF5A1F' }]}>.</Text>
          </View>
          <Text style={styles.brandTagline}>
            CURATED ATELIERS. 18-MIN DOORSTEP TRY & BUY.
          </Text>
        </View>
      </View>

      {/* Footer Navigation Columns */}
      <View style={styles.columnsContainer}>
        {/* SHOP COLUMN */}
        <View style={styles.navColumn}>
          <Text style={styles.columnTitle}>SHOP</Text>
          {['Men', 'Women', 'Kids', 'Beauty', 'Footwear', 'Accessories'].map(
            (item, idx) => (
              <TouchableOpacity key={idx} style={styles.linkRow}>
                <Text style={styles.linkText}>{item}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* HELP COLUMN */}
        <View style={styles.navColumn}>
          <Text style={styles.columnTitle}>HELP</Text>
          {[
            'Track Order',
            'Shipping Policy',
            'Returns & Refunds',
            'Size Guide',
            'Customer FAQs',
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.linkRow}>
              <Text style={styles.linkText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ABOUT COLUMN */}
        <View style={styles.navColumn}>
          <Text style={styles.columnTitle}>AFFORDZ</Text>
          {[
            'About Us',
            'Artisan Network',
            'Express Hubs',
            'Careers',
            'Privacy Policy',
            'Terms of Service',
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.linkRow}>
              <Text style={styles.linkText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Social Media Links */}
      <View style={styles.socialRow}>
        <Text style={styles.socialLabel}>CONNECT WITH US</Text>
        <View style={styles.socialIcons}>
          {['Instagram', 'Facebook', 'YouTube', 'LinkedIn'].map((platform, idx) => (
            <TouchableOpacity key={idx} style={styles.socialPill}>
              <Text style={styles.socialText}>{platform}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Copyright Strip */}
      <View style={styles.copyrightStrip}>
        <Text style={styles.copyrightText}>
          © 2026 Affordz Technologies Pvt Ltd. All rights reserved. Handcrafted with pride across India.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#353335',
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  trustCard: {
    width: '48%',
    backgroundColor: '#1C1B1C',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#353335',
  },
  trustIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trustTitle: {
    color: '#F7F7F5',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  trustDesc: {
    color: '#D9D9D5',
    fontSize: 10,
    lineHeight: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#353335',
    marginBottom: 20,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F7F7F5',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 10,
    color: '#D9D9D5',
    marginTop: 2,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navColumn: {
    flex: 1,
  },
  columnTitle: {
    color: '#F7F7F5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  linkRow: {
    paddingVertical: 4,
  },
  linkText: {
    color: '#D9D9D5',
    fontSize: 11.5,
  },
  socialRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#353335',
    marginBottom: 20,
  },
  socialLabel: {
    color: '#6B6667',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  socialIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialPill: {
    backgroundColor: '#1C1B1C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#353335',
  },
  socialText: {
    color: '#F7F7F5',
    fontSize: 10.5,
    fontWeight: '700',
  },
  copyrightStrip: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#353335',
  },
  copyrightText: {
    color: '#6B6667',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
