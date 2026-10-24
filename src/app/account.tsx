import React, { useState } from 'react';
import { View, ScrollView, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { AccountView } from '@/components/views/account-view';
import { AddressModal } from '@/components/address-modal';
import { AuthModal } from '@/components/auth-modal';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { safeBack } from '@/utils/navigation';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 8 : insets.top;

  const { user, logout } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  React.useEffect(() => {
    const onBackPress = () => {
      safeBack(router, '/');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Top Header */}
      <View
        style={{
          paddingTop,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          backgroundColor: '#FFFFFF',
        }}
      >
        <AnimatedPressable
          onPress={() => safeBack(router, '/')}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#F7F5F0',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E8E5DF',
          }}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <AccountView
          user={user}
          onOrders={() => router.push('/orders')}
          onTracking={() => router.push('/tracking')}
          onAddresses={() => setIsAddressModalOpen(true)}
          onSupport={() => router.push('/support')}
          onAuth={() => setIsAuthModalOpen(true)}
          onLogout={logout}
        />
      </ScrollView>

      {/* Address Selection Modal */}
      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={() => setIsAddressModalOpen(false)}
      />

      {/* Auth / Switch Account Modal */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </View>
  );
}
