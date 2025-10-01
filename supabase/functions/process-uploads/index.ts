import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts';

interface ProcessUploadsRequest {
  pending_session_id: string;
  upload_keys: string[];
}

interface OpenAIVisionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ParsedBookingData {
  type: string;
  provider?: string;
  date?: string;
  time?: string;
  location?: string;
  reference?: string;
  filename: string;
  raw_content?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 10 requests per hour per IP (file processing is resource intensive)
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit(clientIP, 10, 3600000); // 10 requests per hour
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for upload processing, IP ${clientIP}`);
      return createRateLimitResponse(rateLimitResult);
    }

    const { pending_session_id, upload_keys }: ProcessUploadsRequest = await req.json();

    if (!pending_session_id || !upload_keys?.length) {
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

    // Load pending session data to check payment status
    const { data: sessionData, error: sessionError } = await supabase
      .from('pending_sessions')
      .select('has_paid, customer_email')
      .eq('id', pending_session_id)
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check payment status - only process uploads after payment
    if (!sessionData.has_paid) {
      return new Response(
        JSON.stringify({ 
          error: 'Payment required',
          message: 'Document processing is only available after payment confirmation'
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get('VITE_OPENAI_API_KEY');
    const hasOpenAI = !!openaiApiKey;

    const extractedData: ParsedBookingData[] = [];

    // Process each uploaded file
    for (const uploadKey of upload_keys) {
      try {
        // Get signed URL for the file (valid for 1 hour)
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('travel-uploads')
          .createSignedUrl(uploadKey, 3600);

        if (urlError || !signedUrlData?.signedUrl) {
          console.error(`Failed to get signed URL for ${uploadKey}:`, urlError);
          continue;
        }

        const publicUrl = signedUrlData.signedUrl;
        const fileExtension = uploadKey.split('.').pop()?.toLowerCase();
        
        let parsedData: ParsedBookingData;

        if (hasOpenAI && ['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension || '')) {
          // Use GPT-4o Vision to parse the document
          try {
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a travel document parser. Extract structured booking details from the uploaded document. Focus on flights, hotels, trains, buses, events. Return valid JSON with fields: type, provider, date, time, location, reference. If you cannot extract specific information, omit those fields. Always include the type field.'
                  },
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: 'Please extract booking information from this travel document and return it as JSON.'
                      },
                      {
                        type: 'image_url',
                        image_url: {
                          url: publicUrl
                        }
                      }
                    ]
                  }
                ],
                max_tokens: 1000,
                temperature: 0.1,
              }),
            });

            if (!openaiResponse.ok) {
              const errorText = await openaiResponse.text();
              console.error('OpenAI API error:', errorText);
              throw new Error(`OpenAI API error: ${openaiResponse.status}`);
            }

            const openaiData: OpenAIVisionResponse = await openaiResponse.json();
            const content = openaiData.choices[0]?.message?.content;

            if (!content) {
              throw new Error('No content returned from OpenAI');
            }

            // Try to parse the JSON response
            let parsedJson;
            try {
              // Clean the content in case it has markdown formatting
              const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
              parsedJson = JSON.parse(cleanContent);
            } catch (parseError) {
              console.error('Failed to parse OpenAI JSON response:', content);
              throw new Error('Invalid JSON response from OpenAI');
            }

            parsedData = {
              ...parsedJson,
              filename: uploadKey,
              raw_content: content
            };

          } catch (openaiError) {
            console.error(`OpenAI parsing failed for ${uploadKey}:`, openaiError);
            
            // Fallback to dummy data
            parsedData = {
              type: 'document',
              filename: uploadKey,
              raw_content: `OpenAI parsing failed: ${openaiError.message}`
            };
          }
        } else {
          // Fallback for unsupported files or missing OpenAI key
          parsedData = {
            type: fileExtension === 'pdf' ? 'pdf' : 'image',
            filename: uploadKey,
            raw_content: hasOpenAI ? 'Unsupported file type' : 'OpenAI API key not configured'
          };
        }

        extractedData.push(parsedData);

      } catch (fileError) {
        console.error(`Error processing file ${uploadKey}:`, fileError);
        
        // Log individual file processing errors
        await supabase
          .from('logs_errors')
          .insert({
            level: 'warning',
            message: `Failed to process upload: ${uploadKey}`,
            meta: {
              function: 'process_uploads',
              pending_session_id,
              upload_key: uploadKey,
              error: fileError.message
            }
          });

        // Add error entry to extracted data
        extractedData.push({
          type: 'error',
          filename: uploadKey,
          raw_content: `Processing failed: ${fileError.message}`
        });
      }
    }

    // Update the pending_sessions table with booking data
    if (extractedData.length > 0) {
      const { error: updateError } = await supabase
        .from('pending_sessions')
        .update({
          booking_data: extractedData
        })
        .eq('id', pending_session_id);

      if (updateError) {
        console.error('Failed to save booking data:', updateError);
        throw new Error('Failed to save booking data');
      }
    }

    // Log performance
    await supabase
      .from('logs_performance')
      .insert({
        operation: 'process_uploads',
        duration_ms: Date.now(), // In production, calculate actual duration
        meta: {
          pending_session_id,
          files_processed: upload_keys.length,
          successful_extractions: extractedData.length,
          openai_enabled: hasOpenAI
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        parsed: extractedData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing uploads:', error);
    
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
          message: `process-uploads error: ${error.message}`,
          meta: {
            function: 'process_uploads',
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});