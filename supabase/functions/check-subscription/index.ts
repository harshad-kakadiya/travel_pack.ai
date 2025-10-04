import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-email, *',
  'Access-Control-Max-Age': '86400',
};

interface CheckRequest {
  email?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    // Try to parse JSON body first
    let parsedBody: CheckRequest = {};
    try {
      parsedBody = await req.json();
    } catch {
      parsedBody = {};
    }

    // Accept email from multiple sources for robustness across deployments
    const url = new URL(req.url);
    const emailFromQuery = url.searchParams.get('email') || undefined;
    const emailFromHeader = req.headers.get('x-admin-email') || undefined;
    const email = parsedBody.email || emailFromHeader || emailFromQuery;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from('user_emails')
      .select('active_plan, plan_renewal_at')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const now = Date.now();
    const isSubscribed = !!data && data.active_plan === 'yearly' && (!!data.plan_renewal_at ? new Date(data.plan_renewal_at).getTime() > now : true);

    return new Response(JSON.stringify({ is_subscribed: isSubscribed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

