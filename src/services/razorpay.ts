import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL } from './api';

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paisa
  currency: string;
  name: string;
  description: string;
  order_id: string; // Razorpay order id (e.g. order_xxx)
  orderId: string; // Internal order id (e.g. ord-xxx)
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export type RazorpayCheckoutResult =
  | {
      type: 'genuine_callback';
      orderId: string;
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  | {
      type: 'hosted_session_completed';
      orderId: string;
    }
  | {
      type: 'cancelled';
      orderId?: string;
      reason: string;
    };

let scriptLoadingPromise: Promise<void> | null = null;

function loadRazorpayWebScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).Razorpay) return Promise.resolve();

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout script'));
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function launchRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpayCheckoutResult> {
  if (Platform.OS === 'web') {
    await loadRazorpayWebScript();

    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay === 'undefined') {
        resolve({
          type: 'cancelled',
          orderId: options.orderId,
          reason: 'Razorpay SDK could not be loaded in browser',
        });
        return;
      }

      const rzpOptions = {
        key: options.key,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'Affordz Quick Commerce',
        description: options.description || 'Order Payment',
        order_id: options.order_id,
        prefill: {
          name: options.prefill?.name || 'Affordz Customer',
          email: options.prefill?.email || 'customer@affordz.in',
          contact: options.prefill?.contact || '+91 98450 12890',
        },
        theme: {
          color: options.theme?.color || '#0D9488',
        },
        handler: function (response: any) {
          resolve({
            type: 'genuine_callback',
            orderId: options.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            resolve({
              type: 'cancelled',
              orderId: options.orderId,
              reason: 'Payment window was closed by the user',
            });
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', function (res: any) {
        resolve({
          type: 'cancelled',
          orderId: options.orderId,
          reason: res.error?.description || 'Razorpay payment was declined or failed',
        });
      });
      rzp.open();
    });
  }

  // Native Platform (Android / iOS): Open authenticated hosted checkout session
  // Deep-link redirect scheme is 'affordz://' as defined in app.json
  const checkoutUrl = `${API_BASE_URL}/api/v1/payments/razorpay/checkout-session/${encodeURIComponent(options.orderId)}`;

  try {
    const authSessionResult = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      'affordz://',
    );

    if (authSessionResult.type === 'success' && authSessionResult.url) {
      try {
        const parsedUrl = new URL(authSessionResult.url);
        const orderId = parsedUrl.searchParams.get('orderId') || options.orderId;
        const status = parsedUrl.searchParams.get('status');

        if (status === 'CANCELLED') {
          return {
            type: 'cancelled',
            orderId,
            reason: 'Payment checkout was cancelled by the user',
          };
        }

        return {
          type: 'hosted_session_completed',
          orderId,
        };
      } catch {
        return {
          type: 'hosted_session_completed',
          orderId: options.orderId,
        };
      }
    } else if (authSessionResult.type === 'cancel' || authSessionResult.type === 'dismiss') {
      return {
        type: 'cancelled',
        orderId: options.orderId,
        reason: 'Payment window was dismissed',
      };
    } else {
      return {
        type: 'cancelled',
        orderId: options.orderId,
        reason: 'Payment session was not completed',
      };
    }
  } catch (err: any) {
    return {
      type: 'cancelled',
      orderId: options.orderId,
      reason: err?.message || 'Payment session encountered an error',
    };
  }
}
