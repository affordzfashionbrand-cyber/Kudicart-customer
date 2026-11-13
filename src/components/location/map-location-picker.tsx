import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import * as Location from 'expo-location';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  Zap,
  Building,
  Home,
  Briefcase,
  Crosshair,
  Compass,
} from 'lucide-react-native';
import { FontStyles } from '@/constants/theme';
import {
  useAddressStore,
  checkAddressServiceability,
  DARK_STORE_HUB,
  DEFAULT_DARK_STORES,
  ServiceabilityResult,
} from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { reverseGeocodeCoords, GeocodedAddress } from '@/services/geocoding';
import { AddressModel } from '@/services/api';

// Safe conditional import for react-native-maps
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativeCircle: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default;
    NativeMarker = Maps.Marker;
    NativeCircle = Maps.Circle;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('[MapLocationPicker] react-native-maps load notice:', e);
  }
}

interface MapLocationPickerProps {
  visible: boolean;
  initialCoords?: { latitude: number; longitude: number };
  onClose: () => void;
  onAddressConfirmed: (address: AddressModel) => void;
  onRequestAuth?: () => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  visible,
  initialCoords,
  onClose,
  onAddressConfirmed,
  onRequestAuth,
}) => {
  const { isAuthenticated } = useAuthStore();
  const { addAddress, confirmLocation } = useAddressStore();
  const { darkStores } = useCatalogStore();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialCoords?.latitude || DARK_STORE_HUB.latitude,
    longitude: initialCoords?.longitude || DARK_STORE_HUB.longitude,
  });

  const [geocodedAddr, setGeocodedAddr] = useState<GeocodedAddress | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);

  // Address Details Form Step
  const [step, setStep] = useState<'MAP' | 'DETAILS'>('MAP');
  const [houseNumber, setHouseNumber] = useState('');
  const [apartmentRoad, setApartmentRoad] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Chennai');
  const [pincode, setPincode] = useState('600074');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Active Hubs for radius visualization
  const activeHubs = useMemo(() => {
    const hubs = (darkStores || []).filter((h: any) => h?.isActive !== false);
    return hubs.length > 0 ? hubs : DEFAULT_DARK_STORES;
  }, [darkStores]);

  // Primary hub coordinates
  const primaryHub = activeHubs[0] || DARK_STORE_HUB;
  const hubLat = typeof primaryHub.lat === 'number' ? primaryHub.lat : primaryHub.latitude;
  const hubLng = typeof primaryHub.lng === 'number' ? primaryHub.lng : primaryHub.longitude;

  // Update geocoding and serviceability when coordinates change
  const handleCoordsChange = (lat: number, lng: number) => {
    setCoords({ latitude: lat, longitude: lng });
    setIsGeocoding(true);

    const serv = checkAddressServiceability({
      id: '',
      userId: '',
      label: 'Selected Location',
      line1: '',
      locality: '',
      city: 'Chennai',
      pincode: '',
      latitude: lat,
      longitude: lng,
      isDefault: false,
    });
    setServiceability(serv);

    reverseGeocodeCoords(lat, lng)
      .then((rev) => {
        setGeocodedAddr(rev);
        setApartmentRoad(rev.road || '');
        setLocality(rev.locality || '');
        setCity(rev.city || 'Chennai');
        setPincode(rev.pincode || '600074');
      })
      .catch((err) => {
        console.warn('[MapLocationPicker] reverseGeocode error:', err);
      })
      .finally(() => {
        setIsGeocoding(false);
      });
  };

  // Initialize coordinates
  useEffect(() => {
    if (visible) {
      setStep('MAP');
      setFormError(null);
      if (initialCoords) {
        setCoords(initialCoords);
        handleCoordsChange(initialCoords.latitude, initialCoords.longitude);
      } else {
        handleCoordsChange(hubLat, hubLng);
      }
    }
  }, [visible, initialCoords, hubLat, hubLng]);

  // Acquire live GPS position from device
  const handleAcquireCurrentGps = async () => {
    setIsLocatingUser(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFormError('Location permission denied. Please pick a location on the map.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      handleCoordsChange(lat, lng);
    } catch (err: any) {
      console.warn('[MapLocationPicker] GPS error:', err);
      setFormError(err?.message || 'Could not acquire GPS location.');
    } finally {
      setIsLocatingUser(false);
    }
  };

  // Handle messages from Web Leaflet map
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MAP_PIN_MOVED') {
        const { lat, lng } = e.data;
        if (typeof lat === 'number' && typeof lng === 'number') {
          handleCoordsChange(lat, lng);
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleCoordsChange]);

  // Proceed to Address Details Form
  const handleProceedToDetails = () => {
    setFormError(null);
    setStep('DETAILS');
  };

  // Save the address to backend (Customer ID)
  const handleSaveAddress = async () => {
    if (!houseNumber.trim()) {
      setFormError('Please enter Flat / House / Building Number.');
      return;
    }
    if (!locality.trim()) {
      setFormError('Please enter Locality / Area.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      label: addressLabel,
      line1: `${houseNumber.trim()}${apartmentRoad.trim() ? `, ${apartmentRoad.trim()}` : ''}`,
      line2: apartmentRoad.trim() || undefined,
      locality: locality.trim(),
      city: city.trim() || 'Chennai',
      state: geocodedAddr?.state || 'Tamil Nadu',
      pincode: pincode.trim().replace(/\D/g, '') || '600074',
      latitude: coords.latitude,
      longitude: coords.longitude,
      isDefault,
    };

    try {
      if (!isAuthenticated) {
        // Save as preview in-memory so guest flow is not broken
        const confirmed = await confirmLocation(payload);
        setIsSaving(false);
        onAddressConfirmed(confirmed);
        onClose();
        return;
      }

      const saved = await addAddress(payload);
      setIsSaving(false);
      onAddressConfirmed(saved);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      setFormError(err?.message || 'Failed to save address. Please try again.');
    }
  };

  // HTML5 Leaflet Map for Web with Draggable Marker & Darkstore Radius Circles
  const leafletHtml = useMemo(() => {
    const lat = coords.latitude;
    const lng = coords.longitude;

    const hubCirclesJs = activeHubs
      .map((h: any) => {
        const hLat = typeof h.lat === 'number' ? h.lat : h.latitude;
        const hLng = typeof h.lng === 'number' ? h.lng : h.longitude;
        const radMeters = (typeof h.maxRadiusKm === 'number' ? h.maxRadiusKm : 8.0) * 1000;
        const hName = h.name || 'Express Hub';
        return `
          L.circle([${hLat}, ${hLng}], {
            color: '#FF5A1F',
            fillColor: '#FF5A1F',
            fillOpacity: 0.12,
            radius: ${radMeters},
            weight: 1.5,
            dashArray: '4, 4'
          }).addTo(map).bindPopup("<b>${hName}</b><br/>18-Min Instant Drop Zone (8km)");
          
          L.marker([${hLat}, ${hLng}], {
            icon: L.divIcon({
              className: 'hub-icon',
              html: '<div style="background:#111;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">🏪</div>',
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            })
          }).addTo(map).bindPopup("<b>${hName}</b>");
        `;
      })
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #F4F1EA; font-family: -apple-system, sans-serif; }
          .custom-pin {
            width: 36px;
            height: 36px;
            background: #FF5A1F;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(255, 90, 31, 0.5);
            border: 3px solid #FFFFFF;
            cursor: grab;
          }
          .custom-pin:active { cursor: grabbing; }
          .custom-pin-inner {
            width: 12px;
            height: 12px;
            background: #FFFFFF;
            border-radius: 50%;
            transform: rotate(45deg);
          }
          .pin-shadow {
            width: 14px;
            height: 6px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            margin-top: -3px;
            margin-left: 11px;
            filter: blur(2px);
          }
          .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          ${hubCirclesJs}

          var pinIcon = L.divIcon({
            className: 'pin-wrapper',
            html: '<div class="custom-pin"><div class="custom-pin-inner"></div></div><div class="pin-shadow"></div>',
            iconSize: [36, 42],
            iconAnchor: [18, 38]
          });

          var marker = L.marker([${lat}, ${lng}], {
            draggable: true,
            icon: pinIcon
          }).addTo(map);

          function notifyParent(newLat, newLng) {
            window.parent.postMessage({
              type: 'MAP_PIN_MOVED',
              lat: Number(newLat.toFixed(6)),
              lng: Number(newLng.toFixed(6))
            }, '*');
          }

          marker.on('dragend', function(e) {
            var position = marker.getLatLng();
            notifyParent(position.lat, position.lng);
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            notifyParent(e.latlng.lat, e.latlng.lng);
          });
        </script>
      </body>
      </html>
    `;
  }, [coords.latitude, coords.longitude, activeHubs]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable
            onPress={step === 'DETAILS' ? () => setStep('MAP') : onClose}
            hitSlop={12}
            style={styles.backButton}
          >
            {step === 'DETAILS' ? (
              <ChevronLeft size={20} color="#111111" />
            ) : (
              <X size={20} color="#111111" />
            )}
          </Pressable>

          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={[FontStyles.sansBold, { fontSize: 16, color: '#111111' }]} numberOfLines={1}>
              {step === 'MAP' ? 'Set Delivery Pin' : 'Complete Delivery Address'}
            </Text>
            <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#8A857D' }]} numberOfLines={1}>
              {step === 'MAP'
                ? 'Drag pin to your exact doorstep on the map'
                : 'Linked directly to your Customer ID'}
            </Text>
          </View>

          {step === 'MAP' && (
            <Pressable
              onPress={handleAcquireCurrentGps}
              disabled={isLocatingUser}
              style={styles.gpsIconBtn}
            >
              {isLocatingUser ? (
                <ActivityIndicator size="small" color="#FF5A1F" />
              ) : (
                <Crosshair size={18} color="#FF5A1F" />
              )}
            </Pressable>
          )}
        </View>

        {/* Step 1: Interactive Map Screen */}
        {step === 'MAP' ? (
          <View style={{ flex: 1 }}>
            {/* Map Area */}
            <View style={{ flex: 1, position: 'relative' }}>
              {Platform.OS === 'web' ? (
                <iframe
                  title="Interactive Map"
                  srcDoc={leafletHtml}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : NativeMapView ? (
                <NativeMapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFill}
                  initialRegion={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }}
                  onRegionChangeComplete={(region: any) => {
                    handleCoordsChange(region.latitude, region.longitude);
                  }}
                >
                  {/* Delivery Spot Marker */}
                  <NativeMarker
                    coordinate={coords}
                    draggable
                    onDragEnd={(e: any) => {
                      const c = e.nativeEvent.coordinate;
                      handleCoordsChange(c.latitude, c.longitude);
                    }}
                  >
                    <View style={styles.nativePin}>
                      <MapPin size={24} color="#FFFFFF" fill="#FF5A1F" />
                    </View>
                  </NativeMarker>

                  {/* Darkstore Delivery Radius Circles */}
                  {activeHubs.map((h: any) => {
                    const hLat = typeof h.lat === 'number' ? h.lat : h.latitude;
                    const hLng = typeof h.lng === 'number' ? h.lng : h.longitude;
                    const radKm = typeof h.maxRadiusKm === 'number' ? h.maxRadiusKm : 8.0;
                    return (
                      <NativeCircle
                        key={h.id || h.name}
                        center={{ latitude: hLat, longitude: hLng }}
                        radius={radKm * 1000}
                        strokeColor="#FF5A1F"
                        fillColor="rgba(255, 90, 31, 0.12)"
                        strokeWidth={1.5}
                      />
                    );
                  })}
                </NativeMapView>
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.mapFallback]}>
                  <Compass size={32} color="#FF5A1F" />
                  <Text style={[FontStyles.sansMedium, { fontSize: 13, color: '#111111', marginTop: 8 }]}>
                    Interactive Map Canvas
                  </Text>
                </View>
              )}

              {/* Serviceability Floating Badge */}
              <View style={styles.floatingServiceBadge}>
                {serviceability?.isServiceable ? (
                  <View style={[styles.badgePill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Zap size={13} color="#059669" fill="#059669" />
                    <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#059669' }]}>
                      18-MIN DROP AVAILABLE • {serviceability.distanceKm} km from {serviceability.nearestHubName}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.badgePill, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <AlertTriangle size={13} color="#DC2626" />
                    <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#DC2626' }]}>
                      OUT OF 18-MIN ZONE ({serviceability?.distanceKm} km)
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Bottom Card */}
            <View style={styles.bottomCard}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={styles.pinCircle}>
                  <MapPin size={18} color="#FF5A1F" />
                </View>

                <View style={{ flex: 1 }}>
                  {isGeocoding ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
                      <ActivityIndicator size="small" color="#FF5A1F" />
                      <Text style={[FontStyles.sansMedium, { fontSize: 12, color: '#8A857D' }]}>
                        Locating exact doorstep address...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[FontStyles.sansBold, { fontSize: 15, color: '#111111' }]} numberOfLines={1}>
                        {locality || 'Chennai Express Hub'}
                      </Text>
                      <Text
                        style={[FontStyles.sansRegular, { fontSize: 12, color: '#6B6667', marginTop: 2, lineHeight: 17 }]}
                        numberOfLines={2}
                      >
                        {geocodedAddr?.formattedAddress || `${locality}, ${city} - ${pincode}`}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {formError && (
                <View style={styles.errorBanner}>
                  <AlertTriangle size={13} color="#DC2626" />
                  <Text style={[FontStyles.sansMedium, { fontSize: 11, color: '#DC2626', flex: 1 }]}>
                    {formError}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleProceedToDetails}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && { opacity: 0.88 },
                ]}
              >
                <Text style={[FontStyles.sansBold, { fontSize: 13.5, color: '#FFFFFF', letterSpacing: 0.5 }]}>
                  CONFIRM LOCATION & ENTER HOUSE NO.
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Step 2: Address Details Form */
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.formContainer}
          >
            <View style={styles.addressSummaryCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="#059669" />
                <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#059669' }]}>
                  PINPOINTED ON MAP
                </Text>
              </View>
              <Text style={[FontStyles.sansMedium, { fontSize: 13, color: '#111111', marginTop: 4 }]}>
                {locality}, {city} - {pincode}
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#8A857D', marginTop: 2 }]}>
                {apartmentRoad || 'Road selected via map pin'}
              </Text>
            </View>

            {/* Input: House / Flat No */}
            <View style={styles.fieldGroup}>
              <Text style={[FontStyles.sansBold, styles.fieldLabel]}>
                HOUSE / FLAT / BUILDING NO. *
              </Text>
              <TextInput
                value={houseNumber}
                onChangeText={setHouseNumber}
                placeholder="e.g. Flat 402, Sunshine Residency"
                placeholderTextColor="#A8A29E"
                style={[FontStyles.sansMedium, styles.textInput]}
              />
            </View>

            {/* Input: Road / Apartment */}
            <View style={styles.fieldGroup}>
              <Text style={[FontStyles.sansBold, styles.fieldLabel]}>
                APARTMENT / ROAD / STREET
              </Text>
              <TextInput
                value={apartmentRoad}
                onChangeText={setApartmentRoad}
                placeholder="e.g. 1st Main Road, Gandhi Nagar"
                placeholderTextColor="#A8A29E"
                style={[FontStyles.sansMedium, styles.textInput]}
              />
            </View>

            {/* Locality & City Row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[FontStyles.sansBold, styles.fieldLabel]}>LOCALITY / AREA</Text>
                <TextInput
                  value={locality}
                  onChangeText={setLocality}
                  placeholder="e.g. Pozhichalur"
                  placeholderTextColor="#A8A29E"
                  style={[FontStyles.sansMedium, styles.textInput]}
                />
              </View>

              <View style={[styles.fieldGroup, { width: 110 }]}>
                <Text style={[FontStyles.sansBold, styles.fieldLabel]}>PINCODE</Text>
                <TextInput
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  maxLength={6}
                  style={[FontStyles.sansBold, styles.textInput]}
                />
              </View>
            </View>

            {/* Address Tag Selector */}
            <View style={styles.fieldGroup}>
              <Text style={[FontStyles.sansBold, styles.fieldLabel]}>SAVE ADDRESS AS</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['Home', 'Work', 'Other'] as const).map((tag) => {
                  const isSelected = addressLabel === tag;
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => setAddressLabel(tag)}
                      style={[
                        styles.tagChip,
                        isSelected && { borderColor: '#FF5A1F', backgroundColor: '#FFF7ED' },
                      ]}
                    >
                      {tag === 'Home' && (
                        <Home size={14} color={isSelected ? '#FF5A1F' : '#6B6667'} />
                      )}
                      {tag === 'Work' && (
                        <Briefcase size={14} color={isSelected ? '#FF5A1F' : '#6B6667'} />
                      )}
                      {tag === 'Other' && (
                        <Building size={14} color={isSelected ? '#FF5A1F' : '#6B6667'} />
                      )}
                      <Text
                        style={[
                          FontStyles.sansBold,
                          { fontSize: 12, color: isSelected ? '#FF5A1F' : '#6B6667' },
                        ]}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Default Address Checkbox */}
            <Pressable
              onPress={() => setIsDefault(!isDefault)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 }}
            >
              <View
                style={[
                  styles.checkbox,
                  isDefault && { backgroundColor: '#FF5A1F', borderColor: '#FF5A1F' },
                ]}
              >
                {isDefault && <CheckCircle2 size={13} color="#FFFFFF" />}
              </View>
              <Text style={[FontStyles.sansMedium, { fontSize: 13, color: '#111111' }]}>
                Make this my primary delivery address
              </Text>
            </Pressable>

            {/* Sign in prompt banner if guest */}
            {!isAuthenticated && (
              <View style={styles.authNoticeBanner}>
                <Building size={16} color="#FF5A1F" />
                <View style={{ flex: 1 }}>
                  <Text style={[FontStyles.sansBold, { fontSize: 12, color: '#111111' }]}>
                    Save permanently to your Customer ID
                  </Text>
                  <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#6B6667', marginTop: 1 }]}>
                    Sign in to sync this address across all your devices.
                  </Text>
                </View>
                {onRequestAuth && (
                  <Pressable
                    onPress={onRequestAuth}
                    style={{ backgroundColor: '#111111', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
                  >
                    <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#FFFFFF' }]}>SIGN IN</Text>
                  </Pressable>
                )}
              </View>
            )}

            {formError && (
              <View style={styles.errorBanner}>
                <AlertTriangle size={13} color="#DC2626" />
                <Text style={[FontStyles.sansMedium, { fontSize: 11, color: '#DC2626', flex: 1 }]}>
                  {formError}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSaveAddress}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && { opacity: 0.88 },
                isSaving && { backgroundColor: '#A8A29E' },
              ]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#FFFFFF', letterSpacing: 0.6 }]}>
                  {isAuthenticated ? 'SAVE DELIVERY ADDRESS' : 'CONFIRM DELIVERY LOCATION'}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  floatingServiceBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 20,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nativePin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallback: {
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    borderTopWidth: 1,
    borderTopColor: '#E8E5DF',
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  confirmButton: {
    backgroundColor: '#FF5A1F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  addressSummaryCard: {
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#8A857D',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: '#111111',
  },
  tagChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E5DF',
    backgroundColor: '#FAF8F5',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D6D3D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
});
