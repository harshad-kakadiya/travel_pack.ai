export interface CreateCheckoutSessionRequest {
  plan: 'onetime' | 'yearly';
  tripId?: string;
  tripTitle?: string;
  startDate?: string;
  endDate?: string;
  days?: any[];
  redirectToPlan?: boolean;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    } catch {
      throw new Error('Failed to create checkout session');
    }
  }

  const data = await response.json();
  return { url: data.url };
}

export async function verifySessionAndStatus(sessionId: string) {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-session-and-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify session');
  }

  return response.json();
}

export async function checkSubscriptionByEmail(email: string): Promise<{ is_subscribed: boolean }>
{
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    return { is_subscribed: false };
  }

  return response.json();
}

export async function cancelSubscription(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error || 'Failed to cancel subscription' };
  }

  return { success: true, message: data.message };
}
