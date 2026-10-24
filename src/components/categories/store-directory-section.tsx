import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  RotateCcw,
  Store,
  MapPin,
  Clock,
  Zap,
  ShieldCheck,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react-native';
import { ProductCard } from '@/components/common/product-card';
import { EmptyState } from '@/components/common/empty-state';
import { EditorialText } from '@/components/common/section-title';
import { ProductItem } from '@/data/homeData';
import { AtelierStoreDef, ATELIER_STORES } from './category-data';

interface StoreDirectorySectionProps {
  activeStore: AtelierStoreDef | null;
  storeProducts: ProductItem[];
  storeTypeFilter: 'ALL' | 'DARK_STORE' | 'BRAND_BOUTIQUE';
  setStoreTypeFilter: (filter: 'ALL' | 'DARK_STORE' | 'BRAND_BOUTIQUE') => void;
  storeSubFilter: string;
  setStoreSubFilter: (filter: string) => void;
  visibleStores: AtelierStoreDef[];
  activeWishlist: string[];
  onSelectStore: (store: AtelierStoreDef) => void;
  onBackToAllStores: () => void;
  onToggleWishlist: (id: string | number) => void;
  onAddToBag: (product: ProductItem) => void;
  onOpenProduct: (product: any) => void;
}

export const StoreDirectorySection = React.memo(function StoreDirectorySection({
  activeStore,
  storeProducts,
  storeTypeFilter,
  setStoreTypeFilter,
  storeSubFilter,
  setStoreSubFilter,
  visibleStores,
  activeWishlist,
  onSelectStore,
  onBackToAllStores,
  onToggleWishlist,
  onAddToBag,
  onOpenProduct,
}: StoreDirectorySectionProps) {
  if (activeStore) {
    return (
      <View style={{ paddingTop: 10 }}>
        {/* Store Hero Banner */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: '#111111',
              borderRadius: 22,
              overflow: 'hidden',
              position: 'relative',
              borderWidth: 1.5,
              borderColor: '#2A2A2A',
              elevation: 6,
            }}
          >
            <Image
              source={{ uri: activeStore.image }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                opacity: 0.35,
              }}
              contentFit="cover"
            />

            <LinearGradient
              colors={['rgba(17,17,17,0.7)', 'rgba(17,17,17,0.95)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ padding: 18, position: 'relative', zIndex: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' }} />
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: '800',
                      color: '#22C55E',
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                    }}
                  >
                    OPEN NOW • LIVE DISPATCH
                  </Text>
                </View>

                <Pressable
                  onPress={onBackToAllStores}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    paddingHorizontal: 10,
                    paddingVertical: 4.5,
                    borderRadius: 12,
                  }}
                >
                  <RotateCcw size={10} color="#FFFFFF" />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>Switch Store</Text>
                </Pressable>
              </View>

              <EditorialText
                text={activeStore.name}
                fontSize={21}
                lineHeight={25}
                color="#FFFFFF"
                singleLine={true}
              />

              <Text style={{ fontSize: 11.5, color: '#D4D4D8', marginTop: 3, lineHeight: 16 }}>
                {activeStore.tagline}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 12,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 255, 255, 0.12)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color="#FF5A1F" />
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' }}>
                    {activeStore.locality} ({activeStore.distanceKm} km)
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Zap size={11} color="#22C55E" />
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#22C55E' }}>
                    {activeStore.deliveryMinutes} Min Try & Buy
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={11} color="#D4AF37" />
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#D4AF37' }}>
                    {activeStore.stockCount.toLocaleString()} Live Pieces
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {activeStore.features.map((feat) => (
                  <View
                    key={feat}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      paddingHorizontal: 8,
                      paddingVertical: 3.5,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={9} color="#22C55E" strokeWidth={3} />
                    <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#E4E4E7' }}>{feat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Store Sub-filter Strip */}
        <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {[
              { id: 'ALL', label: 'All Store Styles' },
              { id: 'WOMEN', label: 'Women' },
              { id: 'MEN', label: 'Men' },
              { id: 'ETHNIC', label: 'Ethnic Silhouettes' },
              { id: 'WESTERN', label: 'Western Cuts' },
              { id: 'EXPRESS', label: '⚡ Fast Track' },
              { id: 'BUDGET', label: 'Under ₹3,500' },
            ].map((chip) => {
              const active = storeSubFilter === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => setStoreSubFilter(chip.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: active ? '#111111' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: active ? '#111111' : '#E5E0D8',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: active ? '800' : '600', color: active ? '#FFFFFF' : '#4A4A4A' }}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <View>
              <EditorialText first="Store" second="catalogue." fontSize={16} lineHeight={19} singleLine={true} withDot={true} />
              <Text style={{ fontSize: 11, color: '#71717A', fontWeight: '500', marginTop: 1 }}>
                Showing {storeProducts.length} styles from {activeStore.shortName}
              </Text>
            </View>

            {storeSubFilter !== 'ALL' && (
              <Pressable onPress={() => setStoreSubFilter('ALL')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={11} color="#FF5A1F" />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF5A1F' }}>Clear Filter</Text>
              </Pressable>
            )}
          </View>

          {storeProducts.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {storeProducts.map((p) => (
                <View key={p.id} style={{ width: '48.5%', marginBottom: 18 }}>
                  <ProductCard
                    product={p}
                    badge={`${activeStore.deliveryMinutes}M DROP`}
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
              title="NO STYLES IN THIS FILTER"
              body={`No products match this sub-filter in ${activeStore.name}.`}
              action="RESET FILTER"
              onClick={() => setStoreSubFilter('ALL')}
            />
          )}
        </View>
      </View>
    );
  }

  // Directory View (All Stores)
  return (
    <View style={{ paddingTop: 12 }}>
      {/* Header Intro */}
      <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5A1F' }} />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '800',
              color: '#FF5A1F',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            HYPER-LOCAL ATELIERS
          </Text>
        </View>

        <EditorialText first="Select" second="a store." fontSize={24} lineHeight={28} singleLine={true} withDot={true} />
        <Text style={{ fontSize: 11.5, color: '#71717A', marginTop: 3, lineHeight: 16 }}>
          Shop live inventory available for 18–35 min doorstep delivery & try-on from your nearest atelier.
        </Text>
      </View>

      {/* Store Type Filters */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[
            { id: 'ALL', label: `All Stores (${ATELIER_STORES.length})` },
            { id: 'DARK_STORE', label: '⚡ 18M Express Dark Stores' },
            { id: 'BRAND_BOUTIQUE', label: 'Artisan Brand Boutiques' },
          ].map((tab) => {
            const isSelected = storeTypeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setStoreTypeFilter(tab.id as any)}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                  borderRadius: 16,
                  backgroundColor: isSelected ? '#111111' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isSelected ? '#111111' : '#D9D9D5',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: isSelected ? '800' : '600', color: isSelected ? '#FFFFFF' : '#4A4A4A' }}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Stores Directory List */}
      <View style={{ paddingHorizontal: 16, gap: 14, marginBottom: 28 }}>
        {visibleStores.map((store) => (
          <Pressable
            key={store.id}
            onPress={() => onSelectStore(store)}
            style={({ pressed }) => ({
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1.5,
              borderColor: '#E8E5DF',
              opacity: pressed ? 0.96 : 1,
            })}
          >
            <View style={{ height: 130, position: 'relative', width: '100%' }}>
              <Image source={{ uri: store.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />

              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: store.type === 'DARK_STORE' ? '#FF5A1F' : '#111111',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 }}>
                  {store.badge}
                </Text>
              </View>

              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Clock size={10} color="#111111" />
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#111111' }}>
                  {store.deliveryMinutes}m ETA
                </Text>
              </View>

              <View style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 }}>
                  {store.name}
                </Text>
                <Text style={{ fontSize: 10.5, color: '#E4E4E7', marginTop: 1 }}>{store.locality}</Text>
              </View>
            </View>

            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {store.brands.slice(0, 4).map((b) => (
                  <View
                    key={b}
                    style={{
                      backgroundColor: '#F3EFEA',
                      paddingHorizontal: 7,
                      paddingVertical: 2.5,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#55524E' }}>{b}</Text>
                  </View>
                ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: '#F3EFEA',
                }}
              >
                <Text style={{ fontSize: 10.5, color: '#71717A', fontWeight: '600' }}>
                  {store.stockCount.toLocaleString()} live items available
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: '#111111',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>Enter Store</Text>
                  <ChevronRight size={11} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
});
