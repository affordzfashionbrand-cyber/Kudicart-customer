import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator } from 'react-native';
import { CreditCard, X, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { launchRazorpayCheckout, RazorpayCheckoutResult } from '@/services/razorpay';
import { BrandColors, FontStyles } from '@/constants/theme';

export interface CartPaymentSimModalProps {
  visible: boolean;
  onClose: () => void;
  pendingPaymentOrder: any;
  finalPayable: number;
  isSimulatingPayment?: boolean;
  handleSimulatePaymentSuccess?: () => void;
  handleSimulatePaymentFailure?: () => void;
  formatPrice: (price: number) => string;
  handleRazorpaySuccess?: (result: RazorpayCheckoutResult) => Promise<void>;
  razorpayKeyId?: string;
  razorpayOrderId?: string;
}

export const CartPaymentSimModal = React.memo(function CartPaymentSimModal({
  visible,
  onClose,
  pendingPaymentOrder,
  finalPayable,
  isSimulatingPayment = false,
  formatPrice,
  handleRazorpaySuccess,
  razorpayKeyId,
  razorpayOrderId,
}: CartPaymentSimModalProps) {
  const [isLaunchingRzp, setIsLaunchingRzp] = useState(false);
  const [rzpError, setRzpError] = useState<string | null>(null);

  // Hard gate: Never render in production builds
  if (!__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'production') {
    return null;
  }

  const effectiveKeyId =
    razorpayKeyId ||
    pendingPaymentOrder?.razorpayKeyId ||
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

  const effectiveRzpOrderId =
    razorpayOrderId ||
    pendingPaymentOrder?.razorpayOrderId;

  const payableAmount = pendingPaymentOrder?.grandTotal || finalPayable;

  const handleLaunchRazorpay = async () => {
    if (!effectiveKeyId || !effectiveRzpOrderId) {
      setRzpError('Razorpay order or Key ID is missing. Please initiate payment through checkout.');
      return;
    }

    setIsLaunchingRzp(true);
    setRzpError(null);
    try {
      const result = await launchRazorpayCheckout({
        key: effectiveKeyId,
        amount: Math.round(payableAmount * 100),
        currency: 'INR',
        name: 'Affordz Quick Commerce',
        description: `Order #${pendingPaymentOrder?.orderNumber || pendingPaymentOrder?.id || 'AF-2026'}`,
        order_id: effectiveRzpOrderId,
        orderId: pendingPaymentOrder?.id || '',
        prefill: {
          name: pendingPaymentOrder?.recipientName || 'Affordz Customer',
          contact: pendingPaymentOrder?.recipientPhone || '+91 98450 12890',
        },
        theme: {
          color: '#0D9488',
        },
      });

      if (handleRazorpaySuccess) {
        await handleRazorpaySuccess(result);
      }
    } catch (err: any) {
      setRzpError(err.message || 'Payment initiation failed.');
    } finally {
      setIsLaunchingRzp(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
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
            borderRadius: 20,
            padding: 22,
            width: '100%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: '#E8E5DF',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#0D9488" />
              <Text style={[{ fontSize: 16, color: BrandColors.inkBlack }, FontStyles.sansBold]}>
                Razorpay Checkout (Dev)
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#6B6667" />
            </Pressable>
          </View>

          {/* Amount Box */}
          <View
            style={{
              backgroundColor: '#FAF8F5',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <Text style={[{ fontSize: 12, color: '#71717A' }, FontStyles.sansRegular]}>
              Payable Amount
            </Text>
            <Text style={[{ fontSize: 24, color: BrandColors.inkBlack, marginTop: 4 }, FontStyles.sansBold]}>
              {formatPrice(payableAmount)}
            </Text>
            <Text style={[{ fontSize: 11, color: '#0D9488', marginTop: 4 }, FontStyles.sansMedium]}>
              Order #{pendingPaymentOrder?.orderNumber || pendingPaymentOrder?.id || ''}
            </Text>
          </View>

          {rzpError && (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 10,
                padding: 10,
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <AlertCircle size={15} color="#DC2626" style={{ marginTop: 2 }} />
              <Text style={[{ fontSize: 11.5, color: '#B91C1C', flex: 1 }, FontStyles.sansRegular]}>
                {rzpError}
              </Text>
            </View>
          )}

          <AnimatedPressable
            disabled={isLaunchingRzp || isSimulatingPayment}
            onPress={handleLaunchRazorpay}
            style={{
              backgroundColor: '#0D9488',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isLaunchingRzp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <ShieldCheck size={16} color="#FFFFFF" />
                <Text style={[{ color: '#FFFFFF', fontSize: 14 }, FontStyles.sansBold]}>
                  Open Official Razorpay
                </Text>
              </>
            )}
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
});
