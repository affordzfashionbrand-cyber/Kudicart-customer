import { Platform } from 'react-native';

export interface LocationPayload {
  latitude: number;
  longitude: number;
  heading?: number;
  accuracy?: number;
  speed?: number;
  updatedAt: string;
  isStale?: boolean;
}

export interface RoutePayload {
  encodedPolyline?: string;
  coordinates?: [number, number][];
  distanceMeters?: number;
  distanceKm?: string;
  durationSeconds?: number;
  durationMinutes?: number;
  travelMode?: string;
}

export type LocationListener = (location: LocationPayload, route?: RoutePayload | null) => void;
export type StatusListener = (status: string, payload?: any) => void;

class TrackingSocketService {
  private ws: WebSocket | null = null;
  private currentOrderId: string | null = null;
  private token: string = 'demo-customer-token';
  private locationListeners = new Set<LocationListener>();
  private statusListeners = new Set<StatusListener>();
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 6;
  private isExplicitlyClosed = false;
  private lastSeq = 0;

  private getWsUrl(): string {
    if (process.env.EXPO_PUBLIC_WS_URL) {
      return process.env.EXPO_PUBLIC_WS_URL;
    }
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const host = window.location.hostname;
      return `ws://${host}:8081/ws/tracking`;
    }
    // Android emulator reverse / local default
    return 'ws://127.0.0.1:8081/ws/tracking';
  }

  public connect(orderId: string, token: string = 'demo-customer-token') {
    if (this.currentOrderId === orderId && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.disconnect();
    this.currentOrderId = orderId;
    this.token = token;
    this.isExplicitlyClosed = false;
    this.lastSeq = 0;

    const url = `${this.getWsUrl()}?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log(`[CustomerTracking] WebSocket connected for order ${this.currentOrderId}`);
        // Send initial auth packet
        try {
          this.ws?.send(
            JSON.stringify({
              type: 'auth',
              token: this.token,
              orderId: this.currentOrderId,
            }),
          );
          console.log(`[CustomerTracking] Subscribed to live tracking room for order ${this.currentOrderId}`);
        } catch {}
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'DRIVER_LOCATION_UPDATE') {
            // Sequence check: reject out-of-order packets
            if (data.seq && data.seq < this.lastSeq) {
              console.warn(`[CustomerTracking] Out-of-order location packet discarded: seq=${data.seq} < lastSeq=${this.lastSeq}`);
              return;
            }
            if (data.seq) this.lastSeq = data.seq;

            console.log(
              `[CustomerTracking] Location update received: orderId=${data.orderId}, updatedAt=${data.location?.updatedAt || 'unknown'}, isStale=${!!data.location?.isStale}, seq=${data.seq}`,
            );

            if (data.location?.isStale) {
              console.warn(`[CustomerTracking] Signal stale notice received for order ${data.orderId}`);
            }

            this.locationListeners.forEach((listener) => {
              try {
                listener(data.location, data.route);
              } catch {}
            });
          } else if (data.type === 'ORDER_STATUS_UPDATE') {
            if (data.seq && data.seq < this.lastSeq) {
              return;
            }
            if (data.seq) this.lastSeq = data.seq;
            console.log(`[CustomerTracking] Order status update received: ${data.status} for order ${data.orderId}`);

            this.statusListeners.forEach((listener) => {
              try {
                listener(data.status, data.payload);
              } catch {}
            });
          }
        } catch {}
      };

      this.ws.onerror = (err: any) => {
        console.warn(`[CustomerTracking] WebSocket connection notice:`, err?.message || 'Connection event');
      };

      this.ws.onclose = () => {
        console.log(`[CustomerTracking] WebSocket closed (reconnect scheduled: ${!this.isExplicitlyClosed})`);
        if (!this.isExplicitlyClosed && this.currentOrderId) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      if (!this.isExplicitlyClosed && this.currentOrderId) {
        this.connect(this.currentOrderId, this.token);
      }
    }, backoffDelay);
  }

  public subscribeLocation(listener: LocationListener): () => void {
    this.locationListeners.add(listener);
    return () => {
      this.locationListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.currentOrderId = null;
    this.reconnectAttempts = 0;
  }
}

export const trackingSocketService = new TrackingSocketService();

