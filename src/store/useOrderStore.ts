import { create } from 'zustand';
import { ordersApi, OrderModel, TrackingModel, CheckoutPayload } from '@/services/api';
import { useCartStore } from './useCartStore';

interface OrderState {
  orders: OrderModel[];
  activeOrder: OrderModel | null;
  activeTracking: TrackingModel | null;
  isLoading: boolean;
  isCheckingOut: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  checkout: (
    payloadOrAddressId: string | CheckoutPayload,
    paymentMethodArg?: 'RAZORPAY' | 'COD',
  ) => Promise<OrderModel | null>;
  verifyPayment: (data: { orderId: string; paymentId: string; signature: string }) => Promise<any>;
  fetchTracking: (orderId: string) => Promise<TrackingModel | null>;
  setActiveOrder: (order: OrderModel | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [
    {
      id: 'ord-89241',
      orderNumber: 'AF-89241',
      customerId: 'usr-1',
      status: 'OUT_FOR_DELIVERY',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'COMPLETED',
      itemTotal: 1299,
      deliveryFee: 40,
      taxes: 65,
      grandTotal: 1404,
      etaMinutes: 18,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      address: {
        id: 'addr-1',
        userId: 'usr-1',
        label: 'Home Sanctuary',
        line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        isDefault: true,
      },
      items: [
        {
          id: 'oi-1',
          title: 'Embroidered Anarkali Kurta Set',
          brand: 'Avanya Ethnic',
          size: 'M (38 in)',
          price: 1299,
          quantity: 1,
          image:
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85',
        },
      ],
      driver: {
        id: 'drv-1',
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        vehicle: 'KA 03 EV 4821',
      },
    },
    {
      id: 'ord-72019',
      orderNumber: 'AF-72019',
      customerId: 'usr-1',
      status: 'DELIVERED',
      paymentMethod: 'COD',
      paymentStatus: 'COMPLETED',
      itemTotal: 1899,
      deliveryFee: 0,
      taxes: 95,
      grandTotal: 1994,
      etaMinutes: 0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      address: {
        id: 'addr-1',
        userId: 'usr-1',
        label: 'Home Sanctuary',
        line1: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        isDefault: true,
      },
      items: [
        {
          id: 'oi-2',
          title: 'Heritage Handwoven Chanderi Kurta',
          brand: 'Affordz Atelier',
          size: 'L (40 in)',
          price: 1899,
          quantity: 1,
          image:
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
        },
      ],
      driver: {
        id: 'drv-2',
        name: 'Suresh Gowda',
        phone: '+91 98765 99887',
        vehicle: 'KA 01 EK 9102',
      },
    },
  ],
  activeOrder: null,
  activeTracking: null,
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

  fetchTracking: async (orderId: string) => {
    try {
      const tracking = await ordersApi.trackOrder(orderId);
      set({ activeTracking: tracking });
      return tracking;
    } catch (err: any) {
      console.warn('Error fetching live order tracking:', err);
      return null;
    }
  },

  setActiveOrder: (order) => set({ activeOrder: order }),
}));
