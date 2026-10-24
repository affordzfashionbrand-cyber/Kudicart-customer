import React from 'react';
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
} from 'lucide-react-native';
import { ProductCard } from '@/components/common/product-card';
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
}: CategoryGridSectionProps) {
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
            <Store size={12} color="#FF5A1F" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color: '#FF5A1F',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              SHOP BY LOCAL STORE
            </Text>
          </View>

          <Pressable onPress={onViewAllStores} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#111111' }}>View All Stores</Text>
            <ChevronRight size={12} color="#111111" />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
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

      {/* 2. Gender Department Filter Strip */}
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F3EFEA',
            padding: 4,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E8E4DC',
          }}
        >
          {GENDER_TABS.map((tab) => {
            const isSelected = selectedGender === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  setSelectedGender(tab.id);
                  setSelectedCategoryId(null);
                  setSelectedSubcategory('All');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: isSelected ? '#111111' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#ffffff' : '#6B6667',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Category Selection Breadcrumb */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <EditorialText
          first={activeCategory ? 'Selected' : 'Explore all'}
          second={activeCategory ? activeCategory.name : 'departments'}
          fontSize={15}
          lineHeight={18}
          singleLine={true}
        />

        {activeCategory ? (
          <Pressable onPress={onResetCategory} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <RotateCcw size={11} color="#FF5A1F" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF5A1F' }}>View All</Text>
          </Pressable>
        ) : (
          <Text style={{ fontSize: 11, color: '#8A8580', fontWeight: '600' }}>
            {visibleCategories.length} Categories
          </Text>
        )}
      </View>

      {/* 4. Subcategory Pills Strip */}
      {activeCategory && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {activeCategory.subcategories.map((sub) => {
              const active = selectedSubcategory === sub;
              return (
                <Pressable
                  key={sub}
                  onPress={() => setSelectedSubcategory(sub)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5.5,
                    borderRadius: 14,
                    backgroundColor: active ? '#111111' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: active ? '#111111' : '#D9D9D5',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: active ? '800' : '600', color: active ? '#FFFFFF' : '#4A4A4A' }}>
                    {sub}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 5. Product Grid OR Department Cards */}
      {activeCategory ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 4, marginBottom: 28 }}>
          {filteredCategoryProducts.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredCategoryProducts.map((p) => (
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
              title="NO PIECES MATCH"
              body={`No pieces currently found under ${activeCategory.name} - ${selectedSubcategory}.`}
              action="RESET FILTERS"
              onClick={onResetCategory}
            />
          )}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, marginBottom: 24, gap: 10 }}>
          {visibleCategories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              style={({ pressed }) => ({
                height: 104,
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                overflow: 'hidden',
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <View style={{ width: '38%', height: '100%', position: 'relative' }}>
                <Image source={{ uri: cat.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
              </View>

              <View style={{ flex: 1, paddingHorizontal: 14, justifyContent: 'center' }}>
                <Text style={{ fontSize: 14.5, fontWeight: '900', color: '#111111', marginBottom: 2 }}>
                  {cat.name}
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', lineHeight: 14, marginBottom: 6 }}>
                  {cat.subtitle}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#FF5A1F' }}>
                    Shop Collection
                  </Text>
                  <ChevronRight size={11} color="#FF5A1F" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* 6. Atelier Private Suite Promotional Card */}
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
