import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Icon } from '@/components/icon';

export interface Address {
  id: string;
  name: string;
  tag: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  addressLine: string;
  cityPin: string;
  recipient: string;
  phone: string;
}

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Home Sanctuary',
    tag: 'HOME',
    isDefault: true,
    addressLine: 'Apt 4B, Sunrise Heights, 42 Westend Boulevard, Victoria Island',
    cityPin: 'Indiranagar, Bengaluru - 560038',
    recipient: 'Alex Morgan',
    phone: '+234 812 345 6789',
  },
  {
    id: 'addr-2',
    name: 'Tech Park Office',
    tag: 'WORK',
    isDefault: false,
    addressLine: 'Suite 802, Tower B, Prestige Tech Cloud, Outer Ring Road',
    cityPin: 'Kadubeesanahalli, Bengaluru - 560103',
    recipient: 'Alex Morgan',
    phone: '+234 812 345 6789',
  },
  {
    id: 'addr-3',
    name: "Parents' Residence",
    tag: 'OTHER',
    isDefault: false,
    addressLine: 'No 15, 3rd Main, 7th Cross, Indiranagar 1st Stage',
    cityPin: 'Bengaluru - 560038',
    recipient: 'Morgan Family',
    phone: '+91 98765 43210',
  },
];

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAddressId: string;
  onSelectAddress: (address: Address) => void;
}

export function AddressModal({
  visible,
  onClose,
  selectedAddressId,
  onSelectAddress,
}: AddressModalProps) {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New address form state
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCityPin, setNewCityPin] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleSaveNewAddress = () => {
    if (!newTitle || !newAddressLine || !newRecipient) return;

    const created: Address = {
      id: `addr-${Date.now()}`,
      name: newTitle,
      tag: newTag,
      isDefault: false,
      addressLine: newAddressLine,
      cityPin: newCityPin || 'Bengaluru - 560038',
      recipient: newRecipient,
      phone: newPhone || '+91 98765 43210',
    };

    setAddresses((prev) => [created, ...prev]);
    onSelectAddress(created);
    setIsAddingNew(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewAddressLine('');
    setNewCityPin('');
    setNewRecipient('');
    setNewPhone('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[85%] shadow-2xl">
          {/* Header */}
          <View className="flex flex-row items-center justify-between pb-3 border-b border-surface-container-high mb-3">
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center">
                <Icon name="location_on" size={18} color="#b80035" />
              </View>
              <Text className="font-headline-sm text-[18px] text-on-surface font-extrabold">
                {isAddingNew ? 'Add New Address' : 'Select Delivery Address'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (isAddingNew) {
                  setIsAddingNew(false);
                } else {
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center"
            >
              <Icon name="close" size={18} color="#1b1b1e" />
            </TouchableOpacity>
          </View>

          {!isAddingNew ? (
            <ScrollView showsVerticalScrollIndicator={false} className="flex-col gap-3">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => {
                      onSelectAddress(addr);
                      onClose();
                    }}
                    activeOpacity={0.9}
                    className={`p-3.5 rounded-2xl mb-2.5 flex flex-col ${
                      isSelected
                        ? 'bg-primary-fixed/20 border-2 border-primary shadow-xs'
                        : 'bg-surface-container-low border border-transparent'
                    }`}
                  >
                    <View className="flex flex-row items-center justify-between mb-1">
                      <View className="flex flex-row items-center gap-2">
                        <View
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-on-surface-variant/40'
                          }`}
                        >
                          {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </View>
                        <Text className="font-label-lg text-[14px] text-on-surface font-bold">
                          {addr.name}
                        </Text>
                        <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
                          <Text className="font-label-eyebrow text-[9px] text-on-surface font-bold">
                            {addr.tag}
                          </Text>
                        </View>
                      </View>

                      {addr.isDefault && (
                        <View className="px-2 py-0.5 rounded-full bg-primary-container">
                          <Text className="font-label-eyebrow text-[9px] text-white font-bold">
                            DEFAULT
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="font-body-sm text-[12px] text-on-surface-variant ml-6 mt-1 leading-relaxed">
                      {addr.addressLine}
                    </Text>
                    <Text className="font-body-sm text-[11px] text-on-surface-variant/80 ml-6">
                      {addr.cityPin}
                    </Text>

                    <View className="flex flex-row items-center gap-3 ml-6 mt-2 pt-2 border-t border-surface-container-high">
                      <Text className="font-body-sm text-[11px] text-on-surface font-bold">
                        {addr.recipient}
                      </Text>
                      <Text className="font-body-sm text-[11px] text-on-surface-variant">
                        {addr.phone}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => setIsAddingNew(true)}
                activeOpacity={0.8}
                className="py-3 px-4 rounded-2xl bg-surface-container-lowest border-2 border-dashed border-primary/40 flex flex-row items-center justify-center gap-2 mt-1 mb-4"
              >
                <Icon name="add" size={18} color="#b80035" />
                <Text className="font-label-lg text-[13px] text-primary font-bold">
                  Add New Delivery Address
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} className="flex-col gap-3 pb-4">
              <View className="mb-2">
                <Text className="font-label-md text-[12px] text-on-surface font-bold mb-1">
                  Address Title (e.g. Home, Office, Studio)
                </Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Summer Beach House"
                  className="bg-surface-container-low px-3 py-2 rounded-xl text-[13px] font-body-md text-on-surface"
                />
              </View>

              <View className="mb-2">
                <Text className="font-label-md text-[12px] text-on-surface font-bold mb-1">
                  Tag
                </Text>
                <View className="flex flex-row items-center gap-2">
                  {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewTag(t)}
                      className={`px-3 py-1.5 rounded-full ${
                        newTag === t
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <Text
                        className={`font-label-md text-[11px] font-bold ${
                          newTag === t ? 'text-white' : 'text-on-surface'
                        }`}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-2">
                <Text className="font-label-md text-[12px] text-on-surface font-bold mb-1">
                  Street Address & Flat / Suite No.
                </Text>
                <TextInput
                  value={newAddressLine}
                  onChangeText={setNewAddressLine}
                  placeholder="House/Flat No., Building Name, Street"
                  multiline
                  numberOfLines={2}
                  className="bg-surface-container-low px-3 py-2 rounded-xl text-[13px] font-body-md text-on-surface"
                />
              </View>

              <View className="mb-2">
                <Text className="font-label-md text-[12px] text-on-surface font-bold mb-1">
                  Area & Pincode
                </Text>
                <TextInput
                  value={newCityPin}
                  onChangeText={setNewCityPin}
                  placeholder="e.g. Indiranagar, Bengaluru - 560038"
                  className="bg-surface-container-low px-3 py-2 rounded-xl text-[13px] font-body-md text-on-surface"
                />
              </View>

              <View className="flex flex-row items-center gap-2 mb-3">
                <View className="flex-1">
                  <Text className="font-label-md text-[12px] text-on-surface font-bold mb-1">
                    Recipient Name
                  </Text>
                  <TextInput
                    value={newRecipient}
                    onChangeText={setNewRecipient}
                    placeholder="Full Name"
                    className="bg-surface-container-low px-3 py-2 rounded-xl text-[13px] font-body-md text-on-surface"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-label-md text-[12px] text-on-surface font-bold mb-1">
                    Phone Number
                  </Text>
                  <TextInput
                    value={newPhone}
                    onChangeText={setNewPhone}
                    placeholder="+91 Phone"
                    className="bg-surface-container-low px-3 py-2 rounded-xl text-[13px] font-body-md text-on-surface"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveNewAddress}
                activeOpacity={0.9}
                className="py-3 px-4 rounded-xl bg-primary text-white items-center my-2"
              >
                <Text className="text-white font-label-lg text-[14px] font-bold">
                  Save & Select Address
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
