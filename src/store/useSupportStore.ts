import { create } from 'zustand';
import { supportApi, SupportTicketModel, reviewsApi } from '@/services/api';

interface SupportState {
  tickets: SupportTicketModel[];
  isLoading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  createTicket: (data: {
    title: string;
    category: string;
    description: string;
    orderId?: string;
  }) => Promise<SupportTicketModel | null>;
  submitReview: (data: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
  }) => Promise<boolean>;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: [
    {
      id: 'TCK-4819',
      userId: 'usr-1',
      title: 'Fitting & Sizing Guidance',
      category: 'Sizing Issue',
      status: 'OPEN',
      createdAt: 'Today, 2:20 PM',
      updatedAt: 'Today, 2:20 PM',
    },
    {
      id: 'TCK-3210',
      userId: 'usr-1',
      title: 'Gate Landmark Delivery Note',
      category: 'Delivery',
      status: 'RESOLVED',
      createdAt: 'Yesterday, 4:10 PM',
      updatedAt: 'Yesterday, 4:35 PM',
    },
  ],
  isLoading: false,
  error: null,

  fetchTickets: async () => {
    try {
      const tickets = await supportApi.getTickets();
      set({ tickets });
    } catch (err: any) {
      console.warn('Could not fetch tickets:', err);
    }
  },

  createTicket: async (data) => {
    set({ isLoading: true });
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
    try {
      const res = await reviewsApi.createReview(data);
      return res.success;
    } catch (err) {
      console.warn('Review submission error:', err);
      // Allow graceful success for demo if offline
      return true;
    }
  },
}));
