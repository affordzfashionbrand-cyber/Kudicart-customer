import { create } from 'zustand';
import { supportApi, SupportTicketModel, reviewsApi } from '@/services/api';

export const CANONICAL_SUPPORT_CATEGORIES = [
  'DELIVERY',
  'TRY_AND_BUY',
  'ORDER_ISSUE',
  'PAYMENT_REFUND',
  'PRODUCT_QUALITY',
  'ACCOUNT',
  'GENERAL',
] as const;

export type SupportTicketCategory = (typeof CANONICAL_SUPPORT_CATEGORIES)[number];
export type SupportTicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

interface SupportState {
  tickets: SupportTicketModel[];
  isLoading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  createTicket: (data: {
    title: string;
    category: string;
    description: string;
    priority?: SupportTicketPriority;
    orderId?: string;
  }) => Promise<SupportTicketModel | null>;
  submitReview: (data: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
  }) => Promise<boolean>;
  resetSupport: () => void;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: [],
  isLoading: false,
  error: null,

  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const tickets = await supportApi.getTickets();
      set({ tickets, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Unable to load support tickets.',
      });
    }
  },

  createTicket: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const ticket = await supportApi.createTicket(data);
      set({
        tickets: [ticket, ...get().tickets],
        isLoading: false,
      });
      return ticket;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Failed to submit ticket' });
      return null;
    }
  },

  submitReview: async (data) => {
    set({ error: null });
    try {
      const res = await reviewsApi.createReview(data);
      return Boolean(res?.success);
    } catch (err: any) {
      set({ error: err?.message || 'Unable to submit review.' });
      return false;
    }
  },

  resetSupport: () => {
    set({ tickets: [], isLoading: false, error: null });
  },
}));
