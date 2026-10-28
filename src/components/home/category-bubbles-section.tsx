import React, { useRef } from 'react';
import { View, Text, ScrollView, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { GENDER_CATEGORIES, WEAR_CATEGORIES, bespokeEasing } from '@/data/homeData';

export interface CategoryBubblesSectionProps {
  selectedGender: 'All' | 'Men' | 'Women' | 'Kids';
  selectedWear: string;
  onSelectGender: (gender: 'All' | 'Men' | 'Women' | 'Kids') => void;
  onSelectWear: (wearId: string) => void;
}

export const CategoryBubblesSection = React.memo(function CategoryBubblesSection({
  selectedGender,
  selectedWear,
  onSelectGender,
  onSelectWear,
}: CategoryBubblesSectionProps) {
  const wearsFadeAnim = useRef(new Animated.Value(1)).current;
  const isNative = Platform.OS !== 'web';

  const handleGenderPress = (gender: 'All' | 'Men' | 'Women' | 'Kids') => {
    if (gender === selectedGender) return;
    Animated.sequence([
      Animated.timing(wearsFadeAnim, { toValue: 0.25, duration: 80, easing: bespokeEasing, useNativeDriver: isNative }),
      Animated.timing(wearsFadeAnim, { toValue: 1, duration: 220, easing: bespokeEasing, useNativeDriver: isNative }),
    ]).start();
    onSelectGender(gender);
  };

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0ece8',
        paddingBottom: 6,
        marginBottom: 16,
        zIndex: 10,
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }}
    >
      {/* ROW 1: Gender Category Pills (All, Men, Women, Kids) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 }}>
        {GENDER_CATEGORIES.map((cat) => {
          const isSelected = selectedGender === cat.id;
          return (
            <View key={cat.id} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
              <AnimatedPressable
                onPress={() => handleGenderPress(cat.id)}
                containerStyle={{ alignItems: 'center', width: '100%' }}
                style={{ alignItems: 'center', width: '100%' }}
              >
                {/* Pill Avatar with Warm Champagne Gradient */}
                <View
                  style={{
                    width: '100%',
                    maxWidth: 78,
                    height: 38,
                    borderRadius: 19,
                    overflow: 'hidden',
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? '#000000' : '#faedd9',
                    backgroundColor: '#faedd9',
                  }}
                >
                  <LinearGradient
                    colors={['#fdf6ee', '#faedd9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Image
                      source={{ uri: cat.image }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      recyclingKey={cat.id}
                      transition={150}
                    />
                  </LinearGradient>
                </View>

                {/* Label */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#000000' : '#71717a',
                    marginTop: 6,
                    letterSpacing: 0.2,
                    textAlign: 'center',
                  }}
                >
                  {cat.name}
                </Text>

                {/* Active Underline Indicator */}
                {isSelected ? (
                  <View style={{ width: 28, height: 2.5, backgroundColor: '#000000', borderRadius: 2, marginTop: 4 }} />
                ) : (
                  <View style={{ width: 28, height: 2.5, backgroundColor: 'transparent', marginTop: 4 }} />
                )}
              </AnimatedPressable>
            </View>
          );
        })}
      </View>

      {/* ROW 2: Wears Subcategory Strip with Images */}
      <View style={{ paddingVertical: 4 }}>
        <Animated.View style={{
          opacity: wearsFadeAnim,
          transform: [{ translateY: wearsFadeAnim.interpolate({ inputRange: [0.2, 1], outputRange: [4, 0] }) }]
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            overScrollMode="never"
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingTop: 4, paddingBottom: 4 }}
          >
            {WEAR_CATEGORIES.map((wear) => {
              const isSelected = selectedWear === wear.id;
              const imageUrl = wear.images[selectedGender] || wear.images['All'];

              return (
                <AnimatedPressable
                  key={wear.id}
                  onPress={() => onSelectWear(wear.id)}
                  containerStyle={{ alignItems: 'center', width: 64 }}
                  style={{ alignItems: 'center', width: 64 }}
                >
                  {/* Circular / Rounded Avatar with Image */}
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: '#F4F1EA',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#111111' : '#D9D9D5',
                      overflow: 'hidden',
                      position: 'relative',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.15 : 0.05,
                      shadowRadius: 4,
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      recyclingKey={`${wear.id}-${selectedGender}`}
                      transition={150}
                    />

                    {/* Badge if present */}
                    {wear.badge && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: '#111111',
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        borderBottomLeftRadius: 6,
                        borderTopRightRadius: 24,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 7, fontWeight: '800' }}>
                          {wear.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Label */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 10,
                      fontWeight: isSelected ? '800' : '500',
                      color: isSelected ? '#111111' : '#353335',
                      marginTop: 5,
                      textAlign: 'center',
                    }}
                  >
                    {wear.name}
                  </Text>

                  {/* Active Dot */}
                  {isSelected && (
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#111111', marginTop: 2 }} />
                  )}
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
});
