import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createCheckoutSession } from '../lib/stripe';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutProps {
  plan: 'onetime' | 'yearly';
  pendingSessionId: string;
  onSuccess: (url: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

const CheckoutForm: React.FC<StripeCheckoutProps> = ({
  plan,
  pendingSessionId,
  onSuccess,
  onError,
  isLoading
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create checkout session
      const { url } = await createCheckoutSession({
        plan,
        pending_session_id: pendingSessionId
      });

      onSuccess(url);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="p-3 sm:p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm active:translate-y-px"
      >
        {processing ? 'Processing...' : `Pay ${plan === 'onetime' ? '$5' : '$39/year'}`}
      </button>
    </form>
  );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};
