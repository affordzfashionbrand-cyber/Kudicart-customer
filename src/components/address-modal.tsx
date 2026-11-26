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
  Alert,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import {
  X,
  ArrowRight,
  MapPin,
  Plus,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useAddressStore } from '@/store/useAddressStore';
import type { AddressModel } from '@/services/api';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { AddressCard } from '@/components/common/address-card';
import { reverseGeocodeCoords } from '@/services/geocoding';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAddressId?: string;
  onSelectAddress: (address: AddressModel) => void;
}

export const AddressModal = React.memo(function AddressModal({
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
  }, [visible, slideAnim]);

  const handleClose = React.useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 350,
      easing: bespokeEasing,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onClose();
    });
  }, [onClose, slideAnim]);

  const handleStartEdit = React.useCallback((addr: AddressModel) => {
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
  }, []);

  const handleDetectGPSInModal = React.useCallback(async () => {
    setIsLocating(true);
    setFormError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        if (!perm.canAskAgain && Platform.OS !== 'web') {
          Alert.alert(
            'Location Permission Blocked',
            'Location permission is blocked in your device settings. Tap "Open Settings" to enable GPS access, or type your address manually.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
          setFormError('Location permission is blocked. Open Settings or enter address manually.');
        } else {
          setFormError('Location permission denied. Please enter address manually.');
        }
        setIsLocating(false);
        return;
      }
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        if (Platform.OS !== 'web') {
          Alert.alert(
            'GPS Disabled',
            'Device location services are turned off. Please enable GPS in device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        }
        setFormError('Device GPS is turned off. Please enable GPS or enter address manually.');
        setIsLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      let line1 = '';
      let locality = '';
      let city = '';
      let pincode = '';

      try {
        const rev = await reverseGeocodeCoords(latitude, longitude);
        line1 = rev.road || '';
        locality = rev.locality || '';
        city = rev.city || '';
        pincode = rev.pincode || '';
      } catch (e) {
        console.warn('Reverse geocode fallback:', e);
      }

      setNewAddress((prev) => ({
        ...prev,
        line1: line1 || prev.line1,
        locality: locality || prev.locality,
        city: city || prev.city,
        pincode: pincode || prev.pincode,
        latitude,
        longitude,
      }));
    } catch (err: any) {
      setFormError(err?.message || 'Could not acquire GPS location.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleDelete = React.useCallback(async (addrId: string) => {
    try {
      await deleteAddress(addrId);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to delete address.');
    }
  }, [deleteAddress]);

  const handleTagChange = React.useCallback((tag: 'HOME' | 'WORK' | 'OTHER') => {
    setSelectedTag(tag);
    if (tag === 'HOME') setNewAddress(prev => ({ ...prev, label: 'Home Sanctuary' }));
    else if (tag === 'WORK') setNewAddress(prev => ({ ...prev, label: 'Studio HQ' }));
    else setNewAddress(prev => ({ ...prev, label: 'Secondary Suite' }));
  }, []);

  const handleSaveAddress = React.useCallback(async () => {
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
      setFormError('Please enter street or locality.');
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
  }, [newAddress, editingAddressId, updateAddress, addAddress, onSelectAddress, handleClose]);

  const handleSelectAddress = React.useCallback((addr: AddressModel) => {
    onSelectAddress(addr);
    setTimeout(() => {
      handleClose();
    }, 180);
  }, [onSelectAddress, handleClose]);


  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/60 justify-end items-center"
      >
        <Pressable className="flex-1 w-full" onPress={handleClose} />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            width: '100%',
            maxWidth: Platform.OS === 'web' ? 480 : undefined,
          }}
          className="bg-transparent px-[8px] pb-[40px]"
        >
          <View
            style={{
              maxHeight: '88%',
              paddingBottom: Math.max(insets.bottom, 24),
              backgroundColor: '#FFFFFF',
            }}
            className="bg-white rounded-[28px] p-[24px] border border-[#D9D9D5]"
          >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-1 mb-2">
                  <Zap size={14} color="#FF5A1F" />
                  <Text style={{ fontFamily: Fonts.sansBold }} className="text-[10px] text-[#FF5A1F] uppercase tracking-[0.15em]">
                    18-MIN INSTANT COMMERCE
                  </Text>
                </View>
                <Text style={{ fontFamily: Fonts.sansBold }} className="text-[24px] text-black tracking-tight mb-2">
                  Where should we deliver?
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                className="w-9 h-9 bg-zinc-100 rounded-full justify-center items-center"
              >
                <X size={16} color="#18181B" strokeWidth={2.5} />
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

                {/* Form fields */}
                <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">LABEL / NAME</Text>
                <TextInput className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4" placeholder="e.g. Home Sanctuary" value={newAddress.label} onChangeText={(t) => setNewAddress({ ...newAddress, label: t })} />
                <TextInput className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4" placeholder="House / Flat / Building (Line 1)" value={newAddress.line1} onChangeText={(t) => setNewAddress({ ...newAddress, line1: t })} />
                <TextInput className="h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900 mb-4" placeholder="Street / Locality" value={newAddress.locality} onChangeText={(t) => setNewAddress({ ...newAddress, locality: t })} />
                <View className="flex-row gap-2 mb-4">
                  <TextInput className="flex-1 h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900" placeholder="City" value={newAddress.city} onChangeText={(t) => setNewAddress({ ...newAddress, city: t })} />
                  <TextInput className="flex-1 h-[48px] bg-zinc-50 border border-zinc-200 rounded-[14px] px-4 text-[14px] text-zinc-900" placeholder="Pincode" value={newAddress.pincode} onChangeText={(t) => setNewAddress({ ...newAddress, pincode: t })} keyboardType="numeric" maxLength={6} />
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

                <Pressable onPress={() => { setIsAddingNew(false); setEditingAddressId(null); }} className="py-3 items-center mt-1">
                  <Text className="text-[12px] font-bold text-[#6B6667]">Cancel</Text>
                </Pressable>
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
                <View className="gap-3">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      isSelected={selectedAddressId === addr.id}
                      onSelect={() => handleSelectAddress(addr)}
                      onEdit={() => handleStartEdit(addr)}
                      onDelete={() => handleDelete(addr.id)}
                      showShippingInfo={true}
                    />
                  ))}
                </View>

                {/* Action Card: Add New Address */}
                <AnimatedPressable
                  onPress={() => setIsAddingNew(true)}
                  className="mt-6 flex-row items-center justify-between p-6 rounded-[24px] bg-[#111111] active:opacity-90"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <Plus size={22} color="#111111" strokeWidth={3} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: Fonts.sansBold }} className="text-[16px] font-black text-white tracking-tight">
                        Add new destination
                      </Text>
                      <Text style={{ fontFamily: Fonts.sansMedium }} className="text-[12px] text-zinc-400 mt-0.5">
                        Apartment, penthouse, or workspace
                      </Text>
                    </View>
                  </View>
                </AnimatedPressable>
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
