import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Zap, Clock, RotateCcw, Truck, MapPin } from 'lucide-react-native';
import { POPULAR_PINCODES } from './product-constants';

interface DeliveryEstimate {
  hub: string;
  is18Min: boolean;
}

interface ProductDeliverySectionProps {
  isDarkStoreProduct: boolean;
  selectedDarkStoreDeliveryMinutes?: number;
  pincode: string;
  pincodeInput: string;
  isEditingPincode: boolean;
  deliveryEstimate: DeliveryEstimate;
  setPincodeInput: (val: string) => void;
  setIsEditingPincode: (val: boolean) => void;
  onApplyPincode: (pin?: string) => void;
}

export function ProductDeliverySection({
  isDarkStoreProduct,
  selectedDarkStoreDeliveryMinutes = 18,
  pincode,
  pincodeInput,
  isEditingPincode,
  deliveryEstimate,
  setPincodeInput,
  setIsEditingPincode,
  onApplyPincode,
}: ProductDeliverySectionProps) {
  return (
    <>
      {/* Hyper-Local 18-Minute Try & Buy Card (STRICTLY FOR DARK STORE) */}
      {isDarkStoreProduct ? (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View
            style={{
              backgroundColor: '#F4F1EA',
              borderRadius: 22,
              padding: 14,
              borderWidth: 1,
              borderColor: '#E2DFD8',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle Ambient Top Border */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: '#22C55E',
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
                <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#15803D', textTransform: 'uppercase' }}>
                  Instant Doorstep Try & Buy Available
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Clock size={11} color="#FF5A1F" />
                <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FF5A1F' }}>
                  2 Pieces Remaining
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 12,
                flexDirection: 'row',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#111111',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                <Zap size={16} color="#FF5A1F" fill="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                  18-Min Doorstep Fitting Room
                </Text>
                <Text style={{ fontSize: 11, color: '#71717A', lineHeight: 15, marginTop: 2 }}>
                  Our style concierge waits 10 minutes at your door. Slip it on, examine the drape, keep only what you adore—instant zero-hassle handoff.
                </Text>
              </View>
            </View>

            {/* Timeline Tracker */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>3 MIN</Text>
                <Text style={{ fontSize: 8.5, color: '#71717A', fontWeight: '700', textTransform: 'uppercase' }}>Steam Press</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>15 MIN</Text>
                <Text style={{ fontSize: 8.5, color: '#71717A', fontWeight: '700', textTransform: 'uppercase' }}>Atelier Transit</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#111111', padding: 8, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>10 MIN</Text>
                <Text style={{ fontSize: 8.5, color: '#FF5A1F', fontWeight: '800', textTransform: 'uppercase' }}>Try at Home</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' }} />
                <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#1D4ED8', textTransform: 'uppercase' }}>
                  Direct Boutique Dispatch
                </Text>
              </View>
              <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#6B7280' }}>NO TRY & BUY</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F7F5F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={15} color="#111111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#111111' }}>
                  Shipped from Artisan Vendor Studio
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', lineHeight: 15, marginTop: 2 }}>
                  Delivered in 2-4 business days. Note: Doorstep Try & Buy is exclusive to 18-Min Dark Store products; standard 7-day doorstep return/exchange policy applies.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Delivery & Fitting Service Checker */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 14,
            borderWidth: 1,
            borderColor: '#E8E5DF',
          }}
        >
          {/* Header / Current PIN status */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Truck size={15} color="#FF5A1F" />
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                Delivery & Fitting Options
              </Text>
            </View>

            {!isEditingPincode && (
              <Pressable
                onPress={() => setIsEditingPincode(true)}
                style={{
                  backgroundColor: '#FFF0EA',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#FF5A1F' }}>Change PIN</Text>
              </Pressable>
            )}
          </View>

          {/* Pincode Input Mode */}
          {isEditingPincode ? (
            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: '#111111',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  backgroundColor: '#FAFAFA',
                  height: 42,
                }}
              >
                <MapPin size={14} color="#71717A" style={{ marginRight: 6 }} />
                <TextInput
                  value={pincodeInput}
                  onChangeText={setPincodeInput}
                  placeholder="Enter 6-digit Pincode"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: '800',
                    color: '#111111',
                    padding: 0,
                  }}
                />
                <Pressable
                  onPress={() => onApplyPincode()}
                  style={{
                    backgroundColor: '#111111',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>CHECK</Text>
                </Pressable>
              </View>

              {/* Quick Bangalore Pincode Chips */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#71717A' }}>Quick Select:</Text>
                {POPULAR_PINCODES.map((item) => (
                  <Pressable
                    key={item.pin}
                    onPress={() => onApplyPincode(item.pin)}
                    style={{
                      backgroundColor: '#F4F1EA',
                      paddingHorizontal: 8,
                      paddingVertical: 3.5,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#111111' }}>
                      {item.locality} ({item.pin})
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: '#F0ECE4',
                marginBottom: 10,
              }}
            >
              <MapPin size={13} color="#22C55E" />
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#111111' }}>
                Delivering to <Text style={{ color: '#FF5A1F' }}>{pincode}</Text> • {deliveryEstimate.hub}
              </Text>
            </View>
          )}

          {/* Live Service Pillars */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: deliveryEstimate.is18Min ? '#EBFDF2' : '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Zap size={11} color={deliveryEstimate.is18Min ? '#15803D' : '#2563EB'} fill={deliveryEstimate.is18Min ? '#15803D' : '#2563EB'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                  {deliveryEstimate.is18Min ? '18-Minute Doorstep Fitting Concierge' : '2-3 Business Days Standard Delivery'}
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', marginTop: 1 }}>
                  {deliveryEstimate.is18Min
                    ? 'Rider carries outfit steam-pressed on wooden hanger with backup size.'
                    : 'Dispatched directly from designer atelier with signature luxury box.'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Clock size={11} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                  10-Minute Personal Mirror Trial
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', marginTop: 1 }}>
                  Take your time inside your home. Concierge waits at the gate—pay only if you keep it.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#F3E8FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <RotateCcw size={11} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#111111' }}>
                  Instant Zero-Hassle Handback
                </Text>
                <Text style={{ fontSize: 10.5, color: '#71717A', marginTop: 1 }}>
                  Don&apos;t like the fit or silhouette? Hand back on spot. Zero return paperwork or pickup delays.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
