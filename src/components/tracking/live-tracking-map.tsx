import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
  Linking,
  Modal,
  StyleSheet,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import {
  MapPin,
  Store,
  Maximize2,
  Minimize2,
  ExternalLink,
  Compass,
  Bike,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  LocateFixed,
} from 'lucide-react-native';
import { OrderStatus } from '@/services/api';

// Safe conditional import for react-native-maps
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default;
    NativeMarker = Maps.Marker;
    NativePolyline = Maps.Polyline;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('[CustomerMap] react-native-maps load notice:', e);
  }
}

export interface LiveTrackingMapProps {
  status: OrderStatus;
  etaMinutes: number;
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    photo?: string;
    rating: number | null;
    currentLocation?: {
      latitude: number;
      longitude: number;
      heading?: number;
      accuracy?: number;
      speed?: number;
      updatedAt?: string;
    } | null;
    isStale?: boolean;
  } | null;
  hubName?: string;
  destinationAddress?: string;
  isDarkStore?: boolean;
  deliveryCoordinates?: {
    latitude: number;
    longitude: number;
  };
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  route?: {
    encodedPolyline?: string;
    coordinates?: [number, number][];
    distanceKm?: string;
    durationMinutes?: number;
    isRealRoute?: boolean;
    isStraightLineReference?: boolean;
    routeUnavailable?: boolean;
  } | null;
}

export const ALL_STAGES: { key: OrderStatus; label: string; progress: number; eta: number }[] = [
  { key: 'PLACED', label: 'Order Placed', progress: 0.05, eta: 18 },
  { key: 'ACCEPTED', label: 'Vendor Accepted', progress: 0.16, eta: 16 },
  { key: 'PREPARING', label: 'Preparing Garment', progress: 0.30, eta: 13 },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', progress: 0.44, eta: 10 },
  { key: 'ASSIGNED', label: 'Rider Assigned', progress: 0.58, eta: 8 },
  { key: 'PICKED_UP', label: 'Picked Up', progress: 0.72, eta: 6 },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', progress: 0.88, eta: 3 },
  { key: 'DELIVERED', label: 'Delivered', progress: 1.0, eta: 0 },
];

export function LiveTrackingMap({
  status,
  etaMinutes,
  driver,
  hubName = 'Affordz Express Hub',
  destinationAddress = '',
  isDarkStore = true,
  deliveryCoordinates = { latitude: 12.9658, longitude: 77.6465 },
  pickupCoordinates = { latitude: 12.9716, longitude: 77.6412 },
  route,
}: LiveTrackingMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<any>(null);

  // Pulse animation for live markers
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const hasDriverAssigned = Boolean(driver && driver.name && driver.name !== 'Assigning delivery partner...');
  const hasLiveLocation = Boolean(
    hasDriverAssigned &&
    driver?.currentLocation?.latitude &&
    driver?.currentLocation?.longitude
  );
  const isStale = Boolean(driver?.isStale);

  const driverLat = driver?.currentLocation?.latitude;
  const driverLng = driver?.currentLocation?.longitude;

  // Derive route polyline coordinates
  const polylineCoords = useMemo(() => {
    if (route?.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 1) {
      return route.coordinates.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
    }
    // If live driver location is ready, line from driver to destination
    if (hasLiveLocation && driverLat !== undefined && driverLng !== undefined) {
      return [
        { latitude: driverLat, longitude: driverLng },
        { latitude: deliveryCoordinates.latitude, longitude: deliveryCoordinates.longitude },
      ];
    }
    return [
      { latitude: pickupCoordinates.latitude, longitude: pickupCoordinates.longitude },
      { latitude: deliveryCoordinates.latitude, longitude: deliveryCoordinates.longitude },
    ];
  }, [route, hasLiveLocation, driverLat, driverLng, pickupCoordinates, deliveryCoordinates]);

  // Recenter camera on driver & destination
  const handleRecenter = () => {
    if (!mapRef.current) return;
    try {
      const pointsToFit = [
        { latitude: deliveryCoordinates.latitude, longitude: deliveryCoordinates.longitude },
      ];
      if (hasLiveLocation && driver?.currentLocation) {
        pointsToFit.push({
          latitude: driver.currentLocation.latitude,
          longitude: driver.currentLocation.longitude,
        });
      } else {
        pointsToFit.push({
          latitude: pickupCoordinates.latitude,
          longitude: pickupCoordinates.longitude,
        });
      }

      mapRef.current.fitToCoordinates(pointsToFit, {
        edgePadding: { top: 60, right: 50, bottom: 60, left: 50 },
        animated: true,
      });
    } catch {}
  };

  const handleOpenGoogleMaps = () => {
    const lat = deliveryCoordinates.latitude;
    const lng = deliveryCoordinates.longitude;
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}(${encodeURIComponent(destinationAddress)})`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(destinationAddress)})`,
    }) || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url).catch(() => {});
  };

  const renderStatusBanner = () => {
    if (status === 'DELIVERED') {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <CheckCircle2 size={15} color="#15803D" />
          <Text style={[styles.statusBannerText, { color: '#166534' }]}>Delivered to your doorstep</Text>
        </View>
      );
    }

    if (!hasDriverAssigned) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <Clock size={15} color="#D97706" />
          <Text style={[styles.statusBannerText, { color: '#92400E' }]}>Finding delivery partner...</Text>
        </View>
      );
    }

    if (!hasLiveLocation) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <Bike size={15} color="#2563EB" />
          <Text style={[styles.statusBannerText, { color: '#1E40AF' }]}>Delivery partner assigned • Waiting for GPS signal</Text>
        </View>
      );
    }

    if (isStale) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <AlertCircle size={15} color="#DC2626" />
          <Text style={[styles.statusBannerText, { color: '#991B1B' }]}>Waiting for live location... (Signal paused)</Text>
        </View>
      );
    }

    if (route?.isStraightLineReference) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
          <Compass size={15} color="#64748B" />
          <Text style={[styles.statusBannerText, { color: '#475569' }]}>
            Direct reference line (Live road route unavailable)
          </Text>
        </View>
      );
    }

    if (route?.routeUnavailable) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <AlertCircle size={15} color="#D97706" />
          <Text style={[styles.statusBannerText, { color: '#B45309' }]}>
            Road route calculation unavailable
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <View style={styles.liveGreenDot} />
        <Text style={[styles.statusBannerText, { color: '#166534' }]}>
          Live GPS tracking active {route?.distanceKm ? `• ${route.distanceKm} away` : ''}
        </Text>
      </View>
    );
  };

  const renderMapCanvas = (mapHeight: number) => {
    const isWebOrNoNative = Platform.OS === 'web' || !NativeMapView;

    return (
      <View style={[styles.mapCard, { height: mapHeight }]}>
        {isWebOrNoNative ? (
          // Web Preview / Fallback SVG Map Surface
          <View style={styles.webFallbackContainer}>
            <Svg width="100%" height="100%" viewBox="0 0 800 460">
              <Defs>
                <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#F9F7F2" />
                  <Stop offset="100%" stopColor="#F1EDE5" />
                </LinearGradient>
              </Defs>
              <Rect width="800" height="460" fill="url(#bgGrad)" />
              {/* Road Grid */}
              <Line x1="100" y1="370" x2="700" y2="370" stroke="#E5E0D8" strokeWidth="18" />
              <Line x1="230" y1="100" x2="230" y2="400" stroke="#E5E0D8" strokeWidth="18" />
              <Line x1="100" y1="270" x2="700" y2="270" stroke="#E5E0D8" strokeWidth="18" />
              <Line x1="520" y1="100" x2="520" y2="400" stroke="#E5E0D8" strokeWidth="18" />
              <Line x1="100" y1="110" x2="700" y2="110" stroke="#E5E0D8" strokeWidth="18" />

              {/* Active Route */}
              <Path
                d="M 140 370 L 230 370 L 230 270 L 380 270 L 380 190 L 520 190 L 520 110 L 660 110"
                stroke="#FF5A1F"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Store Point */}
              <Circle cx="140" cy="370" r="14" fill="#111111" />
              <Circle cx="140" cy="370" r="6" fill="#FFFFFF" />

              {/* Dropoff Point */}
              <Circle cx="660" cy="110" r="14" fill="#FF5A1F" />
              <Circle cx="660" cy="110" r="6" fill="#FFFFFF" />

              {/* Live Driver Beacon on Web */}
              {hasLiveLocation && (
                <G>
                  <Circle cx="450" cy="190" r="18" fill="#111111" />
                  <Circle cx="450" cy="190" r="8" fill="#FF5A1F" />
                </G>
              )}
            </Svg>
          </View>
        ) : (
          // Production Native Google Map
          <NativeMapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.nativeMap}
            initialRegion={{
              latitude: (deliveryCoordinates.latitude + pickupCoordinates.latitude) / 2,
              longitude: (deliveryCoordinates.longitude + pickupCoordinates.longitude) / 2,
              latitudeDelta: Math.max(0.015, Math.abs(deliveryCoordinates.latitude - pickupCoordinates.latitude) * 1.5),
              longitudeDelta: Math.max(0.015, Math.abs(deliveryCoordinates.longitude - pickupCoordinates.longitude) * 1.5),
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={true}
            toolbarEnabled={false}
          >
            {/* Store / Pickup Marker */}
            <NativeMarker
              coordinate={{
                latitude: pickupCoordinates.latitude,
                longitude: pickupCoordinates.longitude,
              }}
              title={hubName}
              description="Store Dispatch Hub"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.storeMarker}>
                <Store size={15} color="#FFFFFF" />
              </View>
            </NativeMarker>

            {/* Customer Delivery Destination Marker */}
            <NativeMarker
              coordinate={{
                latitude: deliveryCoordinates.latitude,
                longitude: deliveryCoordinates.longitude,
              }}
              title="Your Delivery Destination"
              description={destinationAddress}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.destMarker}>
                <MapPin size={18} color="#FFFFFF" />
              </View>
            </NativeMarker>

            {/* Real Driver Marker (Shown strictly when Driver location exists) */}
            {hasLiveLocation && driver?.currentLocation && (
              <NativeMarker
                coordinate={{
                  latitude: driver.currentLocation.latitude,
                  longitude: driver.currentLocation.longitude,
                }}
                title={driver.name}
                description={driver.vehicle || 'Affordz Delivery Partner'}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.driverMarker}>
                  <Bike size={18} color="#FFFFFF" />
                </View>
              </NativeMarker>
            )}

            {/* Google Routes API Polyline */}
            {polylineCoords.length > 1 && (
              <NativePolyline
                coordinates={polylineCoords}
                strokeColor={route?.isStraightLineReference ? '#94A3B8' : '#FF5A1F'}
                strokeWidth={route?.isStraightLineReference ? 3 : 5}
                lineDashPattern={route?.isStraightLineReference ? [8, 8] : undefined}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </NativeMapView>
        )}

        {/* Top Status Banner Overlay */}
        <View style={styles.bannerOverlay}>
          {renderStatusBanner()}
        </View>

        {/* Floating Controls Overlay */}
        <View style={styles.floatingControls}>
          <Pressable
            onPress={handleRecenter}
            style={styles.floatingBtn}
            accessibilityLabel="Recenter map"
          >
            <LocateFixed size={18} color="#111111" />
          </Pressable>

          <Pressable
            onPress={() => setIsFullscreen(true)}
            style={styles.floatingBtn}
            accessibilityLabel="Expand map"
          >
            <Maximize2 size={18} color="#111111" />
          </Pressable>
        </View>

        {/* Bottom Driver Summary Card Inside Map */}
        {hasDriverAssigned && status !== 'DELIVERED' ? (
          <View style={styles.bottomCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.pilotAvatar}>
                <Bike size={18} color="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.pilotName} numberOfLines={1}>
                    {driver?.name}
                  </Text>
                  {driver?.rating && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>{driver.rating} ★</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pilotSubtitle} numberOfLines={1}>
                  {driver?.vehicle ? `${driver.vehicle} • ` : ''}
                  {hasLiveLocation ? 'Express Delivery' : 'Preparing for departure'}
                </Text>
              </View>
            </View>

            <Pressable onPress={handleOpenGoogleMaps} style={styles.directionsBtn}>
              <ExternalLink size={12} color="#FFFFFF" />
              <Text style={styles.directionsBtnText}>MAPS</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ width: '100%', marginBottom: 14 }}>
      {renderMapCanvas(280)}

      {/* Fullscreen Map Modal */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
          <View style={styles.fullscreenHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.fullscreenTitle}>LIVE DELIVERY RADAR</Text>
            </View>
            <Pressable onPress={() => setIsFullscreen(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </Pressable>
          </View>

          <View style={{ flex: 1, padding: 14 }}>
            {renderMapCanvas(520)}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E8E5DF',
  },
  webFallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F1EC',
  },
  nativeMap: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  floatingControls: {
    position: 'absolute',
    right: 12,
    top: 50,
    zIndex: 10,
    gap: 8,
  },
  floatingBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  storeMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#171716',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  destMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5A1F',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  driverMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111111',
    borderWidth: 2.5,
    borderColor: '#FF5A1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8E5DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pilotAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilotName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111111',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  pilotSubtitle: {
    fontSize: 10.5,
    color: '#6B6667',
    marginTop: 2,
  },
  directionsBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionsBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  fullscreenHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullscreenTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: 0.5,
  },
  closeBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
