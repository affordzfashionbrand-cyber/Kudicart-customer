import React, { useRef, useEffect } from 'react';
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
  StyleSheet,
} from 'react-native';
import { X, Bell, Package, Sparkles, Zap, ArrowRight, CheckCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotificationStore, NotificationItem } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';

export type { NotificationItem };

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(600)).current;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();

  useEffect(() => {
    if (visible) {
      void fetchNotifications();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: bespokeEasing,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible, fetchNotifications, slideAnim]);

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

  const handleMarkAllRead = () => {
    void markAllRead();
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    if (!notif.read) {
      void markRead(notif.id);
    }
    handleClose();
    if (notif.route === '/support' || notif.ticketId) {
      router.push({
        pathname: '/support',
        params: notif.orderId ? { orderId: notif.orderId } : undefined,
      });
      return;
    }
    if (notif.orderId) {
      router.push({
        pathname: '/tracking',
        params: { orderId: notif.orderId },
      });
    } else {
      router.push('/');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
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
            width: '100%',
            maxWidth: Platform.OS === 'web' ? 480 : undefined,
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
                  {!isAuthenticated
                    ? 'Sign in for live alerts'
                    : isLoading
                      ? 'Loading updates...'
                      : 'No notifications yet'}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B6667', marginTop: 4, textAlign: 'center' }}>
                  {!isAuthenticated
                    ? 'Sign in to receive real-time order updates, rider dispatch alerts & concierge replies.'
                    : 'Live order updates, rider dispatch alerts & Try & Buy notifications appear here.'}
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
