import * as WebBrowser from 'expo-web-browser';
import { useCartStore } from '@/store/useCartStore';
import { checkAddressServiceability } from '@/store/useAddressStore';
import { ApiProduct, cartApi, ordersApi, setAuthToken } from '@/services/api';
import {
  buildHostedCheckoutUrl,
  parsePaymentCallbackUrl,
  launchRazorpayCheckout,
} from '@/services/razorpay';

function makeTestProduct(overrides: Partial<ApiProduct>): ApiProduct {
  return {
    id: 'prod-default',
    brand: 'Affordz',
    title: 'Test Garment',
    description: 'Handcrafted garment',
    price: 1000,
    originalPrice: 1200,
    discount: '17% OFF',
    rating: 4.8,
    reviewsCount: 12,
    stockQuantity: 10,
    readyToShip: true,
    sizes: ['S', 'M', 'L'],
    image: 'https://example.com/1.jpg',
    altText: 'Test Garment',
    galleryImages: ['https://example.com/1.jpg'],
    category: 'Kurtas',
    ...overrides,
  };
}

describe('Cart Buckets, Coupons, Serviceability & Hosted Razorpay Checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
    useCartStore.getState().resetCartState();
  });

  it('computes split order delivery buckets accurately for mixed DARK_STORE + VENDOR bags', async () => {
    await useCartStore.getState().addItem(
      makeTestProduct({
        id: 'prod-dark-1',
        title: 'Heritage Chanderi Kurta',
        brand: 'Affordz Vault',
        vendor: { id: 'vendor-vault', storeName: 'Affordz Vault', address: 'Bengaluru', phone: '9999999999' },
        price: 1200,
        originalPrice: 1800,
        image: 'https://example.com/1.jpg',
        category: 'Kurtas',
        fulfillmentType: 'DARK_STORE',
      }),
      'M',
      'Ivory',
      1,
    );

    await useCartStore.getState().addItem(
      makeTestProduct({
        id: 'prod-vendor-1',
        title: 'Atelier Silk Stole',
        brand: 'Kashi Looms',
        vendor: { id: 'vendor-kashi', storeName: 'Kashi Looms', address: 'Bengaluru', phone: '8888888888' },
        price: 1000,
        originalPrice: 1400,
        image: 'https://example.com/2.jpg',
        category: 'Stoles',
        fulfillmentType: 'VENDOR',
      }),
      'Free',
      'Gold',
      1,
    );

    const state = useCartStore.getState();
    expect(state.itemTotal).toBe(2200);
    expect(state.splitOrderCount).toBe(2);
    // Both buckets are < 1499 independently, so each bucket incurs ₹40 delivery fee => ₹80 total
    expect(state.deliveryFee).toBe(80);
    // MRP is GST-inclusive: no extra GST tax line added on top of MRP
    expect(state.taxes).toBe(0);
    expect(state.grandTotal).toBe(2280);
  });

  it('applies empty server cart on fetchCart, syncs DB CartItem IDs, and rejects offline coupons', async () => {
    setAuthToken('jwt-live');
    useCartStore.setState({
      items: [
        {
          id: 'stale-local-1',
          productId: 'prod-old',
          title: 'Stale Garment',
          brand: 'Old',
          price: 999,
          originalPrice: 1299,
          size: 'M',
          quantity: 1,
          image: 'https://example.com/old.jpg',
        },
      ],
      count: 1,
    });

    jest.spyOn(cartApi, 'getCart').mockResolvedValueOnce({
      id: 'cart-1',
      items: [],
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 0,
      splitOrderCount: 0,
      splitBuckets: [],
      giftWrap: false,
      giftWrapFee: 0,
      donationAmount: 0,
    });

    await useCartStore.getState().fetchCart();
    expect(useCartStore.getState().items).toHaveLength(0);

    // DB CartItem.id returned on addItem replaces temporary client id
    jest.spyOn(cartApi, 'addItem').mockResolvedValueOnce({
      id: 'cart-1',
      items: [
        {
          id: 'db-cart-item-99',
          productId: 'prod-5',
          title: 'Zari Kurta',
          brand: 'Varanasi',
          price: 1800,
          originalPrice: 2200,
          size: 'L',
          quantity: 1,
          image: 'https://example.com/zari.jpg',
          fulfillmentType: 'DARK_STORE',
        },
      ],
      itemTotal: 1800,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 1800,
      splitOrderCount: 1,
      splitBuckets: [],
      giftWrap: false,
      giftWrapFee: 0,
      donationAmount: 0,
    });

    const added = await useCartStore.getState().addItem(
      makeTestProduct({
        id: 'prod-5',
        title: 'Zari Kurta',
        brand: 'Varanasi',
        price: 1800,
        originalPrice: 2200,
        image: 'https://example.com/zari.jpg',
        category: 'Kurtas',
        fulfillmentType: 'DARK_STORE',
      }),
    );

    expect(added).toBe(true);
    expect(useCartStore.getState().items[0].id).toBe('db-cart-item-99');

    // Never allow fake offline coupon discount when backend rejects
    jest
      .spyOn(cartApi, 'applyCoupon')
      .mockRejectedValueOnce(new Error('Coupon invalid or expired'));

    const couponResult = await useCartStore.getState().applyCoupon('AFFORDZ10');
    expect(couponResult.success).toBe(false);
    expect(useCartStore.getState().couponCode).toBeNull();
    expect(useCartStore.getState().discountAmount).toBe(0);

    // Gift wrap persists through PATCH /api/v1/cart/preferences
    const prefSpy = jest.spyOn(cartApi, 'updatePreferences').mockResolvedValueOnce({
      id: 'cart-1',
      items: useCartStore.getState().items as any,
      itemTotal: 1800,
      deliveryFee: 0,
      taxes: 0,
      giftWrap: true,
      giftWrapFee: 35,
      donationAmount: 0,
      grandTotal: 1835,
      splitOrderCount: 1,
      splitBuckets: [],
    });

    await useCartStore.getState().toggleGiftWrap();
    expect(prefSpy).toHaveBeenCalledWith({ giftWrap: true });
    expect(useCartStore.getState().giftWrap).toBe(true);
    expect(useCartStore.getState().giftWrapFee).toBe(35);
    expect(useCartStore.getState().grandTotal).toBe(1835);
  });

  it('gates non-serviceable and missing addresses properly', () => {
    expect(checkAddressServiceability(null).isServiceable).toBe(false);

    const outOfRange = checkAddressServiceability({
      id: 'addr-far',
      userId: 'usr-1',
      label: 'Remote House',
      line1: 'Outer Highway',
      locality: 'Far Suburb',
      city: 'Bengaluru',
      pincode: '560066',
      latitude: 13.3,
      longitude: 78.1,
      isDefault: false,
    });
    expect(outOfRange.isServiceable).toBe(false);

    const nearby = checkAddressServiceability({
      id: 'addr-near',
      userId: 'usr-1',
      label: 'Indiranagar Home',
      line1: '100 Feet Road',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isDefault: true,
    });
    expect(nearby.isServiceable).toBe(true);
  });

  it('builds Hosted Razorpay checkout URLs and parses affordz://payment-callback deep links', async () => {
    const builtUrl = buildHostedCheckoutUrl({
      orderId: 'grp-200',
      checkoutSessionToken: 'tok_abc+123',
    });

    expect(builtUrl).toContain('/api/v1/payments/razorpay/checkout-session/grp-200?st=tok_abc%2B123');

    const successParsed = parsePaymentCallbackUrl(
      'affordz://payment-callback?orderId=grp-200&status=success&razorpay_payment_id=pay_123&razorpay_order_id=order_rzp_200&razorpay_signature=sig_xyz',
    );
    expect(successParsed).toEqual({
      type: 'genuine_callback',
      orderId: 'grp-200',
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'order_rzp_200',
      razorpay_signature: 'sig_xyz',
    });

    jest.spyOn(WebBrowser, 'openAuthSessionAsync').mockResolvedValueOnce({
      type: 'success',
      url: 'affordz://payment-callback?orderId=grp-200&status=success&razorpay_payment_id=pay_123&razorpay_order_id=order_rzp_200&razorpay_signature=sig_xyz',
    } as any);

    const outcome = await launchRazorpayCheckout({
      key: 'rzp_test_123',
      amount: 189000,
      currency: 'INR',
      name: 'Affordz',
      description: 'Order #AF-200',
      order_id: 'order_rzp_200',
      orderId: 'grp-200',
      checkoutSessionToken: 'tok_abc',
    });

    expect(outcome).toEqual({
      type: 'genuine_callback',
      orderId: 'grp-200',
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'order_rzp_200',
      razorpay_signature: 'sig_xyz',
    });

    jest.spyOn(WebBrowser, 'openAuthSessionAsync').mockResolvedValueOnce({
      type: 'success',
      url: 'affordz://payment-callback?orderId=grp-200&status=dismissed',
    } as any);

    const dismissedOutcome = await launchRazorpayCheckout({
      key: 'rzp_test_123',
      amount: 189000,
      currency: 'INR',
      name: 'Affordz',
      description: 'Order #AF-200',
      order_id: 'order_rzp_200',
      orderId: 'grp-200',
      checkoutSessionToken: 'tok_abc',
    });

    expect(dismissedOutcome.type).toBe('cancelled');
  });

  it('prevents auto-re-add when decrementing to 0 or removing while addItem is still in flight', async () => {
    setAuthToken('jwt-live');

    let resolveAdd!: (val: any) => void;
    const pendingAddPromise = new Promise((resolve) => {
      resolveAdd = resolve;
    });

    jest.spyOn(cartApi, 'addItem').mockReturnValueOnce(pendingAddPromise as any);
    const removeSpy = jest.spyOn(cartApi, 'removeItem').mockResolvedValueOnce({
      id: 'cart-1',
      items: [],
      itemTotal: 0,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 0,
      splitOrderCount: 0,
      splitBuckets: [],
      giftWrap: false,
      giftWrapFee: 0,
      donationAmount: 0,
    });

    const addPromise = useCartStore.getState().addItem(
      makeTestProduct({
        id: 'prod-race-1',
        title: 'Quick Linen Shirt',
        brand: 'Kudicart',
        price: 1299,
        originalPrice: 1599,
      }),
      'M',
      undefined,
      1,
    );

    const tempId = useCartStore.getState().items[0].id;
    expect(tempId).toMatch(/^ci-/);

    // User immediately decrements to 0 before backend addItem responds
    const decPromise = useCartStore.getState().updateQuantity(tempId, -1);
    expect(useCartStore.getState().items).toHaveLength(0);

    // Slow addItem resolves with server row, then queued removeItem executes using resolved DB ID
    resolveAdd({
      id: 'cart-1',
      items: [
        {
          id: 'db-item-race-1',
          productId: 'prod-race-1',
          title: 'Quick Linen Shirt',
          brand: 'Kudicart',
          price: 1299,
          originalPrice: 1599,
          size: 'M',
          quantity: 1,
          image: 'https://example.com/1.jpg',
        },
      ],
      itemTotal: 1299,
      deliveryFee: 40,
      taxes: 0,
      grandTotal: 1339,
      splitOrderCount: 1,
      splitBuckets: [],
      giftWrap: false,
      giftWrapFee: 0,
      donationAmount: 0,
    });

    await Promise.all([addPromise, decPromise]);
    expect(removeSpy).toHaveBeenCalledWith('db-item-race-1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('syncs guest bag items into backend cart automatically on auth login', async () => {
    // Guest adds an item locally while unauthenticated
    await useCartStore.getState().addItem(
      makeTestProduct({
        id: 'prod-guest-1',
        title: 'Mulmul Tunic',
        brand: 'Ateliers',
        price: 1499,
        originalPrice: 1999,
      }),
      'S',
      undefined,
      1,
    );
    expect(useCartStore.getState().items).toHaveLength(1);

    setAuthToken('jwt-new-user');
    const syncedServerCart = {
      id: 'cart-sync',
      items: [
        {
          id: 'db-synced-1',
          productId: 'prod-guest-1',
          title: 'Mulmul Tunic',
          brand: 'Ateliers',
          price: 1499,
          originalPrice: 1999,
          size: 'S',
          quantity: 1,
          image: 'https://example.com/1.jpg',
        },
      ],
      itemTotal: 1499,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 1499,
      splitOrderCount: 1,
      splitBuckets: [],
      giftWrap: false,
      giftWrapFee: 0,
      donationAmount: 0,
    };
    const syncAddSpy = jest.spyOn(cartApi, 'addItem').mockResolvedValueOnce(syncedServerCart);
    jest.spyOn(cartApi, 'getCart').mockResolvedValueOnce(syncedServerCart);

    await useCartStore.getState().syncGuestCartToServer();
    expect(syncAddSpy).toHaveBeenCalledWith('prod-guest-1', 'S', 1, undefined, 'Standard');
    expect(useCartStore.getState().items[0].id).toBe('db-synced-1');
  });

  it('requests official GST invoice payload for an order', async () => {
    setAuthToken('jwt-live');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          invoiceNumber: 'INV-ORD-100',
          mrpGstInclusive: true,
          totals: { taxableSubtotal: 1904, cgstTotal: 48, sgstTotal: 47, grandTotal: 1999 },
        }),
    }) as any;

    try {
      const inv = await ordersApi.getInvoice('ord-100');
      expect(inv.invoiceNumber).toBe('INV-ORD-100');
      expect(inv.mrpGstInclusive).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/orders/ord-100/invoice'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer jwt-live' }),
        }),
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
