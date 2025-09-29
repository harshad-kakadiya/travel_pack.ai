import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface LogPerformanceRequest {
  operation: string;
  duration_ms: number;
  meta?: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, duration_ms, meta }: LogPerformanceRequest = await req.json();

    if (!operation || typeof duration_ms !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert performance log
    const { error: insertError } = await supabase
      .from('logs_performance')
      .insert({
        operation,
        duration_ms,
        meta: {
          ...meta,
          timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
        }
      });

    if (insertError) {
      console.error('Failed to insert performance log:', insertError);
      throw new Error('Failed to log performance');
    }

    // Log to console for monitoring
    console.log(`[PERFORMANCE] ${operation}: ${duration_ms}ms`, meta);

    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error logging performance:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to log performance' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});