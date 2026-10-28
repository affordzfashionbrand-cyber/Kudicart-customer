import React from 'react';
import { View, Text } from 'react-native';
import { Heart, ShoppingCart, Zap } from 'lucide-react-native';
import { LazyImage } from './lazy-image';
import { AnimatedPressable } from './animated-pressable';
import { EditorialText } from './section-title';
import { formatPrice } from '@/data/homeData';

export interface ProductCardProps {
  product: any;
  wished?: boolean;
  onWishlist: (id: string | number) => void;
  onBag: (id: string | number) => void;
  onOpen?: (product: any) => void;
  badge?: string;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  wished = false,
  onWishlist,
  onBag,
  onOpen,
  badge,
}: ProductCardProps) {
  const title = product.name || product.title;
  const imageUri = product.image || (Array.isArray(product.images) ? product.images[0] : null);
  const formattedPrice = typeof product.price === 'number' ? formatPrice(product.price) : product.price;

  return (
    <AnimatedPressable
      className="w-full"
      scaleTo={0.985}
      onPress={() => (onOpen ? onOpen(product) : onBag(product.id))}
    >
      {/* Double Bezel Card Shell */}
      <View className="p-[4px] bg-[#F4F1EA] border border-[#D9D9D5] rounded-[24px] mb-[16px]">
        <View className="relative bg-white rounded-[20px] aspect-[0.76] overflow-hidden">
          <LazyImage
            source={imageUri}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            priority="low"
          />

          {badge ? (
            <View className="absolute top-[10px] left-[10px] bg-[#111111]/95 px-[8px] py-[4px] rounded-[10px] flex-row items-center gap-[4px] border border-[#FF5A1F] z-10 shadow-sm">
              <Zap size={9} color="#FF5A1F" fill="#FF5A1F" />
              <Text className="text-white text-[9px] font-black tracking-wider uppercase">{badge}</Text>
            </View>
          ) : null}

          <AnimatedPressable
            className="absolute top-[12px] right-[12px] w-[34px] h-[34px] bg-white/90 backdrop-blur-md rounded-full justify-center items-center shadow-sm"
            scaleTo={0.9}
            hitSlop={8}
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
        <Text className="text-[9px] text-[#71717A] tracking-[0.18em] font-medium mb-[5px] uppercase">
          {product.brand}
        </Text>
        <EditorialText
          text={title}
          fontSize={13.5}
          lineHeight={17}
          color="#111111"
          singleLine={true}
          numberOfLines={1}
          style={{ marginBottom: 6 }}
        />
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-[14px] font-black text-[#111111]">{formattedPrice}</Text>
            {product.old ? (
              <Text className="text-[11px] text-[#A1A1AA] line-through font-normal">
                {formatPrice(product.old)}
              </Text>
            ) : null}
          </View>
          <AnimatedPressable
            className="w-[30px] h-[30px] rounded-full bg-[#111111] justify-center items-center"
            scaleTo={0.88}
            hitSlop={8}
            onPress={(e) => {
              e?.stopPropagation?.();
              onBag(product.id);
            }}
          >
            <ShoppingCart size={14} color="#ffffff" strokeWidth={2.2} />
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedPressable>
  );
});
