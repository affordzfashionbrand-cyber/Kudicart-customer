import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import { GENDER_CATEGORIES, GenderCategory } from '@/data/mockCategories';

interface GenderNavProps {
  selectedGender: 'all' | 'men' | 'women' | 'kids';
  onSelectGender: (gender: 'all' | 'men' | 'women' | 'kids') => void;
}

export function GenderNav({
  selectedGender,
  onSelectGender,
}: GenderNavProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
      >
        {GENDER_CATEGORIES.map((cat) => {
          const isSelected = selectedGender === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelectGender(cat.id)}
              activeOpacity={0.75}
              style={[
                styles.itemContainer,
                isSelected && styles.itemSelected,
              ]}
            >
              {/* Rounded Avatar Image with Golden/Rose Glow if active */}
              <View
                style={[
                  styles.imageWrapper,
                  isSelected && styles.imageWrapperActive,
                ]}
              >
                <LazyImage
                  source={cat.image}
                  style={styles.avatarImage}
                  contentFit="cover"
                  priority="normal"
                />
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelActive,
                ]}
              >
                {cat.name}
              </Text>

              {/* Animated underline indicator */}
              {isSelected && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F5',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D5',
    paddingVertical: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  itemContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'relative',
  },
  itemSelected: {},
  imageWrapper: {
    width: 64,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F4F1EA',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    marginBottom: 6,
  },
  imageWrapperActive: {
    borderColor: '#111111',
    borderWidth: 2,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B6667',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#111111',
    fontWeight: '900',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -8,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#111111',
    borderRadius: 2,
  },
});
