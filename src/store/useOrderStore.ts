import { create } from 'zustand';
import {
  ordersApi,
  paymentsApi,
  OrderModel,
  TrackingModel,
  CheckoutPayload,
  reviewsApi,
  PaymentStatusResponse,
} from '@/services/api';
import { useCartStore } from './useCartStore';

export interface OrderRatingData {
  orderId: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

interface OrderState {
  orders: OrderModel[];
  activeOrder: OrderModel | null;
  activeTracking: TrackingModel | null;
  orderRatings: Record<string, OrderRatingData>;
  isLoading: boolean;
  isCheckingOut: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  checkout: (
    payloadOrAddressId: string | CheckoutPayload,
    paymentMethodArg?: 'RAZORPAY' | 'COD',
  ) => Promise<OrderModel | null>;
  verifyPayment: (data: {
    orderId: string;
    paymentId: string;
    signature: string;
    razorpayOrderId?: string;
  }) => Promise<any>;
  confirmPaymentStatus: (orderId: string) => Promise<PaymentStatusResponse | null>;
  fetchTracking: (orderId: string) => Promise<TrackingModel | null>;
  updateLiveLocation: (orderId: string, location: any, route?: any) => void;
  updateLiveStatus: (orderId: string, status: any) => void;
  setActiveOrder: (order: OrderModel | null) => void;
  submitOrderRating: (
    orderId: string,
    rating: number,
    tags: string[],
    comment: string,
    productId?: string,
  ) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  activeTracking: null,
  orderRatings: {},
  isLoading: false,
  isCheckingOut: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const orders = await ordersApi.getOrders();
      set({ orders, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to fetch orders' });
    }
  },

  checkout: async (payloadOrAddressId, paymentMethodArg) => {
    set({ isCheckingOut: true, error: null });
    try {
      const newOrder = await ordersApi.checkout(payloadOrAddressId, paymentMethodArg);
      
      // Clear cart immediately for COD. For online payment (Razorpay), retain cart until verifyPayment succeeds
      const isCod = typeof payloadOrAddressId === 'object' 
        ? payloadOrAddressId.paymentMethod === 'COD' 
        : paymentMethodArg === 'COD';
        
      if (newOrder && isCod) {
        await useCartStore.getState().clearCart();
      }

      const updatedOrders = [newOrder, ...get().orders.filter((o) => o.id !== newOrder.id)];
      set({
        orders: updatedOrders,
        activeOrder: newOrder,
        isCheckingOut: false,
      });

      // Also trigger initial tracking fetch
      get().fetchTracking(newOrder.id);
      return newOrder;
    } catch (err: any) {
      set({ isCheckingOut: false, error: err?.message || 'Checkout failed' });
      return null;
    }
  },

  verifyPayment: async (data) => {
    try {
      const res = await ordersApi.verifyPayment(data);
      if (res.verified) {
        // Clear cart upon verified online payment
        await useCartStore.getState().clearCart();
        // Refresh orders
        get().fetchOrders();
        get().fetchTracking(data.orderId);
      }
      return res;
    } catch (err: any) {
      console.warn('Payment verification error:', err);
      throw err;
    }
  },

  confirmPaymentStatus: async (orderId: string) => {
    try {
      const statusRes = await paymentsApi.getPaymentStatus(orderId);
      if (statusRes.paymentStatus === 'COMPLETED') {
        // Clear cart upon authoritative completion
        await useCartStore.getState().clearCart();
        get().fetchOrders();
        get().fetchTracking(orderId);
      }
      return statusRes;
    } catch (err: any) {
      console.warn('Payment status query error:', err);
      throw err;
    }
  },

  fetchTracking: async (orderId: string) => {
    try {
      const tracking = await ordersApi.trackOrder(orderId);
      if (tracking) {
        const orderModel: OrderModel = {
          id: tracking.orderId,
          orderNumber: tracking.orderNumber,
          customerId: 'usr-1',
          status: tracking.status,
          paymentMethod: (tracking.paymentMethod as any) || 'COD',
          paymentStatus: (tracking.paymentStatus as any) || 'PENDING',
          itemTotal: tracking.itemTotal || tracking.grandTotal || 0,
          deliveryFee: tracking.deliveryFee || 0,
          taxes: tracking.taxes || 0,
          grandTotal: tracking.grandTotal || 0,
          etaMinutes: tracking.etaMinutes,
          isTryAndBuy: tracking.isTryAndBuy,
          createdAt: new Date().toISOString(),
          address: tracking.deliveryAddress || { id: 'addr-1', userId: 'usr-1', label: 'Home Sanctuary', line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard', locality: 'Indiranagar', city: 'Bengaluru', pincode: '560038', isDefault: true },
          items: (tracking.items || []).map((it: any) => ({
            id: it.id || 'oi-1',
            title: it.title,
            brand: it.brand || 'Affordz Atelier',
            size: it.size || 'M',
            price: it.price,
            quantity: it.quantity || 1,
            image: it.image,
            trialSize: it.trialSize,
            fulfillmentType: it.fulfillmentType,
            isTryAndBuy: it.isTryAndBuy,
          })),
          driver: tracking.driver || undefined,
        };

        set((state) => {
          const exists = state.orders.some(
            (o) => o.id === tracking.orderId || o.orderNumber === tracking.orderNumber,
          );
          return {
            activeTracking: tracking,
            activeOrder: orderModel,
            orders: exists
              ? state.orders.map((o) =>
                  o.id === tracking.orderId || o.orderNumber === tracking.orderNumber
                    ? { ...o, ...orderModel }
                    : o,
                )
              : [orderModel, ...state.orders],
          };
        });
      } else {
        set({ activeTracking: null });
      }
      return tracking;
    } catch (err: any) {
      console.warn('Error fetching live order tracking:', err);
      return null;
    }
  },

  setActiveOrder: (order) => set({ activeOrder: order }),

  updateLiveLocation: (orderId: string, location: any, route?: any) => {
    set((state) => {
      if (!state.activeTracking || state.activeTracking.orderId !== orderId) {
        return state;
      }
      return {
        activeTracking: {
          ...state.activeTracking,
          driver: state.activeTracking.driver
            ? {
                ...state.activeTracking.driver,
                currentLocation: location,
                isStale: false,
              }
            : null,
          route: route !== undefined ? route : state.activeTracking.route,
        },
      };
    });
  },

  updateLiveStatus: (orderId: string, status: any) => {
    set((state) => {
      if (!state.activeTracking || state.activeTracking.orderId !== orderId) {
        return state;
      }
      return {
        activeTracking: {
          ...state.activeTracking,
          status,
        },
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        activeOrder:
          state.activeOrder?.id === orderId
            ? { ...state.activeOrder, status }
            : state.activeOrder,
      };
    });
  },

  submitOrderRating: async (orderId, rating, tags, comment, productId) => {
    const ratingData: OrderRatingData = {
      orderId,
      rating,
      tags,
      comment,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      orderRatings: {
        ...state.orderRatings,
        [orderId]: ratingData,
      },
    }));

    try {
      const fullComment =
        tags.length > 0
          ? `[Tags: ${tags.join(', ')}] ${comment || 'Satisfied with drop.'}`
          : comment || 'Satisfied with drop.';

      await reviewsApi.createReview({
        orderId,
        productId: productId || 'prod-1',
        rating,
        comment: fullComment,
      });
    } catch (err: any) {
      console.warn('[Affordz Reviews] Backend review sync:', err?.message || err);
    }

    return true;
  },
}));
