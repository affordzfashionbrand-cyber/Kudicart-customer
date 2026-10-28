import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Search,
  X,
} from 'lucide-react-native';

import { ProductCard } from '@/components/common/product-card';
import { EmptyState } from '@/components/common/empty-state';
import { EditorialText } from '@/components/common/section-title';
import { UniversalSearchBar } from '@/components/home/search-bar';
import { SearchSuggestionsOverlay } from '@/components/home/search-suggestions-overlay';
import {
  CATEGORY_COLLECTIONS,
  CategoryItemDef,
} from '@/components/categories/category-data';
import { COMPLETE_CATEGORY_HIERARCHY } from '@/data/category-hierarchy-data';
import { formatPrice, ProductItem } from '@/data/homeData';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { catalogApi, ApiProduct } from '@/services/api';
import { getEnrichedProductCatalog, sortProductList } from '@/utils/product-catalog';
import { safeBack } from '@/utils/navigation';

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'rating';
type PriceFilter = 'all' | 'under2k' | 'under5k' | 'above5k';

export default function CategoryResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const normalizedId = (id || 'all').toLowerCase();

  // Cart & Wishlist Store
  const { items, wishlist, toggleWishlist, addItem, itemTotal } = useCartStore();
  const storeCatalogProducts = useCatalogStore((s) => s.products);

  const totalBagCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  // Identify matching category metadata from 3-Tier Hierarchy (L1, L2, L3)
  const categoryDef: CategoryItemDef = useMemo(() => {
    // 1. Search in 3-Tier COMPLETE_CATEGORY_HIERARCHY
    for (const dept of COMPLETE_CATEGORY_HIERARCHY) {
      if (
        dept.id.toLowerCase() === normalizedId ||
        dept.slug.toLowerCase() === normalizedId ||
        dept.name.toLowerCase() === normalizedId
      ) {
        return {
          id: dept.id,
          name: dept.name,
          subtitle: `${dept.countText} • Instant Doorstep Drop`,
          gender: dept.gender === 'Women' || dept.gender === 'Men' || dept.gender === 'Kids' ? dept.gender : 'All',
          wear: 'All',
          image: dept.image,
          subcategories: ['All', ...dept.subcategories.map((s) => s.name)],
        };
      }

      for (const sub of dept.subcategories) {
        if (
          sub.id.toLowerCase() === normalizedId ||
          sub.slug.toLowerCase() === normalizedId ||
          sub.name.toLowerCase() === normalizedId
        ) {
          return {
            id: sub.id,
            name: sub.name,
            subtitle: `${sub.countText} • Instant Doorstep Drop`,
            gender: sub.gender === 'Women' || sub.gender === 'Men' || sub.gender === 'Kids' ? sub.gender : 'All',
            wear: sub.name,
            image: sub.image,
            subcategories: ['All', ...sub.subcategories.map((l) => l.name)],
          };
        }

        for (const leaf of sub.subcategories) {
          if (
            leaf.id.toLowerCase() === normalizedId ||
            leaf.slug.toLowerCase() === normalizedId ||
            leaf.name.toLowerCase() === normalizedId
          ) {
            return {
              id: leaf.id,
              name: leaf.name,
              subtitle: `${leaf.countText} • Instant Doorstep Drop`,
              gender: leaf.gender === 'Women' || leaf.gender === 'Men' || leaf.gender === 'Kids' ? leaf.gender : 'All',
              wear: leaf.name,
              image: leaf.image,
              subcategories: ['All', 'Express 18m', 'Try & Buy', 'Top Rated'],
            };
          }
        }
      }
    }

    // 2. Fallback to CATEGORY_COLLECTIONS
    const found = CATEGORY_COLLECTIONS.find(
      (c) =>
        c.id.toLowerCase() === normalizedId ||
        c.name.toLowerCase() === normalizedId ||
        c.wear.toLowerCase() === normalizedId,
    );
    if (found) return found;

    const title =
      normalizedId === 'all'
        ? 'All Collections'
        : normalizedId.charAt(0).toUpperCase() + normalizedId.slice(1);

    return {
      id: normalizedId,
      name: title,
      subtitle: 'Curated Designer Apparel • Instant Doorstep Drop',
      gender: 'All',
      wear: 'All',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      subcategories: ['All', 'Featured', 'New Arrivals', 'Bestsellers'],
    };
  }, [normalizedId]);

  // Filters and Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [activeSort, setActiveSort] = useState<SortOption>('featured');
  const [activePriceFilter, setActivePriceFilter] = useState<PriceFilter>('all');

  // Server-side products and pagination
  const [serverProducts, setServerProducts] = useState<ApiProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch initial/filtered products
  const fetchProductsList = useCallback(
    async (pageToFetch: number, isInitial = false) => {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        let minPrice: number | undefined;
        let maxPrice: number | undefined;
        if (activePriceFilter === 'under2k') maxPrice = 2000;
        else if (activePriceFilter === 'under5k') maxPrice = 5000;
        else if (activePriceFilter === 'above5k') minPrice = 5001;

        const effectiveCategory = normalizedId === 'all' ? undefined : normalizedId;
        const effectiveSearch =
          debouncedSearch ||
          (selectedSubcategory !== 'All' && !selectedSubcategory.startsWith('All ')
            ? selectedSubcategory
            : undefined);

        const sortParam =
          activeSort === 'featured'
            ? 'popular'
            : activeSort === 'price_asc'
            ? 'price_asc'
            : activeSort === 'price_desc'
            ? 'price_desc'
            : 'rating';

        const results = await catalogApi.getProducts({
          category: effectiveCategory,
          search: effectiveSearch,
          sort: sortParam,
          minPrice,
          maxPrice,
          page: pageToFetch,
          limit: 20,
        });

        if (pageToFetch === 1) {
          setServerProducts(results);
        } else {
          setServerProducts((prev) => [...prev, ...results]);
        }

        setHasMore(results.length >= 20);
        setPage(pageToFetch);
      } catch (err) {
        console.warn('Error fetching server catalog:', err);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [normalizedId, debouncedSearch, selectedSubcategory, activeSort, activePriceFilter],
  );

  useEffect(() => {
    fetchProductsList(1, true);
  }, [fetchProductsList]);

  const handleEndReached = () => {
    if (!isFetchingMore && hasMore && !isLoading) {
      fetchProductsList(page + 1, false);
    }
  };

  // Convert server products or enriched local products
  const displayedProducts: ProductItem[] = useMemo(() => {
    if (serverProducts.length > 0) {
      return serverProducts.map((p) => ({
        id: p.id,
        brand: p.brand,
        name: p.title,
        price: p.price,
        old: p.originalPrice || Math.round(p.price * 1.3),
        rating: String(p.rating || '4.8'),
        category: p.category || 'Women',
        wear: (p as any).wear || 'Tops',
        image: p.image || (p.galleryImages && p.galleryImages[0]) || '',
      }));
    }

    // Fallback to local catalog if server returned 0 results
    let pool = getEnrichedProductCatalog(storeCatalogProducts);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      pool = pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return sortProductList(pool, activeSort);
  }, [serverProducts, storeCatalogProducts, debouncedSearch, activeSort]);

  const handleOpenProduct = useCallback(
    (product: ProductItem) => {
      router.push({
        pathname: '/product/[id]',
        params: { id: String(product.id) },
      });
    },
    [router],
  );

  const handleAddToCart = useCallback(
    (product: ProductItem) => {
      addItem(
        {
          id: String(product.id),
          brand: product.brand,
          title: product.name,
          description: '',
          price: product.price,
          originalPrice: product.old || product.price,
          discount: '',
          rating: Number(product.rating) || 4.8,
          reviewsCount: 120,
          stockQuantity: 10,
          readyToShip: true,
          sizes: ['S', 'M', 'L'],
          image: product.image,
          altText: product.name,
          galleryImages: [product.image],
          category: product.category,
        },
        'M',
        'Default',
        1,
      );
    },
    [addItem],
  );

  // FlatList Header Component
  const renderListHeader = () => (
    <View>
      {/* Universal Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <UniversalSearchBar
          query={searchQuery}
          showLogoInside={true}
          onQueryChange={setSearchQuery}
          onOpenOverlay={() => setIsSearchOverlayVisible(true)}
          onClear={() => setSearchQuery('')}
          onBack={() => setSearchQuery('')}
          placeholder={`Search ${categoryDef.name}...`}
        />
      </View>

      {/* Editorial Category Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerCard}>
          <Image
            source={{ uri: categoryDef.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.bannerScrim} />

          <View style={styles.bannerTextContent}>
            <View style={styles.bannerTagRow}>
              <Sparkles size={11} color="#FF5A1F" />
              <Text style={styles.bannerTagText}>VERIFIED AFFORDZ ATELIER</Text>
            </View>
            <EditorialText
              text={categoryDef.name}
              fontSize={24}
              lineHeight={27}
              color="#FFFFFF"
              singleLine={true}
              numberOfLines={1}
            />
            <Text numberOfLines={2} style={styles.bannerSubtext}>
              {categoryDef.subtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Subcategory Filter Pills */}
      {categoryDef.subcategories && categoryDef.subcategories.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            overScrollMode="never"
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {categoryDef.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub;
              return (
                <Pressable
                  key={sub}
                  onPress={() => setSelectedSubcategory(sub)}
                  style={[styles.chip, isSelected ? styles.chipActive : styles.chipInactive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    {sub}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sort & Price Filter Bar */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
        >
          <View style={styles.sortIndicator}>
            <SlidersHorizontal size={12} color="#111111" />
            <Text style={styles.sortIndicatorText}>SORT & FILTER</Text>
          </View>

          {[
            { id: 'featured', label: 'Featured' },
            { id: 'price_asc', label: 'Price: Low' },
            { id: 'price_desc', label: 'Price: High' },
            { id: 'rating', label: 'Rating ★' },
          ].map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setActiveSort(s.id as SortOption)}
              style={[styles.filterPill, activeSort === s.id && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeSort === s.id && styles.filterPillTextActive,
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDivider} />

          {[
            { id: 'all', label: 'All Prices' },
            { id: 'under2k', label: 'Under ₹2K' },
            { id: 'under5k', label: 'Under ₹5K' },
            { id: 'above5k', label: 'Above ₹5K' },
          ].map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setActivePriceFilter(p.id as PriceFilter)}
              style={[styles.filterPill, activePriceFilter === p.id && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activePriceFilter === p.id && styles.filterPillTextActive,
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results Summary */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryCount}>
          Showing{' '}
          <Text style={{ fontWeight: '800', color: '#111111' }}>
            {displayedProducts.length}
          </Text>{' '}
          handpicked styles
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Zap size={11} color="#FF5A1F" fill="#FF5A1F" />
          <Text style={styles.summaryExpress}>18-Min Try & Buy</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7', paddingTop: Math.max(insets.top, 8) }}>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable onPress={() => safeBack(router)} hitSlop={12} style={styles.iconButton}>
            <ArrowLeft size={18} color="#111111" />
          </Pressable>

          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {categoryDef.name}
            </Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>
              {displayedProducts.length} items • 18-Min Try & Buy
            </Text>
          </View>

          <Pressable onPress={() => router.push('/cart')} hitSlop={12} style={styles.iconButton}>
            <ShoppingBag size={18} color="#111111" />
            {totalBagCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalBagCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Virtualized Infinite-Scrolling FlatList */}
        {isLoading && page === 1 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color="#FF5A1F" />
            <Text style={{ marginTop: 12, fontSize: 13, color: '#6B6667', fontWeight: '600' }}>
              Curating Runway Catalog...
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedProducts}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            ListHeaderComponent={renderListHeader}
            removeClippedSubviews={Platform.OS !== 'web'}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={7}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <ProductCard
                  product={item}
                  wished={wishlist.includes(String(item.id))}
                  onWishlist={() => toggleWishlist(String(item.id))}
                  onBag={() => handleAddToCart(item)}
                  onOpen={() => handleOpenProduct(item)}
                  badge={item.old && item.old > item.price ? 'CURATED DEAL' : undefined}
                />
              </View>
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingMore ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FF5A1F" />
                </View>
              ) : (
                <View style={{ height: totalBagCount > 0 ? 120 : 60 }} />
              )
            }
            ListEmptyComponent={
              <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
                <EmptyState
                  title="NO STYLES MATCH"
                  body="Try switching filters or adjusting your search query."
                  action="RESET FILTERS"
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearch('');
                    setSelectedSubcategory('All');
                    setActivePriceFilter('all');
                    setActiveSort('featured');
                  }}
                />
              </View>
            }
          />
        )}

        {/* Floating Cart Peek */}
        {totalBagCount > 0 && (
          <View style={[styles.floatingCartBar, { bottom: Math.max(insets.bottom, 16) + 12 }]}>
            <Pressable onPress={() => router.push('/cart')} style={styles.cartBarInner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.cartBarIconBadge}>
                  <ShoppingBag size={14} color="#111111" />
                </View>
                <View>
                  <Text style={styles.cartBarTitle}>
                    {totalBagCount} {totalBagCount === 1 ? 'ITEM' : 'ITEMS'} IN BAG
                  </Text>
                  <Text style={styles.cartBarTotal}>Total: {formatPrice(itemTotal)}</Text>
                </View>
              </View>
              <View style={styles.cartBarCta}>
                <Text style={styles.cartBarCtaText}>VIEW BAG</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Live Search Suggestions Autocomplete Overlay */}
        <SearchSuggestionsOverlay
          visible={isSearchOverlayVisible}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSelectQuery={(term) => {
            setSearchQuery(term);
          }}
          onOpenProduct={(product) => {
            setIsSearchOverlayVisible(false);
            router.push({
              pathname: '/product/[id]',
              params: { id: String(product.id) },
            });
          }}
          onClose={() => setIsSearchOverlayVisible(false)}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FDFBF7',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE8DF',
    backgroundColor: '#FDFBF7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B6667',
    marginTop: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5A1F',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#111111',
    paddingVertical: 0,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  bannerCard: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E5DF',
  },
  bannerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 17, 17, 0.48)',
  },
  bannerTextContent: {
    zIndex: 10,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  bannerTagText: {
    color: '#FF5A1F',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bannerSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#E5E7EB',
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D5',
  },
  chipText: {
    fontSize: 11,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  chipTextInactive: {
    color: '#33383F',
    fontWeight: '600',
  },
  filterBarContainer: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  sortIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sortIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.5,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9D9D5',
    backgroundColor: '#FFFFFF',
  },
  filterPillActive: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A4647',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#D9D9D5',
    marginHorizontal: 4,
  },
  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ECE8DF',
    marginTop: 6,
    marginBottom: 10,
  },
  summaryCount: {
    fontSize: 11.5,
    color: '#6B6667',
  },
  summaryExpress: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5A1F',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  floatingCartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  cartBarInner: {
    backgroundColor: '#111111',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cartBarIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cartBarTotal: {
    fontSize: 11,
    color: '#A09C9D',
    marginTop: 1,
  },
  cartBarCta: {
    backgroundColor: '#FF5A1F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cartBarCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
