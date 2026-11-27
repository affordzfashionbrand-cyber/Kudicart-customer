import { create } from 'zustand';
import { notificationsApi, getAuthToken } from '@/services/api';
import { registerAuthLoginCallback, registerAuthLogoutReset } from './useAuthStore';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'drop' | 'offer';
  read: boolean;
  orderId?: string;
  ticketId?: string;
  route?: string;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    if (!getAuthToken()) {
      set({ notifications: [], unreadCount: 0, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await notificationsApi.list();
      const mapped: NotificationItem[] = (res.items || []).map((n: any) => ({
        id: String(n.id),
        title: String(n.title || 'Affordz Update'),
        description: String(n.body || ''),
        time: formatRelativeTime(n.createdAt),
        type:
          n.category === 'PAYMENT' || n.category === 'DELIVERY'
            ? 'order'
            : n.category === 'ALERT'
              ? 'offer'
              : 'order',
        read: Boolean(n.isRead),
        orderId: n.orderId || n.data?.orderId || undefined,
        ticketId: n.data?.ticketId || undefined,
        route: n.data?.route || undefined,
      }));
      const unreadCount =
        typeof res.unreadCount === 'number'
          ? res.unreadCount
          : mapped.filter((m) => !m.read).length;
      set({ notifications: mapped, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id: string) => {
    const prevList = get().notifications;
    const nextList = prevList.map((n) => (n.id === id ? { ...n, read: true } : n));
    set({
      notifications: nextList,
      unreadCount: nextList.filter((n) => !n.read).length,
    });
    try {
      await notificationsApi.markRead(id);
    } catch {
      // Keep UI responsive; next fetch reconciles if transient
    }
  },

  markAllRead: async () => {
    const nextList = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: nextList, unreadCount: 0 });
    try {
      await notificationsApi.markAllRead();
    } catch {
      // Keep UI responsive; next fetch reconciles if transient
    }
  },

  resetNotifications: () => {
    set({ notifications: [], unreadCount: 0, isLoading: false });
  },
}));

registerAuthLogoutReset(() => {
  useNotificationStore.getState().resetNotifications();
});

registerAuthLoginCallback(() => {
  void useNotificationStore.getState().fetchNotifications();
});
