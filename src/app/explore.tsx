import React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShopByCategoryView } from '@/components/categories/shop-by-category-view';
import { BottomNavBar } from '@/components/home/bottom-nav-bar';
import { DEFAULT_PRODUCTS } from '@/data/homeData';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 440);

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.phoneContainer, { maxWidth: effectiveWidth, paddingTop: Math.max(insets.top, 8) }]}>
        <ShopByCategoryView
          isStandaloneScreen={true}
          products={DEFAULT_PRODUCTS}
        />
        <BottomNavBar activeTab="categories" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FDFBF7',
    position: 'relative',
    overflow: 'hidden',
  },
});
