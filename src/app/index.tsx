import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TopHeader } from '@/components/top-header';
import { BottomNav } from '@/components/bottom-nav';
import { HeroCarousel } from '@/components/hero-carousel';
import { ExpressTicker } from '@/components/express-ticker';
import { Icon } from '@/components/icon';
import { AddressModal, Address, INITIAL_ADDRESSES } from '@/components/address-modal';
import { PRODUCTS, Product } from '@/data/products';

export default function Catalog() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(3);
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [wishlistItems, setWishlistItems] = useState<{ [key: string]: boolean }>({});

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address>(INITIAL_ADDRESSES[0]);

  const toggleAddToCart = (id: string) => {
    if (addedItems[id]) return;
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    setCartCount((prev) => prev + 1);
  };

  const toggleWishlist = (id: string) => {
    setWishlistItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View className="flex-1 bg-[#faf7f5] relative">
      <TopHeader subtitle="Shoppe" />

      <ScrollView
        className="flex-1 px-4 pt-3 pb-28"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Location & Express Delivery Pill Bar */}
        <View className="flex flex-row items-center justify-between my-1.5">
          <TouchableOpacity
            onPress={() => setIsAddressModalOpen(true)}
            activeOpacity={0.8}
            className="flex flex-row items-center gap-1.5 bg-white px-3.5 py-2 rounded-full shadow-xs border border-surface-container-high"
          >
            <Icon name="near_me" size={18} color="#b80035" />
            <View className="flex flex-row items-center gap-1">
              <Text className="font-label-eyebrow text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold">
                Deliver to
              </Text>
              <Text className="font-label-md text-[12px] text-on-surface font-extrabold">
                {currentAddress.name}
              </Text>
              <Icon name="keyboard_arrow_down" size={16} color="#78716c" />
            </View>
          </TouchableOpacity>

          <View className="flex flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary-fixed border border-primary/20">
            <Icon name="bolt" size={15} color="#b80035" />
            <Text className="font-label-eyebrow text-[10px] text-primary font-extrabold tracking-tight uppercase">
              35 MIN DROP
            </Text>
          </View>
        </View>

        {/* Search Bar with Visual Search & Filters */}
        <View className="relative w-full my-2">
          <View className="flex flex-row items-center w-full bg-white border border-surface-container-high rounded-2xl shadow-xs px-3.5 py-2.5">
            <Icon name="search" size={22} color="#b80035" className="mr-2" />
            <TextInput
              className="flex-1 font-body-md text-[14px] text-on-surface placeholder:text-on-surface-variant/60"
              placeholder="Search Kurtis, Sarees, Dupattas, Fabrics..."
              placeholderTextColor="#78716c"
            />
            <View className="flex flex-row items-center gap-2 pl-2 border-l border-surface-container-high ml-1">
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center"
              >
                <Icon name="photo_camera" size={18} color="#78716c" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center"
              >
                <Icon name="tune" size={18} color="#78716c" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Shoppe Campaign Hero Banner Carousel */}
        <HeroCarousel />

        {/* Curated Wardrobe Categories Hub */}
        <View className="my-2">
          <View className="flex flex-row items-center justify-between mb-2.5">
            <View>
              <Text className="font-label-eyebrow text-[10px] text-primary uppercase tracking-widest font-extrabold">
                Shop by Wardrobe
              </Text>
              <Text className="font-headline-sm text-[18px] text-on-surface font-extrabold tracking-tight">
                Curated Categories
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/category/all' as any)}
              className="flex flex-row items-center gap-0.5"
            >
              <Text className="font-label-md text-[12px] text-primary font-bold">
                See All
              </Text>
              <Icon name="arrow_forward" size={16} color="#b80035" />
            </TouchableOpacity>
          </View>

          {/* Category Cards (4 Columns) */}
          <View className="flex flex-row items-center justify-between gap-2">
            {/* Kurtis */}
            <TouchableOpacity
              onPress={() => router.push('/category/kurtis' as any)}
              activeOpacity={0.8}
              className="flex-1 flex flex-col items-center p-2.5 rounded-2xl bg-white shadow-xs border border-surface-container-high text-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-1.5 shadow-2xs">
                <Icon name="styler" size={24} color="#b80035" />
              </View>
              <Text className="font-label-md text-[12px] text-on-surface font-extrabold text-center">
                Kurtis
              </Text>
              <Text className="font-label-eyebrow text-[10px] text-on-surface-variant/80 text-center">
                320+ styles
              </Text>
            </TouchableOpacity>

            {/* Sarees */}
            <TouchableOpacity
              onPress={() => router.push('/category/sarees' as any)}
              activeOpacity={0.8}
              className="flex-1 flex flex-col items-center p-2.5 rounded-2xl bg-white shadow-xs border border-surface-container-high text-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-1.5 shadow-2xs">
                <Icon name="dry_cleaning" size={24} color="#b80035" />
              </View>
              <Text className="font-label-md text-[12px] text-on-surface font-extrabold text-center">
                Sarees
              </Text>
              <Text className="font-label-eyebrow text-[10px] text-on-surface-variant/80 text-center">
                Pure Silk
              </Text>
            </TouchableOpacity>

            {/* Dresses */}
            <TouchableOpacity
              onPress={() => router.push('/category/dresses' as any)}
              activeOpacity={0.8}
              className="flex-1 flex flex-col items-center p-2.5 rounded-2xl bg-white shadow-xs border border-surface-container-high text-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-1.5 shadow-2xs">
                <Icon name="woman" size={24} color="#b80035" />
              </View>
              <Text className="font-label-md text-[12px] text-on-surface font-extrabold text-center">
                Dresses
              </Text>
              <Text className="font-label-eyebrow text-[10px] text-on-surface-variant/80 text-center">
                Maxi & Midi
              </Text>
            </TouchableOpacity>

            {/* Fabrics */}
            <TouchableOpacity
              onPress={() => router.push('/category/fabrics' as any)}
              activeOpacity={0.8}
              className="flex-1 flex flex-col items-center p-2.5 rounded-2xl bg-white shadow-xs border border-surface-container-high text-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-1.5 shadow-2xs">
                <Icon name="texture" size={24} color="#b80035" />
              </View>
              <Text className="font-label-md text-[12px] text-on-surface font-extrabold text-center">
                Fabrics
              </Text>
              <Text className="font-label-eyebrow text-[10px] text-on-surface-variant/80 text-center">
                By Metre
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shoppe 35-Min Express Drop Flash Sale Ticker */}
        <ExpressTicker />

        {/* Verified Authenticity Artisan Banner */}
        <TouchableOpacity
          onPress={() => router.push('/category/all' as any)}
          activeOpacity={0.8}
          className="flex flex-row items-center justify-between p-3.5 rounded-2xl bg-white border border-surface-container-high shadow-xs my-2"
        >
          <View className="flex flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
              <Icon name="verified" size={22} color="#b80035" />
            </View>
            <View className="flex-1">
              <Text className="font-label-lg text-[14px] text-on-surface font-extrabold leading-tight">
                100% Verified Artisan Ware
              </Text>
              <Text className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                Quality-checked handlooms direct from master weavers
              </Text>
            </View>
          </View>
          <Icon name="chevron_right" size={20} color="#b80035" />
        </TouchableOpacity>

        {/* Express Apparel Heading */}
        <View className="flex flex-row items-center justify-between pt-3 pb-2">
          <View className="flex flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-primary" />
            <Text className="font-headline-sm text-[18px] text-on-surface font-extrabold tracking-tight">
              Express Apparel
            </Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-primary-fixed border border-primary/20">
            <Text className="font-label-eyebrow text-[10px] text-primary font-extrabold uppercase">
              35-Min Drop
            </Text>
          </View>
        </View>

        {/* Shoppe Product Grid (2-Column Tall 3:4 Aspect Ratio Cards) */}
        <View className="flex flex-row flex-wrap justify-between gap-y-3.5 my-1">
          {PRODUCTS.map((product: Product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => router.push(`/product/${product.id}` as any)}
              activeOpacity={0.9}
              className="w-[48%] flex flex-col bg-white rounded-2xl shadow-xs border border-surface-container-high overflow-hidden"
            >
              <View className="relative w-full aspect-[3/4] bg-surface-container-high overflow-hidden">
                <Image
                  className="w-full h-full object-cover"
                  source={{ uri: product.images[0] }}
                />
                <View className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  <Text className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary font-label-eyebrow text-[9px] font-extrabold uppercase shadow-xs">
                    {product.badge || `${product.discountPercentage}% OFF`}
                  </Text>
                  {product.stockBadge && (
                    <Text className="px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-label-eyebrow text-[9px] font-bold shadow-xs">
                      {product.stockBadge}
                    </Text>
                  )}
                </View>

                {/* Glassmorphic Wishlist Heart Button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  activeOpacity={0.8}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center z-10 shadow-xs"
                >
                  <Icon
                    name={wishlistItems[product.id] ? 'favorite' : 'favorite_border'}
                    size={17}
                    color={wishlistItems[product.id] ? '#b80035' : '#78716c'}
                  />
                </TouchableOpacity>
              </View>

              <View className="p-3 flex flex-col justify-between flex-1">
                <View>
                  <View className="flex flex-row items-center justify-between mb-0.5">
                    <Text className="font-label-eyebrow text-[10px] uppercase text-primary font-extrabold tracking-wider">
                      {product.brand}
                    </Text>
                    <View className="flex flex-row items-center gap-0.5">
                      <Icon name="star" size={12} color="#f59e0b" />
                      <Text className="font-label-md text-[11px] font-bold text-on-surface">
                        {product.rating}
                      </Text>
                    </View>
                  </View>
                  <Text
                    numberOfLines={1}
                    className="font-title-md text-[14px] text-on-surface font-extrabold"
                  >
                    {product.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="font-body-sm text-[11px] text-on-surface-variant mt-0.5"
                  >
                    {product.subtitle}
                  </Text>
                </View>

                <View className="pt-2">
                  <View className="flex flex-row items-baseline gap-1.5">
                    <Text className="font-headline-sm text-[16px] text-primary font-extrabold">
                      ₹{product.price.toLocaleString()}
                    </Text>
                    <Text className="font-body-sm text-[11px] text-on-surface-variant line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleAddToCart(product.id);
                    }}
                    activeOpacity={0.8}
                    className={`w-full mt-2 py-2 px-2 rounded-xl flex flex-row items-center justify-center gap-1.5 shadow-xs ${
                      addedItems[product.id]
                        ? 'bg-green-700'
                        : 'bg-primary-container'
                    }`}
                  >
                    <Icon
                      name={addedItems[product.id] ? 'check_circle' : 'shopping_bag'}
                      size={15}
                      color="#ffffff"
                    />
                    <Text className="text-white font-label-md text-[12px] font-extrabold">
                      {addedItems[product.id] ? 'In Bag' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Doorstep Try & Return Guarantee */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex flex-row items-center gap-3 p-3.5 bg-white rounded-2xl border border-surface-container-high shadow-xs mt-3 mb-6"
        >
          <View className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center">
            <Icon name="local_shipping" size={20} color="#b80035" />
          </View>
          <View className="flex-1">
            <Text className="font-label-md text-[13px] text-on-surface font-extrabold">
              Instant Try & Return at Doorstep
            </Text>
            <Text className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              Rider waits 10 mins while you try on your apparel
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Glassmorphic Bottom Navigation */}
      <BottomNav cartCount={cartCount} />

      {/* Address Selection Modal */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={currentAddress.id}
        onSelectAddress={(selected: Address) => setCurrentAddress(selected)}
      />
    </View>
  );
}
