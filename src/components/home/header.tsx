import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/icon';

interface HeaderProps {
  wishlistCount: number;
  cartCount: number;
  onWishlistPress?: () => void;
  onCartPress?: () => void;
  onLogoPress?: () => void;
}

export function Header({
  wishlistCount,
  cartCount,
  onWishlistPress,
  onCartPress,
  onLogoPress,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.mainBar}>
        {/* Brand Logo & Name */}
        <TouchableOpacity
          onPress={onLogoPress || (() => router.push('/'))}
          activeOpacity={0.8}
          style={styles.logoRow}
        >
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandKudi}>Affordz</Text>
            <View style={styles.expressDot} />
          </View>

          {/* Express Delivery Badge */}
          <View style={styles.expressBadge}>
            <Icon name="bolt" size={13} color="#FFFFFF" />
            <Text style={styles.expressBadgeText}>18M DROP</Text>
          </View>
        </TouchableOpacity>

        {/* Action Controls: Wishlist & Cart */}
        <View style={styles.actionsRow}>
          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={onWishlistPress}
            activeOpacity={0.7}
            style={styles.actionButton}
            accessibilityLabel="Wishlist"
          >
            <Icon
              name={wishlistCount > 0 ? 'favorite' : 'favorite_border'}
              size={24}
              color={wishlistCount > 0 ? '#FF5A1F' : '#111111'}
            />
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart Button */}
          <TouchableOpacity
            onPress={onCartPress || (() => router.push('/cart'))}
            activeOpacity={0.7}
            style={styles.actionButton}
            accessibilityLabel="Shopping Cart"
          >
            <Icon name="shopping_bag" size={24} color="#111111" />
            {cartCount > 0 && (
              <View style={[styles.badge, styles.cartBadge]}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F5',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D5',
    zIndex: 50,
  },
  mainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 11,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandKudi: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.5,
  },
  brandCart: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.5,
  },
  expressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5A1F',
    marginLeft: 3,
    marginBottom: 4,
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginLeft: 6,
  },
  expressBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F1EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D5',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF5A1F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cartBadge: {
    backgroundColor: '#FF5A1F',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
