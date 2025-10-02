import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Loader, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { trackDownloadComplete } from '../components/Analytics';
import { generatePDFWithPrint, downloadAsText, enhanceHTMLForPDF } from '../lib/pdfGenerator';
import { AffiliateLinks } from '../components/AffiliateLinks';


// Function to enhance AI response formatting
function enhanceAIResponse(response: string): string {
  // Convert plain text to properly formatted HTML
  let enhanced = response
    // Convert line breaks to proper HTML
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags
    .replace(/^(.*)$/gm, '<p>$1</p>')
    // Fix double paragraph tags
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<p>.*<\/p>)<\/p>/g, '$1')
    // Format headings
    .replace(/<p><strong>([^<]+)<\/strong><\/p>/g, '<h2>$1</h2>')
    .replace(/<p>\*\*([^*]+)\*\*<\/p>/g, '<h2>$1</h2>')
    // Format bold text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Format lists
    .replace(/<p>[-•]\s*(.*)<\/p>/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    // Clean up list formatting
    .replace(/<\/li><ul>/g, '</li><li>')
    .replace(/<ul><li>/g, '<ul><li>')
    .replace(/<\/li><\/ul>/g, '</li></ul>')
    // Format special sections
    .replace(/<p>Flight Information<\/p>/g, '<h3>✈️ Flight Information</h3>')
    .replace(/<p>Accommodation<\/p>/g, '<h3>🏨 Accommodation</h3>')
    .replace(/<p>Activities<\/p>/g, '<h3>🎯 Activities</h3>')
    .replace(/<p>Budget<\/p>/g, '<h3>💰 Budget</h3>')
    .replace(/<p>Tips<\/p>/g, '<h3>💡 Travel Tips</h3>')
    .replace(/<p>Safety<\/p>/g, '<h3>🛡️ Safety</h3>')
    // Add special styling for important information
    .replace(/<p>Departure:.*?<\/p>/g, '<div class="destination-highlight">$&</div>')
    .replace(/<p>Return:.*?<\/p>/g, '<div class="destination-highlight">$&</div>')
    // Clean up empty paragraphs
    .replace(/<p>\s*<\/p>/g, '');

  return enhanced;
}

// Function to create structured travel brief from JSON response
function createStructuredTravelBrief(briefData: any): string {
  const sections = [
    { key: 'cover_html', title: 'Cover', icon: '✈️' },
    { key: 'intro_html', title: 'Introduction', icon: '📋' },
    { key: 'day_by_day_html', title: 'Daily Itinerary', icon: '🗓️', isArray: true },
    { key: 'activities_html', title: 'Activities', icon: '🎯' },
    { key: 'food_html', title: 'Food & Dining', icon: '🍜' },
    { key: 'packing_html', title: 'Packing Checklist', icon: '🎒' },
    { key: 'safety_html', title: 'Safety & Emergency', icon: '🛡️' },
    { key: 'visa_html', title: 'Visa & Documentation', icon: '🛂' },
    { key: 'budget_html', title: 'Budget Overview', icon: '💰' },
    { key: 'language_html', title: 'Language Guide', icon: '🗣️' },
    { key: 'persona_html', title: 'Personalized Tips', icon: '👤' },
    { key: 'weather_html', title: 'Weather & Climate', icon: '🌤️' },
    { key: 'transport_html', title: 'Transportation', icon: '🚌' },
    { key: 'booking_html', title: 'Booking Tips', icon: '📅' },
    { key: 'accessibility_html', title: 'Accessibility', icon: '♿' },
    { key: 'money_html', title: 'Money & Payments', icon: '💳' },
    { key: 'final_html', title: 'Final Notes', icon: '📝' }
  ];

  let html = '';

  sections.forEach(section => {
    const content = briefData[section.key];
    if (content) {
      if (section.isArray && Array.isArray(content)) {
        // Handle day_by_day_html array
        html += `<div class="travel-section">
          <h2 class="section-title">${section.icon} ${section.title}</h2>
          <div class="section-content">`;

        content.forEach((dayContent) => {
          html += `<div class="day-section">${dayContent}</div>`;
        });

        html += `</div></div>`;
      } else {
        // Handle regular sections
        html += `<div class="travel-section">
          <h2 class="section-title">${section.icon} ${section.title}</h2>
          <div class="section-content">${content}</div>
        </div>`;
      }
    }
  });

  // Add theme title if available
  if (briefData.theme_title) {
    html = `<div class="theme-banner">
      <h1 class="theme-title">${briefData.theme_title}</h1>
    </div>` + html;
  }

  return html;
}

interface VerifySessionResponse {
  has_paid: boolean;
  reason: string;
  session_data?: {
    mode: string;
    payment_status: string;
    status: string;
    customer_email?: string;
    amount_total?: number;
    currency?: string;
  };
}

interface GenerateBriefResponse {
  html_url: string;
  pdf_url: string;
  generated_at: string;
  cached?: boolean;
}

interface TravelPackHistory {
  id: string;
  html_url: string;
  pdf_url: string;
  generated_at: string;
  destinations?: string;
}

export function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [verificationData, setVerificationData] = useState<VerifySessionResponse | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [briefData, setBriefData] = useState<GenerateBriefResponse | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided in URL');
      setLoading(false);
      return;
    }

    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      // Get pending_session_id from localStorage (saved during checkout)
      const pendingSessionId = 'f2668173-0fc5-47ae-9593-12a707f79cc4';

      if (!pendingSessionId) {
        setError('No pending session found. Please try creating a new travel pack.');
        setLoading(false);
        return;
      }

      // Verify payment with Stripe
      const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-session-and-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          pending_session_id: pendingSessionId
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Failed to verify payment');
      }

      const verifyData: VerifySessionResponse = await verifyResponse.json();
      setVerificationData(verifyData);

      if (verifyData.has_paid) {
        // Payment successful, generate travel brief
        await generateTravelBrief(pendingSessionId);
      } else {
        setError(`Payment verification failed: ${verifyData.reason}`);
      }

      setLoading(false);
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
      setLoading(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const generateTravelBrief = async (pendingSessionId: string) => {
    // Prevent multiple simultaneous brief generation calls
    if (generatingBrief || briefData) {
      console.log('Already generating brief or brief exists, skipping duplicate call');
      return;
    }


    setGeneratingBrief(true);

    try {
      console.log('🚀 Calling OpenAI Function for travel planning...');

      // Get trip data from localStorage (saved during planning)
      // Try multiple possible storage keys
      let tripDataStr = localStorage.getItem('travel-pack-trip-data') ||
                       localStorage.getItem('tripData') ||
                       localStorage.getItem('travelData');

      console.log('🔍 Checking localStorage keys:');
      console.log('- travel-pack-trip-data:', localStorage.getItem('travel-pack-trip-data'));
      console.log('- tripData:', localStorage.getItem('tripData'));
      console.log('- travelData:', localStorage.getItem('travelData'));

      const tripData = tripDataStr ? JSON.parse(tripDataStr) : {};

      console.log('📦 Trip data:', tripData);

      // Convert trip data to the format expected by our OpenAI function
      const openAITripData = {
        persona: tripData.persona || 'Experienced',
        passportCountry: tripData.passportCountry || { code: 'US', label: 'United States' },
        activityPreferences: tripData.activityPreferences || ['cultural', 'food', 'nature'],
        startDate: tripData.startDate || new Date().toISOString().split('T')[0],
        endDate: tripData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        destinations: tripData.destinations || [{ name: 'Tokyo', daysAllocated: 7 }],
        groupSize: tripData.groupSize || 1,
        ages: tripData.ages || '25-35',
        budget: tripData.budget || 'Mid-range',
        bookingData: tripData.parsedBookingData || []
      };

      // Validate that we have meaningful data
      if (!tripData.persona && !tripData.destinations?.length && !tripData.startDate) {
        console.warn('⚠️ No trip data found in localStorage, using fallback data');

        // Try to get data from pending session in database as backup
        try {
          const sessionResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-pending-session-data`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pending_session_id: pendingSessionId
            }),
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('📊 Retrieved data from pending session:', sessionData);

            // Use session data to populate trip data
            if (sessionData.persona) {
              openAITripData.persona = sessionData.persona;
            }
            if (sessionData.destinations) {
              openAITripData.destinations = sessionData.destinations;
            }
            if (sessionData.start_date) {
              openAITripData.startDate = sessionData.start_date;
            }
            if (sessionData.end_date) {
              openAITripData.endDate = sessionData.end_date;
            }
            if (sessionData.activity_preferences) {
              openAITripData.activityPreferences = sessionData.activity_preferences;
            }
            if (sessionData.group_size) {
              openAITripData.groupSize = sessionData.group_size;
            }
            if (sessionData.budget) {
              openAITripData.budget = sessionData.budget;
            }
          }
        } catch (err) {
          console.warn('Failed to retrieve session data:', err);
        }
      }

      console.log('🎯 OpenAI Trip data payload:', openAITripData);

      // Save the processed trip data to localStorage for debugging
      localStorage.setItem('debug-openai-payload', JSON.stringify(openAITripData, null, 2));

        // Call our new OpenAI function
        const generateResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/openai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tripData: openAITripData,
            promptType: 'travel_brief'
          }),
        }
      );

      console.log('📥 OpenAI Function Status:', generateResponse.status);

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        console.error('❌ OpenAI Function Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate travel brief');
      }

      const responseData = await generateResponse.json();

      console.log('✅ OpenAI travel brief generated!');
      console.log('🤖 OpenAI Response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.error || 'OpenAI failed to generate travel brief');
      }

      const openAIResponse = responseData.response;
      const generatedPrompt = responseData.prompt;

      // Parse the JSON response if it's structured travel brief
      let travelBriefData = null;
      let processedResponse = openAIResponse;

      try {
        // Try to parse as JSON first (structured travel brief)
        const parsedResponse = JSON.parse(openAIResponse);
        if (parsedResponse.cover_html && parsedResponse.intro_html) {
          travelBriefData = parsedResponse;
          processedResponse = createStructuredTravelBrief(parsedResponse);
        }
      } catch (error) {
        // If not JSON, use the enhanced text formatting
        processedResponse = enhanceAIResponse(openAIResponse);
      }

      // Create beautiful, modern HTML formatted response for display and PDF
      const formattedHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Travel Pack AI - ${openAITripData.destinations.map((d: any) => d.name).join(', ')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.7;
              color: #1f2937;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              margin: 0;
              padding: 0;
            }

            .container {
              max-width: 900px;
              margin: 0 auto;
              padding: 0;
              background: white;
              min-height: 100vh;
              box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
              border-radius: 0;
              overflow: hidden;
            }

            .header {
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
              color: white;
              padding: 80px 40px;
              margin-bottom: 0;
              text-align: center;
              position: relative;
              overflow: hidden;
              min-height: 400px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
              opacity: 0.4;
            }

            .header-content {
              position: relative;
              z-index: 1;
              max-width: 800px;
              margin: 0 auto;
            }

            .header-logo {
              display: inline-block;
              margin-bottom: 20px;
              font-size: 48px;
              text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
            }

            .header h1 {
              font-size: 48px;
              font-weight: 900;
              margin-bottom: 20px;
              letter-spacing: -0.02em;
              text-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 20px;
              line-height: 1.1;
            }

            .header .subtitle {
              font-size: 24px;
              opacity: 0.95;
              font-weight: 600;
              margin-bottom: 16px;
              text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
              color: #f8fafc;
              letter-spacing: 0.5px;
            }

            .header .generated-date {
              font-size: 16px;
              opacity: 0.85;
              font-weight: 500;
              color: #e2e8f0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              letter-spacing: 0.3px;
            }

            .trip-summary {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: none;
              border-radius: 0;
              padding: 40px;
              margin-bottom: 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .trip-summary h3 {
              color: #1f2937;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 24px;
              display: flex;
              align-items: center;
              gap: 12px;
              text-align: center;
              justify-content: center;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              gap: 20px;
              max-width: 800px;
              margin: 0 auto;
            }

            .summary-item {
              background: white;
              padding: 24px;
              border-radius: 16px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }

            .summary-item::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            }

            .summary-label {
              font-size: 13px;
              color: #6b7280;
              font-weight: 600;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .summary-value {
              font-size: 18px;
              color: #1f2937;
              font-weight: 700;
              line-height: 1.3;
            }

            .content-section {
              background: white;
              border-radius: 0;
              padding: 0;
              margin-bottom: 0;
              box-shadow: none;
              border: none;
              border-bottom: 1px solid #f3f4f6;
            }

            .content-section h2 {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              color: #1f2937;
              font-size: 20px;
              font-weight: 800;
              margin: 0;
              padding: 30px 40px;
              border-bottom: 3px solid #667eea;
              display: flex;
              align-items: center;
              gap: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .content-text {
              font-size: 16px;
              line-height: 1.8;
              color: #374151;
              white-space: pre-wrap;
            }

            /* Enhanced formatting for AI response */
            .content-text {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            /* Style headings in the AI response */
            .content-text h1, .content-text h2, .content-text h3, .content-text h4, .content-text h5, .content-text h6 {
              color: #1f2937 !important;
              font-weight: 600 !important;
              margin: 20px 0 12px 0 !important;
              line-height: 1.3 !important;
            }

            .content-text h1 {
              font-size: 24px !important;
              border-bottom: 3px solid #667eea !important;
              padding-bottom: 8px !important;
              text-align: center !important;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
              -webkit-background-clip: text !important;
              -webkit-text-fill-color: transparent !important;
              background-clip: text !important;
            }

            .content-text h2 {
              font-size: 20px !important;
              color: #374151 !important;
              border-left: 4px solid #667eea !important;
              padding-left: 16px !important;
              background: #f8fafc !important;
              padding: 12px 16px !important;
              border-radius: 8px !important;
              margin: 24px 0 16px 0 !important;
            }

            .content-text h3 {
              font-size: 18px !important;
              color: #1f2937 !important;
              margin: 20px 0 10px 0 !important;
              font-weight: 600 !important;
            }

            .content-text h4 {
              font-size: 16px !important;
              color: #374151 !important;
              margin: 16px 0 8px 0 !important;
              font-weight: 600 !important;
            }

            /* Style paragraphs */
            .content-text p {
              margin: 12px 0 !important;
              text-align: justify !important;
              line-height: 1.7 !important;
            }

            /* Style lists */
            .content-text ul, .content-text ol {
              margin: 16px 0 !important;
              padding-left: 24px !important;
            }

            .content-text li {
              margin: 8px 0 !important;
              line-height: 1.6 !important;
            }

            /* Style bold text */
            .content-text strong, .content-text b {
              color: #1f2937 !important;
              font-weight: 600 !important;
            }

            /* Style italic text */
            .content-text em, .content-text i {
              color: #6b7280 !important;
              font-style: italic !important;
            }

            /* Style special sections */
            .content-text blockquote {
              border-left: 4px solid #10b981 !important;
              background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%) !important;
              padding: 20px 24px !important;
              margin: 20px 0 !important;
              border-radius: 0 12px 12px 0 !important;
              font-style: italic !important;
              color: #065f46 !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
            }

            /* Style code blocks */
            .content-text code {
              background: #f3f4f6 !important;
              padding: 4px 8px !important;
              border-radius: 6px !important;
              font-family: 'Courier New', 'Monaco', monospace !important;
              font-size: 14px !important;
              color: #dc2626 !important;
              border: 1px solid #e5e7eb !important;
            }

            .content-text pre {
              background: #1f2937 !important;
              color: #f9fafb !important;
              padding: 20px !important;
              border-radius: 12px !important;
              overflow-x: auto !important;
              margin: 20px 0 !important;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }

            .content-text pre code {
              background: transparent !important;
              color: #f9fafb !important;
              border: none !important;
              padding: 0 !important;
            }

            /* Style tables */
            .content-text table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 20px 0 !important;
              background: white !important;
              border-radius: 12px !important;
              overflow: hidden !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }

            .content-text th, .content-text td {
              padding: 12px 16px !important;
              text-align: left !important;
              border-bottom: 1px solid #e5e7eb !important;
            }

            .content-text th {
              background: #f8fafc !important;
              font-weight: 600 !important;
              color: #374151 !important;
            }

            .content-text tr:hover {
              background: #f9fafb !important;
            }

            /* Style links */
            .content-text a {
              color: #667eea !important;
              text-decoration: none !important;
              font-weight: 500 !important;
              border-bottom: 1px solid transparent !important;
              transition: all 0.2s ease !important;
            }

            .content-text a:hover {
              border-bottom-color: #667eea !important;
            }

            /* Style horizontal rules */
            .content-text hr {
              border: none !important;
              height: 2px !important;
              background: linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%) !important;
              margin: 30px 0 !important;
            }

            /* Special formatting for travel-specific content */
            .content-text .destination-highlight {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
              padding: 16px 20px !important;
              border-radius: 12px !important;
              border-left: 4px solid #f59e0b !important;
              margin: 16px 0 !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
            }

            .content-text .activity-box {
              background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
              padding: 16px 20px !important;
              border-radius: 12px !important;
              border-left: 4px solid #6366f1 !important;
              margin: 16px 0 !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
            }

            .content-text .budget-info {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
              padding: 16px 20px !important;
              border-radius: 12px !important;
              border-left: 4px solid #10b981 !important;
              margin: 16px 0 !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
            }

            /* Structured Travel Brief Styles */
            .theme-banner {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
              color: white !important;
              padding: 30px !important;
              border-radius: 16px !important;
              text-align: center !important;
              margin-bottom: 30px !important;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
            }

            .theme-title {
              font-size: 28px !important;
              font-weight: 700 !important;
              margin: 0 !important;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
            }

            .travel-section {
              background: white !important;
              border-radius: 0 !important;
              margin-bottom: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-bottom: 1px solid #f3f4f6 !important;
              overflow: hidden !important;
            }

            .section-title {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
              color: #1f2937 !important;
              font-size: 20px !important;
              font-weight: 800 !important;
              margin: 0 !important;
              padding: 30px 40px !important;
              border-bottom: 3px solid #667eea !important;
              display: flex !important;
              align-items: center !important;
              gap: 16px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
            }

            .section-content {
              padding: 40px !important;
              line-height: 1.7 !important;
              color: #374151 !important;
            }

            .day-section {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 16px !important;
              padding: 28px !important;
              margin-bottom: 20px !important;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
              position: relative !important;
              overflow: hidden !important;
            }

            .day-section::before {
              content: '' !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              height: 4px !important;
              background: linear-gradient(90deg, #10b981 0%, #059669 100%) !important;
            }

            .day-section:last-child {
              margin-bottom: 0 !important;
            }

            /* Enhanced styling for structured content */
            .travel-section h3 {
              color: #1f2937 !important;
              font-size: 18px !important;
              font-weight: 600 !important;
              margin: 16px 0 12px 0 !important;
              border-left: 4px solid #667eea !important;
              padding-left: 12px !important;
            }

            .travel-section h4 {
              color: #374151 !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              margin: 12px 0 8px 0 !important;
            }

            .travel-section p {
              margin: 12px 0 !important;
              line-height: 1.7 !important;
            }

            .travel-section ul, .travel-section ol {
              margin: 12px 0 !important;
              padding-left: 24px !important;
            }

            .travel-section li {
              margin: 6px 0 !important;
              line-height: 1.6 !important;
            }

            .travel-section strong {
              color: #1f2937 !important;
              font-weight: 600 !important;
            }

            .travel-section em {
              color: #6b7280 !important;
              font-style: italic !important;
            }

            .travel-section table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 16px 0 !important;
              background: white !important;
              border-radius: 8px !important;
              overflow: hidden !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            }

            .travel-section th, .travel-section td {
              padding: 12px 16px !important;
              text-align: left !important;
              border-bottom: 1px solid #e5e7eb !important;
            }

            .travel-section th {
              background: #f8fafc !important;
              font-weight: 600 !important;
              color: #374151 !important;
            }

            .travel-section tr:hover {
              background: #f9fafb !important;
            }


            .footer {
              background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
              color: white;
              padding: 60px 40px;
              text-align: center;
              margin-top: 0;
              position: relative;
              overflow: hidden;
            }

            .footer::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
              opacity: 0.3;
            }

            .footer-content {
              position: relative;
              z-index: 1;
            }

            .footer h3 {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 16px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .footer p {
              opacity: 0.9;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 24px;
            }

            .footer .brand {
              font-size: 14px;
              opacity: 0.7;
              font-weight: 500;
            }

            .timestamp {
              background: rgba(255, 255, 255, 0.05);
              color: rgba(255, 255, 255, 0.8);
              font-size: 12px;
              padding: 16px;
              text-align: center;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            @media print {
              body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              .container {
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                background: white !important;
              }

              .header {
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%) !important;
                color: white !important;
                padding: 60px 20px !important;
                margin: 0 !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                min-height: 300px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }

              .header h1 {
                font-size: 36px !important;
                font-weight: 900 !important;
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
                color: white !important;
              }

              .header .subtitle {
                font-size: 20px !important;
                font-weight: 600 !important;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
              }

              .header .generated-date {
                font-size: 14px !important;
                font-weight: 500 !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
              }

              .trip-summary {
                background: #f8fafc !important;
                padding: 30px 20px !important;
                margin: 0 !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              .content-section, .travel-section {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin: 0 !important;
                padding: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
              }

              .section-title, .content-section h2 {
                background: #f8fafc !important;
                color: #1f2937 !important;
                padding: 20px !important;
                margin: 0 !important;
                break-after: avoid !important;
                page-break-after: avoid !important;
              }

              .section-content {
                padding: 20px !important;
              }

              .day-section {
                background: #f8fafc !important;
                padding: 20px !important;
                margin-bottom: 15px !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              .footer {
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
                color: white !important;
                padding: 40px 20px !important;
                margin: 0 !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              .summary-grid {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 15px !important;
              }

              .summary-item {
                padding: 15px !important;
                margin-bottom: 10px !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              /* Ensure proper spacing for print */
              h1, h2, h3, h4, h5, h6 {
                break-after: avoid !important;
                page-break-after: avoid !important;
              }

              p, li, blockquote {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              /* Hide decorative elements that don't print well */
              .header::before, .footer::before {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-content">
                <div class="header-logo">✈️</div>
                <h1>Travel Pack AI</h1>
                <p class="subtitle">Your Personalized Travel Brief</p>
                <p class="generated-date">Generated on ${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <!-- Trip Summary -->
            <div class="trip-summary">
              <h3>📋 Trip Overview</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-label">Traveler Type</div>
                  <div class="summary-value">${openAITripData.persona}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Passport Country</div>
                  <div class="summary-value">${openAITripData.passportCountry?.label || 'Not specified'}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Travel Dates</div>
                  <div class="summary-value">${new Date(openAITripData.startDate).toLocaleDateString()} - ${new Date(openAITripData.endDate).toLocaleDateString()}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Destinations</div>
                  <div class="summary-value">${openAITripData.destinations.map((d: any) => d.name).join(', ')}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Group Size</div>
                  <div class="summary-value">${openAITripData.groupSize} ${openAITripData.ages ? `(${openAITripData.ages})` : ''}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Budget Level</div>
                  <div class="summary-value">${openAITripData.budget}</div>
                </div>
              </div>
            </div>

            <!-- AI Travel Recommendations -->
            <div class="content-section">
              <h2>🎯 AI Travel Recommendations</h2>
              <div class="content-text">${processedResponse}</div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <h3>💡 Generated by TravelPack.ai AI Assistant</h3>
                <p>This travel brief was created using advanced AI technology based on your specific preferences and requirements.</p>
                <p class="brand">TravelPack.ai - Premium Travel Planning</p>
              </div>
            </div>

            <!-- Timestamp -->
            <div class="timestamp">
              Generated on ${new Date().toLocaleString()} | TravelPack.ai | support@travelpack.ai
            </div>
          </div>
        </body>
        </html>
      `;

      // Create response with the data
      const briefData: GenerateBriefResponse = {
        html_url: '#',
        pdf_url: '#',
        generated_at: new Date().toISOString(),
        cached: false
      };

      // Save both the raw response and formatted HTML to localStorage for display
      localStorage.setItem('latest_itinerary_json', JSON.stringify({
        openai_response: openAIResponse,
        generated_prompt: generatedPrompt,
        trip_data: openAITripData,
        travel_brief_data: travelBriefData,
        generated_at: briefData.generated_at
      }, null, 2));
      localStorage.setItem('latest_itinerary', formattedHTML);

      setBriefData(briefData);

      // Save to user's history in localStorage
      saveTravelPackToHistory({
        id: pendingSessionId,
        html_url: briefData.html_url,
        pdf_url: briefData.pdf_url,
        generated_at: briefData.generated_at,
        destinations: getDestinationsFromStorage()
      });

      // Clean up pending session from localStorage
      localStorage.removeItem('pending_session_id');

    } catch (err) {
      // Don't show error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Brief generation request was aborted');
        return;
      }
      console.error('❌ OpenAI brief generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate travel brief');
    } finally {
      setGeneratingBrief(false);
    }
  };

  const saveTravelPackToHistory = (travelPack: TravelPackHistory) => {
    try {
      const existingHistory = localStorage.getItem('travel_pack_history');
      const history: TravelPackHistory[] = existingHistory ? JSON.parse(existingHistory) : [];

      // Add new pack to beginning of array
      history.unshift(travelPack);

      // Keep only last 10 packs
      const trimmedHistory = history.slice(0, 10);

      localStorage.setItem('travel_pack_history', JSON.stringify(trimmedHistory));
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  const getDestinationsFromStorage = (): string => {
    try {
      const tripData = localStorage.getItem('travel-pack-trip-data');
      if (tripData) {
        const parsed = JSON.parse(tripData);
        if (parsed.destinations && Array.isArray(parsed.destinations)) {
          return parsed.destinations.map((d: any) => d.cityName).join(', ');
        }
      }
    } catch (err) {
      console.error('Failed to get destinations from storage:', err);
    }
    return '';
  };


  if (loading && !briefData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isVerifying ? 'Verifying your payment...' : 'Processing your request...'}
            </h1>
            <p className="text-gray-600">
              This usually takes 30-60 seconds. Please wait while we prepare your personalized travel plan.
            </p>
          </div>

          {/* Affiliate Links Section */}
          <div className="max-w-2xl mx-auto">
            <AffiliateLinks />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              to="/plan"
              className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </Link>
            <a
              href="mailto:support@travelpack.ai"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your travel pack is ready!
            </p>
          </div>

          {verificationData?.session_data?.customer_email && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                A confirmation has been sent to <strong>{verificationData.session_data.customer_email}</strong>
              </p>
            </div>
          )}

          {generatingBrief && !briefData ? (
            <div className="py-8">
              <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Generating Your AI Travel Brief...
              </h2>
              <p className="text-gray-600 mb-6">
                Our advanced AI is analyzing your preferences and crafting your personalized travel recommendations. This usually takes 30-60 seconds.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto mb-8">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>

              {/* Affiliate Links during brief generation */}
              <div className="max-w-lg mx-auto">
                <AffiliateLinks />
              </div>
            </div>
          ) : briefData ? (
            <div className="py-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">
                Your AI Travel Brief is Ready! 🤖✈️
              </h2>

              {/* Beautiful Header Preview */}
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 mb-6 overflow-hidden">
                <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
                  {/* Blue gradient background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)'
                    }}
                  ></div>

                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`
                    }}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-center h-full px-8 py-16">
                    <div className="text-center max-w-2xl">
                      {/* Airplane logo */}
                      <div className="mb-6">
                        <span className="text-6xl filter drop-shadow-lg">✈️</span>
                      </div>

                      {/* Main title */}
                      <h1
                        className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg"
                        style={{
                          textShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        Travel Pack AI
                      </h1>

                      {/* Subtitle */}
                      <p
                        className="text-xl md:text-2xl font-semibold text-white mb-4 drop-shadow-md"
                        style={{
                          textShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
                          color: '#f8fafc'
                        }}
                      >
                        Your Personalized Travel Brief
                      </p>

                      {/* Generation date */}
                      <p
                        className="text-base md:text-lg font-medium"
                        style={{
                          color: '#e2e8f0',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        Generated on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={async () => {
                      try {
                        trackDownloadComplete('pdf');
                      const itinerary = localStorage.getItem('latest_itinerary') || '';
                        const enhancedHTML = enhanceHTMLForPDF(itinerary);

                        // Generate PDF using print functionality
                        await generatePDFWithPrint(enhancedHTML, 'travel-pack-ai-brief.pdf');

                      } catch (error) {
                        console.error('PDF generation failed:', error);
                        // Fallback to text download
                        try {
                          const itinerary = localStorage.getItem('latest_itinerary') || '';
                          downloadAsText(itinerary, 'travel-pack-ai-brief.txt');
                        } catch (fallbackError) {
                          console.error('Fallback download failed:', fallbackError);
                        }
                      }
                    }}
                   className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Download className="h-5 w-5" />
                    Download as PDF
                  </button>

                  <button
                    onClick={() => {
                      try {
                        trackDownloadComplete('text');
                        const itinerary = localStorage.getItem('latest_itinerary') || '';
                        downloadAsText(itinerary, 'travel-pack-ai-brief.txt');
                      } catch (error) {
                        console.error('Text download failed:', error);
                      }
                    }}
                   className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <FileText className="h-5 w-5" />
                    Download as Text
                  </button>

                  <a
                    href={briefData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                   className="bg-blue-400 hover:bg-blue-500 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    View Online
                  </a>
                </div>

                <div className="text-sm text-gray-600">
                  <p>We've also emailed you the links for future access.</p>
                  <p className="mt-2">
                    Having trouble? <a href="mailto:support@travelpack.ai" className="text-blue-600 hover:text-blue-800">Contact support</a>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-gray-600 mb-4">
                Your travel pack will be ready shortly. Please wait while we generate your personalized content.
              </p>
              <button
                onClick={verifyPayment}
                disabled={isVerifying || generatingBrief || !!briefData}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isVerifying ? 'Checking...' : (briefData ? 'Already Generated' : 'Check Status')}
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Plan:</strong> {verificationData?.session_data?.mode === 'subscription' ? 'Yearly Unlimited' : 'One-Time Pack'}
              </div>
              <div>
                <strong>Status:</strong> {verificationData?.has_paid ? 'Paid' : 'Processing'}
              </div>
              <div>
                <strong>Email:</strong> {verificationData?.session_data?.customer_email || 'N/A'}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
