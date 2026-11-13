import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Sparkles,
  Package,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useSupportStore,
  CANONICAL_SUPPORT_CATEGORIES,
  SupportTicketCategory,
  SupportTicketPriority,
} from '@/store/useSupportStore';
import { safeBack } from '@/utils/navigation';
import { Fonts, FontStyles } from '@/constants/theme';
import { AnimatedPressable } from '@/components/common/animated-pressable';

const SUPPORT_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  DELIVERY: 'Delivery & Rider',
  TRY_AND_BUY: 'Try & Buy Fit',
  ORDER_ISSUE: 'Order Issue',
  PAYMENT_REFUND: 'Payment & Refund',
  PRODUCT_QUALITY: 'Garment Quality',
  ACCOUNT: 'Account',
  GENERAL: 'General Inquiry',
};

const SUPPORT_PRIORITIES: { value: SupportTicketPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

function resolveSupportCategory(raw?: string): SupportTicketCategory {
  if (!raw) return 'TRY_AND_BUY';
  const upper = raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if ((CANONICAL_SUPPORT_CATEGORIES as readonly string[]).includes(upper)) {
    return upper as SupportTicketCategory;
  }
  const lower = raw.trim().toLowerCase();
  if (lower.includes('deliver') || lower.includes('rider')) return 'DELIVERY';
  if (lower.includes('order')) return 'ORDER_ISSUE';
  if (lower.includes('pay') || lower.includes('refund')) return 'PAYMENT_REFUND';
  if (lower.includes('quality') || lower.includes('care')) return 'PRODUCT_QUALITY';
  if (lower.includes('account')) return 'ACCOUNT';
  if (lower.includes('try') || lower.includes('fit') || lower.includes('size')) return 'TRY_AND_BUY';
  return 'GENERAL';
}

export default function SupportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; category?: string }>();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const { tickets, createTicket, fetchTickets, isLoading } = useSupportStore();

  const [selectedCategory, setSelectedCategory] = useState<SupportTicketCategory>(() =>
    resolveSupportCategory(params.category),
  );
  const [selectedPriority, setSelectedPriority] = useState<SupportTicketPriority>('NORMAL');
  const [subject, setSubject] = useState(params.orderId ? `Inquiry regarding Drop #${params.orderId}` : '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(resolveSupportCategory(params.category));
    }
  }, [params.category]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Android hardware back handler
  useEffect(() => {
    const onBackPress = () => {
      safeBack(router, '/');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Incomplete Form', 'Please provide both a subject and details for your inquiry.');
      return;
    }

    const created = await createTicket({
      title: subject.trim(),
      category: selectedCategory,
      description: message.trim(),
      priority: selectedPriority,
      orderId: params.orderId || undefined,
    });
    if (!created) {
      Alert.alert(
        'Could Not Submit Inquiry',
        useSupportStore.getState().error || 'Please sign in or check your connection and try again.',
      );
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', width: '100%', maxWidth: 360 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: '#ECFDF5', borderWidth: 2, borderColor: '#A7F3D0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <CheckCircle2 size={38} color="#059669" />
          </View>

          <View style={{ backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 10 }}>
            <Text style={[FontStyles.sansBold, { fontSize: 10, fontWeight: '900', color: '#C2410C', letterSpacing: 1.2, textTransform: 'uppercase' }]}>
              CONCIERGE TICKET LOGGED
            </Text>
          </View>

          <Text style={[FontStyles.sansBold, { fontSize: 26, fontWeight: '900', color: '#111111', letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' }]}>
            We&apos;re On It.
          </Text>

          <Text style={[FontStyles.sansRegular, { fontSize: 13, color: '#6B6667', textAlign: 'center', lineHeight: 20, marginBottom: 28 }]}>
            Your request has been dispatched to our dedicated fashion stylists and fleet concierge. We will respond promptly.
          </Text>

          <AnimatedPressable
            style={{ width: '100%', backgroundColor: '#111111', borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => safeBack(router, '/')}
          >
            <Text style={[FontStyles.sansBold, { fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' }]}>
              BACK TO EXPLORE
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#FAF8F5' }}
    >
      {/* Editorial Header */}
      <View
        style={{
          paddingTop,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E8E5DF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 12,
          zIndex: 40,
        }}
      >
        <AnimatedPressable
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#D9D9D5', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => safeBack(router, '/')}
        >
          <ArrowLeft size={18} color="#111111" />
        </AnimatedPressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={[FontStyles.sansBold, { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }]}>
            AFFORDZ CLIENT CARE
          </Text>
          <Text style={[FontStyles.sansBold, { fontSize: 16, fontWeight: '900', color: '#111111' }]}>
            Stylist Concierge
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS !== 'web'}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
      >
        <View style={{ paddingTop: 18, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Sparkles size={13} color="#FF5A1F" />
            <Text style={[FontStyles.sansBold, { fontSize: 10, letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }]}>
              DIRECT ATELIER SUPPORT
            </Text>
          </View>
          <Text
            className="font-sans"
            style={{ fontFamily: Fonts.sansBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: '#111111' }}
          >
            <Text style={FontStyles.sansRegular}>How can we</Text>{' '}
            <Text style={FontStyles.sansBold}>assist you?</Text>
          </Text>
          <Text style={[FontStyles.sansRegular, { fontSize: 12.5, color: '#6B6667', marginTop: 4 }]}>
            Instant doorstep resolutions, fit exchanges, or bespoke order styling.
          </Text>
        </View>

        {/* Attached Order Banner */}
        {params.orderId && (
          <View style={{ backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', borderRadius: 18, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} color="#FF5A1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[FontStyles.sansBold, { fontSize: 11.5, fontWeight: '900', color: '#C2410C', textTransform: 'uppercase' }]}>
                LINKED TO DROP #{params.orderId}
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#9A3412', marginTop: 1 }]}>
                Our team has immediate access to your order items and assigned delivery partner.
              </Text>
            </View>
          </View>
        )}

        {/* Categories Chips */}
        <Text style={[FontStyles.sansBold, { fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }]}>
          SELECT INQUIRY CATEGORY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          overScrollMode="never"
          contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
        >
          {CANONICAL_SUPPORT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isSelected ? '#111111' : '#E8E5DF',
                  backgroundColor: isSelected ? '#111111' : '#FFFFFF',
                }}
              >
                <Text
                  style={[
                    isSelected ? FontStyles.sansBold : FontStyles.sansMedium,
                    {
                      fontSize: 11,
                      fontWeight: isSelected ? '900' : '700',
                      color: isSelected ? '#FFFFFF' : '#4A4A4A',
                    },
                  ]}
                >
                  {SUPPORT_CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Priority Chips */}
        <Text style={[FontStyles.sansBold, { fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }]}>
          PRIORITY LEVEL
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {SUPPORT_PRIORITIES.map((p) => {
            const isSelected = selectedPriority === p.value;
            return (
              <Pressable
                key={p.value}
                onPress={() => setSelectedPriority(p.value)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: isSelected ? '#FF5A1F' : '#E8E5DF',
                  backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                }}
              >
                <Text
                  style={[
                    isSelected ? FontStyles.sansBold : FontStyles.sansMedium,
                    {
                      fontSize: 11,
                      fontWeight: isSelected ? '900' : '700',
                      color: isSelected ? '#C2410C' : '#4A4A4A',
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Input Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 16 }}>
          <Text style={[FontStyles.sansBold, { fontSize: 11, fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }]}>
            Subject
          </Text>
          <View style={{ height: 46, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center', marginBottom: 14 }}>
            <TextInput
              style={[{ fontSize: 13, color: '#111111', fontWeight: '600' }, FontStyles.sansMedium]}
              placeholder="e.g. Size exchange for Heritage Kurta"
              placeholderTextColor="#A0A0A0"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <Text style={[FontStyles.sansBold, { fontSize: 11, fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }]}>
            Inquiry Message
          </Text>
          <View style={{ height: 110, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18 }}>
            <TextInput
              style={[{ fontSize: 13, color: '#111111', minHeight: 90 }, FontStyles.sansRegular]}
              placeholder="Describe your inquiry. Include any sizing preferences or instructions for our delivery pilot..."
              placeholderTextColor="#A0A0A0"
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <AnimatedPressable
            style={{
              backgroundColor: '#111111',
              borderRadius: 999,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#111',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={handleSubmit}
          >
            <Text style={[FontStyles.sansBold, { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
              {isLoading ? 'SUBMITTING TICKET...' : 'DISPATCH TO CONCIERGE'}
            </Text>
            <Send size={14} color="#FFFFFF" />
          </AnimatedPressable>
        </View>

        {/* Existing Tickets Section */}
        {tickets.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[FontStyles.sansBold, { fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }]}>
              RECENT TICKETS & RESOLUTIONS
            </Text>
            {tickets.map((t) => {
              const isClosedOrResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
              const categoryLabel =
                SUPPORT_CATEGORY_LABELS[t.category as SupportTicketCategory] || t.category;
              return (
                <View
                  key={t.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E8E5DF',
                    borderRadius: 18,
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={[FontStyles.sansBold, { fontSize: 10, fontWeight: '800', color: '#8E877E', textTransform: 'uppercase' }]}>
                      {t.id}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {t.priority ? (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                            backgroundColor:
                              t.priority === 'URGENT' || t.priority === 'HIGH' ? '#FEF2F2' : '#F4F1EA',
                            borderWidth: 1,
                            borderColor:
                              t.priority === 'URGENT' || t.priority === 'HIGH' ? '#FECACA' : '#E8E5DF',
                          }}
                        >
                          <Text
                            style={[
                              FontStyles.sansBold,
                              {
                                fontSize: 9,
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                color:
                                  t.priority === 'URGENT' || t.priority === 'HIGH' ? '#B91C1C' : '#57534E',
                              },
                            ]}
                          >
                            {t.priority}
                          </Text>
                        </View>
                      ) : null}
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                          backgroundColor: isClosedOrResolved ? '#ECFDF5' : '#FFF7ED',
                          borderWidth: 1,
                          borderColor: isClosedOrResolved ? '#A7F3D0' : '#FFEDD5',
                        }}
                      >
                        <Text
                          style={[
                            FontStyles.sansBold,
                            {
                              fontSize: 9,
                              fontWeight: '900',
                              textTransform: 'uppercase',
                              color: isClosedOrResolved ? '#065F46' : '#C2410C',
                            },
                          ]}
                        >
                          {t.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={[FontStyles.sansBold, { fontSize: 13, fontWeight: '800', color: '#111111' }]} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={[FontStyles.sansMedium, { fontSize: 11, color: '#8E877E', marginTop: 2 }]}>{categoryLabel}</Text>
                  {t.description ? (
                    <Text style={[FontStyles.sansRegular, { fontSize: 11.5, color: '#4A4A4A', marginTop: 6 }]} numberOfLines={2}>
                      {t.description}
                    </Text>
                  ) : null}
                  {t.resolutionRemarks ? (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
                      <Text style={[FontStyles.sansBold, { fontSize: 10.5, fontWeight: '800', color: '#065F46' }]}>
                        Resolution: {t.resolutionRemarks}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Direct Channel Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E8E5DF' }}>
          <Text style={[FontStyles.sansMedium, { fontSize: 11.5, color: '#6B6667', marginBottom: 2 }]}>Direct VIP Atelier Helpline</Text>
          <Text style={[FontStyles.sansBold, { fontSize: 13, fontWeight: '900', color: '#FF5A1F' }]}>concierge@affordz.in</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
