import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import {
  ChevronRight,
  LogOut,
  Package,
  Heart,
  MapPin,
  Settings,
  Sparkles,
  Phone,
  ShieldCheck,
  Headphones,
  User,
  Mail,
} from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { useOrderStore } from '@/store/useOrderStore';
import { useCartStore } from '@/store/useCartStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { EditProfileModal } from '@/components/account/edit-profile-modal';
import { SettingsModal } from '@/components/account/settings-modal';
import { FontStyles } from '@/constants/theme';

interface AccountViewProps {
  user: any;
  onOrders: () => void;
  onAddresses: () => void;
  onTracking?: () => void;
  onSupport: () => void;
  onAuth: () => void;
  onWishlist?: () => void;
  onLogout?: () => void;
}

export function AccountView({
  user: propUser,
  onOrders,
  onAddresses,
  onSupport,
  onAuth,
  onWishlist,
  onLogout,
}: AccountViewProps) {
  const { user: storeUser, isAuthenticated, loadProfile } = useAuthStore();
  const user = storeUser || propUser;
  const { orders, fetchOrders } = useOrderStore();
  const { wishlist } = useCartStore();
  const { addresses, fetchAddresses } = useAddressStore();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchOrders().catch(() => {});
    fetchAddresses().catch(() => {});
    loadProfile().catch(() => {});
  }, [fetchOrders, fetchAddresses, loadProfile, isAuthenticated]);

  const displayName = (user?.name || '').trim() || (isAuthenticated ? 'Affordz Member' : 'Guest Collector');
  const displayPhone = (user?.phone || '').trim();
  const displayEmail = (user?.email || '').trim();

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AC';

  const handleConfirmLogout = () => {
    setIsSignOutModalOpen(false);
    onLogout?.();
  };

  return (
    <View className="px-5 py-[32px]">
      <SectionTitle
        label="CLIENT PROFILE"
        firstLine="My"
        secondLine="account."
        marginBottom={24}
      />

      {/* Main Account Card */}
      <View className="p-[4px] bg-[#F4F1EA] border border-[#D9D9D5] rounded-[32px]">
        <View className="bg-white rounded-[28px] p-[20px]">
          {/* User Profile Header */}
          <View className="flex-row items-center justify-between pb-[20px] border-b border-[#E8E5DF]">
            <View className="flex-row items-center gap-[16px] flex-1">
              <View className="w-[66px] h-[66px] rounded-full bg-[#111111] justify-center items-center border-2 border-[#D9D9D5] shadow-sm">
                <Text className="font-sans text-[20px] font-black text-white">{initials}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-sans text-[18px] font-black tracking-tight text-[#111111]" numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
                {displayPhone ? (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <ShieldCheck size={12} color="#059669" />
                    <Text className="font-sans text-[12px] font-semibold text-[#6B6667]">{displayPhone}</Text>
                  </View>
                ) : (
                  <Pressable onPress={onAuth} className="flex-row items-center gap-1 mt-0.5">
                    <Phone size={11} color="#C59B27" />
                    <Text className="font-sans text-[11.5px] font-bold text-[#C59B27]">Link mobile number</Text>
                  </Pressable>
                )}
                {displayEmail ? (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Mail size={12} color="#8A857D" />
                    <Text className="font-sans text-[11.5px] font-medium text-[#6B6667]" numberOfLines={1}>
                      {displayEmail}
                    </Text>
                  </View>
                ) : null}
                <View className="flex-row items-center gap-1 mt-1">
                  <Sparkles size={10} color="#C59B27" />
                  <Text className="font-sans text-[10px] font-black uppercase text-[#8A857D] tracking-wider">
                    {isAuthenticated ? 'Atelier Member' : 'Guest Pass'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Edit Profile Pill */}
            <Pressable
              onPress={() => (isAuthenticated ? setIsEditProfileOpen(true) : onAuth())}
              hitSlop={8}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#F4F1EA' : '#FAF8F5',
                borderWidth: 1,
                borderColor: '#111111',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
              })}
            >
              <Text style={[FontStyles.sansExtraBold, { fontSize: 11, color: '#111111', letterSpacing: 0.5 }]}>
                {isAuthenticated ? 'EDIT' : 'SIGN IN'}
              </Text>
            </Pressable>
          </View>

          {/* Quick Activity Hub (3 Stats: Orders, Wishlist, Addresses) */}
          <View className="flex-row justify-between pt-[16px] pb-[16px] border-b border-[#F0ECE1]">
            <AnimatedPressable
              onPress={onOrders}
              className="flex-1 items-center py-2 px-1 rounded-2xl bg-[#FAF8F5] mr-2 border border-[#E8E5DF]"
            >
              <Package size={17} color="#111111" />
              <Text className="font-sans text-[16px] font-black text-[#111111] mt-1">
                {orders.length}
              </Text>
              <Text className="font-sans text-[10px] font-extrabold text-[#6B6667] uppercase tracking-wider">
                Orders
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={onWishlist || onOrders}
              className="flex-1 items-center py-2 px-1 rounded-2xl bg-[#FAF8F5] mr-2 border border-[#E8E5DF]"
            >
              <Heart size={17} color="#DC2626" />
              <Text className="font-sans text-[16px] font-black text-[#111111] mt-1">
                {wishlist.length}
              </Text>
              <Text className="font-sans text-[10px] font-extrabold text-[#6B6667] uppercase tracking-wider">
                Wishlist
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={onAddresses}
              className="flex-1 items-center py-2 px-1 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF]"
            >
              <MapPin size={17} color="#111111" />
              <Text className="font-sans text-[16px] font-black text-[#111111] mt-1">
                {addresses.length}
              </Text>
              <Text className="font-sans text-[10px] font-extrabold text-[#6B6667] uppercase tracking-wider">
                Addresses
              </Text>
            </AnimatedPressable>
          </View>

          {/* Categorized Options List */}
          <View style={{ paddingTop: 18 }}>
            {/* Section 1: Atelier Activity */}
            <Text style={[FontStyles.sansExtraBold, { fontSize: 10.5, textTransform: 'uppercase', color: '#8A857D', letterSpacing: 0.9, marginBottom: 8 }]}>
              My Atelier Activity
            </Text>

            <AnimatedPressable
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#F4F1EA',
              }}
              onPress={onOrders}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={15} color="#111111" />
                </View>
                <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>My Orders</Text>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            {onWishlist && (
              <AnimatedPressable
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F4F1EA',
                }}
                onPress={onWishlist}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={15} color="#111111" />
                  </View>
                  <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>Saved Wishlist & Bag</Text>
                </View>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={14} color="#111111" />
                </View>
              </AnimatedPressable>
            )}

            {/* Section 2: Account & Addresses */}
            <Text style={[FontStyles.sansExtraBold, { fontSize: 10.5, textTransform: 'uppercase', color: '#8A857D', letterSpacing: 0.9, marginTop: 20, marginBottom: 8 }]}>
              Account & Addresses
            </Text>

            <AnimatedPressable
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#F4F1EA',
              }}
              onPress={onAddresses}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={15} color="#111111" />
                </View>
                <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>My Saved Addresses</Text>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#F4F1EA',
              }}
              onPress={() => (isAuthenticated ? setIsEditProfileOpen(true) : onAuth())}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={15} color="#111111" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>Personal Details</Text>
                  <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#8A857D' }]} numberOfLines={1}>
                    {displayName}{displayPhone ? ` • ${displayPhone}` : ''}{displayEmail ? ` • ${displayEmail}` : ''}
                  </Text>
                </View>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            {!isAuthenticated && (
              <AnimatedPressable
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F4F1EA',
                }}
                onPress={onAuth}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={15} color="#111111" />
                  </View>
                  <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>Login / Switch Account</Text>
                </View>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={14} color="#111111" />
                </View>
              </AnimatedPressable>
            )}

            {/* Section 3: Preferences & Concierge */}
            <Text style={[FontStyles.sansExtraBold, { fontSize: 10.5, textTransform: 'uppercase', color: '#8A857D', letterSpacing: 0.9, marginTop: 20, marginBottom: 8 }]}>
              Preferences & Support
            </Text>

            <AnimatedPressable
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#F4F1EA',
              }}
              onPress={() => setIsSettingsOpen(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={15} color="#111111" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>App Settings</Text>
                  <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#8A857D' }]}>Notifications, haptics, security & legal</Text>
                </View>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
              }}
              onPress={onSupport}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', alignItems: 'center', justifyContent: 'center' }}>
                  <Headphones size={15} color="#111111" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#111111' }]}>Client Concierge & Support</Text>
                  <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#8A857D' }]}>24/7 try-and-buy styling & dispute help</Text>
                </View>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4F1EA', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            {/* Sign Out Option */}
            {onLogout && user && (
              <AnimatedPressable
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                  marginTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#F0ECE1',
                }}
                onPress={() => setIsSignOutModalOpen(true)}
              >
                <Text style={[FontStyles.sansBold, { fontSize: 14, color: '#DC2626' }]}>Sign Out from Atelier</Text>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={14} color="#DC2626" />
                </View>
              </AnimatedPressable>
            )}
          </View>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={() => setIsEditProfileOpen(false)}
      />

      {/* Settings & Preferences Modal */}
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenSupport={onSupport}
      />

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
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
                maxWidth: 400,
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
                  marginBottom: 12,
                }}
              >
                <LogOut size={20} color="#DC2626" />
              </View>
              <Text style={[FontStyles.sansBold, { fontSize: 16, fontWeight: '900', color: '#111111', marginBottom: 6 }]}>
                Sign Out from Atelier?
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 12, color: '#6B6667', lineHeight: 17, marginBottom: 20 }]}>
                You can browse and curate your bag as a guest, but you will need to sign in with your phone OTP to access saved addresses and past orders.
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => setIsSignOutModalOpen(false)}
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
                  <Text style={[FontStyles.sansBold, { fontSize: 12.5, fontWeight: '800', color: '#111111' }]}>
                    Cancel
                  </Text>
                </Pressable>
                <AnimatedPressable
                  onPress={handleConfirmLogout}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: '#111111',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[FontStyles.sansBold, { fontSize: 12.5, fontWeight: '900', color: '#FFFFFF' }]}>
                    Sign Out
                  </Text>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
