import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Star,
  CheckCircle2,
  Edit3,
  ThumbsUp,
  Sparkles,
} from 'lucide-react-native';
import { EditorialText } from '@/components/common/section-title';
import { WriteReviewModal } from './write-review-modal';
import { reviewsApi } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore, isOrderItemEligibleForReview } from '@/store/useOrderStore';
import { FontStyles } from '@/constants/theme';
import { ReviewSectionSkeleton } from '@/components/common/skeleton';

export interface ReviewItem {
  id: string;
  userName: string;
  userLocation?: string;
  rating: number;
  comment: string;
  tags?: string[];
  createdAt: string;
  verified?: boolean;
}

export interface ProductReviewsSectionProps {
  productId?: string;
  productTitle?: string;
  productImage?: string;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
}

export function ProductReviewsSection({
  productId = '101',
  productTitle = 'Handloom Cotton Saree with Zari',
  productImage,
  brand = 'Varanasi Looms',
  rating: initialRating = 0,
  reviewsCount: initialReviewsCount = 0,
}: ProductReviewsSectionProps) {
  const { isAuthenticated } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(productId));
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | '5_STAR' | 'VERIFIED'>('ALL');
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && orders.length === 0) {
      void fetchOrders();
    }
  }, [isAuthenticated, orders.length, fetchOrders]);

  const eligibleOrder = useMemo(
    () => orders.find((o) => isOrderItemEligibleForReview(o, productId)) || null,
    [orders, productId],
  );

  const handleOpenWriteReview = useCallback(() => {
    if (!eligibleOrder) {
      setToastMessage(
        !isAuthenticated
          ? 'Sign in after receiving a delivered item to write a review.'
          : 'Reviews unlock once your order containing this piece is delivered.',
      );
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    setIsWriteModalOpen(true);
  }, [eligibleOrder, isAuthenticated]);

  // Fetch reviews from live backend if productId is present
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        if (productId) {
          setIsLoading(true);
          const apiReviews = await reviewsApi.getProductReviews(productId);
          if (isMounted) {
            if (apiReviews && apiReviews.length > 0) {
              const mapped: ReviewItem[] = apiReviews.map((r: any) => ({
                id: r.id,
                userName: r.author?.name || r.user?.name || 'Verified Customer',
                userLocation: 'Verified Delivery',
                rating: Number(r.rating) || 5,
                comment: r.comment || '',
                tags: ['Verified Purchase', 'Atelier Craft'],
                createdAt: r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent',
                verified: true,
              }));
              setReviews(mapped);
            } else {
              setReviews([]);
            }
          }
        }
      } catch {
        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleReviewSubmitted = useCallback(
    (newReview: {
      id: string;
      userName: string;
      rating: number;
      comment: string;
      tags: string[];
      createdAt: string;
      verified: boolean;
    }) => {
      const item: ReviewItem = {
        id: newReview.id,
        userName: newReview.userName,
        userLocation: 'Verified Buyer',
        rating: newReview.rating,
        comment: newReview.comment,
        tags: newReview.tags,
        createdAt: 'Just now',
        verified: true,
      };

      setReviews((prev) => [item, ...prev]);
      setToastMessage('Thank you! Your verified review has been published.');
      setTimeout(() => setToastMessage(null), 3000);
    },
    [],
  );

  const toggleHelpful = useCallback(
    (id: string) => {
      if (votedReviews[id]) return;
      setHelpfulCounts((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
      setVotedReviews((prev) => ({ ...prev, [id]: true }));
    },
    [votedReviews],
  );

  const filteredReviews = useMemo(() => {
    if (selectedFilter === '5_STAR') {
      return reviews.filter((r) => r.rating === 5);
    }
    if (selectedFilter === 'VERIFIED') {
      return reviews.filter((r) => r.verified);
    }
    return reviews;
  }, [reviews, selectedFilter]);

  const totalCount = reviews.length;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return initialRating || 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews, initialRating]);

  const positivePercentage = useMemo(() => {
    if (reviews.length === 0) return 0;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    return Math.round((positive / reviews.length) * 100);
  }, [reviews]);

  if (isLoading && reviews.length === 0) {
    return <ReviewSectionSkeleton />;
  }

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 26 }}>
      {/* Header with Title and "Write a Review" Button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <EditorialText first="Atelier trial" second="stories." fontSize={17} lineHeight={20} singleLine withDot />
          {totalCount > 0 && (
            <View style={{ backgroundColor: '#F0ECE4', paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 8 }}>
              <Text style={[FontStyles.sansBold, { fontSize: 10, color: '#111111' }]}>{totalCount}</Text>
            </View>
          )}
        </View>

        {/* Primary CTA: Write a Review */}
        <Pressable
          onPress={handleOpenWriteReview}
          style={({ pressed }) => ({
            backgroundColor: '#111111',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            opacity: pressed ? 0.85 : 1,
            elevation: 2,
          })}
        >
          <Edit3 size={12} color="#FFFFFF" />
          <Text style={[FontStyles.sansBold, { fontSize: 10.5, color: '#FFFFFF', letterSpacing: 0.5 }]}>
            WRITE REVIEW
          </Text>
        </Pressable>
      </View>

      {/* Floating Success Toast */}
      {toastMessage && (
        <View
          style={{
            backgroundColor: '#ECFDF5',
            borderWidth: 1,
            borderColor: '#A7F3D0',
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#065F46', flex: 1 }]}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* Rating Breakdown & Quick Score Banner */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E8E5DF',
          marginBottom: 14,
          elevation: 2,
        }}
      >
        {totalCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={[FontStyles.sansBold, { fontSize: 28, color: '#111111' }]}>
                  {averageRating.toFixed(1)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      color={s <= Math.round(averageRating) ? '#D4AF37' : '#E5E7EB'}
                      fill={s <= Math.round(averageRating) ? '#D4AF37' : 'none'}
                    />
                  ))}
                </View>
              </View>
              <Text style={[FontStyles.sansBold, { fontSize: 11, color: '#15803D', marginTop: 2 }]}>
                {positivePercentage}% of verified buyers recommend this piece
              </Text>
              <Text style={[FontStyles.sansRegular, { fontSize: 10.5, color: '#71717A', marginTop: 1 }]}>
                Based on {totalCount} {totalCount === 1 ? 'verified review' : 'verified reviews'}
              </Text>
            </View>

            {/* Quick Rate Trigger */}
            <Pressable
              onPress={handleOpenWriteReview}
              style={{
                backgroundColor: '#FFF7ED',
                borderWidth: 1,
                borderColor: '#FFD8C2',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: '#FF5A1F', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
                RATE THIS PIECE
              </Text>
              <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} color="#FF5A1F" fill="none" />
                ))}
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#FF5A1F" />
                <Text style={[FontStyles.sansBold, { fontSize: 15, color: '#111111' }]}>
                  No Reviews Yet
                </Text>
              </View>
              <Text style={[FontStyles.sansRegular, { fontSize: 11.5, color: '#71717A', marginTop: 3 }]}>
                Be the first verified customer to share your fitting experience with this piece.
              </Text>
            </View>

            {/* Quick Rate Trigger */}
            <Pressable
              onPress={handleOpenWriteReview}
              style={{
                backgroundColor: '#FFF7ED',
                borderWidth: 1,
                borderColor: '#FFD8C2',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: '#FF5A1F', letterSpacing: 0.8, textTransform: 'uppercase' }]}>
                RATE THIS PIECE
              </Text>
              <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} color="#FF5A1F" fill="none" />
                ))}
              </View>
            </Pressable>
          </View>
        )}

        {/* Filter Chips (Only shown when there are reviews to filter) */}
        {totalCount > 0 && (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F1EA' }}>
            {[
              { id: 'ALL', label: `All (${reviews.length})` },
              { id: '5_STAR', label: '5 Stars Only' },
              { id: 'VERIFIED', label: 'Verified Purchases' },
            ].map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setSelectedFilter(tab.id as any)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4.5,
                    borderRadius: 10,
                    backgroundColor: isSelected ? '#111111' : '#FAF8F5',
                    borderWidth: 1,
                    borderColor: isSelected ? '#111111' : '#E8E5DF',
                  }}
                >
                  <Text
                    style={[
                      isSelected ? FontStyles.sansBold : FontStyles.sansMedium,
                      {
                        fontSize: 10,
                        color: isSelected ? '#FFFFFF' : '#6B6667',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Customer Reviews Cards or Empty State */}
      <View style={{ gap: 12 }}>
        {totalCount === 0 ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 24,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <Text style={[FontStyles.sansBold, { fontSize: 13, color: '#111111', marginBottom: 4 }]}>
              No verified trial stories yet
            </Text>
            <Text style={[FontStyles.sansRegular, { fontSize: 11.5, color: '#71717A', textAlign: 'center', maxWidth: 280, lineHeight: 16 }]}>
              Ordered or tried this garment? Write a review to help other collectors understand the textile feel, fit, and silhouette.
            </Text>
          </View>
        ) : filteredReviews.length === 0 ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E8E5DF',
            }}
          >
            <Text style={[FontStyles.sansMedium, { fontSize: 12, color: '#71717A' }]}>
              No reviews found matching this filter.
            </Text>
          </View>
        ) : (
          filteredReviews.map((rev) => {
            const initials =
              rev.userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'VC';

            const isVoted = votedReviews[rev.id];
            const count = helpfulCounts[rev.id] || 0;

            return (
              <View
                key={rev.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  elevation: 1,
                }}
              >
                {/* Review Header: User Info & Stars */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: '#FFF0EA',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#FFD8C2',
                      }}
                    >
                      <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#FF5A1F' }]}>
                        {initials}
                      </Text>
                    </View>
                    <View>
                      <Text style={[FontStyles.sansBold, { fontSize: 12.5, color: '#111111' }]}>
                        {rev.userName}
                      </Text>
                      <Text style={[FontStyles.sansRegular, { fontSize: 9.5, color: '#71717A' }]}>
                        {rev.userLocation || 'Verified Buyer'} • {rev.createdAt}
                      </Text>
                    </View>
                  </View>

                  {/* Stars */}
                  <View style={{ flexDirection: 'row', gap: 1.5 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        color={s <= rev.rating ? '#D4AF37' : '#D1D5DB'}
                        fill={s <= rev.rating ? '#D4AF37' : 'none'}
                      />
                    ))}
                  </View>
                </View>

                {/* Review Body */}
                <Text style={[FontStyles.sansRegular, { fontSize: 12, color: '#374151', lineHeight: 18, marginTop: 2 }]}>
                  &ldquo;{rev.comment}&rdquo;
                </Text>

                {/* Praise Tags */}
                {rev.tags && rev.tags.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {rev.tags.map((tag, i) => (
                      <View
                        key={i}
                        style={{
                          backgroundColor: '#FAF8F5',
                          borderWidth: 1,
                          borderColor: '#E8E5DF',
                          borderRadius: 8,
                          paddingHorizontal: 7,
                          paddingVertical: 2.5,
                        }}
                      >
                        <Text style={[FontStyles.sansMedium, { fontSize: 9, color: '#6B6667' }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer: Verified Badge & Helpful Button */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#F4F1EA',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={11} color="#15803D" />
                    <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: '#15803D', textTransform: 'uppercase' }]}>
                      Verified Try & Buy Order
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => toggleHelpful(rev.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 4 }}
                  >
                    <ThumbsUp size={11} color={isVoted ? '#FF5A1F' : '#71717A'} />
                    <Text style={[FontStyles.sansBold, { fontSize: 9.5, color: isVoted ? '#FF5A1F' : '#71717A' }]}>
                      {count > 0 ? `Helpful (${count})` : 'Helpful'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Bottom Write Review Prompt Button */}
      <Pressable
        onPress={handleOpenWriteReview}
        style={({ pressed }) => ({
          marginTop: 14,
          backgroundColor: '#FFFFFF',
          borderWidth: 1.5,
          borderColor: '#111111',
          borderRadius: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Edit3 size={13} color="#111111" />
        <Text style={[FontStyles.sansBold, { fontSize: 11.5, color: '#111111', letterSpacing: 0.8 }]}>
          HAVE YOU TRIED THIS PIECE? WRITE A REVIEW
        </Text>
      </Pressable>

      {/* Write Review Modal */}
      <WriteReviewModal
        visible={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        orderId={eligibleOrder?.id}
        productTitle={productTitle}
        productImage={productImage}
        brand={brand}
        onSubmitSuccess={handleReviewSubmitted}
      />
    </View>
  );
}
