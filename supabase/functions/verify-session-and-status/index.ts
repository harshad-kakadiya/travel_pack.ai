import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts';

interface VerifySessionRequest {
  session_id: string;
  pending_session_id: string;
}

const corsHeadersExtended = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeadersExtended 
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Rate limiting: 20 requests per minute per IP
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit(clientIP, 20, 60000); // 20 requests per minute
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for session verification, IP ${clientIP}`);
      return createRateLimitResponse(rateLimitResult);
    }

    // Check required environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const missingEnvVars = [];
    if (!stripeSecretKey) missingEnvVars.push('STRIPE_SECRET_KEY');
    if (!supabaseUrl) missingEnvVars.push('SUPABASE_URL');
    if (!supabaseServiceKey) missingEnvVars.push('SUPABASE_SERVICE_ROLE_KEY');

    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      return new Response(
        JSON.stringify({ 
          error: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
          has_paid: false
        }),
        { 
          status: 500,
          headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const { session_id, pending_session_id }: VerifySessionRequest = await req.json();

    // Validate required fields
    if (!session_id || !pending_session_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: session_id and pending_session_id',
          has_paid: false
        }),
        { 
          status: 400,
          headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate session_id format (Stripe checkout session IDs start with 'cs_')
    if (!session_id.startsWith('cs_')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid session_id format. Must be a Stripe checkout session ID',
          has_paid: false
        }),
        { 
          status: 400,
          headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate pending_session_id format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pending_session_id)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid pending_session_id format. Must be a valid UUID',
          has_paid: false
        }),
        { 
          status: 400,
          headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Retrieve checkout session from Stripe
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe API error:', {
        status: stripeResponse.status,
        statusText: stripeResponse.statusText,
        body: errorText,
        session_id
      });

      // Try to parse Stripe error for better user feedback
      let errorMessage = 'Failed to verify payment session';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // If parsing fails, use generic message
        errorMessage = `Stripe API error: ${stripeResponse.status}`;
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          has_paid: false
        }),
        { 
          status: 400,
          headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
        }
      );
    }

    const checkoutSession = await stripeResponse.json();

    // Validate that we got the expected response from Stripe
    if (!checkoutSession.id || !checkoutSession.mode) {
      console.error('Invalid Stripe response:', checkoutSession);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from payment processor',
          has_paid: false
        }),
        { 
          status: 500,
          headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
        }
      );
    }

    // Determine if payment is complete based on mode
    let isPaid = false;
    let paymentReason = '';

    if (checkoutSession.mode === 'payment') {
      // One-time payment
      isPaid = checkoutSession.payment_status === 'paid';
      paymentReason = isPaid ? 'One-time payment completed' : `Payment status: ${checkoutSession.payment_status}`;
    } else if (checkoutSession.mode === 'subscription') {
      // Subscription
      isPaid = checkoutSession.status === 'complete';
      paymentReason = isPaid ? 'Subscription created successfully' : `Subscription status: ${checkoutSession.status}`;
    } else {
      paymentReason = `Unknown checkout mode: ${checkoutSession.mode}`;
    }
    // Log the verification attempt
    console.log('Payment verification:', {
      session_id,
      pending_session_id,
      mode: checkoutSession.mode,
      payment_status: checkoutSession.payment_status,
      status: checkoutSession.status,
      isPaid,
      reason: paymentReason
    });

    // If payment is successful, update the pending session
    if (isPaid) {
      const updateData = {
        has_paid: true,
        paid_at: new Date().toISOString(),
        customer_email: checkoutSession.customer_details?.email || null,
        plan_type: checkoutSession.mode === 'subscription' ? 'yearly' : 'one_time',
        status: 'paid'
      };

      // Add Stripe customer ID if available
      if (checkoutSession.customer) {
        updateData.stripe_customer_id = checkoutSession.customer;
      }

      const { error: updateError } = await supabase
        .from('pending_sessions')
        .update(updateData)
        .eq('id', pending_session_id);

      if (updateError) {
        console.error('Failed to update pending session:', updateError);
        return new Response(
          JSON.stringify({ 
            error: 'Payment verified but failed to update database',
            has_paid: true,
            reason: paymentReason
          }),
          { 
            status: 500,
            headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
          }
        );
      }

      // Update or create user email record if email is available
      if (checkoutSession.customer_details?.email) {
        const { error: emailError } = await supabase
          .from('user_emails')
          .upsert({
            email: checkoutSession.customer_details.email,
            last_seen: new Date().toISOString(),
            active_plan: checkoutSession.mode === 'subscription' ? 'yearly' : 'none',
            plan_renewal_at: checkoutSession.mode === 'subscription' && checkoutSession.subscription
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
              : null
          });

        if (emailError) {
          console.error('Failed to update user email record:', emailError);
          // Don't fail the request for this, just log it
        }
      }

      // Log successful verification
      await supabase
        .from('logs_performance')
        .insert({
          operation: 'verify_session_and_status_success',
          duration_ms: Date.now(), // In production, calculate actual duration
          meta: {
            session_id,
            pending_session_id,
            mode: checkoutSession.mode,
            customer_email: checkoutSession.customer_details?.email
          }
        });
    }

    // Return verification result
    return new Response(
      JSON.stringify({
        has_paid: isPaid,
        reason: paymentReason,
        session_data: {
          mode: checkoutSession.mode,
          payment_status: checkoutSession.payment_status,
          status: checkoutSession.status,
          customer_email: checkoutSession.customer_details?.email,
          amount_total: checkoutSession.amount_total,
          currency: checkoutSession.currency
        }
      }),
      { 
        headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in verify-session-and-status:', error);
    
    // Log the error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase
        .from('logs_errors')
        .insert({
          level: 'error',
          message: `verify-session-and-status error: ${error.message}`,
          meta: {
            function: 'verify_session_and_status',
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        has_paid: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeadersExtended, 'Content-Type': 'application/json' }
      }
    );
  }
});