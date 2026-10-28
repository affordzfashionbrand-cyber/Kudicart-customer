import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import { CATEGORY_STRIP_ITEMS, CategoryItem } from '@/data/mockCategories';

interface CategoryStripProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryStrip({
  selectedCategoryId,
  onSelectCategory,
}: CategoryStripProps) {
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
        {CATEGORY_STRIP_ITEMS.map((item) => {
          const isSelected = selectedCategoryId === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelectCategory(item.id)}
              activeOpacity={0.7}
              style={styles.itemContainer}
            >
              {/* Circle Avatar with Image */}
              <View
                style={[
                  styles.iconCircle,
                  isSelected && styles.iconCircleActive,
                ]}
              >
                <LazyImage
                  source={item.image}
                  style={styles.itemImage}
                  contentFit="cover"
                  priority="normal"
                />

                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelActive,
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  itemContainer: {
    alignItems: 'center',
    width: 68,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F4F1EA',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 6,
  },
  iconCircleActive: {
    borderColor: '#111111',
    borderWidth: 2,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#111111',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B6667',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#111111',
    fontWeight: '900',
  },
});
