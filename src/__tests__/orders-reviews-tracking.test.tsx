import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import {
  useOrderStore,
  isOrderItemEligibleForReview,
} from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import {
  useSupportStore,
  CANONICAL_SUPPORT_CATEGORIES,
} from '@/store/useSupportStore';
import { OrderModel, reviewsApi, supportApi, setAuthToken } from '@/services/api';
import { trackingSocketService } from '@/services/trackingSocket';
import { customerNotificationService } from '@/services/notificationService';
import { OrderDetailView } from '@/components/orders/order-detail-view';
import { WriteReviewModal } from '@/components/product/write-review-modal';

const deliveredOrder: OrderModel = {
  id: 'ord-delivered-1',
  orderNumber: 'AF-9001',
  customerId: 'usr-1',
  status: 'DELIVERED',
  paymentMethod: 'RAZORPAY',
  paymentStatus: 'COMPLETED',
  itemTotal: 2400,
  deliveryFee: 0,
  taxes: 120,
  grandTotal: 2520,
  etaMinutes: 18,
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'oi-1',
      productId: 'prod-101',
      title: 'Banarasi Zari Dupatta',
      brand: 'Kashi Heritage',
      size: 'M',
      color: 'Crimson',
      quantity: 2,
      price: 1200,
      image: 'https://example.com/dupatta.jpg',
      fulfillmentType: 'DARK_STORE',
    },
  ],
};

describe('OrderDetailView, DCR-014 Reviews, TrackingSocket, Support & Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
    useOrderStore.getState().resetOrders();
    useCartStore.getState().resetCartState();
    useSupportStore.getState().resetSupport();
    useAuthStore.setState({
      user: {
        id: 'usr-1',
        name: 'Aarav',
        phone: '9876543210',
        email: null,
        avatar: null,
        role: 'CUSTOMER',
      },
      token: 'jwt-1',
      isAuthenticated: true,
    });
    trackingSocketService.disconnect();
  });

  it('enforces DCR-014 review eligibility accurately across regular and Try & Buy orders', () => {
    // Delivered non-Try&Buy order with matching item -> eligible
    expect(isOrderItemEligibleForReview(deliveredOrder, 'prod-101')).toBe(true);
    // Unpurchased product -> ineligible
    expect(isOrderItemEligibleForReview(deliveredOrder, 'prod-other')).toBe(false);

    // Undelivered regular order -> ineligible
    expect(
      isOrderItemEligibleForReview({ ...deliveredOrder, status: 'OUT_FOR_DELIVERY' }, 'prod-101'),
    ).toBe(false);

    // Unsettled Try & Buy session -> ineligible
    const unsettledTryBuy: OrderModel = {
      ...deliveredOrder,
      status: 'OUT_FOR_DELIVERY',
      isTryAndBuy: true,
      tryAndBuySession: {
        id: 'tb-1',
        orderId: 'ord-delivered-1',
        trialDurationMinutes: 10,
        stage: 'TRIAL_IN_PROGRESS',
        keptItemIds: ['oi-1'],
        returnedItemIds: [],
      },
    };
    expect(isOrderItemEligibleForReview(unsettledTryBuy, 'prod-101')).toBe(false);

    // Settled Try & Buy where item was RETURNED -> ineligible
    const returnedTryBuy: OrderModel = {
      ...deliveredOrder,
      status: 'RETURNED',
      isTryAndBuy: true,
      tryAndBuySession: {
        id: 'tb-1',
        orderId: 'ord-delivered-1',
        trialDurationMinutes: 10,
        stage: 'SETTLED' as any,
        keptItemIds: [],
        returnedItemIds: ['oi-1'],
      },
      items: [{ ...deliveredOrder.items[0], tryAndBuyDecision: 'RETURN' }],
    };
    expect(isOrderItemEligibleForReview(returnedTryBuy, 'prod-101')).toBe(false);

    // Settled Try & Buy where item was KEPT -> eligible
    const keptTryBuy: OrderModel = {
      ...deliveredOrder,
      status: 'DELIVERED',
      isTryAndBuy: true,
      tryAndBuySession: {
        id: 'tb-1',
        orderId: 'ord-delivered-1',
        trialDurationMinutes: 10,
        stage: 'SETTLED' as any,
        keptItemIds: ['oi-1'],
        returnedItemIds: [],
      },
      items: [{ ...deliveredOrder.items[0], tryAndBuyDecision: 'KEEP' }],
    };
    expect(isOrderItemEligibleForReview(keptTryBuy, 'prod-101')).toBe(true);
  });

  it('WriteReviewModal blocks undelivered orders and submits verified reviews for delivered orders', async () => {
    const createReviewSpy = jest
      .spyOn(reviewsApi, 'createReview')
      .mockResolvedValue({
        success: true,
        review: {
          id: 'rev-1',
          userId: 'usr-1',
          productId: 'prod-101',
          orderId: 'ord-delivered-1',
          rating: 5,
          comment: 'Wonderful zari drape and great fit!',
          createdAt: new Date().toISOString(),
        },
      });

    useOrderStore.setState({
      orders: [{ ...deliveredOrder, status: 'OUT_FOR_DELIVERY' }],
    });

    const onSubmitSuccess = jest.fn();
    const screen = await render(
      <WriteReviewModal
        visible={true}
        onClose={jest.fn()}
        productId="prod-101"
        productTitle="Banarasi Zari Dupatta"
        brand="Kashi Heritage"
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    await fireEvent.changeText(
      screen.getByPlaceholderText(/Share your thoughts on the fabric softness/i),
      'Wonderful zari drape and great fit!',
    );
    await fireEvent.press(screen.getByText('SUBMIT ATELIER REVIEW'));

    expect(
      await screen.findByText(/Only delivered orders \(or settled Try & Buy items you kept\) can be reviewed/i),
    ).toBeTruthy();
    expect(createReviewSpy).not.toHaveBeenCalled();

    // Update store with DELIVERED order -> succeeds
    useOrderStore.setState({ orders: [deliveredOrder] });
    await fireEvent.press(screen.getByText('SUBMIT ATELIER REVIEW'));

    await waitFor(() => {
      expect(createReviewSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ord-delivered-1',
          productId: 'prod-101',
          rating: 5,
        }),
      );
      expect(onSubmitSuccess).toHaveBeenCalled();
    });
  });

  it('OrderDetailView reorders using item.productId/size/color/quantity and opens web-safe cancel modal', async () => {
    const addItemSpy = jest.spyOn(useCartStore.getState(), 'addItem').mockResolvedValue(true);
    const activeOrder: OrderModel = {
      ...deliveredOrder,
      status: 'PLACED',
    };

    const view = await render(
      <OrderDetailView
        order={activeOrder}
        onBack={jest.fn()}
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        formatPrice={(v) => `₹${v}`}
      />,
    );

    // Rate button should NOT appear before DELIVERED
    expect(view.queryByText('RATE & REVIEW GARMENTS')).toBeNull();

    // Reorder button calls addItem with item.productId, size, color, quantity
    await fireEvent.press(view.getByText('REORDER ITEMS'));
    await waitFor(() => {
      expect(addItemSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prod-101',
          fulfillmentType: 'DARK_STORE',
        }),
        'M',
        'Crimson',
        2,
      );
    });

    // Cancel Drop opens modal instead of multi-button native Alert
    await fireEvent.press(view.getByText('CANCEL DROP'));
    expect(await view.findByText('Cancel Drop?')).toBeTruthy();
  });

  it('TrackingSocketService enforces monotonic seq dedupe, ORDER_ARRIVED, auth close codes & disconnect reset', () => {
    const mockSockets: any[] = [];
    const OriginalWebSocket = globalThis.WebSocket;

    class MockWebSocket {
      static OPEN = 1;
      static CONNECTING = 0;
      readyState = 1;
      onopen: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      onerror: (() => void) | null = null;
      onclose: ((e?: any) => void) | null = null;
      send = jest.fn();
      close = jest.fn();
      url: string;
      constructor(url: string) {
        this.url = url;
        mockSockets.push(this);
      }
    }
    (globalThis as any).WebSocket = MockWebSocket;

    const statusListener = jest.fn();
    const arrivalListener = jest.fn();
    const tryBuyListener = jest.fn();

    const unsubStatus = trackingSocketService.subscribeStatus(statusListener);
    const unsubArrival = trackingSocketService.subscribeArrival(arrivalListener);
    const unsubTryBuy = trackingSocketService.subscribeTryAndBuy(tryBuyListener);

    trackingSocketService.connect('ord-1', 'token-1');
    const ws1 = mockSockets[0];
    expect(ws1.url).toContain('token=token-1');

    // seq 2 arrives
    ws1.onmessage?.({
      data: JSON.stringify({ type: 'ORDER_STATUS_UPDATE', seq: 2, status: 'OUT_FOR_DELIVERY' }),
    });
    expect(statusListener).toHaveBeenCalledWith('OUT_FOR_DELIVERY', expect.any(Object));

    // Stale seq 1 ignored
    ws1.onmessage?.({
      data: JSON.stringify({ type: 'ORDER_STATUS_UPDATE', seq: 1, status: 'ASSIGNED' }),
    });
    expect(statusListener).toHaveBeenCalledTimes(1);

    // ORDER_ARRIVED (seq 3) handled
    ws1.onmessage?.({
      data: JSON.stringify({ type: 'ORDER_ARRIVED', seq: 3, arrivedAt: '2026-11-12T01:00:00Z' }),
    });
    expect(arrivalListener).toHaveBeenCalledTimes(1);

    // TRY_AND_BUY_UPDATED (seq 4) handled
    ws1.onmessage?.({
      data: JSON.stringify({ type: 'TRY_AND_BUY_UPDATED', seq: 4, stage: 'SELECTION_CONFIRMED' }),
    });
    expect(tryBuyListener).toHaveBeenCalledTimes(1);

    // Disconnect resets lastSeq so a new connection accepts seq 1 again
    trackingSocketService.disconnect();
    trackingSocketService.connect('ord-2', 'token-2');
    const ws2 = mockSockets[1];
    ws2.onmessage?.({
      data: JSON.stringify({ type: 'ORDER_STATUS_UPDATE', seq: 1, status: 'PICKED_UP' }),
    });
    expect(statusListener).toHaveBeenLastCalledWith('PICKED_UP', expect.any(Object));

    // Close code 4001 suppresses reconnect loop
    jest.useFakeTimers();
    ws2.onclose?.({ code: 4001 });
    jest.advanceTimersByTime(20000);
    expect(mockSockets).toHaveLength(2);
    jest.useRealTimers();

    unsubStatus();
    unsubArrival();
    unsubTryBuy();
    trackingSocketService.disconnect();
    globalThis.WebSocket = OriginalWebSocket;
  });

  it('notificationService returns null cleanly when push is unconfigured and never fakes tokens', async () => {
    const token = await customerNotificationService.acquireToken();
    expect(token).toBeNull();
  });

  it('useSupportStore aligns canonical categories and returns null/false instead of faking data on error', async () => {
    expect(CANONICAL_SUPPORT_CATEGORIES).toContain('TRY_AND_BUY');
    expect(CANONICAL_SUPPORT_CATEGORIES).toContain('PAYMENT_REFUND');

    jest.spyOn(supportApi, 'createTicket').mockRejectedValueOnce(new Error('Auth required'));
    const ticket = await useSupportStore.getState().createTicket({
      title: 'Exchange size',
      category: 'TRY_AND_BUY',
      description: 'Need M instead of L',
      priority: 'HIGH',
    });
    expect(ticket).toBeNull();
    expect(useSupportStore.getState().tickets).toHaveLength(0);

    jest.spyOn(reviewsApi, 'createReview').mockRejectedValueOnce(new Error('Order not delivered'));
    const reviewOk = await useSupportStore.getState().submitReview({
      orderId: 'ord-1',
      productId: 'prod-101',
      rating: 5,
      comment: 'Great',
    });
    expect(reviewOk).toBe(false);
  });
});
