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
  Zap,
} from 'lucide-react-native';
import { SectionTitle } from '@/components/common/section-title';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { useOrderStore } from '@/store/useOrderStore';
import { useCartStore } from '@/store/useCartStore';
import { useAddressStore } from '@/store/useAddressStore';
import { EditProfileModal } from '@/components/account/edit-profile-modal';
import { SettingsModal } from '@/components/account/settings-modal';

interface AccountViewProps {
  user: any;
  onOrders: () => void;
  onAddresses: () => void;
  onTracking: () => void;
  onSupport: () => void;
  onAuth: () => void;
  onWishlist?: () => void;
  onLogout?: () => void;
}

export const AccountView = React.memo(function AccountView({
  user,
  onOrders,
  onAddresses,
  onTracking,
  onSupport,
  onAuth,
  onWishlist,
  onLogout,
}: AccountViewProps) {
  const { orders } = useOrderStore();
  const { wishlist } = useCartStore();
  const { addresses } = useAddressStore();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const displayName = user?.name || 'Affordz Customer';
  const displayPhone = user?.phone || '+91 8124188999';

  const initials = displayName
    .trim()
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
                <Text className="text-[20px] font-black text-white">{initials}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[18px] font-black tracking-tight text-[#111111]" numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} color="#059669" />
                  <Text className="text-[12px] font-semibold text-[#6B6667]">{displayPhone}</Text>
                </View>
                <View className="flex-row items-center gap-1 mt-1">
                  <Sparkles size={10} color="#C59B27" />
                  <Text className="text-[10px] font-black uppercase text-[#8A857D] tracking-wider">
                    Atelier Member
                  </Text>
                </View>
              </View>
            </View>

            {/* Edit Profile Pill */}
            <Pressable
              onPress={() => setIsEditProfileOpen(true)}
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
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111', letterSpacing: 0.5 }}>
                EDIT
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
              <Text className="text-[16px] font-black text-[#111111] mt-1">
                {orders.length}
              </Text>
              <Text className="text-[10px] font-extrabold text-[#6B6667] uppercase tracking-wider">
                Orders
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={onWishlist || onOrders}
              className="flex-1 items-center py-2 px-1 rounded-2xl bg-[#FAF8F5] mr-2 border border-[#E8E5DF]"
            >
              <Heart size={17} color="#DC2626" />
              <Text className="text-[16px] font-black text-[#111111] mt-1">
                {wishlist.length}
              </Text>
              <Text className="text-[10px] font-extrabold text-[#6B6667] uppercase tracking-wider">
                Wishlist
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={onAddresses}
              className="flex-1 items-center py-2 px-1 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF]"
            >
              <MapPin size={17} color="#111111" />
              <Text className="text-[16px] font-black text-[#111111] mt-1">
                {addresses.length}
              </Text>
              <Text className="text-[10px] font-extrabold text-[#6B6667] uppercase tracking-wider">
                Addresses
              </Text>
            </AnimatedPressable>
          </View>


          {/* Categorized Options List */}
          <View className="pt-[18px]">
            {/* Section 1: Atelier Activity */}
            <Text className="text-[10.5px] font-black uppercase text-[#8A857D] tracking-wider mb-2">
              My Atelier Activity
            </Text>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
              onPress={onOrders}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <Package size={15} color="#111111" />
                </View>
                <Text className="text-[14px] font-bold text-[#111111]">My Orders</Text>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
              onPress={onTracking}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <Zap size={15} color="#111111" />
                </View>
                <Text className="text-[14px] font-bold text-[#111111]">Live Order Tracking</Text>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            {onWishlist && (
              <AnimatedPressable
                className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
                onPress={onWishlist}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                    <Heart size={15} color="#111111" />
                  </View>
                  <Text className="text-[14px] font-bold text-[#111111]">Saved Wishlist & Bag</Text>
                </View>
                <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                  <ChevronRight size={14} color="#111111" />
                </View>
              </AnimatedPressable>
            )}

            {/* Section 2: Account & Addresses */}
            <Text className="text-[10.5px] font-black uppercase text-[#8A857D] tracking-wider mt-5 mb-2">
              Account & Addresses
            </Text>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
              onPress={onAddresses}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <MapPin size={15} color="#111111" />
                </View>
                <Text className="text-[14px] font-bold text-[#111111]">My Saved Addresses</Text>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
              onPress={() => setIsEditProfileOpen(true)}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <User size={15} color="#111111" />
                </View>
                <Text className="text-[14px] font-bold text-[#111111]">Personal Details</Text>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
              onPress={onAuth}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <Phone size={15} color="#111111" />
                </View>
                <Text className="text-[14px] font-bold text-[#111111]">Login / Switch Account</Text>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            {/* Section 3: Preferences & Concierge */}
            <Text className="text-[10.5px] font-black uppercase text-[#8A857D] tracking-wider mt-5 mb-2">
              Preferences & Support
            </Text>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px] border-b border-[#F4F1EA]"
              onPress={() => setIsSettingsOpen(true)}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <Settings size={15} color="#111111" />
                </View>
                <View>
                  <Text className="text-[14px] font-bold text-[#111111]">App Settings</Text>
                  <Text className="text-[10.5px] text-[#8A857D]">Notifications, haptics, security & legal</Text>
                </View>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            <AnimatedPressable
              className="flex-row justify-between items-center py-[14px]"
              onPress={onSupport}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] items-center justify-center">
                  <Headphones size={15} color="#111111" />
                </View>
                <View>
                  <Text className="text-[14px] font-bold text-[#111111]">Client Concierge & Support</Text>
                  <Text className="text-[10.5px] text-[#8A857D]">24/7 try-and-buy styling & dispute help</Text>
                </View>
              </View>
              <View className="w-[28px] h-[28px] rounded-full bg-[#F4F1EA] items-center justify-center">
                <ChevronRight size={14} color="#111111" />
              </View>
            </AnimatedPressable>

            {/* Sign Out Option */}
            {onLogout && user && (
              <AnimatedPressable
                className="flex-row justify-between items-center py-[16px] mt-4 border-t border-[#F0ECE1]"
                onPress={() => setIsSignOutModalOpen(true)}
              >
                <Text className="text-[14px] font-bold text-[#DC2626]">Sign Out from Atelier</Text>
                <View className="w-[30px] h-[30px] rounded-full bg-[#FEF2F2] border border-[#FCA5A5] items-center justify-center">
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
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111', marginBottom: 6 }}>
                Sign Out from Atelier?
              </Text>
              <Text style={{ fontSize: 12, color: '#6B6667', lineHeight: 17, marginBottom: 20 }}>
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
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>
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
                  <Text style={{ fontSize: 12.5, fontWeight: '900', color: '#FFFFFF' }}>
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
});
