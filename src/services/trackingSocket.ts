import { API_BASE_URL, getAuthToken } from './api';
import { TERMINAL_ORDER_STATUSES } from '@/contracts/order-contracts';

export type LocationListener = (location: any, route?: any) => void;
export type StatusListener = (status: string, payload?: any) => void;
export type TryAndBuyListener = (payload: any) => void;
export type ArrivalListener = (payload: any) => void;

class TrackingSocketService {
  private ws: WebSocket | null = null;
  private currentOrderId: string | null = null;
  private token: string | null = null;
  private isExplicitlyClosed = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 6;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSeq = 0;

  private readonly locationListeners = new Set<LocationListener>();
  private readonly statusListeners = new Set<StatusListener>();
  private readonly tryAndBuyListeners = new Set<TryAndBuyListener>();
  private readonly arrivalListeners = new Set<ArrivalListener>();

  private getWebSocketUrl(token?: string | null): string {
    const wsBase = API_BASE_URL.replace(/^https:/i, 'wss:')
      .replace(/^http:/i, 'ws:')
      .replace(/\/+$/, '');
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${wsBase}/ws/tracking${query}`;
  }

  public connect(orderId: string, token?: string | null) {
    if (!orderId) return;

    const resolvedToken = token || getAuthToken();
    if (!resolvedToken) {
      return;
    }

    if (
      this.currentOrderId === orderId &&
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.disconnect();
    this.isExplicitlyClosed = false;
    this.currentOrderId = orderId;
    this.token = resolvedToken;

    const wsUrl = this.getWebSocketUrl(resolvedToken);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'SUBSCRIBE',
              orderId,
              token: resolvedToken,
            }),
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          const msgType = String(data?.type || '').toUpperCase();

          if (msgType === 'SUBSCRIBED') {
            if (data.status) {
              this.statusListeners.forEach((listener) => {
                try {
                  listener(data.status, data);
                } catch {}
              });
            }
            if (data.driverLocation) {
              this.locationListeners.forEach((listener) => {
                try {
                  listener(data.driverLocation, data.route);
                } catch {}
              });
            }
          } else if (msgType === 'DRIVER_LOCATION') {
            if (typeof data.seq === 'number' && data.seq <= this.lastSeq) return;
            if (typeof data.seq === 'number') this.lastSeq = data.seq;

            const loc = data.location || {
              latitude: data.latitude,
              longitude: data.longitude,
              heading: data.heading,
              accuracy: data.accuracy,
              speed: data.speed,
              updatedAt: data.updatedAt,
              isStale: data.isStale,
            };

            this.locationListeners.forEach((listener) => {
              try {
                listener(loc, data.route);
              } catch {}
            });
          } else if (msgType === 'ORDER_STATUS_UPDATE') {
            if (typeof data.seq === 'number' && data.seq <= this.lastSeq) return;
            if (typeof data.seq === 'number') this.lastSeq = data.seq;

            this.statusListeners.forEach((listener) => {
              try {
                listener(data.status, data);
              } catch {}
            });

            if (TERMINAL_ORDER_STATUSES.includes(data.status)) {
              this.isExplicitlyClosed = true;
              try {
                this.ws?.close();
              } catch {}
            }
          } else if (msgType === 'ORDER_ARRIVED') {
            if (typeof data.seq === 'number' && data.seq <= this.lastSeq) return;
            if (typeof data.seq === 'number') this.lastSeq = data.seq;

            this.arrivalListeners.forEach((listener) => {
              try {
                listener(data);
              } catch {}
            });
          } else if (msgType === 'TRY_AND_BUY_UPDATED') {
            if (typeof data.seq === 'number' && data.seq <= this.lastSeq) return;
            if (typeof data.seq === 'number') this.lastSeq = data.seq;

            this.tryAndBuyListeners.forEach((listener) => {
              try {
                listener(data);
              } catch {}
            });
          } else if (msgType === 'PING' && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        } catch {}
      };

      this.ws.onerror = () => {};

      this.ws.onclose = (event: any) => {
        if (event?.code === 4001 || event?.code === 4003) {
          this.isExplicitlyClosed = true;
          return;
        }
        if (!this.isExplicitlyClosed && this.currentOrderId) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (
      this.isExplicitlyClosed ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      if (!this.isExplicitlyClosed && this.currentOrderId) {
        const orderId = this.currentOrderId;
        const latestToken = getAuthToken() || this.token;
        this.connect(orderId, latestToken);
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

  public subscribeTryAndBuy(listener: TryAndBuyListener): () => void {
    this.tryAndBuyListeners.add(listener);
    return () => {
      this.tryAndBuyListeners.delete(listener);
    };
  }

  public subscribeArrival(listener: ArrivalListener): () => void {
    this.arrivalListeners.add(listener);
    return () => {
      this.arrivalListeners.delete(listener);
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
    this.token = null;
    this.lastSeq = 0;
    this.reconnectAttempts = 0;
  }
}

export const trackingSocketService = new TrackingSocketService();
