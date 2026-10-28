import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Platform,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Sparkles, ArrowRight, Eye, Film } from 'lucide-react-native';
import { bespokeEasing } from '@/data/homeData';

interface LookbookSlide {
  id: string;
  productId: string;
  brand: string;
  title: string;
  price: string;
  discount: string;
  image: string;
  tagline: string;
}

const LOOKBOOK_SLIDES: LookbookSlide[] = [
  {
    id: 'look-1',
    productId: 'prod-1',
    brand: 'AVANYA ETHNIC',
    title: 'Mulmul Silk Anarkali Drop',
    price: '₹1,299',
    discount: '48% OFF',
    tagline: 'AUTUMN ATELIER • COLLECTION 2026',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'look-2',
    productId: 'prod-5',
    brand: 'STUDIO 04',
    title: 'Structured French Linen Shirt',
    price: '₹1,890',
    discount: '53% OFF',
    tagline: 'MINIMAL METROPOLIS • MEN',
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'look-3',
    productId: 'prod-3',
    brand: 'GULABI STUDIO',
    title: 'Tiered Floral Rayon Maxi Dress',
    price: '₹999',
    discount: '50% OFF',
    tagline: 'FESTIVE EDIT • BOTANICAL BLUSH',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
  },
];

interface MotionEditorialShowcaseProps {
  onSelectProduct: (productId: string) => void;
}

export const MotionEditorialShowcase: React.FC<MotionEditorialShowcaseProps> = ({
  onSelectProduct,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const lowerThirdSlide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // Continuous subtle Ken-Burns zoom loop
    const zoomLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(zoomAnim, {
          toValue: 1.06,
          duration: 3800,
          easing: bespokeEasing,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(zoomAnim, {
          toValue: 1,
          duration: 3800,
          easing: bespokeEasing,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    zoomLoop.start();

    // Auto-advance slides every 4 seconds
    const interval = setInterval(() => {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.15,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(lowerThirdSlide, {
          toValue: 15,
          duration: 250,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        setCurrentIndex((prev) => (prev + 1) % LOOKBOOK_SLIDES.length);
        // Fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(lowerThirdSlide, {
            toValue: 0,
            duration: 400,
            easing: bespokeEasing,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      });
    }, 4200);

    return () => {
      clearInterval(interval);
      zoomLoop.stop();
    };
  }, [fadeAnim, zoomAnim, lowerThirdSlide]);

  const currentSlide = LOOKBOOK_SLIDES[currentIndex];

  return (
    <Pressable
      onPress={() => onSelectProduct(currentSlide.productId)}
      style={{
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: '#111111',
        marginBottom: 16,
        position: 'relative',
        height: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      {/* Animated Zooming Background Image */}
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          opacity: fadeAnim,
          transform: [{ scale: zoomAnim }],
        }}
      >
        <Image
          source={{ uri: currentSlide.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </Animated.View>

      {/* Dark Cinematic Gradient Vignette */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        }}
      />

      {/* Top Floating Badge Bar */}
      <View
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Film size={11} color="#FF5A1F" />
          <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 }}>
            LOOKBOOK REEL
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#DC2626',
            paddingHorizontal: 8,
            paddingVertical: 3.5,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF' }}>
            {currentSlide.discount}
          </Text>
        </View>
      </View>

      {/* Animated Lower-Third Title Overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          right: 14,
          transform: [{ translateY: lowerThirdSlide }],
        }}
      >
        {/* Accent Bar */}
        <View
          style={{
            width: 32,
            height: 3,
            backgroundColor: '#FF5A1F',
            borderRadius: 1.5,
            marginBottom: 6,
          }}
        />

        <Text
          style={{
            fontSize: 9.5,
            fontWeight: '900',
            color: '#E4E4E7',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {currentSlide.tagline}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: '900',
            color: '#FFFFFF',
            marginTop: 2,
            lineHeight: 20,
          }}
          numberOfLines={1}
        >
          {currentSlide.title}
        </Text>

        {/* Price & Action Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF' }}>
              {currentSlide.price}
            </Text>
            <Text style={{ fontSize: 10, color: '#A1A1AA', fontWeight: '700' }}>
              • {currentSlide.brand}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#111111' }}>
              TAP TO SHOP
            </Text>
            <ArrowRight size={11} color="#111111" />
          </View>
        </View>
      </Animated.View>

      {/* Progress Dots */}
      <View
        style={{
          position: 'absolute',
          bottom: 6,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {LOOKBOOK_SLIDES.map((_, idx) => (
          <View
            key={idx}
            style={{
              width: currentIndex === idx ? 16 : 4,
              height: 2.5,
              borderRadius: 1.5,
              backgroundColor: currentIndex === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
            }}
          />
        ))}
      </View>
    </Pressable>
  );
};
