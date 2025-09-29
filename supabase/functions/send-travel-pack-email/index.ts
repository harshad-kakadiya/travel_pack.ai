import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts';

interface SendEmailRequest {
  email: string;
  pdf_url: string;
  html_url: string;
  traveler_name?: string;
  destinations?: string;
}

interface ResendEmailRequest {
  from: string;
  to: string;
  subject: string;
  html: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 5 requests per hour per IP (prevent email spam)
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit(clientIP, 5, 3600000); // 5 requests per hour
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for email sending, IP ${clientIP}`);
      return createRateLimitResponse(rateLimitResult);
    }

    const { email, pdf_url, html_url, traveler_name, destinations }: SendEmailRequest = await req.json();

    if (!email || !pdf_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured - missing RESEND_API_KEY' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client for email sending
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Email template
    const emailSubject = `Your TravelPack.ai is Ready! 🎒 ${destinations ? `- ${destinations}` : ''}`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Travel Pack is Ready</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
        .button:hover { background: #1d4ed8; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎒 Your TravelPack.ai is Ready!</h1>
            <p>Your personalized travel brief has been generated and is ready for download.</p>
        </div>
        
        <div class="content">
            <p>Hi${traveler_name ? ` ${traveler_name}` : ''}! 👋</p>

            <p>Great news! Your personalized Travel Pack is now ready. We've created a comprehensive travel brief tailored specifically to your trip${destinations ? ` to ${destinations}` : ''}.</p>
            
            <div class="highlight">
                <strong>📋 What's included in your Travel Pack:</strong>
                <ul>
                    <li>Complete day-by-day itinerary</li>
                    <li>Safety tips and local etiquette</li>
                    <li>Visa and entry requirements</li>
                    <li>Packing lists and weather info</li>
                    <li>Food recommendations and local tips</li>
                    <li>Emergency contacts and health info</li>
                    <li>Budget planning and money tips</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${pdf_url}" class="button">📄 Download PDF</a>
                <a href="${html_url}" class="button">🌐 View Online</a>
            </div>
            
            <p><strong>💡 Pro Tips:</strong></p>
            <ul>
                <li>Save the PDF to your phone for offline access</li>
                <li>Print a copy as backup</li>
                <li>Share with your travel companions</li>
                <li>Bookmark this email for easy access</li>
            </ul>
            
            <p>Have an amazing trip! If you need any help or have questions, just reply to this email.</p>

            <p>Safe travels! ✈️<br>
            The Travel Pack Team</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                This email was sent because you purchased a Travel Pack. 
                <br>Need help? Reply to this email or visit our <a href="${Deno.env.get('SITE_URL')}/support">support page</a>.
            </p>
        </div>
    </div>
</body>
</html>`;

    // Send email via Resend
    const resendPayload: ResendEmailRequest = {
      from: 'Travel Pack <no-reply@yourdomain.com>',
      to: email,
      subject: emailSubject,
      html: emailHtml
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        body: errorText
      });
      
      let errorMessage = 'Failed to send email';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If parsing fails, use generic message
        errorMessage = `Email service error: ${resendResponse.status}`;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const resendResult = await resendResponse.json();
    console.log('Email sent successfully via Resend:', resendResult.id);

    // Log the email send attempt
    await supabase
      .from('logs_performance')
      .insert({
        operation: 'send_travel_pack_email',
        duration_ms: Date.now(), // In production, calculate actual duration
        meta: {
          email,
          destinations,
          pdf_url: pdf_url.substring(0, 50) + '...',
          html_url: html_url.substring(0, 50) + '...',
          resend_id: resendResult.id
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_sent_to: email,
        resend_id: resendResult.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});