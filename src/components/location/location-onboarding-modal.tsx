import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Zap,
  ChevronRight,
  Home,
  Briefcase,
  Building,
  Plus,
  LogIn,
} from 'lucide-react-native';
import { FontStyles } from '@/constants/theme';
import {
  useAddressStore,
  checkAddressServiceability,
  DARK_STORE_HUB,
  ServiceabilityResult,
} from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AddressModel } from '@/services/api';
import { geocodePincode } from '@/services/geocoding';
import { MapLocationPicker } from './map-location-picker';
import { AuthModal } from '@/components/auth-modal';

interface LocationOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (address: AddressModel) => void;
}

export const LocationOnboardingModal: React.FC<LocationOnboardingModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    setHasLocationConfirmed,
    fetchAddresses,
  } = useAddressStore();

  const [pincodeInput, setPincodeInput] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<ServiceabilityResult | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Map Picker & Auth Modal State
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mapPickerInitialCoords, setMapPickerInitialCoords] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);

  // Load saved addresses when modal becomes visible
  useEffect(() => {
    if (visible && isAuthenticated) {
      fetchAddresses().catch((err) => {
        console.warn('[LocationModal] fetchAddresses failed:', err);
      });
    }
  }, [visible, isAuthenticated, fetchAddresses]);

  // Select an existing saved address
  const handleSelectSavedAddress = useCallback(
    (addr: AddressModel) => {
      setSelectedAddressId(addr.id);
      setHasLocationConfirmed(true);
      onConfirm?.(addr);
      onClose();
    },
    [setSelectedAddressId, setHasLocationConfirmed, onConfirm, onClose],
  );

  // Handle GPS detection -> opens Map Picker centered on user's exact GPS location
  const handleDetectCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    try {
      // 1. Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(
          'Location permission was denied. Please select a saved address or enter your 6-digit PIN code.',
        );
        setIsDetectingLocation(false);
        return;
      }

      // 2. Check if device location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationError(
          'Device GPS / location services are turned off. Please enable GPS on your device.',
        );
        setIsDetectingLocation(false);
        return;
      }

      // 3. Acquire current GPS position
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;

      // 4. Open Interactive Map Picker pre-centered on exact GPS position
      setMapPickerInitialCoords({ latitude, longitude });
      setIsMapPickerOpen(true);
    } catch (err: any) {
      console.warn('[LocationModal] GPS read error:', err);
      setLocationError(
        err?.message ||
          'Could not detect your current location. Please use the map or enter your PIN code manually.',
      );
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  // Check 6-digit pincode against active darkstores
  const handleCheckPincode = useCallback(async () => {
    const pin = pincodeInput.trim().replace(/\D/g, '');
    if (pin.length !== 6) {
      setLocationError('Please enter a valid 6-digit Indian PIN code.');
      setPincodeResult(null);
      return;
    }

    setIsCheckingPincode(true);
    setLocationError(null);

    try {
      const geocoded = await geocodePincode(pin);
      if (geocoded) {
        const serv = checkAddressServiceability({
          id: '',
          userId: '',
          label: geocoded.locality,
          line1: geocoded.formattedAddress,
          locality: geocoded.locality,
          city: geocoded.city,
          pincode: pin,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          isDefault: false,
        });
        setPincodeResult(serv);
      } else {
        // Fallback serviceability evaluation
        const serv = checkAddressServiceability({
          id: '',
          userId: '',
          label: 'Custom Pincode',
          line1: 'Doorstep Delivery',
          locality: 'Area',
          city: 'Chennai',
          pincode: pin,
          isDefault: false,
        });
        setPincodeResult(serv);
      }
    } catch (err: any) {
      console.warn('[LocationModal] Pincode check error:', err);
      setLocationError(err?.message || 'Unable to check PIN code serviceability.');
    } finally {
      setIsCheckingPincode(false);
    }
  }, [pincodeInput]);

  // Open map picker for confirmed pincode location
  const handleOpenMapFromPincode = useCallback(async () => {
    const pin = pincodeInput.trim().replace(/\D/g, '');
    const geocoded = await geocodePincode(pin);
    if (geocoded) {
      setMapPickerInitialCoords({
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      });
    } else {
      setMapPickerInitialCoords({
        latitude: DARK_STORE_HUB.latitude,
        longitude: DARK_STORE_HUB.longitude,
      });
    }
    setIsMapPickerOpen(true);
  }, [pincodeInput]);

  // Address confirmed callback from Map Location Picker
  const handleMapAddressConfirmed = useCallback(
    (newAddr: AddressModel) => {
      setIsMapPickerOpen(false);
      onConfirm?.(newAddr);
      onClose();
    },
    [onConfirm, onClose],
  );

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Zap size={13} color="#FF5A1F" fill="#FF5A1F" />
                    <Text
                      style={[
                        FontStyles.sansBold,
                        {
                          fontSize: 10,
                          color: '#FF5A1F',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                        },
                      ]}
                    >
                      18-MIN INSTANT COMMERCE
                    </Text>
                  </View>
                  <Text style={[FontStyles.sansBold, { fontSize: 18, color: '#111111' }]}>
                    Where should we deliver?
                  </Text>
                </View>

                <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                  <X size={17} color="#111111" />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                style={{ marginTop: 14 }}
              >
                <Text
                  style={[
                    FontStyles.sansRegular,
                    { fontSize: 12, color: '#6B6667', lineHeight: 17, marginBottom: 16 },
                  ]}
                >
                  Affordz delivers curated fashion & Try & Buy from{' '}
                  <Text style={[FontStyles.sansBold, { color: '#FF5A1F' }]}>
                    nearby dark store hubs
                  </Text>
                  . Select your location to verify availability.
                </Text>

                {/* 1. Detect Current GPS Location Button */}
                <Pressable
                  onPress={handleDetectCurrentLocation}
                  disabled={isDetectingLocation}
                  style={({ pressed }) => [
                    styles.gpsButton,
                    pressed && { backgroundColor: '#FFF7ED' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={styles.gpsIconCircle}>
                      {isDetectingLocation ? (
                        <ActivityIndicator size="small" color="#FF5A1F" />
                      ) : (
                        <Navigation size={18} color="#FF5A1F" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[FontStyles.sansBold, { fontSize: 13.5, color: '#111111' }]}>
                        Use Current GPS Location
                      </Text>
                      <Text
                        style={[FontStyles.sansRegular, { fontSize: 11, color: '#8A857D', marginTop: 1 }]}
                      >
                        Tap to acquire GPS and fine-tune on interactive map
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#8A857D" />
                </Pressable>

                {/* 2. Pincode Radius Checker */}
                <View style={styles.pincodeBox}>
                  <Text
                    style={[
                      FontStyles.sansBold,
                      {
                        fontSize: 10,
                        color: '#8A857D',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      },
                    ]}
                  >
                    ENTER PINCODE TO CHECK RADIUS
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={styles.pincodeInputWrapper}>
                      <Search size={15} color="#8A857D" />
                      <TextInput
                        value={pincodeInput}
                        onChangeText={(val) => {
                          setPincodeInput(val);
                          setPincodeResult(null);
                        }}
                        placeholder="Enter 6-digit Pincode (e.g. 600074)"
                        placeholderTextColor="#A8A29E"
                        keyboardType="numeric"
                        maxLength={6}
                        style={[FontStyles.sansMedium, styles.pincodeInput]}
                      />
                    </View>

                    <Pressable
                      onPress={handleCheckPincode}
                      disabled={isCheckingPincode}
                      style={({ pressed }) => [
                        styles.checkBtn,
                        pressed && { opacity: 0.88 },
                      ]}
                    >
                      {isCheckingPincode ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#FFFFFF' }]}>
                          CHECK
                        </Text>
                      )}
                    </Pressable>
                  </View>

                  {/* Pincode Result Banner */}
                  {pincodeResult && (
                    <View style={{ marginTop: 10 }}>
                      {pincodeResult.isServiceable ? (
                        <View style={styles.serviceableBanner}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={15} color="#059669" />
                            <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#059669' }]}>
                              AVAILABLE FOR 18-MIN DROP!
                            </Text>
                          </View>
                          <Text
                            style={[
                              FontStyles.sansRegular,
                              { fontSize: 11, color: '#047857', marginTop: 2 },
                            ]}
                          >
                            Pincode {pincodeInput} is ~{pincodeResult.distanceKm} km from{' '}
                            {pincodeResult.nearestHubName} (Within 8.0 km radius).
                          </Text>
                          <Pressable
                            onPress={handleOpenMapFromPincode}
                            style={styles.confirmPincodeBtn}
                          >
                            <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#FFFFFF' }]}>
                              PINPOINT ON MAP & DELIVER HERE
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View style={styles.unserviceableBanner}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={15} color="#DC2626" />
                            <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#DC2626' }]}>
                              NOT AVAILABLE FOR THIS PLACE
                            </Text>
                          </View>
                          <Text
                            style={[
                              FontStyles.sansRegular,
                              { fontSize: 11, color: '#B91C1C', marginTop: 2, lineHeight: 15 },
                            ]}
                          >
                            {pincodeResult.reason ||
                              `Distance is ${pincodeResult.distanceKm} km, which exceeds our 8.0 km instant drop radius.`}
                          </Text>
                          <Pressable
                            onPress={handleOpenMapFromPincode}
                            style={styles.openMapAnywayBtn}
                          >
                            <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#DC2626' }]}>
                              VIEW ON MAP
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {locationError && (
                  <View style={styles.locationErrorBox}>
                    <AlertTriangle size={14} color="#DC2626" />
                    <Text style={[FontStyles.sansMedium, { fontSize: 11.5, color: '#DC2626', flex: 1 }]}>
                      {locationError}
                    </Text>
                  </View>
                )}

                {/* 3. SAVED ADDRESSES SECTION (Strictly Saved Addresses Only) */}
                <View style={{ marginTop: 8, marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={[
                        FontStyles.sansBold,
                        {
                          fontSize: 10,
                          color: '#8A857D',
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        },
                      ]}
                    >
                      SAVED ADDRESSES
                    </Text>

                    <Pressable
                      onPress={() => {
                        setMapPickerInitialCoords(undefined);
                        setIsMapPickerOpen(true);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Plus size={13} color="#FF5A1F" />
                      <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#FF5A1F' }]}>
                        Add New
                      </Text>
                    </Pressable>
                  </View>

                  {/* State 1: User is Logged In and has saved addresses */}
                  {isAuthenticated && addresses.length > 0 ? (
                    addresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      const serviceInfo = checkAddressServiceability(addr);

                      return (
                        <Pressable
                          key={addr.id}
                          onPress={() => handleSelectSavedAddress(addr)}
                          style={({ pressed }) => [
                            styles.addressCard,
                            isSelected && {
                              borderColor: '#FF5A1F',
                              backgroundColor: '#FFF7ED',
                            },
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <View style={styles.addressTagIcon}>
                            {addr.label === 'Home' ? (
                              <Home size={15} color={isSelected ? '#FF5A1F' : '#6B6667'} />
                            ) : addr.label === 'Work' ? (
                              <Briefcase size={15} color={isSelected ? '#FF5A1F' : '#6B6667'} />
                            ) : (
                              <Building size={15} color={isSelected ? '#FF5A1F' : '#6B6667'} />
                            )}
                          </View>

                          <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text
                                style={[
                                  FontStyles.sansBold,
                                  { fontSize: 13, color: '#111111' },
                                ]}
                              >
                                {addr.label || 'Saved Address'}
                              </Text>
                              {addr.isDefault && (
                                <View style={styles.defaultPill}>
                                  <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: '#059669' }]}>
                                    DEFAULT
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text
                              style={[
                                FontStyles.sansRegular,
                                { fontSize: 11.5, color: '#6B6667', marginTop: 2, lineHeight: 16 },
                              ]}
                              numberOfLines={2}
                            >
                              {[addr.line1, addr.locality, addr.city, addr.pincode]
                                .filter(Boolean)
                                .join(', ')}
                            </Text>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 4,
                              }}
                            >
                              {serviceInfo.isServiceable ? (
                                <View style={styles.serviceableTag}>
                                  <Zap size={11} color="#059669" fill="#059669" />
                                  <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#059669' }]}>
                                    AVAILABLE • 18-MIN DROP
                                  </Text>
                                </View>
                              ) : (
                                <View style={styles.unserviceableTag}>
                                  <AlertTriangle size={11} color="#DC2626" />
                                  <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#DC2626' }]}>
                                    OUT OF 18-MIN DELIVERY ZONE
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          <View
                            style={[
                              styles.radioIndicator,
                              isSelected && {
                                borderColor: '#FF5A1F',
                                backgroundColor: '#FF5A1F',
                              },
                            ]}
                          >
                            {isSelected && <CheckCircle2 size={13} color="#FFFFFF" />}
                          </View>
                        </Pressable>
                      );
                    })
                  ) : isAuthenticated && addresses.length === 0 ? (
                    /* State 2: Logged in but no saved addresses */
                    <View style={styles.emptySavedBox}>
                      <MapPin size={24} color="#8A857D" />
                      <Text style={[FontStyles.sansBold, { fontSize: 13, color: '#111111', marginTop: 8 }]}>
                        No saved addresses yet
                      </Text>
                      <Text
                        style={[
                          FontStyles.sansRegular,
                          { fontSize: 11, color: '#8A857D', textAlign: 'center', marginTop: 3 },
                        ]}
                      >
                        Pinpoint your delivery location on the map to save it to your account.
                      </Text>
                      <Pressable
                        onPress={() => {
                          setMapPickerInitialCoords(undefined);
                          setIsMapPickerOpen(true);
                        }}
                        style={styles.addAddressCta}
                      >
                        <Plus size={14} color="#FFFFFF" />
                        <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#FFFFFF' }]}>
                          Add Delivery Address
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    /* State 3: Guest user not signed in */
                    <View style={styles.guestAuthBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.guestIconCircle}>
                          <LogIn size={18} color="#FF5A1F" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[FontStyles.sansBold, { fontSize: 13, color: '#111111' }]}>
                            Sign In to view saved addresses
                          </Text>
                          <Text
                            style={[FontStyles.sansRegular, { fontSize: 11, color: '#8A857D', marginTop: 2 }]}
                          >
                            Access your saved doorstep addresses tied to your Customer ID.
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <Pressable
                          onPress={() => setIsAuthModalOpen(true)}
                          style={styles.signInBtn}
                        >
                          <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#FFFFFF' }]}>
                            SIGN IN
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            setMapPickerInitialCoords(undefined);
                            setIsMapPickerOpen(true);
                          }}
                          style={styles.pickOnMapBtn}
                        >
                          <MapPin size={13} color="#111111" />
                          <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#111111' }]}>
                            Pick on Map
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Interactive Map Location Picker Modal */}
      <MapLocationPicker
        visible={isMapPickerOpen}
        initialCoords={mapPickerInitialCoords}
        onClose={() => setIsMapPickerOpen(false)}
        onAddressConfirmed={handleMapAddressConfirmed}
        onRequestAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal for customer sign-in */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          fetchAddresses().catch(() => {});
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderColor: '#E8E5DF',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#FF5A1F',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pincodeBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  pincodeInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  pincodeInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111111',
  },
  checkBtn: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceableBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  unserviceableBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  confirmPincodeBtn: {
    marginTop: 8,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  openMapAnywayBtn: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  locationErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressTagIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  defaultPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  serviceableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unserviceableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  radioIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D6D3D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySavedBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  addAddressCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111111',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 12,
  },
  guestAuthBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 14,
    padding: 14,
  },
  guestIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInBtn: {
    flex: 1,
    backgroundColor: '#FF5A1F',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  pickOnMapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 10,
    paddingVertical: 9,
  },
});
