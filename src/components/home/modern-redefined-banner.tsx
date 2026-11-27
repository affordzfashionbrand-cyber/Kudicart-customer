import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { useHomeContentStore } from '@/store/useHomeContentStore';

interface ModernRedefinedBannerProps {
  onExploreDrop: (banner?: any) => void;
}

export const ModernRedefinedBanner = React.memo(function ModernRedefinedBanner({
  onExploreDrop,
}: ModernRedefinedBannerProps) {
  const banners = useHomeContentStore((s) => s.banners);
  const editorialBanner = banners.find(
    (b) => b.placement === 'MODERN_REDEFINED' && (!b.status || b.status === 'APPROVED'),
  );

  const imageUri =
    editorialBanner?.imageUrl ||
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85';
  const tagLabel = editorialBanner?.tag || 'DROP EDIT 04';
  const titleFirst = editorialBanner?.title1 || 'Modern';
  const titleSecond = editorialBanner?.title2 || 'redefined.';
  const discountBadge = editorialBanner?.discountText;

  return (
    <View className="px-5 pb-[48px]">
      <View className="h-[440px] relative mb-[12px] bg-[#F4F1EA] border border-[#D9D9D5] rounded-[32px] overflow-hidden p-[6px]">
        <View className="flex-1 rounded-[26px] overflow-hidden relative">
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.72)', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0.3 }}
            className="absolute inset-0 z-10"
          />
          {discountBadge ? (
            <View
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 20,
                backgroundColor: '#FF5A1F',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>
                {discountBadge}
              </Text>
            </View>
          ) : null}
          <View className="absolute bottom-[30px] left-[24px] z-20">
            <SectionTitle
              label={tagLabel}
              firstLine={titleFirst}
              secondLine={titleSecond}
              inverted={true}
              marginBottom={18}
            />

            <AnimatedPressable
              className="flex-row items-center bg-black/40 backdrop-blur-md rounded-full pl-[20px] pr-[6px] py-[6px] border border-white/20"
              onPress={() => onExploreDrop(editorialBanner)}
            >
              <Text style={{ fontSize: 10.5, color: '#ffffff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.8, marginRight: 12 }}>
                EXPLORE DROP
              </Text>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={14} color="#111111" strokeWidth={2.5} />
              </View>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </View>
  );
});
