import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { QUICK_COLLECTIONS, QuickCollection } from '@/data/mockCollections';
import { Icon } from '@/components/icon';
import { EditorialText } from '@/components/common/section-title';

interface QuickCollectionsGridProps {
  onCollectionPress?: (collection: QuickCollection) => void;
}

export function QuickCollectionsGrid({
  onCollectionPress,
}: QuickCollectionsGridProps) {
  const { width } = useWindowDimensions();
  const effectiveWidth = Math.min(width, 440);

  // Clean 2-column mobile grid
  const numColumns = 2;
  const gap = 12;
  const totalPadding = 32; // 16px on each side
  const cardWidth = (effectiveWidth - totalPadding - gap) / numColumns;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>CURATED CAPSULES • DROP_04</Text>
          <EditorialText
            first="Urban"
            second="editions"
            fontSize={28}
            lineHeight={30}
            singleLine={true}
          />
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Icon name="chevron_right" size={16} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Grid of Visual Tiles */}
      <View style={styles.gridContainer}>
        {QUICK_COLLECTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onCollectionPress && onCollectionPress(item)}
            activeOpacity={0.88}
            style={[
              styles.tileCard,
              { width: cardWidth, height: cardWidth * 1.05 },
            ]}
          >
            {/* Background Image */}
            <Image
              source={{ uri: item.image }}
              style={styles.tileImage}
              resizeMode="cover"
            />

            {/* Dark Scrim Gradient */}
            <View style={styles.tileOverlay} />

            {/* Optional Badge */}
            {item.badge && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}

            {/* Content & Arrow */}
            <View style={styles.tileContent}>
              <EditorialText
                text={item.title}
                fontSize={14}
                lineHeight={16}
                color="#ffffff"
                singleLine={true}
                numberOfLines={1}
              />
              <Text style={styles.tileSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
              <View style={styles.arrowCircle}>
                <Icon name="arrow_forward" size={13} color="#111111" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F7F7F5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B6667',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tileImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tileOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 17, 17, 0.45)',
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tileContent: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  tileTitle: {
    color: '#F7F7F5',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tileSubtitle: {
    color: '#D9D9D5',
    fontSize: 10.5,
    marginTop: 2,
    fontWeight: '500',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
  },
});
