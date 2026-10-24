import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  X,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Plus,
  Check,
  Home,
  Briefcase,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useAddressStore } from '@/store/useAddressStore';
import type { AddressModel } from '@/services/api';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

const AnimatedPressable = ({
  children,
  style,
  className,
  onPress,
  scaleTo = 0.97,
}: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.timing(scale, {
      toValue: scaleTo,
      duration: 250,
      easing: bespokeEasing,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.timing(scale, {
      toValue: 1,
      duration: 250,
      easing: bespokeEasing,
      useNativeDriver: true,
    }).start();
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[style, { transform: [{ scale }] }]}
        className={className}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAddressId?: string;
  onSelectAddress: (address: AddressModel) => void;
}

export function AddressModal({
  visible,
  onClose,
  selectedAddressId,
  onSelectAddress,
}: AddressModalProps) {
  const insets = useSafeAreaInsets();
  const { addresses, addAddress, updateAddress, deleteAddress } = useAddressStore();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(600)).current;

  // New Address Form State
  const [selectedTag, setSelectedTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [newAddress, setNewAddress] = useState({
    label: 'Home Sanctuary',
    line1: '',
    locality: '',
    city: 'Bengaluru',
    pincode: '',
  });

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        easing: bespokeEasing,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(600);
      setIsAddingNew(false);
      setEditingAddressId(null);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 350,
      easing: bespokeEasing,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleStartEdit = (addr: AddressModel) => {
    setEditingAddressId(addr.id);
    setNewAddress({
      label: addr.label,
      line1: addr.line1,
      locality: addr.locality,
      city: addr.city,
      pincode: addr.pincode,
    });
    if (addr.label.toLowerCase().includes('home')) setSelectedTag('HOME');
    else if (addr.label.toLowerCase().includes('studio') || addr.label.toLowerCase().includes('work')) setSelectedTag('WORK');
    else setSelectedTag('OTHER');
    setIsAddingNew(true);
  };

  const handleDelete = async (addrId: string) => {
    await deleteAddress(addrId);
  };

  const handleTagChange = (tag: 'HOME' | 'WORK' | 'OTHER') => {
    setSelectedTag(tag);
    if (tag === 'HOME') setNewAddress(prev => ({ ...prev, label: 'Home Sanctuary' }));
    else if (tag === 'WORK') setNewAddress(prev => ({ ...prev, label: 'Studio HQ' }));
    else setNewAddress(prev => ({ ...prev, label: 'Secondary Suite' }));
  };

  const handleSaveAddress = async () => {
    if (!newAddress.line1 || !newAddress.city || !newAddress.pincode) return;

    if (editingAddressId) {
      const updated = await updateAddress(editingAddressId, newAddress);
      setEditingAddressId(null);
      setIsAddingNew(false);
      onSelectAddress(updated);
      handleClose();
    } else {
      const added = await addAddress({ ...newAddress, isDefault: false });
      if (added) {
        setIsAddingNew(false);
        onSelectAddress(added);
        handleClose();
      }
    }
  };

  const handleSelectAddress = (addr: AddressModel) => {
    onSelectAddress(addr);
    setTimeout(() => {
      handleClose();
    }, 180);
  };

  const getAddressIcon = (label: string, isSelected: boolean) => {
    const lower = (label || '').toLowerCase();
    const color = isSelected ? '#FFFFFF' : '#52525B';
    if (lower.includes('home') || lower.includes('sanctuary')) {
      return <Home size={17} color={color} strokeWidth={2.2} />;
    }
    if (
      lower.includes('studio') ||
      lower.includes('work') ||
      lower.includes('office') ||
      lower.includes('hq')
    ) {
      return <Briefcase size={17} color={color} strokeWidth={2.2} />;
    }
    return <MapPin size={17} color={color} strokeWidth={2.2} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/60 justify-end"
      >
        <Pressable className="flex-1" onPress={handleClose} />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: '88%',
            paddingBottom: Math.max(insets.bottom, 24),
          }}
          className="bg-white rounded-t-[36px] px-6 pt-3 shadow-2xl"
        >
          {/* Subtle grab bar indicator */}
          <View className="w-10 h-1 bg-zinc-200 rounded-full self-center mb-4" />

          {/* Header Row */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                {isAddingNew && (
                  <Pressable
                    onPress={() => setIsAddingNew(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="mr-1"
                  >
                    <ArrowLeft size={14} color="#8E877E" strokeWidth={2.5} />
                  </Pressable>
                )}
                <Text className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8E877E]">
                  {isAddingNew ? (editingAddressId ? 'EDIT DESTINATION' : 'NEW DESTINATION') : 'SAVED DESTINATIONS'}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 28,
                  lineHeight: 32,
                  letterSpacing: -0.5,
                  color: '#111',
                }}
              >
                <Text style={{ fontFamily: Fonts.serifRegular, fontWeight: '400' }}>
                  {isAddingNew ? (editingAddressId ? 'Edit' : 'Add') : 'Select'}
                </Text>{' '}
                <Text
                  style={{
                    fontFamily: Fonts.serifItalic,
                    fontWeight: '400',
                    fontStyle: 'italic',
                  }}
                >
                  address.
                </Text>
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-9 h-9 bg-zinc-100 rounded-full justify-center items-center active:bg-zinc-200"
            >
              <X size={16} color="#18181B" strokeWidth={2.2} />
            </Pressable>
          </View>

          {isAddingNew ? (
            <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
              {/* GPS Auto-Detect Button */}
              <Pressable
                onPress={() => {
                  setNewAddress({
                    label: selectedTag === 'HOME' ? 'Home Sanctuary' : selectedTag === 'WORK' ? 'Studio HQ' : 'Other Hub',
                    line1: 'Near 12th Main, 100ft Road',
                    locality: 'Indiranagar',
                    city: 'Bengaluru',
                    pincode: '560038',
                  });
                }}
                style={{
                  backgroundColor: '#F0F9FF',
                  borderWidth: 1,
                  borderColor: '#FFEDD5',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <MapPin size={16} color="#C2410C" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#9A3412' }}>
                    Use Current GPS Location
                  </Text>
                  <Text style={{ fontSize: 10, color: '#C2410C', marginTop: 1 }}>
                    Indiranagar, Bengaluru (18-Min Express Hub in Range)
                  </Text>
                </View>
                <View style={{ backgroundColor: '#C2410C', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF' }}>DETECT</Text>
                </View>
              </Pressable>

              {/* Quick Google Places Autocomplete Suggestions */}
              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-2">
                POPULAR BENGALURU EXPRESS ZONES
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
                {[
                  { name: 'Indiranagar', locality: '100ft Road', pincode: '560038', time: '18m' },
                  { name: 'Koramangala', locality: '80 Feet Road, 4th Block', pincode: '560034', time: '20m' },
                  { name: 'Lavelle Road', locality: 'Shantala Nagar', pincode: '560001', time: '15m' },
                  { name: 'Whitefield', locality: 'ITPL Main Road', pincode: '560066', time: '25m' },
                ].map((place) => (
                  <Pressable
                    key={place.name}
                    onPress={() => {
                      setNewAddress((prev) => ({
                        ...prev,
                        locality: place.locality,
                        city: 'Bengaluru',
                        pincode: place.pincode,
                      }));
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#E8E5DF',
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#111111' }}>
                      📍 {place.name}
                    </Text>
                    <Text style={{ fontSize: 9.5, color: '#C2410C', fontWeight: '800', marginTop: 1 }}>
                      {place.time} Drop • {place.pincode}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Type pill selector */}
              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-2">
                ADDRESS TYPE
              </Text>
              <View className="flex-row gap-2 mb-5">
                {(['HOME', 'WORK', 'OTHER'] as const).map((tag) => {
                  const isTagActive = selectedTag === tag;
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => handleTagChange(tag)}
                      className={`px-4 py-2 rounded-full border ${
                        isTagActive
                          ? 'bg-black border-black'
                          : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold tracking-[0.15em] uppercase ${
                          isTagActive ? 'text-white' : 'text-zinc-600'
                        }`}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                LABEL / NAME
              </Text>
              <TextInput
                className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4"
                placeholder="e.g. Home Sanctuary, Studio HQ"
                placeholderTextColor="#A1A1AA"
                value={newAddress.label}
                onChangeText={(t) => setNewAddress({ ...newAddress, label: t })}
              />

              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                HOUSE / FLAT / BUILDING
              </Text>
              <TextInput
                className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4"
                placeholder="e.g. Penthouse 4B, Sunrise Heights"
                placeholderTextColor="#A1A1AA"
                value={newAddress.line1}
                onChangeText={(t) => setNewAddress({ ...newAddress, line1: t })}
              />

              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                STREET / LOCALITY
              </Text>
              <TextInput
                className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4"
                placeholder="e.g. 42 Westend Boulevard, Indiranagar"
                placeholderTextColor="#A1A1AA"
                value={newAddress.locality}
                onChangeText={(t) => setNewAddress({ ...newAddress, locality: t })}
              />

              <View className="flex-row gap-3 mb-5">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                    CITY
                  </Text>
                  <TextInput
                    className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900"
                    placeholder="Bengaluru"
                    placeholderTextColor="#A1A1AA"
                    value={newAddress.city}
                    onChangeText={(t) => setNewAddress({ ...newAddress, city: t })}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                    PINCODE
                  </Text>
                  <TextInput
                    className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900"
                    placeholder="560038"
                    placeholderTextColor="#A1A1AA"
                    keyboardType="numeric"
                    maxLength={6}
                    value={newAddress.pincode}
                    onChangeText={(t) => setNewAddress({ ...newAddress, pincode: t })}
                  />
                </View>
              </View>

              <AnimatedPressable
                className="flex-row items-center bg-black rounded-full pl-6 pr-2 py-2 justify-between mt-2 active:opacity-90"
                onPress={handleSaveAddress}
              >
                <Text className="text-[11px] font-extrabold text-white uppercase tracking-[0.2em]">
                  {editingAddressId ? 'UPDATE DESTINATION' : 'SAVE & SELECT DESTINATION'}
                </Text>
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                  <ArrowRight size={17} color="#111111" strokeWidth={2.2} />
                </View>
              </AnimatedPressable>

              <Pressable
                onPress={() => {
                  setIsAddingNew(false);
                  setEditingAddressId(null);
                }}
                className="py-3 items-center mt-1"
              >
                <Text className="text-[12px] font-bold text-[#6B6667]">
                  Cancel and return to list
                </Text>
              </Pressable>
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
              <View className="gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <AnimatedPressable
                      key={addr.id}
                      onPress={() => handleSelectAddress(addr)}
                    >
                      <View
                        style={{
                          borderWidth: isSelected ? 1.5 : 1,
                          borderColor: isSelected ? '#111111' : '#D9D9D5',
                          backgroundColor: isSelected ? '#F4F1EA' : '#FFFFFF',
                          borderRadius: 20,
                          padding: 16,
                          shadowColor: isSelected ? '#000' : 'transparent',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.04 : 0,
                          shadowRadius: 6,
                          elevation: isSelected ? 1.5 : 0,
                        }}
                      >
                        {/* Top row: Icon, Label, Default tag, Selection indicator */}
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center gap-3">
                            <View
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                backgroundColor: isSelected ? '#111111' : '#F7F7F5',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {getAddressIcon(addr.label, isSelected)}
                            </View>

                            <View>
                              <View className="flex-row items-center gap-2">
                                <Text className="text-[15px] font-extrabold text-[#111111] tracking-tight">
                                  {addr.label}
                                </Text>
                                {addr.isDefault && (
                                  <View className="bg-[#111111] px-2 py-0.5 rounded-full">
                                    <Text className="text-[8px] font-bold text-white tracking-wider uppercase">
                                      DEFAULT
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Minimalist Selection indicator */}
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: isSelected ? '#111111' : 'transparent',
                              borderWidth: isSelected ? 0 : 1.5,
                              borderColor: '#D9D9D5',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected && (
                              <Check size={13} color="#FFFFFF" strokeWidth={2.8} />
                            )}
                          </View>
                        </View>

                        {/* Address detail lines */}
                        <View style={{ paddingLeft: 50 }}>
                          <Text className="text-[13px] text-[#111111] leading-[19px]">
                            {addr.line1}
                            {addr.locality ? `, ${addr.locality}` : ''}
                          </Text>
                          <Text className="text-[12px] text-[#6B6667] mt-0.5 font-medium">
                            {addr.city} • {addr.pincode}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            {addr.pincode.startsWith('560') ? (
                              <View style={{ backgroundColor: '#F0F9FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FFEDD5' }}>
                                <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#9A3412' }}>
                                  ⚡ 18-Min Express Hub in Range
                                </Text>
                              </View>
                            ) : (
                              <View style={{ backgroundColor: '#FDFBF7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E8E5DF' }}>
                                <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#78350F' }}>
                                  📦 Standard Boutique Shipping (1-3 Days)
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Address Action Controls: Edit & Delete */}
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: 16,
                              marginTop: 10,
                              paddingTop: 8,
                              borderTopWidth: 1,
                              borderTopColor: isSelected ? '#E8E5DF' : '#F4F1EA',
                            }}
                          >
                            <Pressable
                              onPress={() => handleStartEdit(addr)}
                              hitSlop={8}
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            >
                              <Pencil size={12} color="#111111" />
                              <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }}>Edit</Text>
                            </Pressable>

                            {addresses.length > 1 && (
                              <Pressable
                                onPress={() => handleDelete(addr.id)}
                                hitSlop={8}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                              >
                                <Trash2 size={12} color="#EF4444" />
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444' }}>Delete</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>

              {/* Action Card: Add New Address */}
              <AnimatedPressable
                onPress={() => setIsAddingNew(true)}
                className="mt-3.5 flex-row items-center justify-between p-4 rounded-[20px] border border-dashed border-[#D9D9D5] bg-white active:bg-[#F7F7F5]"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center">
                    <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-[14px] font-black text-[#111111] tracking-tight">
                      Add new address
                    </Text>
                    <Text className="text-[12px] text-[#6B6667] mt-0.5">
                      Apartment, penthouse, or workspace
                    </Text>
                  </View>
                </View>

                <View className="w-8 h-8 rounded-full bg-white border border-zinc-200 items-center justify-center">
                  <ArrowRight size={14} color="#71717A" />
                </View>
              </AnimatedPressable>
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
