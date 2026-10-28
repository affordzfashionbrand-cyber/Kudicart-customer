import React, { useState } from 'react';
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
} from 'react-native';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Sparkles,
  Zap,
  ChevronRight,
} from 'lucide-react-native';
import {
  useAddressStore,
  checkAddressServiceability,
  DARK_STORE_HUB,
  KNOWN_PINCODES,
} from '@/store/useAddressStore';
import { AddressModel } from '@/services/api';
import { FontStyles } from '@/constants/theme';

interface LocationOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (address: AddressModel) => void;
}

const POPULAR_LOCATIONS: {
  label: string;
  locality: string;
  line1: string;
  pincode: string;
  city: string;
}[] = [
  {
    label: 'Indiranagar 100ft Rd',
    locality: 'Indiranagar',
    line1: 'Apt 4B, Sunrise Heights, 42 Westend Blvd',
    pincode: '560038',
    city: 'Bengaluru',
  },
  {
    label: 'Koramangala 4th Block',
    locality: 'Koramangala',
    line1: 'House 14, 80ft Road, 4th Block',
    pincode: '560095',
    city: 'Bengaluru',
  },
  {
    label: 'MG Road / CBD',
    locality: 'Ashok Nagar',
    line1: 'Prestige Meridian, MG Road',
    pincode: '560001',
    city: 'Bengaluru',
  },
  {
    label: 'Domlur / HAL Airport Rd',
    locality: 'Domlur',
    line1: 'Wind Tunnel Road, Embassy Golf Links',
    pincode: '560071',
    city: 'Bengaluru',
  },
  {
    label: 'Kadubeesanahalli (Outside Radius)',
    locality: 'Kadubeesanahalli',
    line1: 'Suite 802, Prestige Tech Cloud, Outer Ring Road',
    pincode: '560103',
    city: 'Bengaluru',
  },
  {
    label: 'Whitefield (Outside Radius)',
    locality: 'Whitefield',
    line1: 'Tower B, ITPL Main Road',
    pincode: '560066',
    city: 'Bengaluru',
  },
];

export const LocationOnboardingModal: React.FC<LocationOnboardingModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    setHasLocationConfirmed,
    addAddress,
  } = useAddressStore();

  const [pincodeInput, setPincodeInput] = useState('');
  const [localityInput, setLocalityInput] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [customEvalResult, setCustomEvalResult] = useState<any>(null);

  const handleSelectLocation = async (item: {
    label: string;
    locality: string;
    line1: string;
    pincode: string;
    city: string;
  }) => {
    // Check if matching address already exists in store
    const existing = addresses.find(
      (a) => a.pincode === item.pincode || a.locality === item.locality
    );

    let targetId = existing?.id;
    let targetAddr: AddressModel;

    if (existing) {
      targetId = existing.id;
      targetAddr = existing;
      setSelectedAddressId(existing.id);
    } else {
      const created = await addAddress({
        label: item.label,
        line1: item.line1,
        locality: item.locality,
        city: item.city,
        pincode: item.pincode,
        isDefault: true,
      });
      targetId = created.id;
      targetAddr = created;
    }

    setHasLocationConfirmed(true);
    onConfirm?.(targetAddr);
    onClose();
  };

  const handleDetectCurrentLocation = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setIsDetectingLocation(false);
      // Auto-select Indiranagar Central Dark Store catchment (Serviceable)
      handleSelectLocation(POPULAR_LOCATIONS[0]);
    }, 600);
  };

  const handleCheckCustomPincode = () => {
    const pin = pincodeInput.trim().replace(/\D/g, '');
    if (pin.length !== 6) {
      setCustomEvalResult({
        error: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    const tempAddr: any = {
      pincode: pin,
      locality: localityInput.trim() || 'Custom Locality',
      city: 'Bengaluru',
      line1: 'Doorstep Address',
    };

    const res = checkAddressServiceability(tempAddr);
    setCustomEvalResult({
      ...res,
      pincode: pin,
      locality: localityInput.trim() || res.locality || 'Bengaluru',
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          justifyContent: 'flex-end',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', maxHeight: '90%' }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: Platform.OS === 'ios' ? 36 : 24,
              borderTopWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#F0ECE1',
              }}
            >
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

              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F7F5F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={17} color="#111111" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 14 }}>
              <Text style={[FontStyles.sansRegular, { fontSize: 12, color: '#6B6667', lineHeight: 17, marginBottom: 16 }]}>
                Affordz delivers luxury fashion & Try & Buy within{' '}
                <Text style={[FontStyles.sansBold, { color: '#111111' }]}>18 minutes</Text> inside our{' '}
                <Text style={[FontStyles.sansBold, { color: '#FF5A1F' }]}>8-km Dark Store radius</Text>{' '}
                from Indiranagar Hub. Select your location to verify availability.
              </Text>

              {/* 1. Detect Current Location Button */}
              <Pressable
                onPress={handleDetectCurrentLocation}
                disabled={isDetectingLocation}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: pressed ? '#FFF7ED' : '#FAF8F5',
                  borderWidth: 1.5,
                  borderColor: '#FF5A1F',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 16,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#FFF7ED',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Navigation size={18} color="#FF5A1F" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[FontStyles.sansBold, { fontSize: 13.5, color: '#111111' }]}>
                      Use Current GPS Location
                    </Text>
                    <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#059669', marginTop: 1 }]}>
                      ⚡ Indiranagar Central Hub • 18-Min Instant Drop Available
                    </Text>
                  </View>
                </View>

                {isDetectingLocation ? (
                  <ActivityIndicator size="small" color="#FF5A1F" />
                ) : (
                  <ChevronRight size={16} color="#6B6667" />
                )}
              </Pressable>

              {/* 2. Custom Pincode / Radius Verification Bar */}
              <View
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  marginBottom: 16,
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
                      marginBottom: 8,
                    },
                  ]}
                >
                  ENTER PINCODE TO CHECK RADIUS
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#D9D9D5',
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      height: 44,
                    }}
                  >
                    <Search size={15} color="#8A857D" style={{ marginRight: 6 }} />
                    <TextInput
                      value={pincodeInput}
                      onChangeText={(t) => {
                        setPincodeInput(t);
                        setCustomEvalResult(null);
                      }}
                      placeholder="Enter 6-digit Pincode (e.g. 560038)"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[FontStyles.sansBold, { flex: 1, fontSize: 12.5, color: '#111111' }]}
                    />
                  </View>

                  <Pressable
                    onPress={handleCheckCustomPincode}
                    style={{
                      backgroundColor: '#111111',
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#FFFFFF' }]}>CHECK</Text>
                  </Pressable>
                </View>

                {/* Custom Result Banner */}
                {customEvalResult && (
                  <View style={{ marginTop: 6 }}>
                    {customEvalResult.error ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={13} color="#DC2626" />
                        <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#DC2626' }]}>
                          {customEvalResult.error}
                        </Text>
                      </View>
                    ) : customEvalResult.isServiceable ? (
                      <View
                        style={{
                          backgroundColor: '#ECFDF5',
                          borderRadius: 12,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: '#A7F3D0',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={15} color="#059669" />
                          <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#059669' }]}>
                            AVAILABLE FOR 18-MIN DROP!
                          </Text>
                        </View>
                        <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#047857', marginTop: 2 }]}>
                          {customEvalResult.locality} is {customEvalResult.distanceKm} km from{' '}
                          {DARK_STORE_HUB.name} (Within 8.0 km radius).
                        </Text>
                        <Pressable
                          onPress={() =>
                            handleSelectLocation({
                              label: `${customEvalResult.locality} (Checked)`,
                              locality: customEvalResult.locality,
                              line1: `${customEvalResult.locality} Main Road`,
                              pincode: customEvalResult.pincode,
                              city: 'Bengaluru',
                            })
                          }
                          style={{
                            marginTop: 8,
                            backgroundColor: '#059669',
                            borderRadius: 8,
                            paddingVertical: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#FFFFFF' }]}>
                            CONFIRM & DELIVER HERE
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View
                        style={{
                          backgroundColor: '#FEF2F2',
                          borderRadius: 12,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: '#FECACA',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={15} color="#DC2626" />
                          <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#DC2626' }]}>
                            NOT AVAILABLE FOR THIS PLACE
                          </Text>
                        </View>
                        <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#B91C1C', marginTop: 2, lineHeight: 15 }]}>
                          {customEvalResult.reason ||
                            `Distance is ${customEvalResult.distanceKm} km, which exceeds our 8.0 km instant drop radius.`}
                        </Text>
                        <Pressable
                          onPress={() =>
                            handleSelectLocation({
                              label: `${customEvalResult.locality} (Standard)`,
                              locality: customEvalResult.locality,
                              line1: `${customEvalResult.locality} Area`,
                              pincode: customEvalResult.pincode,
                              city: 'Bengaluru',
                            })
                          }
                          style={{
                            marginTop: 8,
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#DC2626',
                            borderRadius: 8,
                            paddingVertical: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#DC2626' }]}>
                            USE FOR STANDARD BOUTIQUE (2-4 DAYS)
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* 3. Popular Locations in Bengaluru */}
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
                SELECT NEIGHBORHOOD (QUICK COMMERCE TEST LOCALITIES)
              </Text>

              {POPULAR_LOCATIONS.map((loc) => {
                const serviceInfo = checkAddressServiceability({
                  pincode: loc.pincode,
                  locality: loc.locality,
                  city: loc.city,
                  id: '',
                  userId: '',
                  label: loc.label,
                  line1: loc.line1,
                  isDefault: false,
                });

                const isSelected = addresses.some(
                  (a) => a.id === selectedAddressId && a.pincode === loc.pincode
                );

                return (
                  <Pressable
                    key={loc.pincode}
                    onPress={() => handleSelectLocation(loc)}
                    style={({ pressed }) => ({
                      backgroundColor: pressed
                        ? '#F4F1EA'
                        : isSelected
                        ? '#FFF7ED'
                        : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isSelected
                        ? '#FF5A1F'
                        : serviceInfo.isServiceable
                        ? '#E8E5DF'
                        : '#FECACA',
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[FontStyles.sansBold, { fontSize: 13, color: '#111111' }]}>
                          {loc.label}
                        </Text>
                        <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#8A857D' }]}>
                          ({loc.pincode})
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        {serviceInfo.isServiceable ? (
                          <View
                            style={{
                              backgroundColor: '#ECFDF5',
                              paddingHorizontal: 6,
                              paddingVertical: 1,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={[
                                FontStyles.sansBold,
                                {
                                  fontSize: 9.5,
                                  color: '#059669',
                                  letterSpacing: 0.5,
                                },
                              ]}
                            >
                              ⚡ AVAILABLE • {serviceInfo.distanceKm} KM (18-MIN DROP)
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={{
                              backgroundColor: '#FEF2F2',
                              paddingHorizontal: 6,
                              paddingVertical: 1,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={[
                                FontStyles.sansBold,
                                {
                                  fontSize: 9.5,
                                  color: '#DC2626',
                                  letterSpacing: 0.5,
                                },
                              ]}
                            >
                              🚫 NOT AVAILABLE • {serviceInfo.distanceKm} KM (OUTSIDE 8 KM)
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {isSelected ? (
                      <CheckCircle2 size={18} color="#FF5A1F" />
                    ) : (
                      <ChevronRight size={15} color="#8A857D" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
