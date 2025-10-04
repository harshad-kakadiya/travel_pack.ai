/**
 * CORS Proxy middleware for handling cross-origin requests
 */

interface ProxyOptions {
  targetUrl: string;
  headers?: Record<string, string>;
}

/**
 * Makes a proxied fetch request that handles CORS issues
 * @param options - Proxy options including target URL and additional headers
 * @param fetchOptions - Standard fetch options (method, body, etc.)
 * @returns Promise with the fetch response
 */
export async function proxyFetch(
  options: ProxyOptions,
  fetchOptions: RequestInit = {}
): Promise<Response> {
  const { targetUrl, headers = {} } = options;
  
  // Combine default headers with any custom headers
  const combinedHeaders = {
    'Content-Type': 'application/json',
    ...headers,
    ...fetchOptions.headers,
  };

  try {
    // Make the fetch request with combined headers
    const response = await fetch(targetUrl, {
      ...fetchOptions,
      headers: combinedHeaders,
      // Add these options to help with CORS
      mode: 'cors',
      credentials: 'same-origin',
    });
    
    return response;
  } catch (error) {
    console.error('Proxy fetch error:', error);
    throw error;
  }
}

/**
 * Helper function specifically for Supabase Edge Function calls
 * @param functionName - The name of the Supabase Edge Function
 * @param body - The request body (will be JSON stringified)
 * @param method - HTTP method (defaults to POST)
 * @returns Promise with the fetch response
 */
export async function callSupabaseFunction(
  functionName: string,
  body: any,
  method: string = 'POST'
): Promise<Response> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return proxyFetch(
    {
      targetUrl: `${supabaseUrl}/functions/v1/${functionName}`,
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    },
    {
      method,
      body: JSON.stringify(body),
    }
  );
}