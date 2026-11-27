import { geocodePincode, reverseGeocodeCoords, searchLocations } from '@/services/geocoding';
import {
  checkAddressServiceability,
  DARK_STORE_HUB,
  MAX_DARK_STORE_RADIUS_KM,
  useAddressStore,
} from '@/store/useAddressStore';
import { addressApi, setAuthToken } from '@/services/api';

describe('Delivery Location, Darkstore Radius & Geocoding Suite', () => {
  beforeEach(() => {
    useAddressStore.getState().resetAddresses();
    setAuthToken(null);
  });

  it('reverse geocodes hub coordinates properly', async () => {
    const rev = await reverseGeocodeCoords(DARK_STORE_HUB.latitude, DARK_STORE_HUB.longitude);
    expect(rev).toBeDefined();
    expect(rev.pincode).toBe('600074');
    expect(rev.city).toBe('Chennai');
  });

  it('geocodes primary hub pincodes (Pozhichalur 600074 and Tambaram 600045) accurately', async () => {
    const pozhichalur = await geocodePincode('600074');
    expect(pozhichalur).not.toBeNull();
    expect(pozhichalur?.pincode).toBe('600074');
    expect(pozhichalur?.locality).toBe('Pozhichalur');
    expect(pozhichalur?.city).toBe('Chennai');
    expect(pozhichalur?.latitude).toBeCloseTo(12.9818, 2);
    expect(pozhichalur?.longitude).toBeCloseTo(80.1384, 2);

    const tambaram = await geocodePincode('600045');
    expect(tambaram).not.toBeNull();
    expect(tambaram?.pincode).toBe('600045');
    expect(tambaram?.locality).toBe('Tambaram');
    expect(tambaram?.latitude).toBeCloseTo(12.9249, 2);
    expect(tambaram?.longitude).toBeCloseTo(80.1, 2);
  });

  it('evaluates 3 km serviceability against real Pozhichalur and Tambaram darkstores', () => {
    expect(MAX_DARK_STORE_RADIUS_KM).toBe(3.0);

    // 1. Pozhichalur doorstep location (0.5 km from hub)
    const pozhichalurDoorstep = checkAddressServiceability({
      id: 'addr-poz',
      userId: 'usr-cust-1',
      label: 'Home',
      recipientName: 'Aarav',
      recipientPhone: '+91 98765 43210',
      line1: 'Plot 12, Main Road',
      locality: 'Pozhichalur',
      city: 'Chennai',
      pincode: '600074',
      latitude: 12.9825,
      longitude: 80.1390,
      isDefault: true,
    });
    expect(pozhichalurDoorstep.isServiceable).toBe(true);
    expect(pozhichalurDoorstep.maxRadiusKm).toBe(3.0);
    expect(pozhichalurDoorstep.distanceKm).toBeLessThanOrEqual(3.0);
    expect(pozhichalurDoorstep.statusText).toContain('19-MIN DROP');

    // 2. Tambaram doorstep location (1.2 km from Tambaram hub)
    const tambaramDoorstep = checkAddressServiceability({
      id: 'addr-tam',
      userId: 'usr-cust-1',
      label: 'Office',
      line1: 'GST Road',
      locality: 'Tambaram',
      city: 'Chennai',
      pincode: '600045',
      latitude: 12.9260,
      longitude: 80.1050,
      isDefault: false,
    });
    expect(tambaramDoorstep.isServiceable).toBe(true);
    expect(tambaramDoorstep.distanceKm).toBeLessThanOrEqual(3.0);

    // 3. Location at ~4.5 km away (previously allowed under 8 km, now rejected under 3 km)
    const midDistanceLocation = checkAddressServiceability({
      id: 'addr-mid',
      userId: 'usr-cust-1',
      label: 'Outside 3km',
      line1: 'Outer Ring Road',
      locality: 'Adambakkam',
      city: 'Chennai',
      pincode: '600088',
      latitude: 13.0220,
      longitude: 80.1384,
      isDefault: false,
    });
    expect(midDistanceLocation.isServiceable).toBe(false);
    expect(midDistanceLocation.distanceKm).toBeGreaterThan(3.0);
    expect(midDistanceLocation.statusText).toBe('NOT AVAILABLE FOR THIS PLACE');

    // 4. Out-of-radius location (e.g. Mahabalipuram, > 40 km away)
    const remoteLocation = checkAddressServiceability({
      id: 'addr-remote',
      userId: 'usr-cust-1',
      label: 'Beach House',
      line1: 'East Coast Road',
      locality: 'Mahabalipuram',
      city: 'Kanchipuram',
      pincode: '603104',
      latitude: 12.6269,
      longitude: 80.1927,
      isDefault: false,
    });
    expect(remoteLocation.isServiceable).toBe(false);
    expect(remoteLocation.distanceKm).toBeGreaterThan(3.0);
    expect(remoteLocation.statusText).toBe('NOT AVAILABLE FOR THIS PLACE');
  });

  it('returns autocomplete suggestions for locality and pincode searches', async () => {
    const results = await searchLocations('Pozhichalur');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].pincode).toBe('600074');
    expect(results[0].city).toBe('Chennai');
  });

  it('safely handles addAddress when unauthenticated without throwing unhandled network error', async () => {
    setAuthToken(null);
    const store = useAddressStore.getState();

    const result = await store.addAddress({
      label: 'Guest Location',
      line1: 'Doorstep 12',
      locality: 'Pozhichalur',
      city: 'Chennai',
      pincode: '600074',
      latitude: 12.9818,
      longitude: 80.1384,
      isDefault: true,
    });

    expect(result).toBeDefined();
    expect(result.label).toBe('Guest Location');
    expect(store.getSelectedAddress()).toBeDefined();
    expect(store.getSelectedAddress()?.locality).toBe('Pozhichalur');
  });

  it('persists address to backend when customer is authenticated and sets active delivery address', async () => {
    const mockToken = 'customer-jwt-token-verified-12345';
    setAuthToken(mockToken);

    const addAddressSpy = jest.spyOn(addressApi, 'addAddress').mockResolvedValueOnce({
      id: 'addr-db-999',
      userId: 'cust-id-777',
      label: 'Sanctuary',
      line1: 'Flat 304, Palm Grove',
      locality: 'Pozhichalur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600074',
      latitude: 12.9818,
      longitude: 80.1384,
      isDefault: true,
    });

    const store = useAddressStore.getState();
    const created = await store.addAddress({
      label: 'Sanctuary',
      line1: 'Flat 304, Palm Grove',
      locality: 'Pozhichalur',
      city: 'Chennai',
      pincode: '600074',
      latitude: 12.9818,
      longitude: 80.1384,
      isDefault: true,
    });

    expect(addAddressSpy).toHaveBeenCalled();
    expect(created.id).toBe('addr-db-999');
    expect(useAddressStore.getState().selectedAddressId).toBe('addr-db-999');
    expect(useAddressStore.getState().hasLocationConfirmed).toBe(true);

    addAddressSpy.mockRestore();
  });
});
