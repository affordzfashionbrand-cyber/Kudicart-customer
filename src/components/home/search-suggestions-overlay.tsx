import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  Keyboard,
  BackHandler,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Search,
  X,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpLeft,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useCatalogStore } from '@/store/useCatalogStore';
import { formatPrice } from '@/data/homeData';

interface SearchSuggestionsOverlayProps {
  visible: boolean;
  query: string;
  onQueryChange: (text: string) => void;
  onSelectQuery: (query: string) => void;
  onOpenProduct: (product: any) => void;
  onClose: () => void;
}

export const SearchSuggestionsOverlay = React.memo(function SearchSuggestionsOverlay({
  visible,
  query,
  onQueryChange,
  onSelectQuery,
  onOpenProduct,
  onClose,
}: SearchSuggestionsOverlayProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const initialQueryRef = useRef(query);

  const {
    searchSuggestions,
    isSuggestionsLoading,
    recentSearches,
    fetchSearchSuggestions,
    addRecentSearch,
    clearRecentSearches,
  } = useCatalogStore();

  // Focus input and fetch suggestions on open; snapshot initial query
  useEffect(() => {
    if (visible) {
      initialQueryRef.current = query;
      fetchSearchSuggestions(query);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Robust back handler: dismisses keyboard, blurs input, reverts uncommitted typing, and closes modal
  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    onQueryChange(initialQueryRef.current);
    onClose();
  }, [onClose, onQueryChange]);

  // Hardware back button support on Android
  useEffect(() => {
    if (!visible) return;
    const onHardwareBack = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [visible, handleBack]);

  // Debounced suggestion fetch as query changes
  useEffect(() => {
    if (!visible) return;
    const debounceTimer = setTimeout(() => {
      fetchSearchSuggestions(query);
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [query, visible]);

  const handleExecuteSearch = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (!clean) return;
      Keyboard.dismiss();
      addRecentSearch(clean);
      onSelectQuery(clean);
      onClose();
    },
    [addRecentSearch, onSelectQuery, onClose],
  );

  const handleClearInput = useCallback(() => {
    onQueryChange('');
    fetchSearchSuggestions('');
    inputRef.current?.focus();
  }, [onQueryChange, fetchSearchSuggestions]);

  if (!visible) return null;

  const suggestions = searchSuggestions?.suggestions || [];
  const matchingCategories = searchSuggestions?.categories || [];
  const matchingBrands = searchSuggestions?.brands || [];
  const trendingList = searchSuggestions?.trending || [
    'Handloom Silk Sarees',
    'Embroidered Anarkali Sets',
    'Chanderi Silk Tunics',
    'Tiered Floral Maxi Dresses',
    'Structured Linen Shirts',
    'Raw Selvedge Denim',
  ];
  const recentPicks = searchSuggestions?.recentPicks || [];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleBack}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: '#FDFBF7',
          width: '100%',
          maxWidth: Platform.OS === 'web' ? 480 : '100%',
          alignSelf: 'center',
        }}
      >
        {/* Sticky Search Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#E8E5DF',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Back Action */}
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: pressed ? '#E8E5DF' : '#F4F1EA',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E8E5DF',
              zIndex: 50,
              ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
            })}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={18} color="#111111" />
          </Pressable>

          {/* Search Input Pill */}
          <View
            style={{
              flex: 1,
              height: 44,
              backgroundColor: '#F7F7F5',
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: '#FF5A1F',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              gap: 8,
            }}
          >
            <Image
              source={require('@/assets/images/logo-removebg-preview.png')}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
            <Search size={16} color="#FF5A1F" />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={onQueryChange}
              onSubmitEditing={() => handleExecuteSearch(query)}
              returnKeyType="search"
              placeholder="Search couture, kurtis, silk..."
              placeholderTextColor="#8A8580"
              style={[
                {
                  flex: 1,
                  height: '100%',
                  fontSize: 14,
                  color: '#111111',
                  fontFamily: Fonts.sansMedium,
                  paddingVertical: 0,
                },
                Platform.OS === 'web'
                  ? ({ outline: 'none', boxShadow: 'none' } as any)
                  : {},
              ]}
              selectionColor="#FF5A1F"
            />
            {query.length > 0 && (
              <Pressable onPress={handleClearInput} hitSlop={8}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#E8E5DF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <X size={12} color="#111111" />
                </View>
              </Pressable>
            )}
            {isSuggestionsLoading && (
              <ActivityIndicator size="small" color="#FF5A1F" />
            )}
          </View>

          {/* Search Action CTA */}
          <Pressable
            onPress={() => handleExecuteSearch(query)}
            disabled={!query.trim()}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 16,
              backgroundColor: query.trim() ? '#111111' : '#E8E5DF',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: Fonts.sansBold,
                color: query.trim() ? '#ffffff' : '#A3A39E',
              }}
            >
              Search
            </Text>
          </Pressable>
        </View>

        {/* Scrollable Suggestion Body */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* STATE 1: Empty Query - Show Recent, Trending, Categories & Top Picks */}
          {!query.trim() ? (
            <View style={{ paddingTop: 16 }}>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={15} color="#FF5A1F" />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: Fonts.sansBold,
                          color: '#111111',
                          letterSpacing: 0.8,
                          textTransform: 'uppercase',
                        }}
                      >
                        Recent Searches
                      </Text>
                    </View>
                    <Pressable onPress={clearRecentSearches} hitSlop={6}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: Fonts.sansMedium,
                          color: '#FF5A1F',
                        }}
                      >
                        Clear All
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {recentSearches.map((term, idx) => (
                      <Pressable
                        key={`recent-${idx}`}
                        onPress={() => handleExecuteSearch(term)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#F4F1EA',
                          borderWidth: 1,
                          borderColor: '#E8E5DF',
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: 20,
                          gap: 6,
                        }}
                      >
                        <Clock size={12} color="#71717A" />
                        <Text
                          style={{
                            fontSize: 12.5,
                            fontFamily: Fonts.sansMedium,
                            color: '#111111',
                          }}
                        >
                          {term}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Trending Searches */}
              <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <TrendingUp size={15} color="#FF5A1F" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.sansBold,
                      color: '#111111',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Trending Fashion Drops
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {trendingList.map((term, idx) => (
                    <Pressable
                      key={`trending-${idx}`}
                      onPress={() => handleExecuteSearch(term)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        borderWidth: 1,
                        borderColor: '#E8E5DF',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        gap: 6,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.04,
                        shadowRadius: 3,
                        elevation: 1,
                      }}
                    >
                      <Sparkles size={12} color="#FF5A1F" />
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: Fonts.sansMedium,
                          color: '#111111',
                        }}
                      >
                        {term}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Curated Popular Categories */}
              {matchingCategories.length > 0 && (
                <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.sansBold,
                      color: '#111111',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    Explore By Category
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {matchingCategories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => handleExecuteSearch(cat.name)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          backgroundColor: '#111111',
                          borderRadius: 18,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12.5, fontFamily: Fonts.sansBold, color: '#ffffff' }}>
                          {cat.name}
                        </Text>
                        <View
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 10,
                          }}
                        >
                          <Text style={{ fontSize: 10, fontFamily: Fonts.sansBold, color: '#ffffff' }}>
                            {cat.count}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Instant Picks (Featured Items) */}
              {recentPicks.length > 0 && (
                <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.sansBold,
                      color: '#111111',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    Featured Fast Drops
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {recentPicks.map((product: any) => (
                      <Pressable
                        key={String(product.id)}
                        onPress={() => {
                          onOpenProduct(product);
                          onClose();
                        }}
                        style={{
                          width: 140,
                          backgroundColor: '#ffffff',
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: '#E8E5DF',
                          overflow: 'hidden',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View style={{ width: '100%', height: 130, backgroundColor: '#F4F1EA', position: 'relative' }}>
                          <Image
                            source={{ uri: product.image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={150}
                          />
                          {product.fulfillmentType === 'DARK_STORE' && (
                            <View
                              style={{
                                position: 'absolute',
                                top: 6,
                                left: 6,
                                backgroundColor: '#111111',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              <Zap size={8} color="#FF5A1F" fill="#FF5A1F" />
                              <Text style={{ fontSize: 8, color: '#ffffff', fontFamily: Fonts.sansBold }}>18M DROP</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ padding: 8 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 10,
                              fontFamily: Fonts.sansBold,
                              color: '#FF5A1F',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            {product.brand}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 12,
                              fontFamily: Fonts.sansMedium,
                              color: '#111111',
                              marginTop: 2,
                            }}
                          >
                            {product.name || product.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: Fonts.sansBold,
                              color: '#111111',
                              marginTop: 4,
                            }}
                          >
                            {formatPrice(product.price)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ) : (
            /* STATE 2: Active Search Query - Show Keyword Autocompletions, Category & Brand Pills, and Instant Previews */
            <View style={{ paddingTop: 10 }}>
              {/* Category & Brand Pills */}
              {(matchingCategories.length > 0 || matchingBrands.length > 0) && (
                <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                    {matchingCategories.map((cat) => (
                      <Pressable
                        key={`cat-${cat.id}`}
                        onPress={() => handleExecuteSearch(cat.name)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#FFF7ED',
                          borderWidth: 1,
                          borderColor: '#FFEDD5',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontFamily: Fonts.sansSemiBold, color: '#C2410C' }}>
                          in {cat.name}
                        </Text>
                        <Text style={{ fontSize: 10, fontFamily: Fonts.sansBold, color: '#9A3412' }}>
                          ({cat.count})
                        </Text>
                      </Pressable>
                    ))}
                    {matchingBrands.map((brand, idx) => (
                      <Pressable
                        key={`brand-${idx}`}
                        onPress={() => handleExecuteSearch(brand.name)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#F4F1EA',
                          borderWidth: 1,
                          borderColor: '#E8E5DF',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontFamily: Fonts.sansSemiBold, color: '#111111' }}>
                          Atelier: {brand.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Suggestions List */}
              <View style={{ backgroundColor: '#ffffff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E8E5DF' }}>
                {suggestions.map((item, index) => {
                  const matchIndex = item.text.toLowerCase().indexOf(query.toLowerCase());
                  const hasMatch = matchIndex !== -1;

                  return (
                    <Pressable
                      key={`sug-${index}`}
                      onPress={() => handleExecuteSearch(item.text)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                        backgroundColor: pressed ? '#F7F7F5' : '#ffffff',
                        borderBottomWidth: index < suggestions.length - 1 ? 0.5 : 0,
                        borderBottomColor: '#F0EDE8',
                      })}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                        <Search size={16} color="#71717A" />
                        <Text numberOfLines={1} style={{ fontSize: 14, color: '#111111', fontFamily: Fonts.sansMedium, flex: 1 }}>
                          {hasMatch ? (
                            <>
                              {item.text.substring(0, matchIndex)}
                              <Text style={{ fontFamily: Fonts.sansBold, color: '#FF5A1F' }}>
                                {item.text.substring(matchIndex, matchIndex + query.length)}
                              </Text>
                              {item.text.substring(matchIndex + query.length)}
                            </>
                          ) : (
                            item.text
                          )}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {item.type !== 'keyword' && (
                          <View style={{ backgroundColor: '#F4F1EA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 10, fontFamily: Fonts.sansBold, color: '#6B6667', textTransform: 'uppercase' }}>
                              {item.type}
                            </Text>
                          </View>
                        )}
                        <ArrowUpLeft size={16} color="#A3A39E" />
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Instant Products Top Matches */}
              {recentPicks.length > 0 && (
                <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: Fonts.sansBold,
                        color: '#111111',
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                      }}
                    >
                      Top Matches for "{query}"
                    </Text>
                    <Pressable onPress={() => handleExecuteSearch(query)}>
                      <Text style={{ fontSize: 12, fontFamily: Fonts.sansBold, color: '#FF5A1F' }}>
                        View All
                      </Text>
                    </Pressable>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {recentPicks.map((product: any) => (
                      <Pressable
                        key={String(product.id)}
                        onPress={() => {
                          onOpenProduct(product);
                          onClose();
                        }}
                        style={{
                          width: 140,
                          backgroundColor: '#ffffff',
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: '#E8E5DF',
                          overflow: 'hidden',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View style={{ width: '100%', height: 130, backgroundColor: '#F4F1EA' }}>
                          <Image
                            source={{ uri: product.image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={150}
                          />
                        </View>
                        <View style={{ padding: 8 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 10,
                              fontFamily: Fonts.sansBold,
                              color: '#FF5A1F',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            {product.brand}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 12,
                              fontFamily: Fonts.sansMedium,
                              color: '#111111',
                              marginTop: 2,
                            }}
                          >
                            {product.name || product.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: Fonts.sansBold,
                              color: '#111111',
                              marginTop: 4,
                            }}
                          >
                            {formatPrice(product.price)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Bottom Full Search Trigger */}
              <Pressable
                onPress={() => handleExecuteSearch(query)}
                style={{
                  marginHorizontal: 16,
                  marginTop: 24,
                  backgroundColor: '#111111',
                  borderRadius: 18,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Search size={16} color="#ffffff" />
                <Text style={{ fontSize: 14, fontFamily: Fonts.sansBold, color: '#ffffff' }}>
                  See all results for "{query}"
                </Text>
                <ChevronRight size={16} color="#ffffff" />
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
});
