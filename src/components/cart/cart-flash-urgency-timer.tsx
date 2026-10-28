import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { Zap, Clock, ShieldCheck } from 'lucide-react-native';

interface CartFlashUrgencyTimerProps {
  initialSeconds?: number;
  initialMinutes?: number;
}

export const CartFlashUrgencyTimer: React.FC<CartFlashUrgencyTimerProps> = ({
  initialSeconds,
  initialMinutes,
}) => {
  const duration = initialMinutes ? initialMinutes * 60 : (initialSeconds || 900);
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.max(0, secondsLeft / duration),
      duration: 800,
      useNativeDriver: false, // Animating layout width
    }).start();

    // Pulse gently when under 3 minutes
    if (secondsLeft < 180 && secondsLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [secondsLeft, duration, progressAnim, pulseAnim]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsLeft < 300;

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: isUrgent ? '#FCA5A5' : '#E8E5DF',
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: isUrgent ? '#FEE2E2' : '#FFF7ED',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={12} color={isUrgent ? '#DC2626' : '#FF5A1F'} fill={isUrgent ? '#DC2626' : '#FF5A1F'} />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: '#111111',
            }}
            numberOfLines={1}
          >
            Reserved Try & Buy Slot
          </Text>
        </View>

        {/* Digital Ticking Clock */}
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: isUrgent ? '#FEF2F2' : '#F4F1EA',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Clock size={11} color={isUrgent ? '#DC2626' : '#6B6667'} />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: '900',
              color: isUrgent ? '#DC2626' : '#111111',
              fontVariant: ['tabular-nums'],
              letterSpacing: 0.5,
            }}
          >
            {formattedTime}
          </Text>
        </Animated.View>
      </View>

      {/* Progress Track */}
      <View
        style={{
          width: '100%',
          height: 3.5,
          backgroundColor: '#F0ECE4',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: isUrgent ? '#DC2626' : '#FF5A1F',
            borderRadius: 2,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
};
