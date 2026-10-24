import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Zap, Ruler } from 'lucide-react-native';

interface ProductGalleryProps {
  galleryImages: string[];
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  isDarkStoreProduct: boolean;
  deliveryMinutes?: number;
  discountPct: number;
}

export function ProductGallery({
  galleryImages,
  activeImageIndex,
  onSelectImage,
  isDarkStoreProduct,
  deliveryMinutes = 18,
  discountPct,
}: ProductGalleryProps) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Fitted Viewport Stage */}
      <View
        style={{
          width: '100%',
          height: 330,
          borderRadius: 22,
          overflow: 'hidden',
          backgroundColor: '#F3EFEA',
          borderWidth: 1,
          borderColor: '#E8E5DF',
          position: 'relative',
        }}
      >
        <Image
          source={{ uri: galleryImages[activeImageIndex] }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          contentPosition="top"
          transition={200}
        />

        {/* Top-Left Badge */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(17, 17, 17, 0.92)',
            paddingHorizontal: 9,
            paddingVertical: 4.5,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Zap size={10} color="#FF5A1F" fill="#FF5A1F" />
          <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 }}>
            {isDarkStoreProduct ? `${deliveryMinutes}M ATELIER DROP` : 'BOUTIQUE RUN'}
          </Text>
        </View>

        {/* Top-Right Badge: Discount */}
        {discountPct > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: '#FF5A1F',
              paddingHorizontal: 8,
              paddingVertical: 4.5,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF' }}>{discountPct}% OFF</Text>
          </View>
        )}

        {/* Bottom Overlay Pill: Fit Spec & Pagination */}
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ruler size={11} color="#FF5A1F" />
            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#111111' }}>
              Model is 5&apos;9&quot; wearing S
            </Text>
          </View>

          {/* Dots Pagination */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(17, 17, 17, 0.75)',
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 12,
            }}
          >
            {galleryImages.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => onSelectImage(i)}
                style={{
                  width: activeImageIndex === i ? 14 : 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: activeImageIndex === i ? '#FF5A1F' : 'rgba(255, 255, 255, 0.5)',
                }}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Interactive Thumbnails Gallery */}
      {galleryImages.length > 1 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
          {galleryImages.map((imgUri, idx) => (
            <Pressable
              key={idx}
              onPress={() => onSelectImage(idx)}
              style={{
                width: 52,
                height: 54,
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: activeImageIndex === idx ? 2 : 1,
                borderColor: activeImageIndex === idx ? '#FF5A1F' : '#E8E5DF',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Image
                source={{ uri: imgUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                contentPosition="top"
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
