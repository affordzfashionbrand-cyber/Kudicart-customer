import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TextInput, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions, Pressable } from 'react-native';
import { X, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { AnimatedPressable } from '@/components/common/animated-pressable';

const bespokeEasing = Easing.bezier(0.32, 0.72, 0, 1);

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
  const isNative = Platform.OS !== 'web';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [countdown, setCountdown] = useState(30);
  const [isGettingOtp, setIsGettingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { sendOtp, verifyOtp } = useAuthStore();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, { toValue: 0, duration: 320, easing: bespokeEasing, useNativeDriver: isNative }).start();
      setActiveStep(1);
      setVerifiedSuccess(false);
      setError(null);
    } else {
      slideAnim.setValue(300);
      setError(null);
    }
  }, [visible, isNative]);

  useEffect(() => {
    let timer: any;
    if (visible && activeStep === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [visible, activeStep, countdown]);

  const handleClose = () => {
    setError(null);
    Animated.timing(slideAnim, { toValue: Dimensions.get('window').height, duration: 260, easing: bespokeEasing, useNativeDriver: isNative }).start(() => {
      onClose();
    });
  };

  const handleGetOtp = async () => {
    const clean = phoneNumber.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setIsGettingOtp(true);
    try {
      const res = await sendOtp(`+91 ${clean.slice(-10)}`);
      setIsGettingOtp(false);
      if (res && res.success) {
        setActiveStep(2);
        setCountdown(res.countdownSeconds || 30);
      } else {
        setError('Unable to send OTP. Authentication service is unavailable.');
      }
    } catch (err: any) {
      setIsGettingOtp(false);
      setError(err?.message || 'Authentication service is unavailable. Please check your network.');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    const clean = phoneNumber.replace(/\D/g, '');
    setError(null);
    setIsVerifying(true);
    try {
      const success = await verifyOtp(`+91 ${clean.slice(-10)}`, code);
      setIsVerifying(false);
      if (success) {
        setVerifiedSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError('Invalid or expired OTP. Please enter the correct code.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setError(err?.message || 'Verification failed. Could not verify OTP with server.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-end">
        <Pressable className="flex-1" onPress={handleClose} />
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="bg-paper rounded-t-[32px] pt-[8px] px-[8px] pb-[40px]">
          <View className="bg-white rounded-[28px] p-[24px] border border-[#D9D9D5]">
            <View className="flex-row justify-between items-center mb-[28px]">
              <Text className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#6B6667]">CLIENT ACCESS</Text>
              <Pressable onPress={handleClose} className="w-[34px] h-[34px] bg-[#F7F7F5] border border-[#D9D9D5] rounded-full justify-center items-center">
                <X size={16} color="#111111" />
              </Pressable>
            </View>

            {error && (
              <View className="flex-row items-center gap-2 bg-[#FFF0EA] border border-[#FF5A1F]/30 rounded-[14px] p-3 mb-4">
                <AlertCircle size={16} color="#FF5A1F" />
                <Text className="flex-1 text-[12px] font-bold text-[#FF5A1F] leading-[16px]">{error}</Text>
              </View>
            )}

            {verifiedSuccess ? (
              <View className="items-center py-[20px]">
                <View className="w-[84px] h-[84px] rounded-full bg-[#111111] justify-center items-center mb-[20px]">
                  <CheckCircle2 size={40} color="#FFFFFF" />
                </View>
                <Text className="text-[28px] tracking-tight font-black text-[#111111] mb-[6px]">WELCOME BACK<Text style={{ color: '#FF5A1F' }}>.</Text></Text>
                <Text className="text-[13px] text-[#6B6667]">STYLE TODAY. DELIVERED NOW.</Text>
              </View>
            ) : activeStep === 1 ? (
              <View>
                <Text className="text-[30px] leading-[34px] tracking-tight font-black text-[#111111] mb-[8px]">SIGN IN<Text style={{ color: '#FF5A1F' }}>.</Text></Text>
                <Text className="text-[13.5px] text-[#6B6667] mb-[28px]">Enter your mobile number for rapid checkout and live drop tracking.</Text>

                <View className="h-[52px] bg-[#F7F7F5] border border-[#D9D9D5] rounded-[16px] flex-row items-center px-[16px] mb-[28px]">
                  <Text className="text-[15px] font-bold text-[#111111] mr-[12px]">+91</Text>
                  <View className="w-[1px] h-[20px] bg-[#D9D9D5] mr-[12px]" />
                  <TextInput 
                    className="flex-1 text-[15px] font-bold text-[#111111]"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#6B6667"
                  />
                </View>

                <AnimatedPressable className="flex-row items-center bg-[#111111] rounded-full pl-[24px] pr-[8px] py-[8px] justify-between" onPress={handleGetOtp}>
                  <Text className="text-[12px] font-extrabold text-white uppercase tracking-[0.18em]">{isGettingOtp ? 'SENDING...' : 'GET OTP'}</Text>
                  <View className="w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center">
                    <ArrowRight size={18} color="#111111" />
                  </View>
                </AnimatedPressable>
              </View>
            ) : (
              <View>
                <Text className="text-[30px] leading-[34px] tracking-tight font-black text-[#111111] mb-[8px]">VERIFY OTP<Text style={{ color: '#FF5A1F' }}>.</Text></Text>
                <Text className="text-[13.5px] text-[#6B6667] mb-[28px]">Enter the 6-digit verification code sent to +91 {phoneNumber}</Text>

                <View className="flex-row justify-between mb-[28px]">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el: any) => (inputRefs.current[index] = el)}
                      className="w-[48px] h-[52px] bg-[#F7F7F5] border border-[#D9D9D5] rounded-[16px] text-center text-[20px] font-black text-[#111111]"
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => {
                        const newOtp = [...otp];
                        newOtp[index] = val;
                        setOtp(newOtp);
                        if (val && index < 5) inputRefs.current[index + 1]?.focus();
                      }}
                    />
                  ))}
                </View>

                <AnimatedPressable className="flex-row items-center bg-[#111111] rounded-full pl-[24px] pr-[8px] py-[8px] justify-between" onPress={handleVerifyOtp}>
                  <Text className="text-[12px] font-extrabold text-white uppercase tracking-[0.18em]">{isVerifying ? 'VERIFYING...' : 'VERIFY & PROCEED'}</Text>
                  <View className="w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center">
                    <ShieldCheck size={18} color="#111111" />
                  </View>
                </AnimatedPressable>
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
