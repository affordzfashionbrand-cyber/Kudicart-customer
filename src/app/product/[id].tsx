import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TopHeader } from '@/components/top-header';
import { BottomNav } from '@/components/bottom-nav';
import { Icon } from '@/components/icon';
import { PRODUCTS, Product } from '@/data/products';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find product or fallback to first product
  const product: Product =
    PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] || 'M'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || 'Berry Crimson'
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  const handleAddToCart = () => {
    if (isAdded) {
      router.push('/cart');
      return;
    }
    setIsAdded(true);
    setCartCount((prev) => prev + 1);
  };

  const handleBuyNow = () => {
    if (!isAdded) {
      setCartCount((prev) => prev + 1);
    }
    router.push('/cart');
  };

  return (
    <View className="flex-1 bg-surface relative">
      <TopHeader subtitle="Product Details" />

      <ScrollView
        className="flex-1 pb-32"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Floating Bar over Image */}
        <View className="relative w-full aspect-[4/5] bg-surface-container-high">
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.images[0] }}
            className="w-full h-full object-cover"
          />

          {/* Overlays */}
          <View className="absolute top-3 left-3 right-3 flex flex-row items-center justify-between z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center"
            >
              <Icon name="arrow_back" size={20} color="#1b1b1e" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsWishlisted(!isWishlisted)}
              activeOpacity={0.8}
              className="w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center"
            >
              <Icon
                name={isWishlisted ? 'favorite' : 'favorite_border'}
                size={20}
                color={isWishlisted ? '#b80035' : '#1b1b1e'}
              />
            </TouchableOpacity>
          </View>

          {/* Badge overlays */}
          <View className="absolute bottom-3 left-3 flex flex-row items-center gap-2 z-10">
            <View className="px-2.5 py-1 rounded-lg bg-secondary-container">
              <Text className="text-white font-label-eyebrow text-[10px] font-extrabold uppercase">
                {product.badge || `${product.discountPercentage}% OFF`}
              </Text>
            </View>

            {product.stockBadge && (
              <View className="px-2.5 py-1 rounded-lg bg-tertiary-fixed flex flex-row items-center gap-1">
                <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                <Text className="font-label-eyebrow text-[10px] text-primary font-bold">
                  {product.stockBadge}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Thumbnail Selector if multiple images */}
        {product.images.length > 1 && (
          <View className="flex flex-row items-center gap-2 px-4 py-2 bg-white border-b border-surface-container-high">
            {product.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${
                  selectedImageIndex === idx ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image source={{ uri: img }} className="w-full h-full object-cover" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Main Details Section */}
        <View className="p-4 bg-white mb-3 shadow-xs">
          <View className="flex flex-row items-center justify-between mb-1">
            <Text className="font-label-eyebrow text-[11px] uppercase text-primary font-extrabold tracking-wider">
              {product.brand}
            </Text>
            <View className="flex flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50">
              <Icon name="star" size={14} color="#f59e0b" />
              <Text className="font-label-md text-[12px] font-bold text-on-surface">
                {product.rating}
              </Text>
              <Text className="font-body-sm text-[11px] text-on-surface-variant">
                ({product.reviewsCount} reviews)
              </Text>
            </View>
          </View>

          <Text className="font-headline-sm text-[20px] text-on-surface font-extrabold leading-tight">
            {product.title}
          </Text>
          <Text className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">
            {product.subtitle}
          </Text>

          {/* Pricing Row */}
          <View className="flex flex-row items-baseline gap-2 mt-3 pt-3 border-t border-surface-container-high">
            <Text className="font-headline-xl-mobile text-[24px] text-primary font-extrabold">
              ₹{product.price.toLocaleString()}
            </Text>
            <Text className="font-body-sm text-[13px] text-on-surface-variant line-through">
              ₹{product.originalPrice.toLocaleString()}
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-secondary-fixed">
              <Text className="font-label-eyebrow text-[10px] text-primary font-bold">
                Save ₹{(product.originalPrice - product.price).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Size Selection */}
        {product.sizes.length > 0 && (
          <View className="p-4 bg-white mb-3 shadow-xs">
            <View className="flex flex-row items-center justify-between mb-2">
              <Text className="font-title-md text-[14px] text-on-surface font-bold">
                Select Size
              </Text>
              <TouchableOpacity>
                <Text className="font-label-md text-[11px] text-primary font-bold">
                  Size Guide
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2 flex-wrap">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    activeOpacity={0.8}
                    className={`min-w-[44px] h-11 px-3 rounded-xl flex items-center justify-center border-2 ${
                      isSelected
                        ? 'border-primary bg-primary-fixed/20'
                        : 'border-surface-container-high bg-surface-container-low'
                    }`}
                  >
                    <Text
                      className={`font-label-lg text-[13px] font-bold ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Color Selection */}
        {product.colors.length > 0 && (
          <View className="p-4 bg-white mb-3 shadow-xs">
            <Text className="font-title-md text-[14px] text-on-surface font-bold mb-2">
              Select Color: <Text className="text-primary">{selectedColor}</Text>
            </Text>

            <View className="flex flex-row items-center gap-3">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <TouchableOpacity
                    key={color.name}
                    onPress={() => setSelectedColor(color.name)}
                    activeOpacity={0.8}
                    className={`flex flex-row items-center gap-2 px-3 py-1.5 rounded-full border-2 ${
                      isSelected
                        ? 'border-primary bg-primary-fixed/20'
                        : 'border-surface-container-high bg-surface-container-low'
                    }`}
                  >
                    <View
                      style={{ backgroundColor: color.hex }}
                      className="w-4 h-4 rounded-full border border-black/20"
                    />
                    <Text
                      className={`font-label-md text-[12px] font-bold ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Doorstep Fitting & Try Banner */}
        <View className="mx-4 p-3.5 bg-secondary-fixed/40 rounded-2xl border border-primary/20 flex flex-row items-center gap-3 mb-3">
          <View className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <Icon name="local_shipping" size={22} color="#b80035" />
          </View>
          <View className="flex-1">
            <Text className="font-label-md text-[13px] text-on-surface font-bold">
              Instant 10-Min Doorstep Try & Return
            </Text>
            <Text className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              Rider waits 10 mins outside while you try on for perfect fit.
            </Text>
          </View>
        </View>

        {/* Description & Specifications */}
        <View className="p-4 bg-white mb-6 shadow-xs">
          <Text className="font-title-md text-[15px] text-on-surface font-bold mb-2">
            Product Description
          </Text>
          <Text className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">
            {product.description}
          </Text>

          <View className="mt-3 pt-3 border-t border-surface-container-high">
            <Text className="font-label-lg text-[13px] text-on-surface font-bold mb-1">
              Fabric Details
            </Text>
            <Text className="font-body-sm text-[12px] text-on-surface-variant">
              {product.fabricDetails}
            </Text>
          </View>

          <View className="mt-3 pt-3 border-t border-surface-container-high">
            <Text className="font-label-lg text-[13px] text-on-surface font-bold mb-1">
              Care Instructions
            </Text>
            <Text className="font-body-sm text-[12px] text-on-surface-variant">
              {product.careInstructions}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View className="absolute bottom-16 left-0 right-0 w-full bg-white/95 border-t border-surface-container-high px-4 py-3 flex flex-row items-center gap-3 shadow-2xl z-40">
        <TouchableOpacity
          onPress={handleAddToCart}
          activeOpacity={0.9}
          className={`flex-1 py-3 rounded-2xl flex flex-row items-center justify-center gap-2 ${
            isAdded ? 'bg-green-700' : 'bg-primary-container'
          }`}
        >
          <Icon
            name={isAdded ? 'check_circle' : 'shopping_bag'}
            size={18}
            color="#ffffff"
          />
          <Text className="text-white font-label-lg text-[14px] font-bold">
            {isAdded ? 'Go to Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBuyNow}
          activeOpacity={0.9}
          className="flex-1 py-3 rounded-2xl bg-primary flex flex-row items-center justify-center gap-2 shadow-md"
        >
          <Text className="text-white font-label-lg text-[14px] font-bold">
            Buy Now
          </Text>
          <Icon name="arrow_forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <BottomNav cartCount={cartCount} />
    </View>
  );
}
