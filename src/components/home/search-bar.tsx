import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Icon } from '@/components/icon';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onVisualSearchPress?: () => void;
  onFilterPress?: () => void;
  onSelectSuggestion?: (query: string) => void;
}

const RECENT_SEARCHES = [
  'Cotton Kurta Set',
  'Oversized T-Shirts',
  'Chikankari Kurti',
  'Running Sneakers',
  'Denim Jacket',
];

const TRENDING_SEARCHES = [
  'Silk Sarees',
  'Polo Shirts Under ₹699',
  'Summer Floral Dresses',
  'BellaVita Perfume',
];

export function SearchBar({
  searchQuery,
  onSearchChange,
  onVisualSearchPress,
  onFilterPress,
  onSelectSuggestion,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Dynamic Search Placeholder Animation Ticker
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderTranslateAnim] = useState(() => new Animated.Value(0));
  const [placeholderOpacityAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(placeholderTranslateAnim, {
          toValue: -14,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(placeholderOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % TRENDING_SEARCHES.length);
        placeholderTranslateAnim.setValue(14);
        Animated.parallel([
          Animated.timing(placeholderTranslateAnim, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(placeholderOpacityAnim, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [placeholderOpacityAnim, placeholderTranslateAnim]);

  const handleSuggestionClick = (text: string) => {
    onSearchChange(text);
    if (onSelectSuggestion) onSelectSuggestion(text);
    setIsFocused(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* Search Input Box */}
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
        ]}
      >
        <Icon
          name="search"
          size={22}
          color={isFocused ? '#111111' : '#6B6667'}
        />

        {/* Dynamic Rolling Animated Placeholder */}
        {searchQuery.length === 0 && (
          <View 
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 44,
              right: 90,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                opacity: placeholderOpacityAnim,
                transform: [{ translateY: placeholderTranslateAnim }],
              }}
            >
              <Text numberOfLines={1} style={{ fontSize: 13.5, color: '#6B6667' }}>
                Search <Text style={{ fontWeight: '700', color: isFocused ? '#111111' : '#353335' }}>&quot;{TRENDING_SEARCHES[placeholderIndex]}&quot;</Text>
              </Text>
            </Animated.View>
          </View>
        )}

        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={() => setIsFocused(true)}
          placeholder=""
          style={[
            styles.input,
            {
              borderWidth: 0,
              backgroundColor: 'transparent',
              paddingVertical: 0,
            },
            Platform.OS === 'web' ? ({ outline: 'none', outlineWidth: 0, outlineStyle: 'none', boxShadow: 'none' } as any) : {}
          ]}
          returnKeyType="search"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            style={styles.clearBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={18} color="#71717a" />
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={onVisualSearchPress}
          activeOpacity={0.7}
          style={styles.actionBtn}
          accessibilityLabel="Visual Camera Search"
        >
          <Icon name="photo_camera" size={20} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.7}
          style={styles.actionBtn}
          accessibilityLabel="Filter Options"
        >
          <Icon name="tune" size={20} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Dynamic Search Suggestions Overlay when focused */}
      {isFocused && (
        <View style={styles.suggestionsBox}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
            <TouchableOpacity onPress={() => setIsFocused(false)}>
              <Text style={styles.closeBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsContainer}>
            {RECENT_SEARCHES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSuggestionClick(item)}
                style={styles.tagPill}
              >
                <Icon name="history" size={14} color="#6B6667" />
                <Text style={styles.tagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.suggestionsHeader, { marginTop: 14 }]}>
            <Text style={styles.sectionTitle}>TRENDING RIGHT NOW</Text>
          </View>

          <View style={styles.tagsContainer}>
            {TRENDING_SEARCHES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSuggestionClick(item)}
                style={[styles.tagPill, styles.trendingTagPill]}
              >
                <Icon name="trending_up" size={14} color="#111111" />
                <Text style={[styles.tagText, { color: '#111111', fontWeight: '800' }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F7F5',
    zIndex: 40,
    position: 'relative',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    paddingHorizontal: 14,
    height: 48,
  },
  containerFocused: {
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: '#111111',
    marginLeft: 8,
    paddingVertical: 0,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: '#D9D9D5',
    marginHorizontal: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#F7F7F5',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#D9D9D5',
    zIndex: 100,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#6B6667',
    letterSpacing: 1,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F1EA',
    borderWidth: 1,
    borderColor: '#D9D9D5',
  },
  trendingTagPill: {
    backgroundColor: '#F7F7F5',
    borderWidth: 1,
    borderColor: '#111111',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
});
