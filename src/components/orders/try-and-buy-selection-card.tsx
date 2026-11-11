import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Sparkles, Check, RotateCcw, KeyRound } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { OrderModel, ordersApi } from '@/services/api';
import { TRY_AND_BUY_STAGES } from '@/contracts/order-contracts';
import { AnimatedPressable } from '@/components/common/animated-pressable';

interface TryAndBuySelectionCardProps {
  order: OrderModel;
  formatPrice: (price: number) => string;
  onUpdated?: (updated: OrderModel) => void;
}

const ACTIVE_TRIAL_STAGES = new Set<string>(
  TRY_AND_BUY_STAGES.filter(
    (s) => s !== 'RETURNING_TO_STORE' && s !== 'STORE_RECONCILIATION',
  ),
);

export const TryAndBuySelectionCard = React.memo(function TryAndBuySelectionCard({
  order,
  formatPrice,
  onUpdated,
}: TryAndBuySelectionCardProps) {
  const session = order.tryAndBuySession;
  const stage = session?.stage;
  const stageUpper = String(stage || '').toUpperCase();
  const isTerminal =
    order.status === 'DELIVERED' ||
    order.status === 'RETURNED' ||
    order.status === 'CANCELLED' ||
    order.status === 'FAILED' ||
    stageUpper === 'COMPLETED' ||
    stageUpper === 'SETTLED';

  const canSelect =
    Boolean(order.isTryAndBuy) &&
    !isTerminal &&
    (Boolean(order.isArrived || order.arrivedAt) ||
      (stage ? ACTIVE_TRIAL_STAGES.has(stage) : false));

  const [decisions, setDecisions] = useState<Record<string, 'KEEP' | 'RETURN'>>({});

  useEffect(() => {
    const returnedSet = new Set(session?.returnedItemIds || []);
    const initial: Record<string, 'KEEP' | 'RETURN'> = {};
    for (const item of order.items || []) {
      const decision = (item as { tryAndBuyDecision?: 'KEEP' | 'RETURN' | null })
        .tryAndBuyDecision;
      const explicit: 'KEEP' | 'RETURN' =
        decision === 'RETURN' || decision === 'KEEP'
          ? decision
          : returnedSet.has(item.id)
            ? 'RETURN'
            : 'KEEP';
      initial[item.id] = explicit;
    }
    setDecisions(initial);
  }, [order.id, order.items, session?.returnedItemIds]);

  const summary = useMemo(() => {
    let keepTotal = 0;
    let returnTotal = 0;
    for (const item of order.items || []) {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      if (decisions[item.id] === 'RETURN') {
        returnTotal += lineTotal;
      } else {
        keepTotal += lineTotal;
      }
    }
    return { keepTotal, returnTotal };
  }, [order.items, decisions]);

  const submitMutation = useMutation({
    mutationFn: () => ordersApi.submitTryAndBuySelections(order.id, decisions),
    onSuccess: (updated) => {
      onUpdated?.(updated);
      Alert.alert(
        'Choices Submitted',
        'Your Keep / Return choices have been sent to your delivery partner. Share the handover OTP at doorstep settlement.',
      );
    },
    onError: (err: any) => {
      Alert.alert(
        'Could Not Submit Choices',
        err?.message || 'Please check your connection and try again.',
      );
    },
  });

  if (!order.isTryAndBuy) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: '#FFFBF5',
        borderWidth: 1,
        borderColor: '#FED7AA',
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="#C2410C" />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: '900',
              color: '#9A3412',
              textTransform: 'uppercase',
              letterSpacing: 0.7,
            }}
          >
            DOORSTEP TRY &amp; BUY
          </Text>
        </View>
        {stage && (
          <View
            style={{
              backgroundColor: '#FFEDD5',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#9A3412' }}>
              {stage.replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      </View>

      {order.handoverOtp ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FDBA74',
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <KeyRound size={15} color="#C2410C" />
            <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#7C2D12' }}>
              Doorstep Settlement OTP
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#111111',
              letterSpacing: 3,
            }}
          >
            {order.handoverOtp}
          </Text>
        </View>
      ) : null}

      {!canSelect ? (
        <Text style={{ fontSize: 11.5, color: '#7C2D12', lineHeight: 16 }}>
          {isTerminal
            ? `Try & Buy settled (${stage ? stage.replace(/_/g, ' ') : order.status}).`
            : 'Keep / Return controls unlock once your delivery partner arrives at your doorstep.'}
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 11.5, color: '#7C2D12', lineHeight: 16 }}>
            Select whether to keep or return each garment during your 10-minute doorstep trial:
          </Text>

          {(order.items || []).map((item) => {
            const choice = decisions[item.id] || 'KEEP';
            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  padding: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B6667', marginTop: 1 }}>
                      Size {item.size} • Qty {item.quantity}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() =>
                      setDecisions((prev) => ({ ...prev, [item.id]: 'KEEP' }))
                    }
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: choice === 'KEEP' ? '#15803D' : '#E8E5DF',
                      backgroundColor: choice === 'KEEP' ? '#ECFDF5' : '#FAF8F5',
                    }}
                  >
                    <Check
                      size={13}
                      color={choice === 'KEEP' ? '#15803D' : '#6B6667'}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '900',
                        color: choice === 'KEEP' ? '#15803D' : '#6B6667',
                      }}
                    >
                      KEEP
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setDecisions((prev) => ({ ...prev, [item.id]: 'RETURN' }))
                    }
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: choice === 'RETURN' ? '#DC2626' : '#E8E5DF',
                      backgroundColor: choice === 'RETURN' ? '#FEF2F2' : '#FAF8F5',
                    }}
                  >
                    <RotateCcw
                      size={13}
                      color={choice === 'RETURN' ? '#DC2626' : '#6B6667'}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '900',
                        color: choice === 'RETURN' ? '#DC2626' : '#6B6667',
                      }}
                    >
                      RETURN
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 11.5, color: '#15803D', fontWeight: '800' }}>
              Kept Subtotal: {formatPrice(summary.keepTotal)}
            </Text>
            <Text style={{ fontSize: 11.5, color: '#C2410C', fontWeight: '800' }}>
              Returned: {formatPrice(summary.returnTotal)}
            </Text>
          </View>

          <AnimatedPressable
            disabled={submitMutation.isPending}
            onPress={() => submitMutation.mutate()}
            style={{
              backgroundColor: '#111111',
              borderRadius: 999,
              paddingVertical: 13,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: submitMutation.isPending ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: '900',
                color: '#FFFFFF',
                letterSpacing: 0.9,
              }}
            >
              {submitMutation.isPending
                ? 'SUBMITTING CHOICES...'
                : 'SUBMIT TRY & BUY CHOICES'}
            </Text>
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
});
