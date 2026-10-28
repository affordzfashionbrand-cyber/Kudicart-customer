import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Store,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  Shirt,
  Smile,
  Footprints,
  Gem,
  ShoppingBag,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react-native';
import { ProductCard } from '@/components/common/product-card';
import { ProductCardSkeleton } from '@/components/common/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { EditorialText } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { ProductItem } from '@/data/homeData';
import {
  CategoryItemDef,
  AtelierStoreDef,
  ATELIER_STORES,
  GENDER_TABS,
} from './category-data';
import {
  COMPLETE_CATEGORY_HIERARCHY,
  DepartmentCategoryDef,
  SubCategoryDef,
  SubSubCategoryDef,
} from '@/data/category-hierarchy-data';

interface CategoryGridSectionProps {
  selectedGender: 'All' | 'Women' | 'Men' | 'Kids';
  setSelectedGender: (gender: 'All' | 'Women' | 'Men' | 'Kids') => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  activeCategory: CategoryItemDef | null;
  visibleCategories: CategoryItemDef[];
  filteredCategoryProducts: ProductItem[];
  activeWishlist: string[];
  onSelectStore: (store: AtelierStoreDef) => void;
  onViewAllStores: () => void;
  onSelectCategory: (catId: string) => void;
  onResetCategory: () => void;
  onToggleWishlist: (id: string | number) => void;
  onAddToBag: (product: ProductItem) => void;
  onOpenProduct: (product: any) => void;
  isLoading?: boolean;
}

export const CategoryGridSection = React.memo(function CategoryGridSection({
  selectedGender,
  setSelectedGender,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedSubcategory,
  setSelectedSubcategory,
  activeCategory,
  visibleCategories,
  filteredCategoryProducts,
  activeWishlist,
  onSelectStore,
  onViewAllStores,
  onSelectCategory,
  onResetCategory,
  onToggleWishlist,
  onAddToBag,
  onOpenProduct,
  isLoading = false,
}: CategoryGridSectionProps) {
  // Active Department (L1) state aligned with Ajio/Myntra navigation
  const [activeDepartmentSlug, setActiveDepartmentSlug] = useState<string>('women');
  const [activeSubCatId, setActiveSubCatId] = useState<string | null>(null);
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null);

  // Department definitions
  const departments = useMemo(() => {
    return COMPLETE_CATEGORY_HIERARCHY;
  }, []);

  // Active Department Object
  const currentDepartment = useMemo(() => {
    return (
      departments.find((d) => d.slug === activeDepartmentSlug) ||
      departments[0]
    );
  }, [departments, activeDepartmentSlug]);

  // Active Sub-Category Object
  const currentSubCategory = useMemo(() => {
    if (!activeSubCatId) return null;
    for (const d of departments) {
      const match = d.subcategories.find((s) => s.id === activeSubCatId);
      if (match) return match;
    }
    return null;
  }, [departments, activeSubCatId]);

  // Active Leaf Category Object
  const currentLeafCategory = useMemo(() => {
    if (!activeLeafId) return null;
    for (const d of departments) {
      for (const s of d.subcategories) {
        const leaf = s.subcategories.find((l) => l.id === activeLeafId);
        if (leaf) return leaf;
      }
    }
    return null;
  }, [departments, activeLeafId]);

  // Helper to switch department
  const handleDepartmentSwitch = (dept: DepartmentCategoryDef) => {
    setActiveDepartmentSlug(dept.slug);
    setActiveSubCatId(null);
    setActiveLeafId(null);
    setSelectedCategoryId(null);
    setSelectedSubcategory('All');
    if (dept.gender === 'Women') setSelectedGender('Women');
    else if (dept.gender === 'Men') setSelectedGender('Men');
    else if (dept.gender === 'Kids') setSelectedGender('Kids');
    else setSelectedGender('All');
  };

  // Helper to select a subcategory (L2)
  const handleSubCategorySelect = (sub: SubCategoryDef) => {
    if (activeSubCatId === sub.id) {
      setActiveSubCatId(null);
      setActiveLeafId(null);
      setSelectedSubcategory('All');
    } else {
      setActiveSubCatId(sub.id);
      setActiveLeafId(null);
      setSelectedSubcategory(sub.name);
    }
  };

  // Helper to select a leaf (L3)
  const handleLeafSelect = (leaf: SubSubCategoryDef, parentSub: SubCategoryDef) => {
    if (activeLeafId === leaf.id) {
      setActiveLeafId(null);
      setSelectedSubcategory('All');
    } else {
      setActiveSubCatId(parentSub.id);
      setActiveLeafId(leaf.id);
      setSelectedSubcategory(leaf.name);
      onSelectCategory(leaf.id);
    }
  };

  // Reset all filters
  const handleClearAllCategoryFilters = () => {
    setActiveSubCatId(null);
    setActiveLeafId(null);
    setSelectedCategoryId(null);
    setSelectedSubcategory('All');
    onResetCategory();
  };

  // Compute products matching the active category selections
  const displayProducts = useMemo(() => {
    let prods = [...filteredCategoryProducts];

    if (activeLeafId) {
      const q = activeLeafId.toLowerCase();
      const leafName = currentLeafCategory?.name.toLowerCase() || '';
      prods = prods.filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pWear = (p.wear || '').toLowerCase();
        return (
          pCat.includes(q) ||
          pName.includes(q) ||
          pWear.includes(q) ||
          (leafName && (pCat.includes(leafName) || pName.includes(leafName) || pWear.includes(leafName)))
        );
      });
    } else if (activeSubCatId && currentSubCategory) {
      const q = currentSubCategory.name.toLowerCase();
      prods = prods.filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pWear = (p.wear || '').toLowerCase();
        return pCat.includes(q) || pName.includes(q) || pWear.includes(q);
      });
    }

    return prods.length > 0 ? prods : filteredCategoryProducts;
  }, [filteredCategoryProducts, activeLeafId, activeSubCatId, currentLeafCategory, currentSubCategory]);

  return (
    <>
      {/* 1. Hyper-Local Atelier Stores Horizontal Strip */}
      <View style={{ paddingTop: 12, paddingBottom: 10 }}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Store size={13} color="#FF5A1F" />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '900',
                color: '#FF5A1F',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              SHOP BY LOCAL DARK STORE
            </Text>
          </View>

          <Pressable onPress={onViewAllStores} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#111111' }}>View All Hubs</Text>
            <ChevronRight size={12} color="#111111" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {ATELIER_STORES.map((store) => (
            <Pressable
              key={store.id}
              onPress={() => onSelectStore(store)}
              style={({ pressed }) => ({
                width: 175,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E5E0D8',
                padding: 8,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ width: '100%', height: 74, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
                <Image source={{ uri: store.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    left: 5,
                    backgroundColor: '#FF5A1F',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>
                    {store.deliveryMinutes}M DROP
                  </Text>
                </View>
              </View>
              <Text numberOfLines={1} style={{ fontSize: 11.5, fontWeight: '800', color: '#111111', marginBottom: 1 }}>
                {store.shortName}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 9.5, color: '#71717A' }}>
                {store.locality}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 2. Ajio / Myntra Level 1 Department Tabs */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 9.5,
            fontWeight: '900',
            color: '#8A8580',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            marginBottom: 7,
          }}
        >
          BROWSE DEPARTMENTS
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ gap: 8 }}
        >
          {departments.map((dept) => {
            const isSelected = activeDepartmentSlug === dept.slug;
            return (
              <Pressable
                key={dept.id}
                onPress={() => handleDepartmentSwitch(dept)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: isSelected ? '#111111' : '#FFFFFF',
                  borderWidth: 1.2,
                  borderColor: isSelected ? '#111111' : '#E8E4DC',
                }}
              >
                {dept.slug === 'women' && (
                  <Sparkles size={12} color={isSelected ? '#FF5A1F' : '#71717A'} />
                )}
                {dept.slug === 'men' && (
                  <Shirt size={12} color={isSelected ? '#FF5A1F' : '#71717A'} />
                )}
                {dept.slug === 'kids' && (
                  <Smile size={12} color={isSelected ? '#FF5A1F' : '#71717A'} />
                )}
                {dept.slug === 'footwear' && (
                  <Footprints size={12} color={isSelected ? '#FF5A1F' : '#71717A'} />
                )}
                {dept.slug === 'beauty' && (
                  <Gem size={12} color={isSelected ? '#FF5A1F' : '#71717A'} />
                )}
                {dept.slug === 'accessories' && (
                  <ShoppingBag size={12} color={isSelected ? '#FF5A1F' : '#71717A'} />
                )}

                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#FFFFFF' : '#333333',
                  }}
                >
                  {dept.name}
                </Text>

                {isSelected && (
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: '#FF5A1F',
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Department Hero Banner */}
      <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
        <View
          style={{
            height: 98,
            borderRadius: 18,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#18181B',
            justifyContent: 'center',
          }}
        >
          <Image
            source={{ uri: currentDepartment.banner }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <View style={{ paddingHorizontal: 16, zIndex: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <View
                style={{
                  backgroundColor: '#FF5A1F',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 8.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 }}>
                  {currentDepartment.badge || 'CURATED ATELIER'}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: '#E4E4E7', fontWeight: '700' }}>
                {currentDepartment.countText}
              </Text>
            </View>

            <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 }}>
              {currentDepartment.name} Collection
            </Text>
            <Text style={{ fontSize: 10.5, color: '#D4D4D8', marginTop: 1 }}>
              {currentDepartment.subcategories.length} Sections • Doorstep Trial & 18m Express
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Active Breadcrumb & Filter Reset Bar */}
      {(activeSubCatId || activeLeafId || activeCategory) && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: '#FFF4EE',
            borderWidth: 1,
            borderColor: '#FFE2D1',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, paddingRight: 8 }}>
            <SlidersHorizontal size={12} color="#FF5A1F" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#111111' }} numberOfLines={1}>
              {currentDepartment.name}
              {currentSubCategory ? ` › ${currentSubCategory.name}` : ''}
              {currentLeafCategory ? ` › ${currentLeafCategory.name}` : ''}
            </Text>
          </View>

          <Pressable
            onPress={handleClearAllCategoryFilters}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
          >
            <RotateCcw size={10} color="#FF5A1F" />
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#FF5A1F' }}>Clear Filter</Text>
          </Pressable>
        </View>
      )}

      {/* 5. Ajio/Myntra Level 2 Sub-Categories & Level 3 Leaf Cards */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {currentDepartment.subcategories.map((subCat) => {
          const isSubActive = activeSubCatId === subCat.id;
          return (
            <View
              key={subCat.id}
              style={{
                marginBottom: 18,
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: 12,
                borderWidth: 1,
                borderColor: isSubActive ? '#FF5A1F' : '#EAE6DF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              {/* L2 Header */}
              <Pressable
                onPress={() => handleSubCategorySelect(subCat)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F4F1EA',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#F3EFEA',
                    }}
                  >
                    <Image source={{ uri: subCat.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '900', color: '#111111' }}>
                      {subCat.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#71717A', fontWeight: '600' }}>
                      {subCat.subcategories.length} styles • {subCat.countText}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: isSubActive ? '#FF5A1F' : '#F4F1EA',
                    paddingHorizontal: 8,
                    paddingVertical: 3.5,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: '800',
                      color: isSubActive ? '#FFFFFF' : '#333333',
                    }}
                  >
                    {isSubActive ? 'Active' : 'Explore'}
                  </Text>
                  <ChevronRight size={10} color={isSubActive ? '#FFFFFF' : '#333333'} />
                </View>
              </Pressable>

              {/* L3 Leaf Grid (3-column circular / squircle thumbnails like Ajio & Myntra) */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginHorizontal: -4,
                }}
              >
                {subCat.subcategories.map((leaf) => {
                  const isLeafActive = activeLeafId === leaf.id;
                  return (
                    <Pressable
                      key={leaf.id}
                      onPress={() => handleLeafSelect(leaf, subCat)}
                      style={{
                        width: '33.33%',
                        paddingHorizontal: 4,
                        marginBottom: 10,
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: 20,
                          overflow: 'hidden',
                          borderWidth: isLeafActive ? 2.5 : 1,
                          borderColor: isLeafActive ? '#FF5A1F' : '#E8E5DF',
                          backgroundColor: '#F7F5F0',
                          marginBottom: 5,
                          position: 'relative',
                        }}
                      >
                        <Image
                          source={{ uri: leaf.image }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                        {isLeafActive && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 3,
                              right: 3,
                              width: 16,
                              height: 16,
                              borderRadius: 8,
                              backgroundColor: '#FF5A1F',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={10} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </View>

                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 10.5,
                          fontWeight: isLeafActive ? '900' : '700',
                          color: isLeafActive ? '#FF5A1F' : '#18181B',
                          textAlign: 'center',
                          lineHeight: 13,
                        }}
                      >
                        {leaf.name}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 8.5,
                          color: '#A1A1AA',
                          fontWeight: '600',
                          marginTop: 1,
                        }}
                      >
                        {leaf.countText}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* 6. Matching Products Header & Grid */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4, marginBottom: 28 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View>
            <EditorialText
              first={activeLeafId ? 'Styles in' : 'Featured in'}
              second={
                currentLeafCategory
                  ? currentLeafCategory.name
                  : currentSubCategory
                  ? currentSubCategory.name
                  : currentDepartment.name
              }
              fontSize={16}
              lineHeight={19}
              singleLine={true}
            />
            <Text style={{ fontSize: 10, color: '#8A8580', fontWeight: '600', marginTop: 1 }}>
              {displayProducts.length} curated pieces available for instant drop
            </Text>
          </View>

          {(activeLeafId || activeSubCatId) && (
            <Pressable
              onPress={handleClearAllCategoryFilters}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                backgroundColor: '#F3EFEA',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <X size={11} color="#666666" />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#666666' }}>Reset</Text>
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map((skeletonId) => (
              <View key={skeletonId} style={{ width: '48.5%', marginBottom: 18 }}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : displayProducts.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {displayProducts.map((p) => (
              <View key={p.id} style={{ width: '48.5%', marginBottom: 18 }}>
                <ProductCard
                  product={p}
                  badge={p.old && p.old > p.price ? 'CURATED DROP' : undefined}
                  wished={activeWishlist.includes(String(p.id))}
                  onWishlist={() => onToggleWishlist(p.id)}
                  onBag={() => onAddToBag(p)}
                  onOpen={() => onOpenProduct(p)}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="NO PIECES FOUND"
            body={`No pieces currently found under this category filter. Try selecting a different sub-category.`}
            action="RESET FILTERS"
            onClick={handleClearAllCategoryFilters}
          />
        )}
      </View>

      {/* 7. Atelier Private Suite Promotional Card */}
      <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
        <AnimatedPressable
          onPress={() => onSelectCategory('western')}
          style={{
            height: 102,
            backgroundColor: '#0D0D11',
            borderRadius: 22,
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
            borderWidth: 1.2,
            borderColor: 'rgba(212, 175, 55, 0.3)',
          }}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85' }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '48%' }}
            contentFit="cover"
          />

          <LinearGradient
            colors={['transparent', 'rgba(13, 13, 17, 0.6)', '#0D0D11', '#0D0D11']}
            start={{ x: 0.15, y: 0.5 }}
            end={{ x: 0.52, y: 0.5 }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flex: 1, marginLeft: '36%', paddingRight: 16, justifyContent: 'center', zIndex: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <Sparkles size={11} color="#D4AF37" />
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#D4AF37', letterSpacing: 1.8, textTransform: 'uppercase' }}>
                PRIVATE SUITE
              </Text>
            </View>

            <EditorialText first="The" second="atelier." fontSize={21} lineHeight={24} color="#FFFFFF" singleLine={true} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 10.5, fontWeight: '500', color: '#A1A1AA', flex: 1, paddingRight: 8 }} numberOfLines={1}>
                The most coveted luxury labels
              </Text>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowRight size={11} color="#D4AF37" strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </AnimatedPressable>
      </View>
    </>
  );
});
