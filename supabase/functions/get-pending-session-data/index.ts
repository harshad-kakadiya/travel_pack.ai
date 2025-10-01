import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pending_session_id } = await req.json();

    if (!pending_session_id) {
      return new Response(
        JSON.stringify({ error: "pending_session_id is required" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/pending_sessions?id=eq.${pending_session_id}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending session: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Pending session not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const sessionData = data[0];

    // Return the session data in a clean format
    return new Response(
      JSON.stringify({
        persona: sessionData.persona,
        destinations: sessionData.destinations || [],
        start_date: sessionData.start_date,
        end_date: sessionData.end_date,
        activity_preferences: sessionData.activity_preferences || [],
        group_size: sessionData.group_size,
        budget: sessionData.budget,
        passport_country_code: sessionData.passport_country_code,
        passport_country_label: sessionData.passport_country_label,
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get pending session data error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});