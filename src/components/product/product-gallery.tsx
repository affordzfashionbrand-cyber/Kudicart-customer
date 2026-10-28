import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Zap,
  Ruler,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react-native';
import { FontStyles } from '@/constants/theme';

export interface ProductGalleryProps {
  galleryImages: string[];
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  isDarkStoreProduct: boolean;
  deliveryMinutes?: number;
  discountPct: number;
  isWished?: boolean;
  onToggleWishlist?: () => void;
  shotLabels?: string[];
  productTitle?: string;
  brand?: string;
}

const DEFAULT_SHOT_LABELS = [
  'Lookbook Drape',
  'Weave & Zari Detail',
  'Model Fall & Pleats',
  'Pallu & Border Motif',
  'Atelier Runway',
  'Craftsmanship Detail',
];

export function ProductGallery({
  galleryImages,
  activeImageIndex,
  onSelectImage,
  isDarkStoreProduct,
  deliveryMinutes = 18,
  discountPct,
  isWished = false,
  onToggleWishlist,
  shotLabels,
  productTitle = 'Handloom Apparel',
  brand = 'Atelier',
}: ProductGalleryProps) {
  const [stageWidth, setStageWidth] = useState<number>(360);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(activeImageIndex);

  const carouselRef = useRef<ScrollView>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);
  const lightboxScrollRef = useRef<ScrollView>(null);

  const labels = shotLabels && shotLabels.length >= galleryImages.length
    ? shotLabels
    : galleryImages.map((_, i) => DEFAULT_SHOT_LABELS[i % DEFAULT_SHOT_LABELS.length]);

  // Sync horizontal carousel when activeImageIndex changes externally (e.g. thumbnail tap or arrow button)
  useEffect(() => {
    if (carouselRef.current && stageWidth > 0) {
      carouselRef.current.scrollTo({
        x: activeImageIndex * stageWidth,
        animated: true,
      });
    }
  }, [activeImageIndex, stageWidth]);

  // Handle momentum scroll end on main carousel
  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIdx = Math.round(offsetX / (stageWidth || 1));
    if (newIdx >= 0 && newIdx < galleryImages.length && newIdx !== activeImageIndex) {
      onSelectImage(newIdx);
    }
  };

  const handlePrev = () => {
    if (activeImageIndex > 0) {
      onSelectImage(activeImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeImageIndex < galleryImages.length - 1) {
      onSelectImage(activeImageIndex + 1);
    }
  };

  const handleOpenLightbox = (indexToOpen: number) => {
    setLightboxIndex(indexToOpen);
    setIsLightboxOpen(true);
  };

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Fitted Viewport Stage */}
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setStageWidth(w);
        }}
        style={{
          width: '100%',
          height: 345,
          borderRadius: 22,
          overflow: 'hidden',
          backgroundColor: '#F3EFEA',
          borderWidth: 1,
          borderColor: '#E8E5DF',
          position: 'relative',
        }}
      >
        {/* Horizontal Swipeable Carousel */}
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={{ width: '100%', height: '100%' }}
        >
          {galleryImages.map((imgUri, idx) => (
            <Pressable
              key={`slide-${idx}`}
              onPress={() => handleOpenLightbox(idx)}
              style={{
                width: stageWidth,
                height: 345,
                backgroundColor: '#F3EFEA',
              }}
            >
              <Image
                source={{ uri: imgUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                contentPosition="top"
                transition={200}
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* Top-Left Badge: 18M Drop vs Boutique Run */}
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
            zIndex: 10,
          }}
        >
          <Zap size={10} color="#FF5A1F" fill="#FF5A1F" />
          <Text style={[FontStyles.sansBold, { fontSize: 9, color: '#FFFFFF', letterSpacing: 0.8 }]}>
            {isDarkStoreProduct ? `${deliveryMinutes}M ATELIER DROP` : 'BOUTIQUE RUN'}
          </Text>
        </View>

        {/* Top-Center Shot Perspective Label (Subtle Atelier Luxury Detail) */}
        {galleryImages.length > 1 && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              alignSelf: 'center',
              backgroundColor: 'rgba(17, 17, 17, 0.72)',
              paddingHorizontal: 9,
              paddingVertical: 3.5,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              zIndex: 10,
            }}
          >
            <Sparkles size={9} color="#FBBF24" />
            <Text style={[FontStyles.sansBold, { fontSize: 8.5, color: '#FFFFFF', letterSpacing: 0.5, textTransform: 'uppercase' }]}>
              {labels[activeImageIndex] || `ANGLE 0${activeImageIndex + 1}`}
            </Text>
          </View>
        )}

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
              shadowColor: '#FF5A1F',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 3,
              zIndex: 10,
            }}
          >
            <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: '#FFFFFF' }]}>{discountPct}% OFF</Text>
          </View>
        )}

        {/* Wishlist Heart Button on Lookbook Stage */}
        {onToggleWishlist && (
          <Pressable
            onPress={onToggleWishlist}
            hitSlop={8}
            style={({ pressed }) => ({
              position: 'absolute',
              top: discountPct > 0 ? 46 : 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pressed ? '#F5F5F5' : 'rgba(255, 255, 255, 0.94)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
              zIndex: 10,
            })}
            accessibilityRole="button"
            accessibilityLabel="Wishlist item"
          >
            <Heart
              size={18}
              color={isWished ? '#FF5A1F' : '#111111'}
              fill={isWished ? '#FF5A1F' : 'none'}
            />
          </Pressable>
        )}

        {/* Floating Left Navigation Arrow (Web / Touch) */}
        {galleryImages.length > 1 && activeImageIndex > 0 && (
          <Pressable
            onPress={handlePrev}
            style={({ pressed }) => ({
              position: 'absolute',
              left: 10,
              top: '50%',
              marginTop: -18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pressed ? 'rgba(17, 17, 17, 0.85)' : 'rgba(17, 17, 17, 0.55)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            })}
          >
            <ChevronLeft size={19} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        )}

        {/* Floating Right Navigation Arrow (Web / Touch) */}
        {galleryImages.length > 1 && activeImageIndex < galleryImages.length - 1 && (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({
              position: 'absolute',
              right: 10,
              top: '50%',
              marginTop: -18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pressed ? 'rgba(17, 17, 17, 0.85)' : 'rgba(17, 17, 17, 0.55)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            })}
          >
            <ChevronRight size={19} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        )}

        {/* Bottom Overlay Pill: Fit Spec (Left) & Luxury Pagination (Right) */}
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          {/* Fit Spec Badge */}
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4.5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
            }}
          >
            <Ruler size={11} color="#FF5A1F" />
            <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: '#111111' }]}>
              Model is 5&apos;9&quot; wearing S
            </Text>
          </View>

          {/* Luxury Multi-Image Pagination Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(17, 17, 17, 0.88)',
              paddingHorizontal: 9,
              paddingVertical: 4.5,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.15)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            {/* Slide Index Counter */}
            <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#FFFFFF', letterSpacing: 0.6 }]}>
              {activeImageIndex + 1}/{galleryImages.length}
            </Text>

            {galleryImages.length > 1 && (
              <>
                <View style={{ width: 1, height: 9, backgroundColor: 'rgba(255, 255, 255, 0.35)' }} />

                {/* Animated Segmented Dashes */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3.5 }}>
                  {galleryImages.map((_, i) => (
                    <Pressable
                      key={`dash-${i}`}
                      onPress={() => onSelectImage(i)}
                      hitSlop={6}
                      style={{
                        width: activeImageIndex === i ? 14 : 5,
                        height: 4.5,
                        borderRadius: 2.5,
                        backgroundColor:
                          activeImageIndex === i
                            ? '#FF5A1F'
                            : 'rgba(255, 255, 255, 0.45)',
                      }}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Interactive Thumbnails Gallery Ribbon */}
      {galleryImages.length > 1 && (
        <View style={{ marginTop: 12 }}>
          <ScrollView
            ref={thumbnailScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            overScrollMode="never"
            contentContainerStyle={{ gap: 9, paddingVertical: 2 }}
          >
            {galleryImages.map((imgUri, idx) => {
              const isSelected = activeImageIndex === idx;
              const shotTitle = labels[idx] || `Shot ${idx + 1}`;
              return (
                <Pressable
                  key={`thumb-${idx}`}
                  onPress={() => onSelectImage(idx)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    opacity: isSelected ? 1 : pressed ? 0.9 : 0.75,
                  })}
                >
                  <View
                    style={{
                      width: 58,
                      height: 64,
                      borderRadius: 14,
                      overflow: 'hidden',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#FF5A1F' : '#E8E5DF',
                      backgroundColor: '#FFFFFF',
                      shadowColor: isSelected ? '#FF5A1F' : '#000000',
                      shadowOffset: { width: 0, height: isSelected ? 3 : 1 },
                      shadowOpacity: isSelected ? 0.3 : 0.05,
                      shadowRadius: isSelected ? 6 : 2,
                      elevation: isSelected ? 4 : 1,
                    }}
                  >
                    <Image
                      source={{ uri: imgUri }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      contentPosition="top"
                    />

                    {/* Active Check Dot */}
                    {isSelected && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 3,
                          right: 3,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#FF5A1F',
                          borderWidth: 1.5,
                          borderColor: '#FFFFFF',
                        }}
                      />
                    )}
                  </View>

                  {/* Micro Shot Angle Title */}
                  <Text
                    style={[
                      isSelected ? FontStyles.sansBold : FontStyles.sansMedium,
                      {
                        fontSize: 9,
                        color: isSelected ? '#FF5A1F' : '#71717A',
                        marginTop: 4,
                        maxWidth: 62,
                        textAlign: 'center',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {shotTitle}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* High-Definition Fullscreen Lightbox Modal */}
      <Modal
        visible={isLightboxOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLightboxOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(9, 9, 11, 0.97)', justifyContent: 'space-between' }}>
          {/* Lightbox Top Header */}
          <View
            style={{
              paddingTop: Platform.OS === 'ios' ? 52 : 36,
              paddingHorizontal: 20,
              paddingBottom: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#FF5A1F', letterSpacing: 1, textTransform: 'uppercase' }]}>
                {brand} • RUNWAY ATELIER
              </Text>
              <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#FFFFFF', marginTop: 2 }]} numberOfLines={1}>
                {productTitle}
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#A1A1AA', marginTop: 2 }]}>
                {labels[lightboxIndex] || `Photo ${lightboxIndex + 1}`} • {lightboxIndex + 1} of {galleryImages.length}
              </Text>
            </View>

            <Pressable
              onPress={() => setIsLightboxOpen(false)}
              hitSlop={10}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Lightbox Full-Bleed Image Viewport */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 }}>
            <Image
              source={{ uri: galleryImages[lightboxIndex] }}
              style={{ width: '100%', height: '88%' }}
              contentFit="contain"
              transition={250}
            />

            {/* Lightbox Prev / Next Controls */}
            {galleryImages.length > 1 && lightboxIndex > 0 && (
              <Pressable
                onPress={() => setLightboxIndex(lightboxIndex - 1)}
                style={{
                  position: 'absolute',
                  left: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={24} color="#FFFFFF" />
              </Pressable>
            )}

            {galleryImages.length > 1 && lightboxIndex < galleryImages.length - 1 && (
              <Pressable
                onPress={() => setLightboxIndex(lightboxIndex + 1)}
                style={{
                  position: 'absolute',
                  right: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={24} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          {/* Lightbox Bottom Thumbnail Ribbon */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <ScrollView
              ref={lightboxScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              overScrollMode="never"
              contentContainerStyle={{ gap: 10, justifyContent: 'center' }}
            >
              {galleryImages.map((uri, idx) => {
                const isSelected = lightboxIndex === idx;
                return (
                  <Pressable
                    key={`lb-thumb-${idx}`}
                    onPress={() => setLightboxIndex(idx)}
                    style={{
                      width: 50,
                      height: 56,
                      borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#FF5A1F' : 'rgba(255, 255, 255, 0.25)',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      contentPosition="top"
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
