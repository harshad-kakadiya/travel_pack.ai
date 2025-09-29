import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface LogErrorRequest {
  level: 'error' | 'warning' | 'info';
  message: string;
  meta?: any;
  source?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { level, message, meta, source }: LogErrorRequest = await req.json();

    if (!level || !message) {
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

    // Insert error log
    const { error: insertError } = await supabase
      .from('logs_errors')
      .insert({
        level,
        message,
        meta: {
          ...meta,
          source: source || 'api',
          timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
        }
      });

    if (insertError) {
      console.error('Failed to insert error log:', insertError);
      throw new Error('Failed to log error');
    }

    // Also log to console for immediate visibility
    const logLevel = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logLevel(`[${level.toUpperCase()}] ${message}`, meta);

    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error logging error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to log error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});