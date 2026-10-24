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
} from 'react-native';
import { X, Bell, Package, Sparkles, Zap, ArrowRight, CheckCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';

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

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Drop #AF-89241 Out for Delivery',
    description: 'Rider Rajesh Kumar is en route with your artisanal garments. 14 mins away.',
    time: '4 mins ago',
    type: 'order',
    read: false,
    orderId: 'ord-89241',
  },
  {
    id: 'notif-2',
    title: 'Festive Silk & Handloom Edit Live',
    description: 'Explore limited capsule collections handcrafted by master weavers.',
    time: '1 hour ago',
    type: 'drop',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Doorstep Try & Buy Activated',
    description: 'Doorstep fitting with 10-minute trial window is active for your Bengaluru location.',
    time: 'Yesterday',
    type: 'offer',
    read: true,
  },
];

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: bespokeEasing,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      easing: bespokeEasing,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    );
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
          {/* Subtle grab bar indicator */}
          <View style={{ width: 40, height: 4, backgroundColor: '#E8E5DF', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          {/* Header Row */}
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

          {/* Notification List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {notifications.map((notif) => {
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
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
