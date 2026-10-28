import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  CheckCircle2,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react-native';
import { AnimatedPressable } from '@/components/common/animated-pressable';
import { OrderStatus } from '@/services/api';

const FEEDBACK_TAGS = [
  '⚡ Blazing 18-Min Speed',
  '👔 Neatly Steamed & Pressed',
  '🛵 Polite EV Pilot',
  '📦 Tamper-Proof Vault Box',
  '👗 Perfect Doorstep Fit',
  '⏱️ Smooth 10-Min Try Window',
];

export interface TrackingPilotRatingCardProps {
  existingRating: {
    rating: number;
    tags: string[];
    comment: string;
  } | null;
  isEditingRating: boolean;
  setIsEditingRating: (val: boolean) => void;
  selectedRating: number;
  setSelectedRating: (val: number) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  isSubmittingReview: boolean;
  isRatingExpanded: boolean;
  setIsRatingExpanded: (val: boolean | ((prev: boolean) => boolean)) => void;
  handleSubmitRating: () => void;
  activeStatus: OrderStatus;
  driverName: string;
}

export const TrackingPilotRatingCard = React.memo(function TrackingPilotRatingCard({
  existingRating,
  isEditingRating,
  setIsEditingRating,
  selectedRating,
  setSelectedRating,
  selectedTags,
  setSelectedTags,
  reviewComment,
  setReviewComment,
  isSubmittingReview,
  isRatingExpanded,
  setIsRatingExpanded,
  handleSubmitRating,
  activeStatus,
  driverName,
}: TrackingPilotRatingCardProps) {
  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '★★★★★ Exceptional 18-Min Speed & Service';
      case 4:
        return '★★★★☆ Very Good Delivery & Fit';
      case 3:
        return '★★★☆☆ Satisfactory Experience';
      case 2:
        return '★★☆☆☆ Needs Improvement';
      case 1:
        return '★☆☆☆☆ Poor Service';
      default:
        return '★★★★★ Tap stars to rate';
    }
  };

  if (existingRating && !isEditingRating) {
    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          padding: 18,
          borderWidth: 1.5,
          borderColor: '#22C55E',
          shadowColor: '#16A34A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <CheckCircle2 size={12} color="#15803D" />
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#15803D', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              VERIFIED DROP REVIEW
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setSelectedRating(existingRating.rating);
              setSelectedTags(existingRating.tags);
              setReviewComment(existingRating.comment);
              setIsEditingRating(true);
              setIsRatingExpanded(true);
            }}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF5A1F' }}>
              Edit Review
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((starNum) => (
              <Star
                key={starNum}
                size={18}
                color={starNum <= existingRating.rating ? '#F59E0B' : '#D1D5DB'}
                fill={starNum <= existingRating.rating ? '#F59E0B' : 'transparent'}
              />
            ))}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#111111' }}>
            {existingRating.rating}.0 ★
          </Text>
        </View>

        <Text style={{ fontSize: 12, color: '#4B5563', lineHeight: 17, marginTop: 4 }}>
          Thank you! {driverName} and the Indiranagar Vault team have been notified of your review.
        </Text>

        {existingRating.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {existingRating.tags.map((tag) => (
              <View
                key={tag}
                style={{
                  backgroundColor: '#FFF7ED',
                  borderWidth: 1,
                  borderColor: '#FFEDD5',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#C2410C' }}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {Boolean(existingRating.comment) && (
          <View style={{ marginTop: 10, padding: 10, backgroundColor: '#FAF8F5', borderRadius: 10, borderWidth: 1, borderColor: '#E8E5DF' }}>
            <Text style={{ fontSize: 11.5, color: '#374151', fontStyle: 'italic' }}>
              "{existingRating.comment}"
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        borderWidth: 1.5,
        borderColor: activeStatus === 'DELIVERED' ? '#FF5A1F' : '#FED7AA',
        shadowColor: '#FF5A1F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 14,
      }}
    >
      {/* Header Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#FFF7ED',
            borderWidth: 1,
            borderColor: '#FFEDD5',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Sparkles size={12} color="#FF5A1F" />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '900',
              color: '#C2410C',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            {activeStatus === 'DELIVERED' ? 'HOW WAS YOUR DROP?' : 'PILOT & DROP FEEDBACK'}
          </Text>
        </View>

        <Pressable
          onPress={() => setIsRatingExpanded(!isRatingExpanded)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2 }}
        >
          <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#6B6667' }}>
            {isRatingExpanded ? 'Collapse' : 'Rate Drop'}
          </Text>
          {isRatingExpanded ? <ChevronUp size={14} color="#6B6667" /> : <ChevronDown size={14} color="#6B6667" />}
        </Pressable>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '900', color: '#111111' }}>
        Rate Your 18-Min Drop Experience
      </Text>
      <Text style={{ fontSize: 11.5, color: '#6B6667', marginTop: 3, lineHeight: 16 }}>
        How was your Ather EV pilot {driverName} and your doorstep garment trial?
      </Text>

      {isRatingExpanded && (
        <View>
          {/* 5 Interactive Stars */}
          <View style={{ marginTop: 14, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isFilled = starNum <= selectedRating;
                return (
                  <Pressable
                    key={starNum}
                    onPress={() => setSelectedRating(starNum)}
                    style={{ padding: 4 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Star
                      size={32}
                      color={isFilled ? '#F59E0B' : '#D1D5DB'}
                      fill={isFilled ? '#F59E0B' : 'transparent'}
                    />
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#B45309', marginTop: 6 }}>
              {getRatingLabel(selectedRating)}
            </Text>
          </View>

          {/* Quick Praise Chips */}
          <View style={{ marginTop: 14 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                color: '#8E877E',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              WHAT STOOD OUT? (TAP TO SELECT)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {FEEDBACK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: isSelected ? '#FFF7ED' : '#FAF8F5',
                      borderWidth: 1,
                      borderColor: isSelected ? '#FF5A1F' : '#E8E5DF',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 14,
                    }}
                  >
                    {isSelected && <Check size={11} color="#FF5A1F" strokeWidth={3} />}
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected ? '#C2410C' : '#4B5563',
                      }}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Optional Feedback Notes */}
          <View style={{ marginTop: 14 }}>
            <TextInput
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={`Add details about pilot ${driverName} or garment sizing (optional)...`}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#FAF8F5',
                borderWidth: 1,
                borderColor: '#E8E5DF',
                borderRadius: 14,
                padding: 10,
                fontSize: 12,
                color: '#111111',
                minHeight: 64,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Submit Rating CTA */}
          <View style={{ marginTop: 14 }}>
            <AnimatedPressable
              onPress={handleSubmitRating}
              style={{
                backgroundColor: '#111111',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {isSubmittingReview ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 }}>
                    SUBMIT RATING & REVIEW
                  </Text>
                </>
              )}
            </AnimatedPressable>
          </View>
        </View>
      )}
    </View>
  );
});
