import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { X, Bell, Package, Sparkles, Zap, ArrowRight, CheckCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { notificationsApi, getAuthToken } from '@/services/api';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'drop' | 'offer';
  read: boolean;
  orderId?: string;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!getAuthToken()) {
      setNotifications([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await notificationsApi.list();
      const mapped: NotificationItem[] = (res.items || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.body || '',
        time: formatRelativeTime(n.createdAt),
        type:
          n.category === 'PAYMENT' || n.category === 'DELIVERY'
            ? 'order'
            : n.category === 'ALERT'
            ? 'offer'
            : 'order',
        read: Boolean(n.isRead),
        orderId: n.orderId || n.data?.orderId || undefined,
      }));
      setNotifications(mapped);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void loadNotifications();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: bespokeEasing,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible, loadNotifications, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      easing: bespokeEasing,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onClose();
    });
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllRead();
    } catch {}
  };

  const handleNotificationPress = async (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    );
    if (!notif.read) {
      notificationsApi.markRead(notif.id).catch(() => {});
    }
    handleClose();
    if (notif.orderId) {
      router.push({
        pathname: '/tracking',
        params: { orderId: notif.orderId },
      });
    } else {
      router.push('/');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: '80%',
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 24),
            paddingHorizontal: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <View style={{ width: 40, height: 4, backgroundColor: '#E8E5DF', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }}>
                  ACTIVITY & UPDATES
                </Text>
                {unreadCount > 0 && (
                  <View style={{ backgroundColor: '#FF5A1F', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFFFFF' }}>{unreadCount} NEW</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#111111', letterSpacing: -0.5, marginTop: 2 }}>
                Notifications
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <Pressable
                  onPress={handleMarkAllRead}
                  hitSlop={8}
                  style={{ backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <CheckCheck size={12} color="#111111" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }}>Mark Read</Text>
                </Pressable>
              )}

              <Pressable
                onPress={handleClose}
                hitSlop={8}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', justifyContent: 'center', alignItems: 'center' }}
              >
                <X size={16} color="#111111" />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {notifications.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Bell size={28} color="#8E877E" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#111111', marginTop: 10 }}>
                  {isLoading ? 'Loading updates...' : 'No notifications yet'}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 4, textAlign: 'center' }}>
                  Live order updates, rider dispatch alerts &amp; Try &amp; Buy notifications appear here.
                </Text>
              </View>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read;
                return (
                  <Pressable
                    key={notif.id}
                    onPress={() => handleNotificationPress(notif)}
                    style={({ pressed }) => ({
                      backgroundColor: isUnread ? '#FAF8F5' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isUnread ? '#FF5A1F25' : '#E8E5DF',
                      borderRadius: 18,
                      padding: 14,
                      marginBottom: 10,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          backgroundColor: isUnread ? '#111111' : '#F4F1EA',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 2,
                        }}
                      >
                        {notif.type === 'order' ? (
                          <Package size={18} color={isUnread ? '#FF5A1F' : '#6B6667'} />
                        ) : notif.type === 'drop' ? (
                          <Sparkles size={18} color={isUnread ? '#FF5A1F' : '#6B6667'} />
                        ) : (
                          <Zap size={18} color={isUnread ? '#FF5A1F' : '#6B6667'} />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111', flex: 1, marginRight: 8 }} numberOfLines={1}>
                            {notif.title}
                          </Text>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: '#8E877E' }}>{notif.time}</Text>
                        </View>

                        <Text style={{ fontSize: 11.5, color: '#6B6667', lineHeight: 16 }}>
                          {notif.description}
                        </Text>

                        {notif.orderId && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: '900', color: '#FF5A1F' }}>Track Live Drop</Text>
                            <ArrowRight size={12} color="#FF5A1F" />
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
