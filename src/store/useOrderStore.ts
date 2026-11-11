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
import type { CheckoutResponseContract, OrderStatus } from '@/contracts/order-contracts';
import { useCartStore } from './useCartStore';
import { registerAuthLogoutReset } from './useAuthStore';

export function isOrderItemEligibleForReview(
  order: OrderModel | null | undefined,
  productId?: string,
): boolean {
  if (!order) return false;
  const items = order.items || [];
  const matchingItems = productId
    ? items.filter((item: any) => String(item.productId || item.id) === String(productId))
    : items;

  if (matchingItems.length === 0) return false;

  if (order.isTryAndBuy) {
    const session = order.tryAndBuySession;
    const keptIds = new Set<string>(
      Array.isArray(session?.keptItemIds) ? session.keptItemIds.map(String) : [],
    );
    const hasKeptDecision = matchingItems.some(
      (item: any) => item.tryAndBuyDecision === 'KEEP' || keptIds.has(String(item.id)),
    );

    if (session) {
      const stage = String(session.stage || '').toUpperCase();
      const isSettled = stage === 'COMPLETED' || stage === 'SETTLED';
      return isSettled && hasKeptDecision;
    }

    return (
      order.status === 'DELIVERED' &&
      matchingItems.some((item: any) => item.tryAndBuyDecision !== 'RETURN')
    );
  }

  return order.status === 'DELIVERED';
}

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
  activeCheckoutGroup: CheckoutResponseContract | null;
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
    checkoutGroupId?: string;
    paymentId: string;
    signature: string;
    razorpayOrderId?: string;
    isBuyNow?: boolean;
  }) => Promise<any>;
  confirmPaymentStatus: (orderId: string, isBuyNow?: boolean) => Promise<PaymentStatusResponse | null>;
  cancelOrder: (orderId: string, reason?: string) => Promise<OrderModel>;
  submitTryAndBuySelections: (
    orderId: string,
    selections: Record<string, 'KEEP' | 'RETURN'>,
  ) => Promise<OrderModel>;
  fetchTracking: (orderId: string) => Promise<TrackingModel | null>;
  updateLiveLocation: (orderId: string, location: any, route?: any) => void;
  updateLiveStatus: (orderId: string, status: OrderStatus | string) => void;
  updateLiveArrival: (orderId: string, arrivedAt?: string, payload?: any) => void;
  setActiveOrder: (order: OrderModel | null) => void;
  submitOrderRating: (
    orderId: string,
    rating: number,
    tags: string[],
    comment: string,
    productId?: string,
  ) => Promise<boolean>;
  resetOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  activeCheckoutGroup: null,
  activeTracking: null,
  orderRatings: {},
  isLoading: false,
  isCheckingOut: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
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
      const primaryOrder = await ordersApi.checkout(payloadOrAddressId, paymentMethodArg);
      const group = (primaryOrder as any).checkoutGroup || null;
      const splitOrders: OrderModel[] = Array.isArray((primaryOrder as any).splitOrders)
        ? (primaryOrder as any).splitOrders
        : [primaryOrder];

      const isCod =
        typeof payloadOrAddressId === 'object'
          ? payloadOrAddressId.paymentMethod === 'COD'
          : paymentMethodArg === 'COD';
      const isBuyNow =
        typeof payloadOrAddressId === 'object' ? Boolean(payloadOrAddressId.isBuyNow) : false;

      if (primaryOrder && isCod && !isBuyNow) {
        await useCartStore.getState().clearCart();
      }

      const splitIds = new Set(splitOrders.map((o) => o.id));
      const updatedOrders = [
        ...splitOrders,
        ...get().orders.filter((o) => !splitIds.has(o.id)),
      ];

      set({
        orders: updatedOrders,
        activeOrder: primaryOrder,
        activeCheckoutGroup: group,
        isCheckingOut: false,
      });

      void get().fetchTracking(primaryOrder.id);
      return primaryOrder;
    } catch (err: any) {
      set({ isCheckingOut: false, error: err?.message || 'Checkout failed' });
      return null;
    }
  },

  verifyPayment: async (data) => {
    try {
      const { isBuyNow, ...verifyPayload } = data;
      const res = await ordersApi.verifyPayment(verifyPayload);
      if (res.verified) {
        if (!isBuyNow) {
          await useCartStore.getState().clearCart();
        }
        await get().fetchOrders();
        if (data.orderId) {
          void get().fetchTracking(data.orderId);
        }
      }
      return res;
    } catch (err: any) {
      console.warn('Payment verification error:', err);
      throw err;
    }
  },

  confirmPaymentStatus: async (orderId: string, isBuyNow = false) => {
    try {
      const statusRes = await paymentsApi.getPaymentStatus(orderId);
      if (statusRes.paymentStatus === 'COMPLETED') {
        if (!isBuyNow) {
          await useCartStore.getState().clearCart();
        }
        await get().fetchOrders();
        void get().fetchTracking(orderId);
      }
      return statusRes;
    } catch (err: any) {
      console.warn('Payment status query error:', err);
      throw err;
    }
  },

  cancelOrder: async (orderId: string, reason?: string) => {
    const updated = await ordersApi.cancelOrder(orderId, reason);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updated } : o)),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, ...updated }
          : state.activeOrder,
      activeTracking:
        state.activeTracking?.orderId === orderId
          ? { ...state.activeTracking, status: updated.status }
          : state.activeTracking,
    }));
    return updated;
  },

  submitTryAndBuySelections: async (orderId: string, selections) => {
    const updated = await ordersApi.submitTryAndBuySelections(orderId, selections);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updated } : o)),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, ...updated }
          : state.activeOrder,
      activeTracking:
        state.activeTracking?.orderId === orderId
          ? {
              ...state.activeTracking,
              tryAndBuySession: updated.tryAndBuySession,
            }
          : state.activeTracking,
    }));
    return updated;
  },

  fetchTracking: async (orderId: string) => {
    try {
      const tracking = await ordersApi.trackOrder(orderId);
      if (tracking) {
        const existing = get().orders.find(
          (o) => o.id === tracking.orderId || o.orderNumber === tracking.orderNumber,
        );
        const orderModel: OrderModel = {
          ...(existing || ({} as OrderModel)),
          id: tracking.orderId,
          orderNumber: tracking.orderNumber,
          customerId: existing?.customerId || '',
          status: tracking.status,
          paymentMethod: (tracking.paymentMethod as any) || existing?.paymentMethod || 'COD',
          paymentStatus: (tracking.paymentStatus as any) || existing?.paymentStatus || 'PENDING',
          itemTotal: tracking.itemTotal ?? existing?.itemTotal ?? 0,
          deliveryFee: tracking.deliveryFee ?? existing?.deliveryFee ?? 0,
          taxes: tracking.taxes ?? existing?.taxes ?? 0,
          grandTotal: tracking.grandTotal ?? existing?.grandTotal ?? 0,
          etaMinutes: tracking.etaMinutes,
          isTryAndBuy: tracking.isTryAndBuy ?? existing?.isTryAndBuy ?? false,
          isArrived: Boolean((tracking as any).isArrived ?? existing?.isArrived),
          arrivedAt: (tracking as any).arrivedAt ?? existing?.arrivedAt ?? null,
          handoverOtp: (tracking as any).handoverOtp ?? existing?.handoverOtp,
          tryAndBuySession:
            (tracking as any).tryAndBuySession ?? existing?.tryAndBuySession ?? null,
          createdAt: existing?.createdAt || new Date().toISOString(),
          address: tracking.deliveryAddress || existing?.address,
          deliveryAddress: tracking.deliveryAddress || existing?.deliveryAddress,
          items: (tracking.items && tracking.items.length > 0
            ? tracking.items
            : existing?.items || []
          ).map((it: any) => ({
            id: it.id,
            productId: it.productId,
            title: it.title,
            brand: it.brand || 'Affordz',
            size: it.size || 'M',
            price: it.price,
            quantity: it.quantity || 1,
            image: it.image,
            trialSize: it.trialSize,
            fulfillmentType: it.fulfillmentType,
            isTryAndBuy: it.isTryAndBuy,
          })),
          driver: tracking.driver || existing?.driver || undefined,
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
      console.warn('Error fetching live order tracking:', err?.message || err);
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

  updateLiveStatus: (orderId: string, status: OrderStatus | string) => {
    set((state) => ({
      activeTracking:
        state.activeTracking?.orderId === orderId
          ? { ...state.activeTracking, status: status as OrderStatus }
          : state.activeTracking,
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: status as OrderStatus } : o,
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, status: status as OrderStatus }
          : state.activeOrder,
    }));
  },

  updateLiveArrival: (orderId: string, arrivedAt?: string, payload?: any) => {
    const resolvedArrivedAt = arrivedAt || new Date().toISOString();
    set((state) => ({
      activeTracking:
        state.activeTracking?.orderId === orderId
          ? {
              ...state.activeTracking,
              isArrived: true,
              arrivedAt: resolvedArrivedAt,
              ...(payload?.tryAndBuySession
                ? { tryAndBuySession: payload.tryAndBuySession }
                : {}),
            }
          : state.activeTracking,
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              isArrived: true,
              arrivedAt: resolvedArrivedAt,
              ...(payload?.tryAndBuySession
                ? { tryAndBuySession: payload.tryAndBuySession }
                : {}),
            }
          : o,
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? {
              ...state.activeOrder,
              isArrived: true,
              arrivedAt: resolvedArrivedAt,
              ...(payload?.tryAndBuySession
                ? { tryAndBuySession: payload.tryAndBuySession }
                : {}),
            }
          : state.activeOrder,
    }));
  },

  submitOrderRating: async (orderId, rating, tags, comment, productId) => {
    const targetOrder =
      get().orders.find((o) => o.id === orderId || o.orderNumber === orderId) ||
      (get().activeOrder?.id === orderId || get().activeOrder?.orderNumber === orderId
        ? get().activeOrder
        : null);

    let resolvedProductId = productId ? String(productId) : undefined;
    if (!resolvedProductId && targetOrder?.items?.length) {
      const eligibleItem =
        targetOrder.items.find((it: any) =>
          isOrderItemEligibleForReview(targetOrder, String(it.productId || it.id)),
        ) || targetOrder.items[0];
      if (eligibleItem) {
        resolvedProductId = String((eligibleItem as any).productId || eligibleItem.id);
      }
    }

    if (!targetOrder || !resolvedProductId || !isOrderItemEligibleForReview(targetOrder, resolvedProductId)) {
      throw new Error(
        'Reviews unlock once your order is delivered or your Try & Buy selection is settled.',
      );
    }

    const fullComment =
      tags.length > 0
        ? `[Tags: ${tags.join(', ')}] ${comment || 'Satisfied with drop.'}`
        : comment || 'Satisfied with drop.';

    await reviewsApi.createReview({
      orderId: targetOrder.id || orderId,
      productId: resolvedProductId,
      rating,
      comment: fullComment,
    });

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

    return true;
  },

  resetOrders: () => {
    set({
      orders: [],
      activeOrder: null,
      activeCheckoutGroup: null,
      activeTracking: null,
      orderRatings: {},
      isLoading: false,
      isCheckingOut: false,
      error: null,
    });
  },
}));

registerAuthLogoutReset(() => {
  useOrderStore.getState().resetOrders();
});
