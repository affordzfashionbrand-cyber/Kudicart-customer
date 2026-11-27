import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Alert,
  Linking,
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
  Search,
  User,
  Phone,
  Users,
} from 'lucide-react-native';
import { FontStyles } from '@/constants/theme';
import {
  useAddressStore,
  checkAddressServiceability,
  DARK_STORE_HUB,
  DEFAULT_DARK_STORES,
  MAX_DARK_STORE_RADIUS_KM,
  ServiceabilityResult,
} from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import {
  reverseGeocodeCoords,
  searchLocations,
  geocodePincode,
  GeocodedAddress,
  LocationSuggestion,
} from '@/services/geocoding';
import { requestContactsPermission } from '@/services/permissionsService';
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
  const { isAuthenticated, user } = useAuthStore();
  const { addAddress, confirmLocation } = useAddressStore();
  const { darkStores } = useCatalogStore();

  const mapRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const initialMapCenterRef = useRef<{ latitude: number; longitude: number }>({
    latitude: initialCoords?.latitude || DARK_STORE_HUB.latitude,
    longitude: initialCoords?.longitude || DARK_STORE_HUB.longitude,
  });

  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialCoords?.latitude || DARK_STORE_HUB.latitude,
    longitude: initialCoords?.longitude || DARK_STORE_HUB.longitude,
  });

  const [geocodedAddr, setGeocodedAddr] = useState<GeocodedAddress | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);

  // Location Search & Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Address Details Form Step
  const [step, setStep] = useState<'MAP' | 'DETAILS'>('MAP');
  const [receiverMode, setReceiverMode] = useState<'SELF' | 'OTHER'>('SELF');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
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

  // Clean presentation Title & Subtitle for bottom card
  const displayTitle = useMemo(() => {
    if (geocodedAddr?.road && geocodedAddr.road !== 'Selected Location') {
      return geocodedAddr.locality && !geocodedAddr.road.toLowerCase().includes(geocodedAddr.locality.toLowerCase())
        ? `${geocodedAddr.road}, ${geocodedAddr.locality}`
        : geocodedAddr.road;
    }
    return geocodedAddr?.locality || locality || 'Selected Location';
  }, [geocodedAddr, locality]);

  const displaySubtitle = useMemo(() => {
    let full = geocodedAddr?.formattedAddress || `${locality}, ${city} - ${pincode}`;
    if (displayTitle && full.toLowerCase().startsWith(displayTitle.toLowerCase() + ', ')) {
      full = full.slice(displayTitle.length + 2);
    }
    return full;
  }, [geocodedAddr, locality, city, pincode, displayTitle]);

  // Primary hub coordinates
  const primaryHub = activeHubs[0] || DARK_STORE_HUB;
  const hubLat = typeof primaryHub.lat === 'number' ? primaryHub.lat : primaryHub.latitude;
  const hubLng = typeof primaryHub.lng === 'number' ? primaryHub.lng : primaryHub.longitude;

  // Recenter native map or web Leaflet iframe smoothly without reloading
  const moveMapTo = useCallback((lat: number, lng: number) => {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'SET_MAP_CENTER', lat, lng },
          '*',
        );
      } catch {
        // ignore cross-frame postMessage errors
      }
    } else if (mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        350,
      );
    }
  }, []);

  // Update geocoding and serviceability when coordinates change
  const handleCoordsChange = useCallback((lat: number, lng: number) => {
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
  }, []);

  // Acquire live GPS position from device
  const handleAcquireCurrentGps = useCallback(async () => {
    setIsLocatingUser(true);
    setFormError(null);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        const webPos = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 10000 },
          );
        });
        handleCoordsChange(webPos.latitude, webPos.longitude);
        moveMapTo(webPos.latitude, webPos.longitude);
        return;
      }

      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        if (!perm.canAskAgain && Platform.OS !== 'web') {
          Alert.alert(
            'Location Permission Blocked',
            'Location access is blocked in your device settings. Please enable GPS permissions to locate your delivery doorstep.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
          setFormError('Location permission is blocked in settings. Please drag the pin on map or enable in Settings.');
        } else {
          setFormError('Location permission denied. Please pick a location on the map.');
        }
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Location Services Disabled',
            'Your device GPS is turned off. Please turn on location services in device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        }
        setFormError('Device GPS is turned off. Please enable location services or drag the pin.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      handleCoordsChange(lat, lng);
      moveMapTo(lat, lng);
    } catch (err: any) {
      console.warn('[MapLocationPicker] GPS error:', err);
      setFormError(err?.message || 'Could not acquire GPS location.');
    } finally {
      setIsLocatingUser(false);
    }
  }, [handleCoordsChange, moveMapTo]);

  // Initialize coordinates and auto-detect GPS if permission already granted
  useEffect(() => {
    if (!visible) return;
    setStep('MAP');
    setFormError(null);
    setSearchQuery('');
    setSuggestions([]);
    setReceiverMode('SELF');
    setRecipientName(user?.name || '');
    setRecipientPhone(user?.phone || '');

    if (initialCoords) {
      initialMapCenterRef.current = initialCoords;
      handleCoordsChange(initialCoords.latitude, initialCoords.longitude);
      moveMapTo(initialCoords.latitude, initialCoords.longitude);
      return;
    }

    initialMapCenterRef.current = { latitude: hubLat, longitude: hubLng };
    handleCoordsChange(hubLat, hubLng);
    moveMapTo(hubLat, hubLng);

    // Attempt silent GPS auto-detection if permission is already granted
    (async () => {
      try {
        if (Platform.OS === 'web') return;
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === 'granted') {
          const enabled = await Location.hasServicesEnabledAsync();
          if (enabled) {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            handleCoordsChange(pos.coords.latitude, pos.coords.longitude);
            moveMapTo(pos.coords.latitude, pos.coords.longitude);
          }
        }
      } catch {
        // Keep hub fallback quietly
      }
    })();
  }, [visible, initialCoords, hubLat, hubLng, handleCoordsChange, moveMapTo, user?.name, user?.phone]);

  // Debounced Location Search Autocomplete
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    const controller = new AbortController();
    setIsSearchingPlaces(true);
    const timer = setTimeout(() => {
      searchLocations(trimmed, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) {
            setSuggestions(results);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearchingPlaces(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelectSuggestion = useCallback(
    (item: LocationSuggestion) => {
      setSearchQuery(item.title);
      setSuggestions([]);
      handleCoordsChange(item.latitude, item.longitude);
      moveMapTo(item.latitude, item.longitude);
    },
    [handleCoordsChange, moveMapTo],
  );

  const handleSearchSubmit = useCallback(async () => {
    const digits = searchQuery.replace(/\D/g, '');
    if (digits.length === 6) {
      setIsSearchingPlaces(true);
      try {
        const res = await geocodePincode(digits);
        if (res) {
          setSuggestions([]);
          handleCoordsChange(res.latitude, res.longitude);
          moveMapTo(res.latitude, res.longitude);
        }
      } finally {
        setIsSearchingPlaces(false);
      }
    } else if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  }, [searchQuery, suggestions, handleCoordsChange, moveMapTo, handleSelectSuggestion]);

  const handlePickContact = useCallback(async () => {
    setReceiverMode('OTHER');
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).contacts?.select) {
      try {
        const picked = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (Array.isArray(picked) && picked[0]) {
          const pickedName = Array.isArray(picked[0].name) ? picked[0].name[0] : picked[0].name;
          const pickedTel = Array.isArray(picked[0].tel) ? picked[0].tel[0] : picked[0].tel;
          if (pickedName) setRecipientName(String(pickedName));
          if (pickedTel) setRecipientPhone(String(pickedTel));
          return;
        }
      } catch {
        // user dismissed
      }
    }
    if (Platform.OS === 'android') {
      const granted = await requestContactsPermission();
      if (!granted) {
        setFormError('Contacts permission denied. Enter receiver name & phone manually.');
        return;
      }
    }
    setFormError('Enter receiver name & 10-digit phone number below.');
  }, []);

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
    if (!recipientName.trim()) {
      setFormError('Please enter Receiver Name.');
      return;
    }
    const cleanReceiverPhone = recipientPhone.replace(/\D/g, '');
    if (cleanReceiverPhone.length < 10) {
      setFormError('Please enter a valid 10-digit Receiver Phone Number.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      label: addressLabel,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
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

  // HTML5 Leaflet Map for Web with Draggable Marker & Darkstore 3km Boundary Ring (No orange fill overlay)
  const leafletHtml = useMemo(() => {
    const lat = initialMapCenterRef.current.latitude;
    const lng = initialMapCenterRef.current.longitude;

    const hubCirclesJs = activeHubs
      .map((h: any) => {
        const hLat = typeof h.lat === 'number' ? h.lat : h.latitude;
        const hLng = typeof h.lng === 'number' ? h.lng : h.longitude;
        const radKm =
          typeof h.maxRadiusKm === 'number'
            ? Math.min(h.maxRadiusKm, MAX_DARK_STORE_RADIUS_KM)
            : MAX_DARK_STORE_RADIUS_KM;
        const radMeters = radKm * 1000;
        const hName = String(h.name || 'Express Hub').replace(/"/g, '&quot;');
        return `
          L.circle([${hLat}, ${hLng}], {
            color: '#111111',
            opacity: 0.35,
            fillColor: 'transparent',
            fillOpacity: 0,
            radius: ${radMeters},
            weight: 1.5,
            dashArray: '5, 5'
          }).addTo(map).bindPopup("<b>${hName}</b><br/>19-Min Instant Drop Zone (${radKm}km)");
          
          L.marker([${hLat}, ${hLng}], {
            icon: L.divIcon({
              className: 'hub-icon',
              html: '<div style="background:#111;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">ðŸª</div>',
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

          window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'SET_MAP_CENTER') {
              var nextLat = Number(e.data.lat);
              var nextLng = Number(e.data.lng);
              if (isFinite(nextLat) && isFinite(nextLng)) {
                marker.setLatLng([nextLat, nextLng]);
                map.setView([nextLat, nextLng], 16, { animate: true });
              }
            }
          });
        </script>
      </body>
      </html>
    `;
  }, [activeHubs]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: Platform.OS === 'web' ? '#EDE8E1' : '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            width: '100%',
            maxWidth: Platform.OS === 'web' ? 480 : '100%',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}
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
            {/* Location Search Bar + Pincode Lookup with Autocomplete */}
            <View style={styles.searchSection}>
              <View style={styles.searchInputBar}>
                <Search size={16} color="#8A857D" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  placeholder="Search area, street, landmark or 6-digit pincode"
                  placeholderTextColor="#A8A29E"
                  returnKeyType="search"
                  style={[FontStyles.sansMedium, styles.searchInput]}
                />
                {isSearchingPlaces ? (
                  <ActivityIndicator size="small" color="#FF5A1F" />
                ) : searchQuery.length > 0 ? (
                  <Pressable
                    onPress={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    hitSlop={8}
                  >
                    <X size={15} color="#8A857D" />
                  </Pressable>
                ) : null}
              </View>

              {suggestions.length > 0 && (
                <View style={styles.suggestionsDropdown}>
                  <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 210 }}>
                    {suggestions.map((item, idx) => (
                      <Pressable
                        key={item.id}
                        onPress={() => handleSelectSuggestion(item)}
                        style={({ pressed }) => [
                          styles.suggestionRow,
                          idx < suggestions.length - 1 && styles.suggestionDivider,
                          pressed && { backgroundColor: '#FAF8F5' },
                        ]}
                      >
                        <MapPin size={15} color="#FF5A1F" style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[FontStyles.sansBold, { fontSize: 12.5, color: '#111111' }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[FontStyles.sansRegular, { fontSize: 11, color: '#6B6667', marginTop: 1 }]} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Map Area */}
            <View style={{ flex: 1, position: 'relative' }}>
              {Platform.OS === 'web' ? (
                <iframe
                  ref={iframeRef}
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
                  ref={mapRef}
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

                  {/* Darkstore Delivery Radius Boundary Ring (No orange fill overlay) */}
                  {activeHubs.map((h: any) => {
                    const hLat = typeof h.lat === 'number' ? h.lat : h.latitude;
                    const hLng = typeof h.lng === 'number' ? h.lng : h.longitude;
                    const radKm =
                      typeof h.maxRadiusKm === 'number'
                        ? Math.min(h.maxRadiusKm, MAX_DARK_STORE_RADIUS_KM)
                        : MAX_DARK_STORE_RADIUS_KM;
                    return (
                      <NativeCircle
                        key={h.id || h.name}
                        center={{ latitude: hLat, longitude: hLng }}
                        radius={radKm * 1000}
                        strokeColor="rgba(17, 17, 17, 0.35)"
                        fillColor="transparent"
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
                      19-MIN DROP AVAILABLE • {serviceability.distanceKm} km from {serviceability.nearestHubName}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.badgePill, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <AlertTriangle size={13} color="#DC2626" />
                    <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#DC2626' }]}>
                      OUT OF 3.0 KM ZONE ({serviceability?.distanceKm} km)
                    </Text>
                  </View>
                )}
              </View>

              {/* Floating Recenter / Current GPS Button */}
              <Pressable
                onPress={handleAcquireCurrentGps}
                disabled={isLocatingUser}
                accessibilityRole="button"
                accessibilityLabel="Use current GPS location"
                style={({ pressed }) => [
                  styles.recenterFloatingBtn,
                  pressed && { opacity: 0.9 },
                ]}
              >
                {isLocatingUser ? (
                  <ActivityIndicator size="small" color="#FF5A1F" />
                ) : (
                  <Crosshair size={16} color="#FF5A1F" />
                )}
                <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#111111' }]}>
                  {isLocatingUser ? 'Locating...' : 'Use Current GPS'}
                </Text>
              </Pressable>
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
                      <Text style={[FontStyles.sansBold, { fontSize: 16, color: '#111111' }]} numberOfLines={1}>
                        {displayTitle}
                      </Text>
                      <Text
                        style={[FontStyles.sansRegular, { fontSize: 12, color: '#6B6667', marginTop: 2, lineHeight: 18 }]}
                        numberOfLines={2}
                      >
                        {displaySubtitle}
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

            {/* Receiver Details Section */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[FontStyles.sansBold, styles.fieldLabel, { marginBottom: 0 }]}>
                  RECEIVER DETAILS *
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable
                    onPress={() => {
                      setReceiverMode('SELF');
                      setRecipientName(user?.name || '');
                      setRecipientPhone(user?.phone || '');
                    }}
                    style={[
                      styles.receiverQuickChip,
                      receiverMode === 'SELF' && styles.receiverQuickChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        FontStyles.sansBold,
                        { fontSize: 10.5, color: receiverMode === 'SELF' ? '#FFFFFF' : '#111111' },
                      ]}
                    >
                      Myself
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setReceiverMode('OTHER');
                      setRecipientName('');
                      setRecipientPhone('');
                    }}
                    style={[
                      styles.receiverQuickChip,
                      receiverMode === 'OTHER' && styles.receiverQuickChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        FontStyles.sansBold,
                        { fontSize: 10.5, color: receiverMode === 'OTHER' ? '#FFFFFF' : '#111111' },
                      ]}
                    >
                      Someone Else
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handlePickContact}
                    style={[
                      styles.receiverQuickChip,
                      { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5', borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
                    ]}
                  >
                    <Users size={11} color="#FF5A1F" />
                    <Text style={[FontStyles.sansBold, { fontSize: 10.5, color: '#FF5A1F' }]}>
                      Contacts
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.receiverInputWrapper, { flex: 1 }]}>
                  <User size={14} color="#8A857D" />
                  <TextInput
                    value={recipientName}
                    onChangeText={setRecipientName}
                    placeholder="Receiver Name *"
                    placeholderTextColor="#A8A29E"
                    style={[FontStyles.sansMedium, styles.receiverInput]}
                  />
                </View>

                <View style={[styles.receiverInputWrapper, { flex: 1 }]}>
                  <Phone size={14} color="#8A857D" />
                  <TextInput
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    placeholder="Receiver Phone *"
                    placeholderTextColor="#A8A29E"
                    keyboardType="phone-pad"
                    style={[FontStyles.sansMedium, styles.receiverInput]}
                  />
                </View>
              </View>
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
    </View>
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
  searchSection: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DF',
    zIndex: 30,
  },
  searchInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111111',
  },
  suggestionsDropdown: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E5DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EA',
  },
  recenterFloatingBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 20,
  },
  receiverQuickChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F4F1EA',
  },
  receiverQuickChipActive: {
    backgroundColor: '#111111',
  },
  receiverInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  receiverInput: {
    flex: 1,
    fontSize: 13,
    color: '#111111',
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
