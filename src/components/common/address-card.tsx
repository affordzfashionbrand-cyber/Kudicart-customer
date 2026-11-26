import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Home, Briefcase, Building, Check, Pencil, Trash2 } from 'lucide-react-native';
import { Fonts, FontStyles } from '@/constants/theme';
import { AddressModel } from '@/services/api';

interface AddressCardProps {
  address: AddressModel;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showShippingInfo?: boolean;
}

export const AddressCard = React.memo(function AddressCard({ address, isSelected, onSelect, onEdit, onDelete, showShippingInfo }: AddressCardProps) {
  const getIcon = () => {
    const iconProps = { size: 18, color: isSelected ? '#FFFFFF' : '#52525B' };
    const label = (address.label || '').toLowerCase();
    if (label.includes('home')) return <Home {...iconProps} />;
    if (label.includes('work') || label.includes('studio') || label.includes('hq')) return <Briefcase {...iconProps} />;
    return <Building {...iconProps} />;
  };

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
          {getIcon()}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[FontStyles.sansBold, styles.label]}>{address.label}</Text>
            {address.isDefault && (
              <View style={styles.defaultPill}>
                <Text style={[FontStyles.sansBold, styles.defaultPillText]}>DEFAULT</Text>
              </View>
            )}
          </View>
          <Text style={[FontStyles.sansRegular, styles.addressText]} numberOfLines={2}>
            {[address.line1, address.locality, address.city, address.pincode].filter(Boolean).join(', ')}
          </Text>
          {showShippingInfo && (
            <View style={styles.shippingBadge}>
              <Text style={[FontStyles.sansMedium, styles.shippingText]}>📦 Standard Boutique Shipping (1-3 Days)</Text>
            </View>
          )}
        </View>

        <View style={[styles.selectionIndicator, isSelected && styles.selectedSelectionIndicator]}>
            {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
        </View>
      </View>
      
      {(onEdit || onDelete) && (
        <View style={styles.controls}>
          {onEdit && (
            <Pressable onPress={onEdit} style={styles.controlButton}>
                <Pencil size={12} color="#111111" />
                <Text style={[FontStyles.sansBold, styles.controlText]}>Edit</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.controlButton}>
                <Trash2 size={12} color="#EF4444" />
                <Text style={[FontStyles.sansBold, styles.deleteText]}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: '#111111',
    backgroundColor: '#F4F1EA',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F7F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconContainer: {
    backgroundColor: '#111111',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    color: '#111111',
    fontWeight: '800'
  },
  defaultPill: {
    backgroundColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultPillText: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 13,
    color: '#6B6667',
    lineHeight: 18,
  },
  shippingBadge: {
    marginTop: 8,
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  shippingText: {
    fontSize: 10,
    color: '#9D174D',
  },
  selectionIndicator: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: '#D9D9D5',
      alignItems: 'center',
      justifyContent: 'center',
  },
  selectedSelectionIndicator: {
      backgroundColor: '#111111',
      borderColor: '#111111',
  },
  controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#E8E5DF',
      justifyContent: 'flex-end',
  },
  controlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  controlText: {
      fontSize: 11,
      color: '#111111',
  },
  deleteText: {
      fontSize: 11,
      color: '#EF4444',
  }
});
