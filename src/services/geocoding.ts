import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  road?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
}

// Pre-mapped hub pincodes for instant response with zero network latency
const KNOWN_PINCODES: Record<string, { lat: number; lng: number; locality: string; city: string; state: string }> = {
  // Chennai Darkstore Hubs & Vicinity (Primary Delivery Zone)
  '600074': { lat: 12.9818, lng: 80.1384, locality: 'Pozhichalur', city: 'Chennai', state: 'Tamil Nadu' },
  '600045': { lat: 12.9249, lng: 80.1000, locality: 'Tambaram', city: 'Chennai', state: 'Tamil Nadu' },
  '600043': { lat: 12.9675, lng: 80.1491, locality: 'Pallavaram', city: 'Chennai', state: 'Tamil Nadu' },
  '600044': { lat: 12.9516, lng: 80.1462, locality: 'Chromepet', city: 'Chennai', state: 'Tamil Nadu' },
  '600075': { lat: 12.9733, lng: 80.1264, locality: 'Pammal', city: 'Chennai', state: 'Tamil Nadu' },
  '600091': { lat: 12.9698, lng: 80.1948, locality: 'Madipakkam', city: 'Chennai', state: 'Tamil Nadu' },
  '600088': { lat: 12.9984, lng: 80.1924, locality: 'Adambakkam', city: 'Chennai', state: 'Tamil Nadu' },
  '600061': { lat: 12.9800, lng: 80.1800, locality: 'Nanganallur', city: 'Chennai', state: 'Tamil Nadu' },
  '600016': { lat: 13.0067, lng: 80.2017, locality: 'Alandur', city: 'Chennai', state: 'Tamil Nadu' },
  '600042': { lat: 12.9833, lng: 80.2167, locality: 'Velachery', city: 'Chennai', state: 'Tamil Nadu' },
  '600096': { lat: 12.9692, lng: 80.2458, locality: 'Perungudi', city: 'Chennai', state: 'Tamil Nadu' },
  '600100': { lat: 12.9216, lng: 80.2045, locality: 'Medavakkam', city: 'Chennai', state: 'Tamil Nadu' },
  '600117': { lat: 12.9430, lng: 80.1764, locality: 'Keelkattalai', city: 'Chennai', state: 'Tamil Nadu' },
  '600126': { lat: 12.9080, lng: 80.1420, locality: 'Camp Road / Selaiyur', city: 'Chennai', state: 'Tamil Nadu' },
  '600047': { lat: 12.9100, lng: 80.0800, locality: 'Tambaram West', city: 'Chennai', state: 'Tamil Nadu' },

  // Bengaluru Secondary Zones
  '560038': { lat: 12.9784, lng: 77.6408, locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka' },
  '560095': { lat: 12.9345, lng: 77.6265, locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka' },
  '560001': { lat: 12.9756, lng: 77.6066, locality: 'MG Road', city: 'Bengaluru', state: 'Karnataka' },
  '560071': { lat: 12.9609, lng: 77.6387, locality: 'Domlur', city: 'Bengaluru', state: 'Karnataka' },
};

/**
 * Geocode a 6-digit Indian Postal Code to coordinates and locality details.
 */
export async function geocodePincode(pincode: string): Promise<GeocodedAddress | null> {
  const cleanPin = pincode.trim().replace(/\D/g, '');
  if (cleanPin.length !== 6) return null;

  // 1. Check instant in-memory cache
  if (KNOWN_PINCODES[cleanPin]) {
    const known = KNOWN_PINCODES[cleanPin];
    return {
      latitude: known.lat,
      longitude: known.lng,
      locality: known.locality,
      city: known.city,
      state: known.state,
      pincode: cleanPin,
      formattedAddress: `${known.locality}, ${known.city}, ${known.state} - ${cleanPin}`,
    };
  }

  // 2. OpenStreetMap Nominatim with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
      cleanPin,
    )}&country=India&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Kudicart-App/1.0 (customer-app-geocoding)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const addr = item.address || {};
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.district ||
          'Local Area';
        const city = addr.city || addr.state_district || 'Chennai';
        const state = addr.state || 'Tamil Nadu';

        return {
          latitude: lat,
          longitude: lon,
          locality,
          city,
          state,
          pincode: cleanPin,
          formattedAddress: item.display_name || `${locality}, ${city}, ${state} - ${cleanPin}`,
        };
      }
    }
  } catch (nomErr) {
    console.warn('[Geocoding] Nominatim query failed:', nomErr);
  }

  // 3. Fallback to India Post Postal Pincode API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const locality = po.Name || 'Local Area';
        const city = po.District || po.Division || 'Chennai';
        const state = po.State || 'Tamil Nadu';

        // Default to Pozhichalur hub coordinates as approximate anchor if external coordinates unavailable
        return {
          latitude: 12.9818,
          longitude: 80.1384,
          locality,
          city,
          state,
          pincode: cleanPin,
          formattedAddress: `${locality}, ${city}, ${state} - ${cleanPin}`,
        };
      }
    }
  } catch (postErr) {
    console.warn('[Geocoding] India Post query failed:', postErr);
  }

  return null;
}

/**
 * Reverse geocode coordinates to street, locality, city, state, and pincode.
 */
export async function reverseGeocodeCoords(
  latitude: number,
  longitude: number,
): Promise<GeocodedAddress> {
  let road = '';
  let locality = 'Pozhichalur';
  let city = 'Chennai';
  let state = 'Tamil Nadu';
  let pincode = '600074';

  // 1. On Native: use Expo Location (Apple CoreLocation / Android Geocoder)
  if (Platform.OS !== 'web') {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const rev = results[0];
        const roadParts = [rev.streetNumber, rev.street, rev.name].filter(Boolean);
        if (roadParts.length > 0) road = roadParts.join(', ');
        locality = rev.district || rev.subregion || rev.city || locality;
        city = rev.city || rev.region || city;
        state = rev.region || state;
        pincode = rev.postalCode || pincode;

        return {
          latitude,
          longitude,
          road,
          locality,
          city,
          state,
          pincode,
          formattedAddress: [road, locality, city, pincode].filter(Boolean).join(', '),
        };
      }
    } catch (nativeErr) {
      console.warn('[Geocoding] Native reverse geocode fallback:', nativeErr);
    }
  }

  // 2. On Web or Native fallback: use OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Kudicart-App/1.0 (customer-app-reverse-geocode)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      road = addr.road || addr.residential || addr.pedestrian || '';
      locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.town ||
        addr.village ||
        addr.county ||
        locality;
      city = addr.city || addr.town || addr.state_district || city;
      state = addr.state || state;
      pincode = addr.postcode || pincode;

      return {
        latitude,
        longitude,
        road,
        locality,
        city,
        state,
        pincode,
        formattedAddress:
          data.display_name || [road, locality, city, pincode].filter(Boolean).join(', '),
      };
    }
  } catch (webErr) {
    console.warn('[Geocoding] Web Nominatim reverse geocode fallback:', webErr);
  }

  return {
    latitude,
    longitude,
    road: road || 'Selected Location',
    locality,
    city,
    state,
    pincode,
    formattedAddress: [road, locality, city, pincode].filter(Boolean).join(', '),
  };
}

