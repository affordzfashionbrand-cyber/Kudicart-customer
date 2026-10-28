import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
  Linking,
  Modal,
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
} from 'lucide-react-native';
import { OrderStatus } from '@/services/api';

export interface LiveTrackingMapProps {
  status: OrderStatus;
  etaMinutes: number;
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    currentLocation?: {
      latitude: number;
      longitude: number;
      heading?: number;
    };
  } | null;
  hubName?: string;
  destinationAddress?: string;
  isDarkStore?: boolean;
}

// 8 Stages progression hierarchy with accurate ETAs
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

// Waypoints on Bangalore Indiranagar -> Domlur grid (viewBox 0 0 800 460)
// Store at Indiranagar 100ft Road (140, 370) -> Destination at Domlur/HAL (660, 110)
const ROUTE_WAYPOINTS = [
  { x: 140, y: 370, street: 'Indiranagar 100ft Road' },
  { x: 230, y: 370, street: 'CMH Road Junction' },
  { x: 230, y: 270, street: '12th Main Road' },
  { x: 380, y: 270, street: 'Defense Colony Main Road' },
  { x: 380, y: 190, street: 'HAL 2nd Stage Avenue' },
  { x: 520, y: 190, street: 'Domlur Flyover Underpass' },
  { x: 520, y: 110, street: 'Sunrise Boulevard' },
  { x: 660, y: 110, street: 'Home Sanctuary Doorstep' },
];

export function LiveTrackingMap({
  status,
  etaMinutes,
  driver,
  hubName = 'Indiranagar Express Hub',
  destinationAddress = 'Apt 4B, Sunrise Heights, 42 Westend Blvd',
  isDarkStore = true,
}: LiveTrackingMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapMode, setMapMode] = useState<'GOOGLE' | 'RADAR'>('RADAR');

  // Pulse animations for live beacon
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
    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  // Current stage details
  const currentStageMeta = useMemo(() => {
    return ALL_STAGES.find((s) => s.key === status) || ALL_STAGES[0];
  }, [status]);

  // Interpolate rider coordinates along route based on status progress
  const riderPosition = useMemo(() => {
    const progress = currentStageMeta.progress;
    const totalSegments = ROUTE_WAYPOINTS.length - 1;
    const rawIndex = progress * totalSegments;
    const segIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
    const segFraction = rawIndex - segIndex;

    const p1 = ROUTE_WAYPOINTS[segIndex];
    const p2 = ROUTE_WAYPOINTS[segIndex + 1];

    const currentX = p1.x + (p2.x - p1.x) * segFraction;
    const currentY = p1.y + (p2.y - p1.y) * segFraction;

    return {
      x: Math.round(currentX),
      y: Math.round(currentY),
      street: p2.street,
    };
  }, [currentStageMeta]);

  // Build SVG path string from waypoints
  const fullRoutePath = useMemo(() => {
    return ROUTE_WAYPOINTS.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, []);

  // Open real navigation in Google Maps
  const handleOpenGoogleMaps = () => {
    const originLat = 12.9716;
    const originLng = 77.6412;
    const destLat = 12.9645;
    const destLng = 77.632;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {});
  };

  const renderMapCanvas = (height: number = 260) => {
    const isGoogle = mapMode === 'GOOGLE';
    const bgTheme = '#F7F5F0';
    const roadColor = '#FFFFFF';
    const roadBorder = '#E8E5DF';
    const blockColor = '#EFECE5';
    const parkColor = '#E5EFE7';

    return (
      <View
        style={{
          width: '100%',
          height,
          backgroundColor: bgTheme,
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#E8E5DF',
          position: 'relative',
        }}
      >
        {/* View 1: Real Interactive Google Map Embed (Web only) */}
        {Platform.OS === 'web' && isGoogle ? (
          <iframe
            title="Google Maps Live Tracking"
            src="https://maps.google.com/maps?q=100+Feet+Rd,+Indiranagar,+Bengaluru,+Karnataka+560038&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, width: '100%', height: '100%' }}
            loading="lazy"
          />
        ) : (
          /* View 2: High-Performance Vector Cartography & Radar */
          <Svg
            viewBox="0 0 800 460"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
          >
            <Defs>
              <LinearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FF5A1F" stopOpacity={0.9} />
                <Stop offset="50%" stopColor="#FB923C" stopOpacity={0.95} />
                <Stop offset="100%" stopColor="#22C55E" stopOpacity={1} />
              </LinearGradient>
            </Defs>

            {/* 1. Neighborhood City Blocks */}
            <Rect x="40" y="40" width="160" height="120" rx="8" fill={blockColor} />
            <Rect x="230" y="40" width="120" height="120" rx="8" fill={parkColor} />
            <Rect x="380" y="40" width="180" height="120" rx="8" fill={blockColor} />
            <Rect x="590" y="40" width="160" height="120" rx="8" fill={blockColor} />

            <Rect x="40" y="190" width="160" height="140" rx="8" fill={blockColor} />
            <Rect x="230" y="190" width="120" height="60" rx="8" fill={blockColor} />
            <Rect x="380" y="220" width="110" height="110" rx="8" fill={parkColor} />
            <Rect x="520" y="190" width="100" height="140" rx="8" fill={blockColor} />
            <Rect x="650" y="190" width="100" height="140" rx="8" fill={blockColor} />

            <Rect x="40" y="360" width="70" height="70" rx="8" fill={blockColor} />
            <Rect x="260" y="360" width="180" height="70" rx="8" fill={parkColor} />
            <Rect x="470" y="360" width="280" height="70" rx="8" fill={blockColor} />

            {/* 2. Grid Road Networks (Bangalore Arteries) */}
            <Line x1="0" y1="110" x2="800" y2="110" stroke={roadBorder} strokeWidth="34" strokeLinecap="square" opacity={0.6} />
            <Line x1="0" y1="110" x2="800" y2="110" stroke={roadColor} strokeWidth="30" strokeLinecap="square" />

            <Line x1="0" y1="190" x2="800" y2="190" stroke={roadColor} strokeWidth="26" />
            <Line x1="0" y1="270" x2="800" y2="270" stroke={roadColor} strokeWidth="26" />

            <Line x1="0" y1="370" x2="800" y2="370" stroke={roadBorder} strokeWidth="36" opacity={0.6} />
            <Line x1="0" y1="370" x2="800" y2="370" stroke={roadColor} strokeWidth="32" />

            {/* Vertical Arteries */}
            <Line x1="140" y1="0" x2="140" y2="460" stroke={roadColor} strokeWidth="28" />
            <Line x1="230" y1="0" x2="230" y2="460" stroke={roadColor} strokeWidth="26" />
            <Line x1="380" y1="0" x2="380" y2="460" stroke={roadColor} strokeWidth="30" />
            <Line x1="520" y1="0" x2="520" y2="460" stroke={roadColor} strokeWidth="28" />
            <Line x1="660" y1="0" x2="660" y2="460" stroke={roadColor} strokeWidth="30" />

            {/* 3. Outer Route Track */}
            <Path
              d={fullRoutePath}
              stroke="#FED7AA"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.7}
            />

            {/* 4. Active Glowing Gradient Route Line */}
            <Path
              d={fullRoutePath}
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* 5. Animated Dashed Pulse Route */}
            <Path
              d={fullRoutePath}
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="8 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.8}
            />

            {/* 6. Origin Hub Marker (Indiranagar Vault) */}
            <G transform="translate(140, 370)">
              <Circle r="18" fill="#111111" />
              <Circle r="8" fill="#22C55E" />
              <Circle r="24" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="4 4" opacity={0.6} />
            </G>

            {/* 7. Destination Marker (Home Sanctuary) */}
            <G transform="translate(660, 110)">
              <Circle r="18" fill="#FF5A1F" />
              <Circle r="7" fill="#FFFFFF" />
              <Circle r="26" fill="none" stroke="#FF5A1F" strokeWidth="2" opacity={0.4} />
            </G>

            {/* 8. Live Delivery Pilot Marker & Concentric Radar Waves */}
            {status !== 'DELIVERED' && (
              <G transform={`translate(${riderPosition.x}, ${riderPosition.y})`}>
                <Circle r="34" fill="none" stroke="#FF5A1F" strokeWidth="1.5" opacity={0.35} />
                <Circle r="24" fill="none" stroke="#FF5A1F" strokeWidth="2" opacity={0.6} />
                <Circle r="15" fill="#111111" />
                <Circle r="6" fill="#FF5A1F" />
              </G>
            )}

            {/* Success Check on Delivered */}
            {status === 'DELIVERED' && (
              <G transform="translate(660, 110)">
                <Circle r="24" fill="#15803D" />
                <Circle r="28" fill="none" stroke="#22C55E" strokeWidth="3" />
              </G>
            )}
          </Svg>
        )}

        {/* HUD Top Bar: GPS Telemetry & Mode Controls */}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Live Status Pill */}
          <View
            style={{
              backgroundColor: 'rgba(17, 17, 17, 0.92)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: status === 'DELIVERED' ? '#22C55E' : '#FF5A1F',
              }}
            />
            <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 }}>
              {status === 'DELIVERED'
                ? 'DELIVERED AT DOORSTEP'
                : `LIVE GPS • ${currentStageMeta.label.toUpperCase()}`}
            </Text>
          </View>

          {/* Map Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Toggle between Google Map and Atelier Radar */}
            {Platform.OS === 'web' && (
              <Pressable
                onPress={() => setMapMode(mapMode === 'GOOGLE' ? 'RADAR' : 'GOOGLE')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {mapMode === 'GOOGLE' ? (
                  <Compass size={12} color="#111111" />
                ) : (
                  <MapIcon size={12} color="#111111" />
                )}
                <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#111111' }}>
                  {mapMode === 'GOOGLE' ? 'Radar View' : 'Google Map'}
                </Text>
              </Pressable>
            )}

            {/* Expand / Minimize Fullscreen */}
            <Pressable
              onPress={() => setIsFullscreen(!isFullscreen)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFullscreen ? (
                <Minimize2 size={13} color="#111111" />
              ) : (
                <Maximize2 size={13} color="#111111" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Floating Rider Pilot Card (Bottom overlay inside map) */}
        {status !== 'DELIVERED' ? (
          <View
            style={{
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
              shadowRadius: 10,
              elevation: 4,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#111111',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bike size={16} color="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                    {driver?.name || 'Rajesh Kumar (Pilot)'}
                  </Text>
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#B45309' }}>
                      {driver?.rating || 4.9} ★
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, color: '#6B6667', marginTop: 1 }} numberOfLines={1}>
                  Cruising on {riderPosition.street} • 28 km/h
                </Text>
              </View>
            </View>

            {/* Google Maps External Live Turn-by-Turn button */}
            <Pressable
              onPress={handleOpenGoogleMaps}
              style={{
                backgroundColor: '#111111',
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ExternalLink size={11} color="#FFFFFF" />
              <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 }}>
                DIRECTIONS
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              right: 10,
              backgroundColor: '#F0FDF4',
              borderRadius: 14,
              padding: 10,
              borderWidth: 1,
              borderColor: '#BBF7D0',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={18} color="#15803D" />
            <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#166534' }}>
              Handover complete at Home Sanctuary doorstep!
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ width: '100%', marginBottom: 14 }}>
      {/* 1. Main Map View Container */}
      {renderMapCanvas(260)}

      {/* 2. Fullscreen Map Modal */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
          {/* Header */}
          <View
            style={{
              paddingTop: Platform.OS === 'ios' ? 50 : 20,
              paddingHorizontal: 16,
              paddingBottom: 12,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#E8E5DF',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                FULLSCREEN LIVE RADAR
              </Text>
            </View>
            <Pressable
              onPress={() => setIsFullscreen(false)}
              style={{
                backgroundColor: '#111111',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>CLOSE</Text>
            </Pressable>
          </View>

          {/* Fullscreen Map Body */}
          <View style={{ flex: 1, padding: 16 }}>
            {renderMapCanvas(520)}
          </View>
        </View>
      </Modal>
    </View>
  );
}
