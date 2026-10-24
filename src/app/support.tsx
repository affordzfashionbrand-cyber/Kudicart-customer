import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Package,
  Headphones,
  Mail,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSupportStore } from '@/store/useSupportStore';
import { safeBack } from '@/utils/navigation';
import { Fonts } from '@/constants/theme';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

const AnimatedPressable = ({ children, style, className, onPress, scaleTo = 0.97 }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.timing(scale, { toValue: scaleTo, duration: 250, easing: bespokeEasing, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: 250, easing: bespokeEasing, useNativeDriver: true }).start();
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]} className={className}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const SUPPORT_CATEGORIES = [
  'Try & Buy Fit Exchange',
  'Delivery & Rider Help',
  'Payment & Refund Dispute',
  'Garment Quality & Care',
  'General Stylist Inquiry',
];

export default function SupportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; category?: string }>();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top;

  const { tickets, createTicket, fetchTickets, isLoading } = useSupportStore();

  const [selectedCategory, setSelectedCategory] = useState(params.category || 'Try & Buy Fit Exchange');
  const [subject, setSubject] = useState(params.orderId ? `Inquiry regarding Drop #${params.orderId}` : '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

    await createTicket({
      title: subject.trim(),
      category: selectedCategory,
      description: message.trim(),
      orderId: params.orderId || undefined,
    });
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
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#C2410C', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              CONCIERGE TICKET LOGGED
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '900', color: '#111111', letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' }}>
            We&apos;re On It.
          </Text>

          <Text style={{ fontSize: 13, color: '#6B6667', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
            Your request has been dispatched to our dedicated fashion stylists and fleet concierge. We will respond promptly.
          </Text>

          <AnimatedPressable
            style={{ width: '100%', backgroundColor: '#111111', borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => safeBack(router, '/')}
          >
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' }}>
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
          <Text style={{ fontSize: 9.5, fontWeight: '900', letterSpacing: 1.5, color: '#FF5A1F', textTransform: 'uppercase' }}>
            AFFORDZ CLIENT CARE
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
            Stylist Concierge
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 18, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Sparkles size={13} color="#FF5A1F" />
            <Text style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: '900', color: '#FF5A1F', textTransform: 'uppercase' }}>
              DIRECT ATELIER SUPPORT
            </Text>
          </View>
          <Text style={{ fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: '#111111' }}>
            <Text style={{ fontFamily: Fonts.serifRegular, fontWeight: '400' }}>How can we</Text>{' '}
            <Text style={{ fontFamily: Fonts.serifItalic, fontWeight: '400', fontStyle: 'italic' }}>assist you?</Text>
          </Text>
          <Text style={{ fontSize: 12.5, color: '#6B6667', marginTop: 4 }}>
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
              <Text style={{ fontSize: 11.5, fontWeight: '900', color: '#C2410C', textTransform: 'uppercase' }}>
                LINKED TO DROP #{params.orderId}
              </Text>
              <Text style={{ fontSize: 10.5, color: '#9A3412', marginTop: 1 }}>
                Our team has immediate access to your order items and assigned delivery partner.
              </Text>
            </View>
          </View>
        )}

        {/* Categories Chips */}
        <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
          SELECT INQUIRY CATEGORY
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
          {SUPPORT_CATEGORIES.map((cat) => {
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
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? '900' : '700',
                    color: isSelected ? '#FFFFFF' : '#4A4A4A',
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Input Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E8E5DF', marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
            Subject
          </Text>
          <View style={{ height: 46, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center', marginBottom: 14 }}>
            <TextInput
              style={{ fontSize: 13, color: '#111111', fontWeight: '600' }}
              placeholder="e.g. Size exchange for Heritage Kurta"
              placeholderTextColor="#A0A0A0"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
            Inquiry Message
          </Text>
          <View style={{ height: 110, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8E5DF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18 }}>
            <TextInput
              style={{ fontSize: 13, color: '#111111', minHeight: 90 }}
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
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              {isLoading ? 'SUBMITTING TICKET...' : 'DISPATCH TO CONCIERGE'}
            </Text>
            <Send size={14} color="#FFFFFF" />
          </AnimatedPressable>
        </View>

        {/* Existing Tickets Section */}
        {tickets.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#8E877E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
              RECENT TICKETS & RESOLUTIONS
            </Text>
            {tickets.map((t) => (
              <View
                key={t.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#8E877E', textTransform: 'uppercase' }}>
                      {t.id}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                        backgroundColor: t.status === 'RESOLVED' ? '#ECFDF5' : '#FFF7ED',
                        borderWidth: 1,
                        borderColor: t.status === 'RESOLVED' ? '#A7F3D0' : '#FFEDD5',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '900',
                          textTransform: 'uppercase',
                          color: t.status === 'RESOLVED' ? '#065F46' : '#C2410C',
                        }}
                      >
                        {t.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 2 }}>{t.category}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Direct Channel Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E8E5DF' }}>
          <Text style={{ fontSize: 11.5, color: '#6B6667', marginBottom: 2 }}>Direct VIP Atelier Helpline</Text>
          <Text style={{ fontSize: 13, fontWeight: '900', color: '#FF5A1F' }}>concierge@affordz.in</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
