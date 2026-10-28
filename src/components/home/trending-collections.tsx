import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import { TRENDING_STORIES, TrendingStory } from '@/data/mockCollections';
import { Icon } from '@/components/icon';
import { EditorialText } from '@/components/common/section-title';

interface TrendingCollectionsProps {
  onStoryPress?: (story: TrendingStory) => void;
}

export function TrendingCollections({ onStoryPress }: TrendingCollectionsProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>DROP_04 • LOOKBOOK</Text>
          <EditorialText
            first="Visual"
            second="editorials"
            fontSize={28}
            lineHeight={30}
            singleLine={true}
          />
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
          <Text style={styles.viewAllText}>ALL LOOKS</Text>
          <Icon name="arrow_forward" size={14} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Story Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
      >
        {TRENDING_STORIES.map((story) => (
          <TouchableOpacity
            key={story.id}
            onPress={() => onStoryPress && onStoryPress(story)}
            activeOpacity={0.9}
            style={styles.storyCard}
          >
            {/* Background Image */}
            <LazyImage
              source={story.image}
              style={styles.storyImage}
              contentFit="cover"
              priority="normal"
            />

            {/* Gradient Dark Overlay */}
            <View style={styles.storyOverlay} />

            {/* Hashtag Tag */}
            <View
              style={[
                styles.hashtagPill,
                { backgroundColor: story.tagColor || '#111111' },
              ]}
            >
              <Text style={styles.hashtagText}>{story.hashtag}</Text>
            </View>

            {/* Content Bottom */}
            <View style={styles.storyContent}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storySubtitle} numberOfLines={2}>
                {story.subtitle}
              </Text>

              {/* Action Pill */}
              <View style={styles.explorePill}>
                <Text style={styles.exploreText}>SHOP LOOK</Text>
                <Icon name="arrow_forward" size={12} color="#111111" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    backgroundColor: '#F7F7F5',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B6667',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyCard: {
    width: 220,
    height: 290,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  storyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 17, 17, 0.45)',
  },
  hashtagPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hashtagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  storyContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  storyTitle: {
    color: '#F7F7F5',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  storySubtitle: {
    color: '#D9D9D5',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
    fontWeight: '500',
  },
  explorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },
  exploreText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
