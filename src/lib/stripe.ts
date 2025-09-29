export interface CreateCheckoutSessionRequest {
  plan: 'onetime' | 'yearly';
  tripId?: string;
  tripTitle?: string;
  startDate?: string;
  endDate?: string;
  days?: any[];
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