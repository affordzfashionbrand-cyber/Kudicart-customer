import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 380);

interface BannerItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  discount: string;
  buttonText: string;
  image: string;
  categoryId: string;
  bgGradient: string;
}

const BANNERS: BannerItem[] = [
  {
    id: 'b1',
    tag: 'HANDLOOM ARTISAN EDIT',
    title: 'Pure Varanasi Silk & Zari Sarees',
    subtitle: 'Crafted by master weavers in Banaras',
    discount: 'UP TO 50% OFF',
    buttonText: 'Shop Collection',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZmXmAng2VIvmt-e5UoQ1MrsXUMl1p1ftqAD3jjKM_YhlObUmOfd_rwaYD9cuGHuKnJVJBq6kagdOAfjiCSzvvDeVpdrAoGZBOD7YgEfEhdUx85DVetiWSmEdkgQISuSVzZXuSiadjUZUFFvsv0XIZp7_tRq9rvE-Exol7J2LYupakSoB-rwJjs7Y3evVbNoXHjav-QXpye1FUGXeKzjdjw_34arHkcmA3NY6gd6xMd-6DRSq6M5oNfw',
    categoryId: 'sarees',
    bgGradient: 'bg-gradient-to-r from-[#920028] to-[#be0037]',
  },
  {
    id: 'b2',
    tag: 'EXPRESS 35-MIN DROP',
    title: 'Embroidered Anarkali & Kurta Sets',
    subtitle: 'Opulent silk weaves with gotta patti detail',
    discount: 'FLAT 48% OFF',
    buttonText: 'Explore Kurtis',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTs6-ZqrlCWEJVbPDPREz0wpb5KSte4RfbM_CFWtYByj1Qc_k44_GCyF1iH4BGfJnWitJDsFkbG5QdTkr1lWbmeRjm4Sjw1-H24gH-93XY9maRVKsweEwf47isp-cXHwTuC01nyYYwhghENAssQln3RbbqPdr5ZU7vbKVIAZzaBN3nCBPzrEWX99MdjRBISiVH6LhmgYy1UufvPL6FavGOUabgo-pl4fxAqy5IIErLKuy3XyzrqnSLzg',
    categoryId: 'kurtis',
    bgGradient: 'bg-gradient-to-r from-[#40000c] to-[#920028]',
  },
  {
    id: 'b3',
    tag: 'NEW SEASON COUTURE',
    title: 'Tiered Rayon & Silk Maxi Dresses',
    subtitle: 'Flowing romantic silhouettes with waist ties',
    discount: 'MIN. 40% OFF',
    buttonText: 'View Dresses',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChjjRPXtK6wGlAzoX8MBkuhS5YQslHvyJa70gSCTmiApO-Lv00JijbP2efRpHEXOYf7Sb03MXrwmH90rYSHdWR_oiv_PNVMCQPGogU99bT_moi70avCMo2utLRF3l_PH6o7WaUE_ndCaN1oW4g9nWiFuH3yLqZDFknFOazu7KzBYjldvcFKSVuQDqubPby_0bCn0qmp1p5scLFl83Y1KDLoHjsLtaL4FCmrZV4k7E3Zx-u5XYrt3g3KQ',
    categoryId: 'dresses',
    bgGradient: 'bg-gradient-to-r from-[#db2e4e] to-[#b80938]',
  },
];

export function HeroCarousel() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + 12),
        animated: true,
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <View className="my-3">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
        onScroll={(e) => {
          const xOffset = e.nativeEvent.contentOffset.x;
          const index = Math.round(xOffset / (CARD_WIDTH + 12));
          if (index !== activeIndex && index >= 0 && index < BANNERS.length) {
            setActiveIndex(index);
          }
        }}
        scrollEventThrottle={16}
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => router.push(`/category/${banner.categoryId}` as any)}
            activeOpacity={0.92}
            style={{ width: CARD_WIDTH }}
            className="h-44 rounded-3xl overflow-hidden relative shadow-md bg-inverse-surface flex flex-row"
          >
            {/* Background Image */}
            <LazyImage
              source={banner.image}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              contentFit="cover"
              priority="high"
            />

            {/* Gradient Dark Overlay */}
            <View className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

            {/* Banner Content */}
            <View className="relative z-10 flex-1 p-4 justify-between max-w-[65%]">
              <View>
                <View className="flex flex-row items-center gap-1 mb-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  <Text className="font-label-eyebrow text-[9px] text-white font-extrabold tracking-widest uppercase">
                    {banner.tag}
                  </Text>
                </View>

                <Text
                  numberOfLines={2}
                  className="font-headline-sm text-[17px] text-white font-extrabold leading-snug tracking-tight"
                >
                  {banner.title}
                </Text>

                <Text
                  numberOfLines={1}
                  className="font-body-sm text-[11px] text-white/80 mt-0.5"
                >
                  {banner.subtitle}
                </Text>
              </View>

              <View className="flex flex-row items-center gap-2 pt-1">
                <View className="px-2.5 py-1 rounded-full bg-[#111111] border border-white/20">
                  <Text className="text-[10px] text-white font-extrabold uppercase">
                    {banner.discount}
                  </Text>
                </View>

                <View className="flex flex-row items-center gap-0.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
                  <Text className="text-[11px] text-white font-bold">
                    {banner.buttonText}
                  </Text>
                  <Icon name="arrow_forward" size={13} color="#ffffff" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View className="flex flex-row items-center justify-center gap-1.5 mt-2.5">
        {BANNERS.map((_, idx) => (
          <View
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === idx ? 'w-6 bg-[#111111]' : 'w-1.5 bg-[#D9D9D5]'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
