import React from 'react';
import { View } from 'react-native';
import { ProductItem } from '@/data/homeData';
import { ShopByCategoryView } from '@/components/categories/shop-by-category-view';

interface ShopViewProps {
  products?: ProductItem[];
  category?: string;
  setCategory?: (cat: string) => void;
  wishlist?: string[];
  onWishlist?: (id: string | number) => void;
  onBag?: (id: string | number) => void;
  onOpen?: (product: any) => void;
  maxPriceFilter?: number | null;
  onClearPriceFilter?: () => void;
  isLoading?: boolean;
}

export const ShopView = React.memo(function ShopView({
  products,
  wishlist,
  onWishlist,
  onBag,
  onOpen,
  isLoading = false,
}: ShopViewProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      <ShopByCategoryView
        isStandaloneScreen={false}
        products={products}
        wishlist={wishlist}
        onWishlist={onWishlist}
        onBag={onBag}
        onOpen={onOpen}
        isLoading={isLoading}
      />
    </View>
  );
});
