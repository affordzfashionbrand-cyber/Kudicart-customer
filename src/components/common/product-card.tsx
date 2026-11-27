import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Heart, ShoppingCart, Zap, ShoppingBag, Check } from 'lucide-react-native';
import { LazyImage } from './lazy-image';
import { AnimatedPressable } from './animated-pressable';
import { EditorialText } from './section-title';
import { formatPrice } from '@/data/homeData';

export interface ProductCardProps {
  product: any;
  wished?: boolean;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number, size?: string) => void;
  onOpen?: (product: any) => void;
  badge?: string;
  sizes?: string[];
  selectedSize?: string;
  onSelectSize?: (id: string | number, size: string) => void;
  isAddedToBag?: boolean;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  wished = false,
  onWishlist,
  onBag,
  onOpen,
  badge,
  sizes,
  selectedSize,
  onSelectSize,
  isAddedToBag = false,
}: ProductCardProps) {
  const title = product.name || product.title;
  const imageUri =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) ||
    (Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? product.galleryImages[0]
      : null);
  const formattedPrice = typeof product.price === 'number' ? formatPrice(product.price) : product.price;
  const availableSizes = Array.isArray(sizes) && sizes.length > 0
    ? sizes
    : Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : [];
  const activeSize = selectedSize || availableSizes[0] || undefined;
  const resolvedBadge = badge || (product.fulfillmentType === 'DARK_STORE' ? '19M DROP' : undefined);
  const handleOpen = () => (onOpen ? onOpen(product) : onBag(product.id, activeSize));

  return (
    <View className="w-full">
      {/* Double Bezel Card Shell */}
      <View className="p-[4px] bg-[#F4F1EA] border border-[#D9D9D5] rounded-[24px] mb-[12px]">
        <View className="relative bg-[#F4F1EA] rounded-[20px] aspect-[0.76] overflow-hidden">
          <AnimatedPressable
            containerStyle={StyleSheet.absoluteFill}
            style={StyleSheet.absoluteFill}
            scaleTo={0.985}
            onPress={handleOpen}
          >
            {imageUri ? (
              <LazyImage
                source={imageUri}
                containerStyle={StyleSheet.absoluteFill}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                priority="low"
              />
            ) : (
              <View
                style={StyleSheet.absoluteFill}
                className="items-center justify-center bg-[#F4F1EA]"
              >
                <ShoppingBag size={28} color="#A1A1AA" />
              </View>
            )}
          </AnimatedPressable>

          {resolvedBadge ? (
            <View
              pointerEvents="none"
              className="absolute top-[10px] left-[10px] bg-[#111111]/95 px-[8px] py-[4px] rounded-[10px] flex-row items-center gap-[4px] border border-[#FF5A1F] z-10 shadow-sm"
            >
              <Zap size={9} color="#FF5A1F" fill="#FF5A1F" />
              <Text className="font-sans text-white text-[9px] font-black tracking-wider uppercase">{resolvedBadge}</Text>
            </View>
          ) : null}

          <AnimatedPressable
            containerStyle={{ position: 'absolute', top: 10, right: 10, zIndex: 30 }}
            className="w-[36px] h-[36px] bg-white/95 rounded-full justify-center items-center shadow-sm border border-[#E8E5DF]"
            scaleTo={0.88}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={(e) => {
              e?.stopPropagation?.();
              onWishlist(product.id);
            }}
          >
            <Heart size={18} color={wished ? '#EF4444' : '#111111'} fill={wished ? '#EF4444' : 'none'} />
          </AnimatedPressable>
        </View>
      </View>

      <View className="px-2">
        <Pressable onPress={handleOpen}>
          <Text className="font-sans text-[9px] text-[#71717A] tracking-[0.18em] font-medium mb-[4px] uppercase" numberOfLines={1}>
            {product.brand}
          </Text>
          <EditorialText
            text={title}
            fontSize={13.5}
            lineHeight={17}
            color="#111111"
            singleLine={true}
            numberOfLines={1}
            style={{ marginBottom: onSelectSize && availableSizes.length > 0 ? 6 : 6 }}
          />
        </Pressable>

        {onSelectSize && availableSizes.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {availableSizes.slice(0, 5).map((sz: string) => {
              const isSelected = activeSize === sz;
              return (
                <Pressable
                  key={sz}
                  onPress={() => onSelectSize(product.id, sz)}
                  hitSlop={4}
                  style={{
                    minWidth: 24,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 6,
                    backgroundColor: isSelected ? '#111111' : '#F4F1EA',
                    borderWidth: 1,
                    borderColor: isSelected ? '#111111' : '#D9D9D5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 9.5, fontWeight: '800', color: isSelected ? '#FFFFFF' : '#353335' }}>
                    {sz}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="flex-row justify-between items-center">
          <Pressable onPress={handleOpen} style={{ flex: 1, marginRight: 8 }}>
            <View className="flex-row items-baseline gap-1.5 flex-wrap">
              <Text className="font-sans text-[14px] font-black text-[#111111]">{formattedPrice}</Text>
              {product.old && Number(product.old) > Number(product.price) ? (
                <Text className="font-sans text-[11px] text-[#A1A1AA] line-through font-normal">
                  {formatPrice(product.old)}
                </Text>
              ) : null}
            </View>
          </Pressable>
          <AnimatedPressable
            className="w-[32px] h-[32px] rounded-full justify-center items-center"
            style={{ backgroundColor: isAddedToBag ? '#22C55E' : '#111111' }}
            scaleTo={0.88}
            hitSlop={8}
            onPress={(e) => {
              e?.stopPropagation?.();
              onBag(product.id, activeSize);
            }}
          >
            {isAddedToBag ? (
              <Check size={14} color="#ffffff" strokeWidth={2.6} />
            ) : (
              <ShoppingCart size={14} color="#ffffff" strokeWidth={2.2} />
            )}
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
});
