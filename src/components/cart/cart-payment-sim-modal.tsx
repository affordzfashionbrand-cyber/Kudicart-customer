import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { CreditCard, X, CheckCircle2 } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';

export interface CartPaymentSimModalProps {
  visible: boolean;
  onClose: () => void;
  pendingPaymentOrder: any;
  finalPayable: number;
  isSimulatingPayment: boolean;
  handleSimulatePaymentSuccess: () => void;
  handleSimulatePaymentFailure: () => void;
  formatPrice: (price: number) => string;
}

export const CartPaymentSimModal = React.memo(function CartPaymentSimModal({
  visible,
  onClose,
  pendingPaymentOrder,
  finalPayable,
  isSimulatingPayment,
  handleSimulatePaymentSuccess,
  handleSimulatePaymentFailure,
  formatPrice,
}: CartPaymentSimModalProps) {
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
          backgroundColor: 'rgba(0,0,0,0.75)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 22,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CreditCard size={16} color="#FF5A1F" />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '900',
                    color: '#FF5A1F',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  DEMO PAYMENT SIMULATOR
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#111111', marginTop: 2 }}>
                Simulated Payment
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F4F1EA',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={16} color="#6B6667" />
            </Pressable>
          </View>

          {/* Order Summary Strip */}
          <View
            style={{
              backgroundColor: '#F7F5F0',
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: '#6B6667' }}>Order Number</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#111111' }}>
                #{pendingPaymentOrder?.orderNumber || pendingPaymentOrder?.id || 'AF-2026'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#6B6667' }}>Payable Amount</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#FF5A1F' }}>
                {formatPrice(pendingPaymentOrder?.grandTotal || finalPayable)}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 11.5, color: '#6B6667', lineHeight: 17, marginBottom: 18 }}>
            Select payment outcome to test QA resilience, order state transition, and payment failure recovery paths:
          </Text>

          {/* Outcome Buttons */}
          <View style={{ gap: 10 }}>
            <AnimatedPressable
              style={{
                backgroundColor: '#15803D',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
              onPress={handleSimulatePaymentSuccess}
              disabled={isSimulatingPayment}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                {isSimulatingPayment ? 'Verifying...' : 'Simulate Success (Payment Verified)'}
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#DC2626',
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
              onPress={handleSimulatePaymentFailure}
              disabled={isSimulatingPayment}
            >
              <X size={16} color="#DC2626" />
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#DC2626' }}>
                Simulate Failure (Bank Decline / Cancel)
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});
