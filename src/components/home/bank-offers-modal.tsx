import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Copy } from 'lucide-react-native';
import { BANK_OFFERS } from '@/data/homeData';

const { height } = Dimensions.get('window');

export interface BankOffersModalProps {
  visible: boolean;
  onClose: () => void;
  currentBankIndex: number;
  onSelectOffer: (index: number) => void;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
}

export const BankOffersModal = React.memo(function BankOffersModal({
  visible,
  onClose,
  currentBankIndex,
  onSelectOffer,
  onCopyCode,
  copiedCode,
}: BankOffersModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 18,
            paddingBottom: insets.bottom + 20,
            maxHeight: height * 0.82,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Grab Handle */}
          <View style={{ width: 44, height: 4.5, backgroundColor: '#e5e7eb', borderRadius: 3, alignSelf: 'center', marginBottom: 16 }} />

          {/* Modal Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#18181b', letterSpacing: -0.3 }}>
                Available Bank Offers
              </Text>
              <Text style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                Instant savings applicable directly at checkout
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} color="#374151" />
            </Pressable>
          </View>

          {/* Scrollable list of offers */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
            {BANK_OFFERS.map((offer, idx) => (
              <View
                key={offer.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1.5,
                  borderColor: currentBankIndex === idx ? '#111111' : '#D9D9D5',
                  borderRadius: 18,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ backgroundColor: offer.badgeBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900', letterSpacing: 0.6 }}>
                        {offer.bankName}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#111111' }}>
                      {offer.discount}
                    </Text>
                  </View>

                  {/* Copy Code Button */}
                  <Pressable
                    onPress={() => onCopyCode(offer.code)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: copiedCode === offer.code ? '#ecfdf5' : '#F4F1EA',
                      borderWidth: 1,
                      borderColor: copiedCode === offer.code ? '#10b981' : '#D9D9D5',
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check size={12} color="#059669" strokeWidth={3} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#059669' }}>COPIED</Text>
                      </>
                    ) : (
                      <>
                        <Copy size={12} color="#111111" />
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>{offer.code}</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                <Text style={{ fontSize: 12, color: '#4b5563', lineHeight: 17, marginBottom: 8 }}>
                  {offer.details}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#D9D9D5', paddingTop: 8 }}>
                  <Text style={{ fontSize: 11, color: '#6B6667' }}>
                    Minimum Spend: <Text style={{ fontWeight: '800', color: '#111111' }}>{offer.minSpend}</Text>
                  </Text>
                  <Pressable onPress={() => onSelectOffer(idx)}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111' }}>
                      Select Offer →
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});
