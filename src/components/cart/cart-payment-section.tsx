import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Banknote,
  AlertCircle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';
import { BrandColors, FontStyles } from '@/constants/theme';
import { formatPrice } from '@/data/homeData';

export interface CartPaymentSectionProps {
  selectedPaymentCategory: 'RAZORPAY' | 'COD' | string;
  setSelectedPaymentCategory: (cat: any) => void;
  payableAmount?: number;
  isProcessingPayment?: boolean;
  paymentError?: string | null;
  onRetryPayment?: () => void;
  // Backward compatibility placeholders (ignored safely)
  [key: string]: any;
}

export const CartPaymentSection = React.memo(function CartPaymentSection({
  selectedPaymentCategory,
  setSelectedPaymentCategory,
  payableAmount,
  isProcessingPayment = false,
  paymentError = null,
  onRetryPayment,
}: CartPaymentSectionProps) {
  const isRazorpay = selectedPaymentCategory !== 'COD';
  const isCod = selectedPaymentCategory === 'COD';

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#FAF8F5',
              borderWidth: 1,
              borderColor: '#E8E5DF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={17} color={BrandColors.inkBlack} />
          </View>
          <View>
            <Text style={[{ fontSize: 15, color: BrandColors.inkBlack }, FontStyles.sansBold]}>
              Payment Method
            </Text>
            <Text style={[{ fontSize: 11, color: '#71717A' }, FontStyles.sansRegular]}>
              Secure 256-bit encrypted checkout
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#F0FDF4',
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#BBF7D0',
          }}
        >
          <ShieldCheck size={13} color="#15803D" />
          <Text style={[{ fontSize: 10, color: '#15803D', letterSpacing: 0.4 }, FontStyles.sansBold]}>
            100% SECURE
          </Text>
        </View>
      </View>

      {/* Payment Error / Cancellation Banner with Retry */}
      {paymentError && (
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={18} color="#DC2626" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: 13, color: '#991B1B', marginBottom: 2 }, FontStyles.sansBold]}>
                Payment Incomplete
              </Text>
              <Text style={[{ fontSize: 12, color: '#B91C1C', lineHeight: 18 }, FontStyles.sansRegular]}>
                {paymentError}
              </Text>
              {onRetryPayment && (
                <Pressable
                  onPress={onRetryPayment}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 10,
                    alignSelf: 'flex-start',
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <RotateCcw size={13} color="#DC2626" />
                  <Text style={[{ fontSize: 12, color: '#DC2626' }, FontStyles.sansBold]}>
                    Retry Payment
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Option 1: Razorpay Secure Gateway (Recommended) */}
      <Pressable
        onPress={() => setSelectedPaymentCategory('RAZORPAY')}
        style={{
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: isRazorpay ? BrandColors.inkBlack : '#E8E5DF',
          backgroundColor: isRazorpay ? '#FAF8F5' : '#FFFFFF',
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 }}>
            {/* Radio Circle */}
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: isRazorpay ? BrandColors.inkBlack : '#D9D9D5',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {isRazorpay && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: BrandColors.inkBlack,
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={[{ fontSize: 14, color: BrandColors.inkBlack }, FontStyles.sansBold]}>
                  Online Payment
                </Text>
                <View
                  style={{
                    backgroundColor: '#0D9488',
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Sparkles size={10} color="#FFFFFF" />
                  <Text style={[{ fontSize: 9, color: '#FFFFFF', letterSpacing: 0.5 }, FontStyles.sansBold]}>
                    RECOMMENDED
                  </Text>
                </View>
              </View>

              <Text style={[{ fontSize: 12, color: '#6B6667', marginTop: 3 }, FontStyles.sansRegular]}>
                Powered by Razorpay • UPI, Credit/Debit Cards, NetBanking & Wallets
              </Text>

              {/* Supported Methods Badge Strip */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {['UPI (GPay / PhonePe / Paytm)', 'Cards (Visa, MC, RuPay)', 'NetBanking', 'Wallets'].map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#E8E5DF',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={[{ fontSize: 10, color: '#4A4A4A' }, FontStyles.sansMedium]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {payableAmount ? (
            <Text style={[{ fontSize: 14, color: BrandColors.inkBlack }, FontStyles.sansBold]}>
              {formatPrice(payableAmount)}
            </Text>
          ) : null}
        </View>

        {/* Selected Online Detail Drawer */}
        {isRazorpay && (
          <View
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#E8E5DF',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Lock size={12} color="#0D9488" />
              <Text style={[{ fontSize: 11, color: '#0F766E' }, FontStyles.sansSemiBold]}>
                Zero-risk checkout: Card & UPI details handled directly by Razorpay
              </Text>
            </View>
            <Text style={[{ fontSize: 11, color: '#71717A', lineHeight: 16 }, FontStyles.sansRegular]}>
              You will complete your transaction inside Razorpay’s certified secure portal. KudiCart never stores or transmits sensitive payment credentials.
            </Text>
          </View>
        )}
      </Pressable>

      {/* Option 2: Cash on Delivery (COD) */}
      <Pressable
        onPress={() => setSelectedPaymentCategory('COD')}
        style={{
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: isCod ? BrandColors.inkBlack : '#E8E5DF',
          backgroundColor: isCod ? '#FAF8F5' : '#FFFFFF',
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 }}>
            {/* Radio Circle */}
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: isCod ? BrandColors.inkBlack : '#D9D9D5',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {isCod && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: BrandColors.inkBlack,
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[{ fontSize: 14, color: BrandColors.inkBlack }, FontStyles.sansBold]}>
                  Cash on Delivery (COD)
                </Text>
                <Banknote size={15} color="#15803D" />
              </View>

              <Text style={[{ fontSize: 12, color: '#6B6667', marginTop: 3 }, FontStyles.sansRegular]}>
                Pay via Cash or QR scan at doorstep upon delivery
              </Text>
            </View>
          </View>

          {payableAmount ? (
            <Text style={[{ fontSize: 14, color: BrandColors.inkBlack }, FontStyles.sansBold]}>
              {formatPrice(payableAmount)}
            </Text>
          ) : null}
        </View>

        {isCod && (
          <View
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#E8E5DF',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={12} color="#15803D" />
              <Text style={[{ fontSize: 11, color: '#15803D' }, FontStyles.sansSemiBold]}>
                Doorstep verification available. Exact cash or UPI scan accepted.
              </Text>
            </View>
          </View>
        )}
      </Pressable>

      {/* Processing State Indicator */}
      {isProcessingPayment && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 14,
            paddingVertical: 10,
            backgroundColor: '#FAF8F5',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E8E5DF',
          }}
        >
          <ActivityIndicator size="small" color="#0D9488" />
          <Text style={[{ fontSize: 12, color: '#0F766E' }, FontStyles.sansSemiBold]}>
            Connecting to Razorpay secure gateway...
          </Text>
        </View>
      )}
    </View>
  );
});
