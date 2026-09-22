import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TopHeader } from '@/components/top-header';
import { BottomNav } from '@/components/bottom-nav';
import { Icon } from '@/components/icon';
import { PRODUCTS, Product } from '@/data/products';

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const categoryName = (id || 'Kurtis').toLowerCase();

  // Filter products by category or return all if 'all'
  const categoryProducts: Product[] =
    categoryName === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p: Product) => p.category === categoryName || p.id === 'p1');

  const displayTitle =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const [wishlistItems, setWishlistItems] = useState<{ [key: string]: boolean }>({});
  const [cartCount, setCartCount] = useState(3);

  const toggleWishlist = (pId: string) => {
    setWishlistItems((prev) => ({ ...prev, [pId]: !prev[pId] }));
  };

  return (
    <View className="flex-1 bg-surface relative">
      <TopHeader subtitle={`${displayTitle} Collection`} />

      <ScrollView
        className="flex-1 px-4 pt-3 pb-28"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title Bar */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push('/')}
              activeOpacity={0.8}
              className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center"
            >
              <Icon name="arrow_back" size={20} color="#1b1b1e" />
            </TouchableOpacity>
            <View>
              <Text className="font-headline-lg-mobile text-[22px] text-on-surface font-extrabold tracking-tight">
                {displayTitle}
              </Text>
              <Text className="font-body-sm text-[12px] text-on-surface-variant">
                {categoryProducts.length} items ready for 35-min delivery
              </Text>
            </View>
          </View>

          <TouchableOpacity className="flex flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-white shadow-xs">
            <Icon name="tune" size={16} color="#b80035" />
            <Text className="font-label-md text-[12px] text-primary font-bold">
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Grid (2 Columns Flex) */}
        <View className="flex flex-row flex-wrap justify-between gap-y-3.5 my-1">
          {categoryProducts.map((p: Product) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => router.push(`/product/${p.id}` as any)}
              activeOpacity={0.9}
              className="w-[48%] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xs overflow-hidden"
            >
              <View className="relative w-full aspect-[4/5] bg-surface-container-high overflow-hidden">
                <Image
                  source={{ uri: p.images[0] }}
                  className="w-full h-full object-cover"
                />
                <View className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  <Text className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary font-label-eyebrow text-[9px] font-extrabold uppercase">
                    {p.badge || `${p.discountPercentage}% OFF`}
                  </Text>
                  {p.stockBadge && (
                    <Text className="px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-label-eyebrow text-[9px] font-bold">
                      {p.stockBadge}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p.id);
                  }}
                  activeOpacity={0.8}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center z-10"
                >
                  <Icon
                    name={wishlistItems[p.id] ? 'favorite' : 'favorite_border'}
                    size={16}
                    color={wishlistItems[p.id] ? '#b80035' : '#5c3f40'}
                  />
                </TouchableOpacity>
              </View>

              <View className="p-2.5 flex flex-col justify-between flex-1">
                <View>
                  <View className="flex flex-row items-center justify-between mb-0.5">
                    <Text className="font-label-eyebrow text-[10px] uppercase text-primary font-bold">
                      {p.brand}
                    </Text>
                    <View className="flex flex-row items-center gap-0.5">
                      <Icon name="star" size={12} color="#f59e0b" />
                      <Text className="font-label-md text-[11px] font-bold text-on-surface">
                        {p.rating}
                      </Text>
                    </View>
                  </View>
                  <Text
                    numberOfLines={1}
                    className="font-title-md text-[14px] text-on-surface font-bold"
                  >
                    {p.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="font-body-sm text-[11px] text-on-surface-variant mt-0.5"
                  >
                    {p.subtitle}
                  </Text>
                </View>

                <View className="pt-2">
                  <View className="flex flex-row items-baseline gap-1.5">
                    <Text className="font-headline-sm text-[16px] text-primary font-extrabold">
                      ₹{p.price.toLocaleString()}
                    </Text>
                    <Text className="font-body-sm text-[11px] text-on-surface-variant line-through">
                      ₹{p.originalPrice.toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(`/product/${p.id}` as any)}
                    activeOpacity={0.8}
                    className="w-full mt-2 py-2 px-2 rounded-xl bg-primary-container flex flex-row items-center justify-center gap-1"
                  >
                    <Icon name="shopping_bag" size={15} color="#ffffff" />
                    <Text className="text-white font-label-md text-[12px] font-bold">
                      View Item
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNav cartCount={cartCount} />
    </View>
  );
}
