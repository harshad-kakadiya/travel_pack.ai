import { createClient } from 'npm:@supabase/supabase-js@2';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

/**
 * Check if a request from the given IP address is within rate limits
 * @param ipAddress - Client IP address
 * @param limit - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds (e.g., 60000 for 1 minute)
 * @returns Promise<RateLimitResult> - Whether the request is allowed and metadata
 */
export async function checkRateLimit(
  ipAddress: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        allowed: true, // Fail open if configuration is missing
        remaining: limit,
        resetTime: Date.now() + windowMs,
        error: 'Rate limiting configuration missing'
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Try to get existing rate limit record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Rate limit fetch error:', fetchError);
      return {
        allowed: true, // Fail open on database errors
        remaining: limit,
        resetTime: Date.now() + windowMs,
        error: 'Database error during rate limit check'
      };
    }

    let requestCount = 1;
    let lastResetAt = now;

    if (existingRecord) {
      const recordResetTime = new Date(existingRecord.last_reset_at);
      
      if (recordResetTime > windowStart) {
        // Within the current window, increment count
        requestCount = existingRecord.request_count + 1;
        lastResetAt = recordResetTime;
      } else {
        // Window has expired, reset count
        requestCount = 1;
        lastResetAt = now;
      }

      // Update existing record
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({
          request_count: requestCount,
          last_reset_at: lastResetAt.toISOString()
        })
        .eq('ip_address', ipAddress);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
        return {
          allowed: true, // Fail open on database errors
          remaining: limit,
          resetTime: Date.now() + windowMs,
          error: 'Database error during rate limit update'
        };
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          ip_address: ipAddress,
          request_count: requestCount,
          last_reset_at: lastResetAt.toISOString()
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
        return {
          allowed: true, // Fail open on database errors
          remaining: limit,
          resetTime: Date.now() + windowMs,
          error: 'Database error during rate limit creation'
        };
      }
    }

    const allowed = requestCount <= limit;
    const remaining = Math.max(0, limit - requestCount);
    const resetTime = lastResetAt.getTime() + windowMs;

    return {
      allowed,
      remaining,
      resetTime
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      allowed: true, // Fail open on unexpected errors
      remaining: limit,
      resetTime: Date.now() + windowMs,
      error: `Unexpected error: ${error.message}`
    };
  }
}

/**
 * Get client IP address from request headers
 * @param req - Request object
 * @returns string - Client IP address or 'unknown' if not found
 */
export function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  return 'unknown';
}

/**
 * Create a rate limit exceeded response
 * @param result - Rate limit result
 * @returns Response - HTTP 429 response with rate limit headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}