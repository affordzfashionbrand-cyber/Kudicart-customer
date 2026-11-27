import { PermissionsAndroid, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { customerNotificationService } from './notificationService';
import { getAuthToken } from './api';

const STARTUP_PERMISSIONS_PROMPTED_KEY = 'affordz_startup_permissions_prompted_v1';

export interface PermissionSummary {
  location: boolean;
  notifications: boolean;
  contacts: boolean;
  phone: boolean;
}

let sessionPrompted = false;

/**
 * Requests all essential runtime permissions (Location, Notifications, Contacts, Call/Phone)
 * once on native mobile launch so features like GPS hub detection, receiver contact picking,
 * driver calling, and live order alerts work seamlessly.
 */
export async function requestStartupPermissions(): Promise<PermissionSummary> {
  const result: PermissionSummary = {
    location: false,
    notifications: false,
    contacts: false,
    phone: false,
  };

  if (Platform.OS === 'web') {
    return result;
  }

  if (sessionPrompted) {
    return checkAllPermissions();
  }
  sessionPrompted = true;

  try {
    const alreadyPrompted = await SecureStore.getItemAsync(STARTUP_PERMISSIONS_PROMPTED_KEY);
    if (alreadyPrompted === '1') {
      return checkAllPermissions();
    }
  } catch {
    // Continue if SecureStore is unavailable
  }

  try {
    if (Platform.OS === 'android') {
      const permissionsToRequest: any[] = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      ];

      if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
        permissionsToRequest.push('android.permission.POST_NOTIFICATIONS');
      }

      const grantedMap = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      result.location =
        grantedMap[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        grantedMap[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
      result.contacts =
        grantedMap[PermissionsAndroid.PERMISSIONS.READ_CONTACTS] ===
        PermissionsAndroid.RESULTS.GRANTED;
      result.phone =
        grantedMap[PermissionsAndroid.PERMISSIONS.CALL_PHONE] ===
        PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const locPerm = await Location.requestForegroundPermissionsAsync();
      result.location = locPerm.status === 'granted';
    }

    const notifPerm = await customerNotificationService.requestPermission();
    result.notifications = notifPerm.granted;
    if (notifPerm.granted && getAuthToken()) {
      void customerNotificationService.registerDeviceToken().catch(() => {});
    }

    try {
      await SecureStore.setItemAsync(STARTUP_PERMISSIONS_PROMPTED_KEY, '1');
    } catch {
      // ignore storage failure
    }
  } catch (err) {
    console.warn('[Permissions] Startup permission request failed:', err);
  }

  return result;
}

export async function checkAllPermissions(): Promise<PermissionSummary> {
  const summary: PermissionSummary = {
    location: false,
    notifications: false,
    contacts: false,
    phone: false,
  };

  if (Platform.OS === 'web') {
    const notif = await customerNotificationService.checkPermission();
    summary.notifications = notif.granted;
    return summary;
  }

  try {
    const [loc, notif] = await Promise.all([
      Location.getForegroundPermissionsAsync().catch(() => ({ status: 'undetermined' })),
      customerNotificationService.checkPermission().catch(() => ({ granted: false })),
    ]);
    summary.location = loc.status === 'granted';
    summary.notifications = notif.granted;

    if (Platform.OS === 'android') {
      const [contactsGranted, phoneGranted] = await Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).catch(() => false),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE).catch(() => false),
      ]);
      summary.contacts = contactsGranted;
      summary.phone = phoneGranted;
    }
  } catch {
    // ignore check errors
  }

  return summary;
}

export async function requestContactsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export async function requestCallPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}
