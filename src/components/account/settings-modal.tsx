import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import {
  X,
  Bell,
  MessageSquare,
  Zap,
  Vibrate,
  Lock,
  Trash2,
  Globe,
  FileText,
  Shield,
  UserX,
  CheckCircle2,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AnimatedPressable } from '@/components/common/animated-pressable';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onOpenSupport,
}) => {
  const {
    notifications,
    hapticsEnabled,
    biometricLock,
    setNotificationPreference,
    setHapticsEnabled,
    setBiometricLock,
    clearAppCache,
  } = useSettingsStore();

  const { user, logout } = useAuthStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearCache = async () => {
    const res = await clearAppCache();
    showToast(res.message);
  };

  const handleRequestDeletion = async () => {
    setIsDeleteConfirmOpen(false);
    showToast('Account deletion request initiated. Our concierge team will confirm within 24 hours.');
    setTimeout(() => {
      logout();
      onClose();
    }, 2000);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onClose}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FAF8F5',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              height: '88%',
              borderTopWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 14,
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderBottomWidth: 1,
                borderBottomColor: '#E8E5DF',
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '900',
                    color: '#8A857D',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                  }}
                >
                  PREFERENCES
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '900',
                    color: '#111111',
                    marginTop: 2,
                  }}
                >
                  App Settings
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F7F5F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={17} color="#111111" />
              </Pressable>
            </View>

            {/* Content List */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 50 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Feedback Toast */}
              {toastMessage && (
                <View
                  style={{
                    backgroundColor: '#111111',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <CheckCircle2 size={16} color="#4ADE80" />
                  <Text style={{ fontSize: 11.5, color: '#FFFFFF', fontWeight: '800', flex: 1 }}>
                    {toastMessage}
                  </Text>
                </View>
              )}

              {/* 1. NOTIFICATIONS SECTION */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: '900',
                    color: '#8A857D',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  NOTIFICATION CONTROLS
                </Text>

                {/* Order Updates */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F4F1EA',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Bell size={15} color="#111111" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                        18-Min Drop & Order Alerts
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                      Receive real-time push notifications for dispatch, arrival & Try-and-Buy
                    </Text>
                  </View>
                  <Switch
                    value={notifications.orderUpdates}
                    onValueChange={(val) => setNotificationPreference('orderUpdates', val)}
                    trackColor={{ false: '#E8E5DF', true: '#111111' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* WhatsApp Updates */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F4F1EA',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MessageSquare size={15} color="#15803D" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                        WhatsApp Delivery Tracking
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                      Get rider location links and OTP delivery codes via WhatsApp
                    </Text>
                  </View>
                  <Switch
                    value={notifications.whatsappUpdates}
                    onValueChange={(val) => setNotificationPreference('whatsappUpdates', val)}
                    trackColor={{ false: '#E8E5DF', true: '#111111' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Exclusive Drops */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Zap size={15} color="#EAB308" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                        Atelier Drops & Flash Deals
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                      Early access notifications for curated limited-edition handcrafted wear
                    </Text>
                  </View>
                  <Switch
                    value={notifications.dropAlerts}
                    onValueChange={(val) => setNotificationPreference('dropAlerts', val)}
                    trackColor={{ false: '#E8E5DF', true: '#111111' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* 2. APP EXPERIENCE & PERFORMANCE */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: '900',
                    color: '#8A857D',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  APP EXPERIENCE & SECURITY
                </Text>

                {/* Haptic Feedback */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F4F1EA',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Vibrate size={15} color="#111111" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                        Tactile Haptic Feedback
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                      Micro-vibrations for buttons, slider gestures, and cart updates
                    </Text>
                  </View>
                  <Switch
                    value={hapticsEnabled}
                    onValueChange={setHapticsEnabled}
                    trackColor={{ false: '#E8E5DF', true: '#111111' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Biometric Quick Lock */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F4F1EA',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Lock size={15} color="#111111" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                        Biometric / App Lock
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                      Require fingerprint or face verification before opening bag or checkout
                    </Text>
                  </View>
                  <Switch
                    value={biometricLock}
                    onValueChange={setBiometricLock}
                    trackColor={{ false: '#E8E5DF', true: '#111111' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Clear Cache */}
                <Pressable
                  onPress={handleClearCache}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    backgroundColor: pressed ? '#FAF8F5' : 'transparent',
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Trash2 size={15} color="#DC2626" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626' }}>
                        Purge Lookbook & Image Cache
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10.5, color: '#6B6667', marginTop: 2, lineHeight: 15 }}>
                      Frees up local device memory by removing cached product visuals
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#8A857D" />
                </Pressable>
              </View>

              {/* 3. LOCALIZATION & CURRENCY */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: '900',
                    color: '#8A857D',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  REGION & REGIONAL CONVENTIONS
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Globe size={16} color="#111111" />
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                        Operational Territory
                      </Text>
                      <Text style={{ fontSize: 10.5, color: '#6B6667' }}>
                        India (Express Dark Store Pods)
                      </Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#F4F1EA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>
                      IN / ₹ INR
                    </Text>
                  </View>
                </View>
              </View>

              {/* 4. LEGAL & POLICIES */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: '900',
                    color: '#8A857D',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  LEGAL & DATA GOVERNANCE
                </Text>

                <Pressable
                  onPress={() =>
                    setLegalModal({
                      title: 'Terms of Atelier Service',
                      content:
                        'Welcome to Affordz / KudiCart. By placing an order, you agree to our 18-minute express delivery commitment from nearest dark store micro-hubs, doorstep Try-and-Buy fit options, and direct vendor dispatch. Deliveries are fulfilled by authorized partners. Payments are processed securely via verified gateways.',
                    })
                  }
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F4F1EA',
                    backgroundColor: pressed ? '#FAF8F5' : 'transparent',
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <FileText size={15} color="#111111" />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                      Terms of Atelier Service
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#8A857D" />
                </Pressable>

                <Pressable
                  onPress={() =>
                    setLegalModal({
                      title: 'Privacy Policy & Data Security',
                      content:
                        'Your personal data (phone number, delivery addresses, and order history) is protected under industry standard encryption and Firebase Authentication protocols. Payment credentials and card numbers are never stored on KudiCart servers.',
                    })
                  }
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F4F1EA',
                    backgroundColor: pressed ? '#FAF8F5' : 'transparent',
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Shield size={15} color="#111111" />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                      Privacy & Data Encryption
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#8A857D" />
                </Pressable>

                {/* Google Play Account Deletion Option */}
                {user && (
                  <Pressable
                    onPress={() => setIsDeleteConfirmOpen(true)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      backgroundColor: pressed ? '#FAF8F5' : 'transparent',
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <UserX size={15} color="#DC2626" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626' }}>
                        Request Account Deletion
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#DC2626" />
                  </Pressable>
                )}
              </View>

              {/* Version & Build */}
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#8A857D' }}>
                  KudiCart Atelier • Customer Edition
                </Text>
                <Text style={{ fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>
                  Version 1.0.4 • Build 2026.10 • Ultra-Fast Dark Store Commerce
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Legal Sheet Modal */}
      {legalModal && (
        <Modal visible transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 24,
                maxWidth: 420,
                width: '100%',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111', marginBottom: 12 }}>
                {legalModal.title}
              </Text>
              <Text style={{ fontSize: 12.5, color: '#4A4A4A', lineHeight: 19, marginBottom: 20 }}>
                {legalModal.content}
              </Text>
              <AnimatedPressable
                onPress={() => setLegalModal(null)}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: 14,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12.5, fontWeight: '900' }}>
                  CLOSE
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <Modal visible transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.65)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 24,
                maxWidth: 420,
                width: '100%',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FEF2F2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <UserX size={22} color="#DC2626" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111', marginBottom: 8 }}>
                Delete Atelier Account?
              </Text>
              <Text style={{ fontSize: 12, color: '#6B6667', lineHeight: 18, marginBottom: 20 }}>
                This will delete your registered profile, saved addresses, and active dark store tokens. Active in-transit orders must be fulfilled or returned before closure.
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => setIsDeleteConfirmOpen(false)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>
                    Cancel
                  </Text>
                </Pressable>
                <AnimatedPressable
                  onPress={handleRequestDeletion}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: '#DC2626',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#FFFFFF' }}>
                    Confirm Delete
                  </Text>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};
