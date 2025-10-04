import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-email, *',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    // Get request body
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({
        error: 'Email is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!stripeSecretKey || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({
        error: 'Server not configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Initialize clients
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient()
    });
    const supabase = createClient(supabaseUrl, serviceKey);
    // Get user from database
    const { data: userData, error: userError } = await supabase.from('user_emails').select('active_plan, plan_renewal_at').eq('email', email).maybeSingle();
    if (userError) {
      return new Response(JSON.stringify({
        error: 'Database error',
        details: userError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!userData || userData.active_plan !== 'yearly') {
      return new Response(JSON.stringify({
        error: 'No active subscription found'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Find customer in Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({
        error: 'Customer not found in payment system'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const customer = customers.data[0];
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active'
    });
    if (subscriptions.data.length === 0) {
      // Sync database
      await supabase.from('user_emails').update({
        active_plan: 'none',
        plan_renewal_at: null
      }).eq('email', email);
      return new Response(JSON.stringify({
        error: 'No active subscription found'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Cancel all subscriptions
    for (const subscription of subscriptions.data){
      await stripe.subscriptions.cancel(subscription.id);
    }
    // Update database
    await supabase.from('user_emails').update({
      active_plan: 'none',
      plan_renewal_at: null
    }).eq('email', email);
    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription cancelled successfully'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      }
    });
  }
});
