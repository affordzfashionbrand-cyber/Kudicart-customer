import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, CheckCircle2, User, Mail, Phone, Sparkles, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { FontStyles } from '@/constants/theme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setValidationError(null);
      setSuccessToast(false);
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters long.');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setValidationError(null);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onSuccess?.();
        onClose();
      }, 700);
    } catch {
      setValidationError('Failed to update profile. Please try again.');
    }
  };

  const initials = name
    ? name
        .trim()
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AC';

  return (
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', maxHeight: '90%' }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: Platform.OS === 'ios' ? 36 : 24,
              borderTopWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            {/* Header bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#F0ECE1',
              }}
            >
              <View>
                <Text
                  style={[
                    FontStyles.sansBold,
                    {
                      fontSize: 10,
                      color: '#8A857D',
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                    },
                  ]}
                >
                  ATELIER PROFILE
                </Text>
                <Text
                  style={[
                    FontStyles.sansBold,
                    {
                      fontSize: 18,
                      color: '#111111',
                      marginTop: 2,
                    },
                  ]}
                >
                  Edit Personal Details
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

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
              {/* Avatar Initial Circle */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    backgroundColor: '#111111',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: '#E8E5DF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text style={[FontStyles.sansBold, { fontSize: 24, color: '#FFFFFF' }]}>
                    {initials}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 8,
                    backgroundColor: '#F7F5F0',
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}
                >
                  <Sparkles size={11} color="#C59B27" />
                  <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#6B6667' }]}>
                    Affordz Atelier Member
                  </Text>
                </View>
              </View>

              {/* Error Banner */}
              {(validationError || error) && (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderWidth: 1,
                    borderColor: '#FCA5A5',
                    borderRadius: 12,
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <AlertCircle size={15} color="#DC2626" />
                  <Text style={{ fontSize: 11.5, color: '#DC2626', fontWeight: '700', flex: 1 }}>
                    {validationError || error}
                  </Text>
                </View>
              )}

              {/* Success Banner */}
              {successToast && (
                <View
                  style={{
                    backgroundColor: '#ECFDF5',
                    borderWidth: 1,
                    borderColor: '#A7F3D0',
                    borderRadius: 12,
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <CheckCircle2 size={15} color="#059669" />
                  <Text style={{ fontSize: 11.5, color: '#059669', fontWeight: '800', flex: 1 }}>
                    Profile details updated successfully!
                  </Text>
                </View>
              )}

              {/* Full Name Input */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={[
                    FontStyles.sansBold,
                    {
                      fontSize: 11,
                      color: '#4A4A4A',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    },
                  ]}
                >
                  Full Name *
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FAF8F5',
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    height: 48,
                  }}
                >
                  <User size={16} color="#8A857D" style={{ marginRight: 8 }} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A0A0A0"
                    style={[FontStyles.sansSemiBold, { flex: 1, fontSize: 13.5, color: '#111111' }]}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={[
                    FontStyles.sansBold,
                    {
                      fontSize: 11,
                      color: '#4A4A4A',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    },
                  ]}
                >
                  Email Address
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FAF8F5',
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    height: 48,
                  }}
                >
                  <Mail size={16} color="#8A857D" style={{ marginRight: 8 }} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 13.5, color: '#111111', fontWeight: '600' }}
                  />
                </View>
              </View>

              {/* Phone Input (Read Only / Verified via Firebase) */}
              <View style={{ marginBottom: 22 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: '#4A4A4A',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Registered Phone Number
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={12} color="#059669" />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#059669' }}>
                      VERIFIED
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F2EFEB',
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    height: 48,
                  }}
                >
                  <Phone size={16} color="#8A857D" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 13.5, color: '#71717A', fontWeight: '700' }}>
                    {user?.phone || '+91 8124188999'}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: '#8A857D', marginTop: 4 }}>
                  Phone number is verified with Firebase Authentication. To change, sign in with another number.
                </Text>
              </View>

              {/* Save Changes Button */}
              <AnimatedPressable
                onPress={handleSave}
                disabled={isLoading}
                style={{
                  backgroundColor: '#111111',
                  borderRadius: 14,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 }}>
                    SAVE PROFILE DETAILS
                  </Text>
                )}
              </AnimatedPressable>

              <Pressable
                onPress={onClose}
                style={{
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B6667' }}>
                  Cancel
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
