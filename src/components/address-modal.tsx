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
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
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
  AlertCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useAddressStore } from '@/store/useAddressStore';
import type { AddressModel } from '@/services/api';
import { AnimatedPressable } from '@/components/common/animated-pressable';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

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
  const { addresses, addAddress, updateAddress, deleteAddress, fetchAddresses } = useAddressStore();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(600)).current;

  // New Address Form State
  const [formError, setFormError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [newAddress, setNewAddress] = useState<{
    label: string;
    recipientName: string;
    recipientPhone: string;
    line1: string;
    line2: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
  }>({
    label: 'Home Sanctuary',
    recipientName: '',
    recipientPhone: '',
    line1: '',
    line2: '',
    locality: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    latitude: undefined,
    longitude: undefined,
    isDefault: false,
  });

  useEffect(() => {
    if (visible) {
      fetchAddresses();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        easing: bespokeEasing,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      slideAnim.setValue(600);
      setIsAddingNew(false);
      setEditingAddressId(null);
      setFormError(null);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 350,
      easing: bespokeEasing,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onClose();
    });
  };

  const handleStartEdit = (addr: AddressModel) => {
    setEditingAddressId(addr.id);
    setNewAddress({
      label: addr.label,
      recipientName: addr.recipientName || '',
      recipientPhone: addr.recipientPhone || '',
      line1: addr.line1,
      line2: addr.line2 || '',
      locality: addr.locality,
      city: addr.city,
      state: addr.state || 'Karnataka',
      pincode: addr.pincode,
      latitude: addr.latitude,
      longitude: addr.longitude,
      isDefault: addr.isDefault || false,
    });
    if (addr.label.toLowerCase().includes('home')) setSelectedTag('HOME');
    else if (addr.label.toLowerCase().includes('studio') || addr.label.toLowerCase().includes('work')) setSelectedTag('WORK');
    else setSelectedTag('OTHER');
    setFormError(null);
    setIsAddingNew(true);
  };

  const handleDetectGPSInModal = async () => {
    setIsLocating(true);
    setFormError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFormError('Location permission denied. Please enter address manually.');
        setIsLocating(false);
        return;
      }
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setFormError('Device GPS is turned off. Please enable GPS.');
        setIsLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      let line1 = 'Current Location';
      let locality = 'Indiranagar';
      let city = 'Bengaluru';
      let pincode = '560038';

      try {
        const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (rev && rev.length > 0) {
          const r = rev[0];
          const parts = [r.streetNumber, r.street, r.name].filter(Boolean);
          if (parts.length > 0) line1 = parts.join(', ');
          locality = r.district || r.subregion || r.city || locality;
          city = r.city || r.region || city;
          pincode = r.postalCode || pincode;
        }
      } catch (e) {
        console.warn('Reverse geocode fallback:', e);
      }

      setNewAddress((prev) => ({
        ...prev,
        line1,
        locality,
        city,
        pincode,
        latitude,
        longitude,
      }));
    } catch (err: any) {
      setFormError(err?.message || 'Could not acquire GPS location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleDelete = async (addrId: string) => {
    try {
      await deleteAddress(addrId);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to delete address.');
    }
  };

  const handleTagChange = (tag: 'HOME' | 'WORK' | 'OTHER') => {
    setSelectedTag(tag);
    if (tag === 'HOME') setNewAddress(prev => ({ ...prev, label: 'Home Sanctuary' }));
    else if (tag === 'WORK') setNewAddress(prev => ({ ...prev, label: 'Studio HQ' }));
    else setNewAddress(prev => ({ ...prev, label: 'Secondary Suite' }));
  };

  const handleSaveAddress = async () => {
    setFormError(null);
    if (!newAddress.line1.trim()) {
      setFormError('Please enter house / flat / apartment details.');
      return;
    }
    if (newAddress.line1.trim().length < 3) {
      setFormError('House / flat details must be at least 3 characters.');
      return;
    }
    if (!newAddress.locality.trim()) {
      setFormError('Please enter street or locality (e.g. Indiranagar).');
      return;
    }
    if (!newAddress.city.trim()) {
      setFormError('Please enter city name.');
      return;
    }
    const cleanPin = newAddress.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setFormError('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    const payload = {
      label: newAddress.label.trim(),
      recipientName: newAddress.recipientName.trim() || undefined,
      recipientPhone: newAddress.recipientPhone.trim() || undefined,
      line1: newAddress.line1.trim(),
      line2: newAddress.line2.trim() || undefined,
      locality: newAddress.locality.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim() || undefined,
      pincode: cleanPin,
      latitude: newAddress.latitude,
      longitude: newAddress.longitude,
      isDefault: newAddress.isDefault,
    };

    try {
      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, payload);
        setEditingAddressId(null);
        setIsAddingNew(false);
        onSelectAddress(updated);
        handleClose();
      } else {
        const added = await addAddress(payload);
        if (added) {
          setIsAddingNew(false);
          onSelectAddress(added);
          handleClose();
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save address. Please try again.');
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
                onPress={handleDetectGPSInModal}
                disabled={isLocating}
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
                    {isLocating
                      ? 'Acquiring GPS coordinates from device...'
                      : 'Acquire real coordinates to verify instant serviceability'}
                  </Text>
                </View>
                {isLocating ? (
                  <ActivityIndicator size="small" color="#C2410C" />
                ) : (
                  <View style={{ backgroundColor: '#C2410C', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF' }}>DETECT</Text>
                  </View>
                )}
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
              {formError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF0EA', borderWidth: 1, borderColor: 'rgba(255, 90, 31, 0.3)', borderRadius: 14, padding: 12, marginBottom: 16 }}>
                  <AlertCircle size={16} color="#FF5A1F" />
                  <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#FF5A1F', lineHeight: 16 }}>
                    {formError}
                  </Text>
                </View>
              )}
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

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                    RECIPIENT NAME (OPTIONAL)
                  </Text>
                  <TextInput
                    className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900"
                    placeholder="e.g. Ananya Sharma"
                    placeholderTextColor="#A1A1AA"
                    value={newAddress.recipientName}
                    onChangeText={(t) => setNewAddress({ ...newAddress, recipientName: t })}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                    CONTACT PHONE (OPTIONAL)
                  </Text>
                  <TextInput
                    className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900"
                    placeholder="+91 98450 12890"
                    placeholderTextColor="#A1A1AA"
                    keyboardType="phone-pad"
                    value={newAddress.recipientPhone}
                    onChangeText={(t) => setNewAddress({ ...newAddress, recipientPhone: t })}
                  />
                </View>
              </View>

              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                HOUSE / FLAT / BUILDING (LINE 1)
              </Text>
              <TextInput
                className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4"
                placeholder="e.g. Penthouse 4B, Sunrise Heights"
                placeholderTextColor="#A1A1AA"
                value={newAddress.line1}
                onChangeText={(t) => setNewAddress({ ...newAddress, line1: t })}
              />

              <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                APARTMENT / SUITE / LANDMARK (OPTIONAL)
              </Text>
              <TextInput
                className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4"
                placeholder="e.g. Near Indiranagar Metro Station"
                placeholderTextColor="#A1A1AA"
                value={newAddress.line2}
                onChangeText={(t) => setNewAddress({ ...newAddress, line2: t })}
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

              <View className="flex-row gap-2 mb-4">
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
                    STATE
                  </Text>
                  <TextInput
                    className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900"
                    placeholder="Karnataka"
                    placeholderTextColor="#A1A1AA"
                    value={newAddress.state}
                    onChangeText={(t) => setNewAddress({ ...newAddress, state: t })}
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

              <Pressable
                onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
                className="flex-row items-center gap-3 mb-5 px-1 py-2"
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: newAddress.isDefault ? '#111111' : '#D1D5DB',
                    backgroundColor: newAddress.isDefault ? '#111111' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {newAddress.isDefault && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text className="text-[13px] font-bold text-zinc-800">
                  Set as default delivery address
                </Text>
              </Pressable>

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
                          {addr.recipientName ? (
                            <Text className="text-[12px] font-bold text-[#111111] mb-0.5">
                              {addr.recipientName} {addr.recipientPhone ? `(${addr.recipientPhone})` : ''}
                            </Text>
                          ) : null}
                          <Text className="text-[13px] text-[#111111] leading-[19px]">
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ''}
                            {addr.locality ? `, ${addr.locality}` : ''}
                          </Text>
                          <Text className="text-[12px] text-[#6B6667] mt-0.5 font-medium">
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} • {addr.pincode}
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
