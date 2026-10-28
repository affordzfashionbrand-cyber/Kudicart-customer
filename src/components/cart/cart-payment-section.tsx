import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { CreditCard, ShieldCheck, Info, Smartphone, Building2, Banknote } from 'lucide-react-native';

export const POPULAR_UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'https://cdn-icons-png.flaticon.com/128/6124/6124998.png' },
  { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn-icons-png.flaticon.com/128/825/825454.png' },
  { id: 'paytm', name: 'Paytm', icon: 'https://cdn-icons-png.flaticon.com/128/825/825484.png' },
  { id: 'cred', name: 'CRED UPI', icon: 'https://cdn-icons-png.flaticon.com/128/1177/1177577.png' },
];

export const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'sbi', name: 'SBI', code: 'SBI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak', code: 'KOTAK' },
];

export interface CartPaymentSectionProps {
  selectedPaymentCategory: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD';
  setSelectedPaymentCategory: (cat: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD') => void;
  selectedUpiApp: string;
  setSelectedUpiApp: (app: string) => void;
  customUpiId: string;
  setCustomUpiId: (val: string) => void;
  cardNumber: string;
  handleCardNumberChange: (text: string) => void;
  cardExpiry: string;
  handleExpiryChange: (text: string) => void;
  cardCvv: string;
  setCardCvv: (text: string) => void;
  cardName: string;
  setCardName: (text: string) => void;
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  isProduction: boolean;
}

export const CartPaymentSection = React.memo(function CartPaymentSection({
  selectedPaymentCategory,
  setSelectedPaymentCategory,
  selectedUpiApp,
  setSelectedUpiApp,
  customUpiId,
  setCustomUpiId,
  cardNumber,
  handleCardNumberChange,
  cardExpiry,
  handleExpiryChange,
  cardCvv,
  setCardCvv,
  cardName,
  setCardName,
  selectedBank,
  setSelectedBank,
  isProduction,
}: CartPaymentSectionProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E5DF',
        marginBottom: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CreditCard size={18} color="#111111" />
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>
            Select Payment Option
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={14} color="#15803D" />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>100% SECURE</Text>
        </View>
      </View>

      {!isProduction && (
        <View
          style={{
            backgroundColor: '#F0F9FF',
            borderWidth: 1,
            borderColor: '#FFEDD5',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Info size={14} color="#C2410C" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9A3412', flex: 1 }}>
            DEMO MODE: Simulated test payments active — no real funds charged.
          </Text>
        </View>
      )}

      {/* Category 1: UPI (Recommended) */}
      <View
        style={{
          marginBottom: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: selectedPaymentCategory === 'UPI' ? '#111111' : '#E8E5DF',
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => setSelectedPaymentCategory('UPI')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            backgroundColor: selectedPaymentCategory === 'UPI' ? '#FAF8F5' : '#FFFFFF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedPaymentCategory === 'UPI' ? '#111111' : '#D9D9D5',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedPaymentCategory === 'UPI' && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />
              )}
            </View>
            <Smartphone size={18} color="#111111" />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                  UPI (Instant & Free)
                </Text>
                <View style={{ backgroundColor: '#22C55E', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>Google Pay, PhonePe, Paytm, CRED</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>FASTEST</Text>
        </Pressable>

        {/* Sub-options for UPI */}
        {selectedPaymentCategory === 'UPI' && (
          <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#6B6667', marginBottom: 10 }}>
              SELECT UPI APP:
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              {POPULAR_UPI_APPS.map((app) => {
                const isChosen = selectedUpiApp === app.id;
                return (
                  <Pressable
                    key={app.id}
                    onPress={() => setSelectedUpiApp(app.id)}
                    style={{
                      alignItems: 'center',
                      width: '23%',
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isChosen ? '#111111' : '#E8E5DF',
                      backgroundColor: isChosen ? '#F4F1EA' : '#FFFFFF',
                    }}
                  >
                    <Image source={{ uri: app.icon }} style={{ width: 28, height: 28 }} contentFit="contain" />
                    <Text style={{ fontSize: 10, fontWeight: isChosen ? '800' : '600', color: '#111111', marginTop: 4 }}>
                      {app.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom UPI ID Input */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#F4F1EA', paddingTop: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 6 }}>
                Or Pay using UPI ID / VPA
              </Text>
              <View
                style={{
                  height: 40,
                  borderWidth: 1,
                  borderColor: '#D9D9D5',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  placeholder="e.g. mobile@okhdfcbank"
                  placeholderTextColor="#A0A0A0"
                  value={customUpiId}
                  onChangeText={setCustomUpiId}
                  style={{ fontSize: 12, color: '#111111' }}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Category 2: Credit / Debit Cards (Visa, MasterCard, RuPay) */}
      <View
        style={{
          marginBottom: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: selectedPaymentCategory === 'CARD' ? '#111111' : '#E8E5DF',
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => setSelectedPaymentCategory('CARD')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            backgroundColor: selectedPaymentCategory === 'CARD' ? '#FAF8F5' : '#FFFFFF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedPaymentCategory === 'CARD' ? '#111111' : '#D9D9D5',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedPaymentCategory === 'CARD' && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />
              )}
            </View>
            <CreditCard size={18} color="#111111" />
            <View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Credit / Debit Cards</Text>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>Visa, MasterCard, RuPay, Amex</Text>
            </View>
          </View>
        </Pressable>

        {/* Sub-options for Card Form */}
        {selectedPaymentCategory === 'CARD' && (
          <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF', gap: 10 }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>CARD NUMBER</Text>
              <View
                style={{
                  height: 40,
                  borderWidth: 1,
                  borderColor: '#D9D9D5',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  placeholder="XXXX XXXX XXXX XXXX"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  style={{ fontSize: 12.5, fontWeight: '700', color: '#111111' }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>VALID THRU</Text>
                <View
                  style={{
                    height: 40,
                    borderWidth: 1,
                    borderColor: '#D9D9D5',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    justifyContent: 'center',
                  }}
                >
                  <TextInput
                    placeholder="MM/YY"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    value={cardExpiry}
                    onChangeText={handleExpiryChange}
                    style={{ fontSize: 12.5, fontWeight: '700', color: '#111111' }}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>CVV</Text>
                <View
                  style={{
                    height: 40,
                    borderWidth: 1,
                    borderColor: '#D9D9D5',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    justifyContent: 'center',
                  }}
                >
                  <TextInput
                    placeholder="•••"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    style={{ fontSize: 12.5, fontWeight: '700', color: '#111111' }}
                  />
                </View>
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 }}>NAME ON CARD</Text>
              <View
                style={{
                  height: 40,
                  borderWidth: 1,
                  borderColor: '#D9D9D5',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  placeholder="Name as on card"
                  placeholderTextColor="#A0A0A0"
                  value={cardName}
                  onChangeText={setCardName}
                  style={{ fontSize: 12, fontWeight: '600', color: '#111111' }}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Category 3: Net Banking */}
      <View
        style={{
          marginBottom: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: selectedPaymentCategory === 'NET_BANKING' ? '#111111' : '#E8E5DF',
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => setSelectedPaymentCategory('NET_BANKING')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            backgroundColor: selectedPaymentCategory === 'NET_BANKING' ? '#FAF8F5' : '#FFFFFF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedPaymentCategory === 'NET_BANKING' ? '#111111' : '#D9D9D5',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedPaymentCategory === 'NET_BANKING' && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />
              )}
            </View>
            <Building2 size={18} color="#111111" />
            <View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Net Banking</Text>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>All major Indian banks supported</Text>
            </View>
          </View>
        </Pressable>

        {/* Sub-options for Net Banking */}
        {selectedPaymentCategory === 'NET_BANKING' && (
          <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {POPULAR_BANKS.map((b) => {
                const isChosen = selectedBank === b.id;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => setSelectedBank(b.id)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: isChosen ? '#111111' : '#E8E5DF',
                      backgroundColor: isChosen ? '#F4F1EA' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: isChosen ? '900' : '600', color: '#111111' }}>
                      {b.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Category 4: Cash on Delivery (COD) */}
      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: selectedPaymentCategory === 'COD' ? '#111111' : '#E8E5DF',
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => setSelectedPaymentCategory('COD')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            backgroundColor: selectedPaymentCategory === 'COD' ? '#FAF8F5' : '#FFFFFF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedPaymentCategory === 'COD' ? '#111111' : '#D9D9D5',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedPaymentCategory === 'COD' && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#111111' }} />
              )}
            </View>
            <Banknote size={18} color="#111111" />
            <View>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>Cash on Delivery (COD)</Text>
              <Text style={{ fontSize: 10.5, color: '#71717A' }}>Pay cash or scan QR on arrival</Text>
            </View>
          </View>
        </Pressable>

        {selectedPaymentCategory === 'COD' && (
          <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E8E5DF', backgroundColor: '#FFFFFF' }}>
            <View style={{ backgroundColor: '#F0ECE4', padding: 10, borderRadius: 10 }}>
              <Text style={{ fontSize: 11, color: '#4A4A4A', lineHeight: 16 }}>
                ℹ️ You can pay via Cash or UPI QR Code directly to the delivery concierge. Doorstep Try & Buy is fully supported!
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});
