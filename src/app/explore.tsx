import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShopByCategoryView } from '@/components/categories/shop-by-category-view';
import { BottomNavBar } from '@/components/home/bottom-nav-bar';
import { DEFAULT_PRODUCTS } from '@/data/homeData';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7', paddingTop: Math.max(insets.top, 8) }}>
      <ShopByCategoryView
        isStandaloneScreen={true}
        products={DEFAULT_PRODUCTS}
      />
      <BottomNavBar activeTab="categories" />
    </View>
  );
}
