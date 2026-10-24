import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import {
  X,
  Zap,
  MapPin,
  Layers,
  Check,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { EditorialText } from '@/components/common/section-title';
import { useDarkStore, DarkStore } from '@/store/useDarkStore';

interface SelectDarkStoreModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStore?: (store: DarkStore) => void;
}

export function SelectDarkStoreModal({
  visible,
  onClose,
  onSelectStore,
}: SelectDarkStoreModalProps) {
  const { darkStores, selectedDarkStore, setSelectedDarkStore } = useDarkStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'FAST' | 'LUXE'>('ALL');

  const filteredStores = useMemo(() => {
    return darkStores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'FAST') return store.deliveryMinutes <= 22;
      if (selectedFilter === 'LUXE') return store.badge?.includes('LUXE') || store.stockCount > 5000;
      return true;
    });
  }, [darkStores, searchQuery, selectedFilter]);

  const handleChooseStore = (store: DarkStore) => {
    setSelectedDarkStore(store);
    if (onSelectStore) {
      onSelectStore(store);
    }
    setTimeout(() => {
      onClose();
    }, 180);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />

        {/* Bottom Sheet Card */}
        <View
          style={{
            backgroundColor: '#111111',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderTopColor: '#2A2A2A',
            maxHeight: '88%',
            paddingTop: 14,
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
            paddingHorizontal: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.45,
            shadowRadius: 18,
          }}
        >
          {/* Pull handle indicator */}
          <View
            style={{
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#353335',
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Header Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#FF5A1F',
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '900',
                    color: '#FF5A1F',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                  }}
                >
                  HYPER-LOCAL FASHION DISPATCH
                </Text>
              </View>

              <EditorialText
                first="Select Dark"
                second="Store"
                fontSize={24}
                withDot
                color="#ffffff"
                singleLine
              />

              <Text
                style={{
                  fontSize: 12,
                  color: '#888888',
                  marginTop: 4,
                  lineHeight: 16,
                }}
              >
                Instant 18-35 min delivery direct from your nearest neighborhood wardrobe vault.
              </Text>
            </View>

            <AnimatedPressable
              onPress={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: '#1E1E1E',
                borderWidth: 1,
                borderColor: '#333333',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={16} color="#ffffff" />
            </AnimatedPressable>
          </View>

          {/* Quick Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              borderWidth: 1,
              borderColor: '#2A2A2A',
              borderRadius: 16,
              paddingHorizontal: 12,
              height: 42,
              marginBottom: 12,
            }}
          >
            <Search size={15} color="#888888" style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 13,
                color: '#ffffff',
                height: '100%',
              }}
              placeholder="Search dark store by hub or locality..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={14} color="#888888" />
              </Pressable>
            )}
          </View>

          {/* Filter Pills */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => setSelectedFilter('ALL')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: selectedFilter === 'ALL' ? '#ffffff' : '#1A1A1A',
                borderWidth: 1,
                borderColor: selectedFilter === 'ALL' ? '#ffffff' : '#2A2A2A',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: selectedFilter === 'ALL' ? '#111111' : '#888888',
                }}
              >
                All Dark Stores ({darkStores.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilter('FAST')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: selectedFilter === 'FAST' ? '#FF5A1F' : '#1A1A1A',
                borderWidth: 1,
                borderColor: selectedFilter === 'FAST' ? '#FF5A1F' : '#2A2A2A',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Zap size={11} color={selectedFilter === 'FAST' ? '#ffffff' : '#FF5A1F'} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: selectedFilter === 'FAST' ? '#ffffff' : '#888888',
                }}
              >
                Under 22 Mins
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilter('LUXE')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: selectedFilter === 'LUXE' ? '#D4AF37' : '#1A1A1A',
                borderWidth: 1,
                borderColor: selectedFilter === 'LUXE' ? '#D4AF37' : '#2A2A2A',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Sparkles size={11} color={selectedFilter === 'LUXE' ? '#111111' : '#D4AF37'} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: selectedFilter === 'LUXE' ? '#111111' : '#888888',
                }}
              >
                Curated Haute Vaults
              </Text>
            </Pressable>
          </View>

          {/* Store List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
          >
            {filteredStores.map((store) => {
              const isSelected = selectedDarkStore?.id === store.id;

              return (
                <AnimatedPressable
                  key={store.id}
                  onPress={() => handleChooseStore(store)}
                  style={{
                    backgroundColor: isSelected ? '#1A1816' : '#18181A',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#FF5A1F' : '#2A2A2D',
                    padding: 14,
                    position: 'relative',
                  }}
                >
                  {/* Top Row: Store Badge & Delivery Time */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {store.badge && (
                        <View
                          style={{
                            backgroundColor: isSelected ? 'rgba(255, 90, 31, 0.18)' : '#242426',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              fontWeight: '900',
                              color: isSelected ? '#FF5A1F' : '#A0A0A0',
                              letterSpacing: 0.6,
                            }}
                          >
                            {store.badge}
                          </Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 10, color: '#666666', fontWeight: '600' }}>
                        HUB {store.code}
                      </Text>
                    </View>

                    {/* ETA Pill */}
                    <View
                      style={{
                        backgroundColor: '#FF5A1F',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Zap size={11} color="#ffffff" fill="#ffffff" />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '900',
                          color: '#ffffff',
                          letterSpacing: 0.3,
                        }}
                      >
                        {store.deliveryMinutes} MIN DROP
                      </Text>
                    </View>
                  </View>

                  {/* Store Name & Distance */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 4,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '800',
                          color: isSelected ? '#ffffff' : '#ECECEC',
                          lineHeight: 18,
                        }}
                      >
                        {store.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4,
                        }}
                      >
                        <MapPin size={11} color="#FF5A1F" />
                        <Text style={{ fontSize: 11.5, color: '#888888' }}>
                          {store.locality} • <Text style={{ color: '#A0A0A0', fontWeight: '700' }}>{store.distanceKm} km</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Radio Checkmark */}
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: isSelected ? '#FF5A1F' : '#444444',
                        backgroundColor: isSelected ? '#FF5A1F' : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </View>

                  {/* Address Snippet */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 10.5,
                      color: '#666666',
                      marginTop: 2,
                      marginBottom: 10,
                    }}
                  >
                    {store.address}
                  </Text>

                  {/* Features Tag Row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 6,
                      borderTopWidth: 1,
                      borderTopColor: isSelected ? 'rgba(255, 90, 31, 0.15)' : '#222224',
                      paddingTop: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                        backgroundColor: '#1E1E22',
                        paddingHorizontal: 7,
                        paddingVertical: 2.5,
                        borderRadius: 6,
                      }}
                    >
                      <Layers size={10} color="#888888" />
                      <Text style={{ fontSize: 9.5, color: '#A0A0A0', fontWeight: '600' }}>
                        {store.stockCount.toLocaleString()} In-Stock Outfits
                      </Text>
                    </View>

                    {store.features.slice(0, 2).map((feat, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: '#1E1E22',
                          paddingHorizontal: 7,
                          paddingVertical: 2.5,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontSize: 9.5, color: '#888888', fontWeight: '500' }}>
                          ✓ {feat}
                        </Text>
                      </View>
                    ))}
                  </View>
                </AnimatedPressable>
              );
            })}
          </ScrollView>

          {/* Bottom Confirmation Footer if a store is selected */}
          {selectedDarkStore && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#262626',
                paddingTop: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ fontSize: 10.5, color: '#888888' }}>
                  CONNECTED FULFILLMENT HUB
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>
                  {selectedDarkStore.shortName} • <Text style={{ color: '#FF5A1F' }}>{selectedDarkStore.deliveryMinutes}m Drop</Text>
                </Text>
              </View>

              <AnimatedPressable
                onPress={onClose}
                style={{
                  backgroundColor: '#ffffff',
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                  Confirm & Shop
                </Text>
                <ChevronRight size={14} color="#111111" />
              </AnimatedPressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
