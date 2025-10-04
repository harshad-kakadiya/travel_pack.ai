import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface PDFRequest {
  html?: string;
  travelBriefData?: any; // TravelBriefData from the template generator
  format?: 'A4' | 'Letter';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

interface PDFResponse {
  success: boolean;
  pdf_url?: string;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { html, travelBriefData, format = 'A4', margin }: PDFRequest = await req.json();

    if (!html && !travelBriefData) {
      return new Response(
        JSON.stringify({ error: "HTML content or travel brief data is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let finalHtml = html;
    
    // If travel brief data is provided, generate HTML from template
    if (travelBriefData && !html) {
      finalHtml = await generateHTMLFromTravelBriefData(travelBriefData);
    }

    // For now, we'll return the HTML content with instructions for client-side PDF generation
    // In a production environment, you would use a service like Puppeteer, Playwright, or a cloud PDF service
    
    const pdfUrl = await generatePDFFromHTML(finalHtml, format, margin);

    const response: PDFResponse = {
      success: true,
      pdf_url: pdfUrl
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('PDF Generation Error:', error);
    
    const response: PDFResponse = {
      success: false,
      error: error.message || 'Failed to generate PDF'
    };

    return new Response(
      JSON.stringify(response),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateHTMLFromTravelBriefData(travelBriefData: any): Promise<string> {
  // This is a simplified version of the template generator for Deno
  // In production, you would import the full template generator
  
  const persona = travelBriefData.persona || 'new-traveler';
  const icon = getPersonaIcon(persona);
  const title = getPersonaTitle(persona);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} – ${travelBriefData.destination} ${travelBriefData.duration}</title>
    ${getTravelBriefStyles(persona)}
</head>
<body>
    <div class="header-section">
        <div class="header-title">
            <div class="suitcase-icon">🧳</div>
            <h1>${title} – ${travelBriefData.destination} ${travelBriefData.duration}</h1>
        </div>
        <div class="header-underline"></div>
    </div>
    
    <div class="persona-info">
        <p><strong>Persona:</strong> ${formatPersonaName(persona)}</p>
        <p><strong>Destination:</strong> ${travelBriefData.destination}</p>
        <p><strong>Duration:</strong> ${travelBriefData.duration}</p>
    </div>

    ${travelBriefData.destinationIntroduction ? `
    <h2>
        <div class="blue-line"></div>
        <div class="section-icon">🌍</div>
        Destination Introduction
    </h2>
    <div class="destination-intro">
        <p>${travelBriefData.destinationIntroduction}</p>
    </div>` : ''}
    
    <div class="table-of-contents">
        <h2>
            <div class="section-icon">📋</div>
            Table of Contents
        </h2>
        <ul>
            <li>Day-by-Day Itinerary</li>
            <li>Safety Tips for First-Time Travelers</li>
            <li>Essential Packing List</li>
            <li>Basic Japanese Phrases</li>
            <li>Emergency ICE Card</li>
            <li>Recommended Travel Gear</li>
        </ul>
    </div>
    
    ${generateBookingDetails(travelBriefData.bookingDetails)}
    
    ${generateItinerary(travelBriefData.itinerary, persona)}
    
    ${generateSafetyTips(travelBriefData.safetyTips, persona)}
    
    ${generatePackingList(travelBriefData.packingList, persona)}
    
    ${generatePhrases(travelBriefData.phrases, persona)}
    
    ${generateEmergencyContacts(travelBriefData.emergencyContacts, persona)}
    
    ${generateGearRecommendations(travelBriefData.gearRecommendations, persona)}
</body>
</html>`;
}

// Helper functions for template generation
function getPersonaIcon(persona: string): string {
  const icons: { [key: string]: string } = {
    family: '👨‍👩‍👧',
    adventure: '⛰️',
    'solo-female': '👩',
    'new-traveler': '🆕',
    experienced: '🌍'
  };
  return icons[persona] || '🌍';
}

function getPersonaTitle(persona: string): string {
  const titles: { [key: string]: string } = {
    family: 'Family Pack',
    adventure: 'Adventure Pack',
    'solo-female': 'Solo Female Pack',
    'new-traveler': 'New Traveler Pack',
    experienced: 'Experienced Traveler Pack'
  };
  return titles[persona] || 'Travel Pack';
}

function formatPersonaName(persona: string): string {
  const names: { [key: string]: string } = {
    family: 'Family Traveler',
    adventure: 'Adventure Traveler',
    'solo-female': 'Solo Female Traveler',
    'new-traveler': 'New Traveler',
    experienced: 'Experienced Traveler'
  };
  return names[persona] || 'Traveler';
}

function getTravelBriefStyles(persona: string): string {
  return `
    <style>
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #1f2937;
        max-width: 800px;
        margin: 0 auto;
        padding: 30px 20px;
        background: #fff;
      }
      
      .header-section {
        margin-bottom: 35px;
        border-bottom: 4px solid #2563eb;
        padding-bottom: 20px;
      }
      
      .header-title {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .suitcase-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        margin-right: 15px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
      }
      
      h1 { 
        color: #1e40af; 
        font-size: 32px;
        font-weight: 800;
        margin: 0;
        padding: 0;
        letter-spacing: -0.5px;
      }
      
      .header-underline {
        height: 4px;
        background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
        width: 100%;
        margin-top: 15px;
        border-radius: 2px;
      }
      
      .persona-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 35px;
        background: #f8fafc;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #e2e8f0;
      }
      
      .persona-info p {
        margin: 0;
        font-size: 16px;
        line-height: 1.5;
        color: #334155;
      }
      
      .persona-info strong {
        color: #1e40af;
        font-weight: 700;
        display: inline-block;
        min-width: 110px;
      }
      
      h2 { 
        color: #ffffff; 
        margin-top: 40px; 
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15);
        letter-spacing: -0.3px;
      }
      
      .section-icon {
        width: 32px;
        height: 32px;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        padding: 4px;
      }
      
      .blue-line {
        width: 5px;
        height: 28px;
        background: #ffffff;
        margin-right: 12px;
        border-radius: 3px;
        opacity: 0.9;
      }
      
      h3 { 
        color: #1e40af; 
        margin-top: 25px; 
        margin-bottom: 12px;
        font-size: 19px;
        font-weight: 700;
      }
      
      .destination-intro {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 25px;
        border-radius: 12px;
        border: 3px solid #f59e0b;
        margin: 20px 0;
        box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
      }
      
      .destination-intro p {
        margin-bottom: 15px;
        font-size: 16px;
        line-height: 1.7;
        color: #1f2937;
      }
      
      .destination-intro p:last-child {
        margin-bottom: 0;
      }
      
      .table-of-contents {
        margin: 30px 0;
        background: #f8fafc;
        padding: 25px;
        border-radius: 12px;
        border: 2px solid #cbd5e1;
      }
      
      .table-of-contents h2 {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        margin-top: 0;
      }
      
      .table-of-contents ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .table-of-contents li {
        margin-bottom: 10px;
        font-size: 16px;
        padding-left: 28px;
        position: relative;
        color: #334155;
        line-height: 1.5;
      }
      
      .table-of-contents li:before {
        content: "•";
        position: absolute;
        left: 8px;
        color: #2563eb;
        font-size: 20px;
        font-weight: bold;
      }
      
      .booking-section {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 25px;
        border-radius: 12px;
        border: 3px solid #f59e0b;
        margin: 20px 0;
        box-shadow: 0 4px 6px rgba(245, 158, 11, 0.15);
      }
      
      .booking-section p {
        margin-bottom: 18px;
        font-size: 16px;
        font-weight: 700;
        color: #92400e;
      }
      
      .booking-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 18px;
        margin: 20px 0;
      }
      
      .booking-card {
        background: #ffffff;
        padding: 22px;
        border-radius: 12px;
        border: 2px solid #e0e7ff;
        box-shadow: 0 2px 4px rgba(37, 99, 235, 0.08);
        transition: transform 0.2s;
      }
      
      .booking-card h4 {
        margin-bottom: 16px;
        margin-top: 0;
        color: #1e40af;
        font-size: 17px;
        font-weight: 700;
        display: flex;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 2px solid #dbeafe;
      }
      
      .booking-card .card-icon {
        margin-right: 10px;
        font-size: 18px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        padding: 6px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      
      .booking-card p {
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 1.6;
        color: #475569;
      }
      
      .booking-card strong {
        font-weight: 700;
        color: #1e293b;
      }
      
      .disclaimer {
        font-style: italic;
        color: #64748b;
        font-size: 13px;
        margin-top: 18px;
        padding-top: 12px;
        border-top: 1px solid #e2e8f0;
      }
      
      .sample-day {
        margin: 35px 0;
      }
      
      .sample-day h2 {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
      }
      
      .activity {
        margin-bottom: 30px;
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        border-left: 4px solid #2563eb;
      }
      
      .activity h3 {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        margin-top: 0;
      }
      
      .activity-icon {
        margin-right: 10px;
        font-size: 18px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        padding: 6px 8px;
        border-radius: 6px;
      }
      
      .activity p {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.7;
        color: #334155;
      }
      
      .activity strong {
        font-weight: 700;
        color: #1e40af;
      }
      
      .new-traveler-tip {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        padding: 18px;
        border-radius: 10px;
        border: 3px solid #10b981;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
      }
      
      .new-traveler-tip strong {
        color: #047857;
        font-weight: 700;
        font-size: 15px;
      }
      
      .alternatives {
        margin-top: 18px;
        background: #f1f5f9;
        padding: 15px;
        border-radius: 8px;
        border-left: 3px solid #64748b;
      }
      
      .alternatives p {
        font-weight: 700;
        color: #1e40af;
        margin-bottom: 12px;
        margin-top: 0;
        font-size: 15px;
      }
      
      .alternatives ul {
        margin: 0;
        padding-left: 20px;
      }
      
      .alternatives li {
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 1.6;
        color: #475569;
      }
      
      .alternatives strong {
        font-weight: 700;
        color: #1e293b;
      }
      
      .safety-tips {
        margin: 35px 0;
      }
      
      .safety-tips h2 {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
      }
      
      .safety-tips ul {
        margin: 0;
        padding-left: 20px;
        background: #f8fafc;
        padding: 20px 20px 20px 40px;
        border-radius: 10px;
        border: 2px solid #cbd5e1;
      }
      
      .safety-tips li {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.7;
        color: #334155;
      }
      
      .packing-list {
        margin: 35px 0;
      }
      
      .packing-list h2 {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
      }
      
      .packing-list ul {
        margin: 0;
        padding-left: 20px;
        background: #f8fafc;
        padding: 20px 20px 20px 40px;
        border-radius: 10px;
        border: 2px solid #cbd5e1;
      }
      
      .packing-list li {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.7;
        color: #334155;
      }
      
      .phrases-section {
        margin: 35px 0;
      }
      
      .phrases-section h2 {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
      }
      
      .phrases-section ul {
        margin: 0;
        padding-left: 20px;
        background: #f8fafc;
        padding: 20px 20px 20px 40px;
        border-radius: 10px;
        border: 2px solid #cbd5e1;
      }
      
      .phrases-section li {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.7;
        color: #334155;
      }
      
      .phrases-section strong {
        font-weight: 700;
        color: #1e40af;
      }
      
      .gear-recommendations {
        margin: 35px 0;
      }
      
      .gear-recommendations h2 {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
      }
      
      .gear-recommendations ul {
        margin: 0;
        padding-left: 20px;
        background: #f8fafc;
        padding: 20px 20px 20px 40px;
        border-radius: 10px;
        border: 2px solid #cbd5e1;
      }
      
      .gear-recommendations li {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.7;
        color: #334155;
      }
      
      .gear-recommendations strong {
        font-weight: 700;
        color: #1e40af;
      }
      
      .cultural-tip {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 20px;
        border-radius: 10px;
        border: 3px solid #f59e0b;
        margin: 20px 0;
        box-shadow: 0 2px 4px rgba(245, 158, 11, 0.15);
      }
      
      .cultural-tip strong {
        color: #92400e;
        font-weight: 700;
        font-size: 15px;
      }
      
      .emergency-contacts {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        padding: 25px;
        border-radius: 12px;
        border: 3px solid #ef4444;
        margin: 20px 0;
        box-shadow: 0 4px 6px rgba(239, 68, 68, 0.15);
      }
      
      .emergency-contacts h2 {
        color: #ffffff;
        margin-bottom: 20px;
        margin-top: 0;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
      }
      
      .emergency-contacts ul {
        margin-bottom: 0;
        padding-left: 20px;
      }
      
      .emergency-contacts li {
        font-size: 15px;
        margin-bottom: 12px;
        line-height: 1.7;
        color: #991b1b;
        font-weight: 500;
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body {
          max-width: none;
          margin: 0;
          padding: 20px;
        }
        
        .booking-cards {
          grid-template-columns: 1fr;
          gap: 18px;
        }
        
        .booking-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        h1, h2, h3 {
          break-after: avoid;
          page-break-after: avoid;
        }
        
        .destination-intro, .new-traveler-tip, .cultural-tip {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .emergency-contacts, .activity, .alternatives {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .booking-section, .table-of-contents {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .safety-tips, .packing-list, .phrases-section, .gear-recommendations {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    </style>
  `;
}

function generateBookingDetails(bookings: any[]): string {
  if (!bookings || bookings.length === 0) {
    return `
    <h2>
        <div class="blue-line"></div>
        <div class="section-icon">🎯</div>
        Your Trip Essentials
    </h2>
    <div class="booking-section">
        <p>Parsed from your uploaded booking confirmations:</p>
        
        <div class="booking-cards">
            <div class="booking-card">
                <h4>
                    <span class="card-icon">✈️</span>
                    Flight Details
                </h4>
                <p><strong>ANA Flight NH102</strong></p>
                <p>Los Angeles (LAX) → Tokyo (NRT)</p>
                <p>Departure: 05 Apr 2025, 11:50</p>
                <p>Arrival: 06 Apr 2025, 15:35</p>
                <p>Terminal 2, Gate 58A</p>
            </div>
            
            <div class="booking-card">
                <h4>
                    <span class="card-icon">🏨</span>
                    Hotel Booking
                </h4>
                <p><strong>Tokyo Station Hotel</strong></p>
                <p>1-9-1 Marunouchi, Chiyoda City</p>
                <p>Check-in: 06 Apr 2025, 15:00</p>
                <p>Check-out: 15 Apr 2025, 11:00</p>
                <p>Confirmation: TKY654321</p>
            </div>
            
            <div class="booking-card">
                <h4>
                    <span class="card-icon">🚂</span>
                    JR Pass
                </h4>
                <p><strong>7-Day JR Pass</strong></p>
                <p>Valid from: 06 Apr 2025</p>
                <p>Valid until: 12 Apr 2025</p>
                <p>Exchange at: JR East Travel Center</p>
            </div>
        </div>
    </div>`;
  }

  const bookingCards = bookings.map(booking => `
    <div class="booking-card">
        <h4>
            <span class="card-icon">${booking.icon}</span>
            ${booking.title}
        </h4>
        ${booking.details.map((detail: string) => `<p>${detail}</p>`).join('')}
        ${booking.confirmation ? `<p><strong>Confirmation:</strong> ${booking.confirmation}</p>` : ''}
    </div>`).join('');

  return `
  <h2>
      <div class="blue-line"></div>
      <div class="section-icon">🎯</div>
      Your Trip Essentials
  </h2>
  <div class="booking-section">
      <p>Parsed from your uploaded booking confirmations:</p>
      
      <div class="booking-cards">
          ${bookingCards}
      </div>
  </div>`;
}

function generateItinerary(itinerary: any[], persona: string): string {
  if (!itinerary || itinerary.length === 0) {
    return `
    <div class="sample-day">
        <h2>
            <div class="blue-line"></div>
            <div class="section-icon">📅</div>
            Sample Day: Day 3 - Tokyo Highlights
        </h2>
        
        <div class="activity">
            <h3>
                <span class="activity-icon">🗼</span>
                Morning: Tokyo Skytree
            </h3>
            <p><strong>Why?</strong> Tokyo's tallest structure offers breathtaking 360-degree views of the sprawling metropolis. Perfect introduction to the scale and beauty of Japan's capital.</p>
            
            <div class="new-traveler-tip">
                <strong>New Traveler Tip:</strong> Buy tickets online to skip lines. Visit on a clear day for Mount Fuji views. English audio guides available.
            </div>
            
            <div class="alternatives">
                <p>Alternatives:</p>
                <ul>
                    <li><strong>Shinjuku Gyoen</strong> - Beautiful gardens, perfect for cherry blossom season</li>
                    <li><strong>Asakusa Temple (Senso-ji)</strong> - Tokyo's oldest temple with traditional atmosphere</li>
                </ul>
            </div>
        </div>
        
        <div class="activity">
            <h3>
                <span class="activity-icon">🍣</span>
                Lunch: Sushi Dai (Tsukiji Outer Market)
            </h3>
            <p><strong>Why?</strong> World-famous sushi breakfast spot where you'll experience the freshest fish and traditional sushi-making. A must-try cultural experience.</p>
            
            <div class="alternatives">
                <p>Alternatives:</p>
                <ul>
                    <li><strong>Kyubey</strong> - High-end sushi experience in Ginza</li>
                    <li><strong>Tempura Kondo</strong> - Michelin-starred tempura, perfect for first-timers</li>
                </ul>
            </div>
        </div>
        
        <div class="activity">
            <h3>
                <span class="activity-icon">🛍️</span>
                Afternoon: Harajuku & Takeshita Street
            </h3>
            <p><strong>Why?</strong> Experience Japan's unique pop-culture and fashion scene. Safe, fun area perfect for first-time visitors to see the quirky side of Tokyo culture.</p>
        </div>
    </div>`;
  }

  const sampleDay = itinerary[0];
  if (!sampleDay) return '';

  const activities = sampleDay.activities.map((activity: any) => `
    <div class="activity">
        <h3>
            <span class="activity-icon">${getActivityIcon(activity.time)}</span>
            ${activity.time}: ${activity.title}
        </h3>
        <p><strong>Why?</strong> ${activity.why}</p>
        
        ${activity.tips ? `<div class="new-traveler-tip">
            <strong>New Traveler Tip:</strong> ${activity.tips}
        </div>` : ''}
        
        ${activity.alternatives && activity.alternatives.length > 0 ? `
        <div class="alternatives">
            <p>Alternatives:</p>
            <ul>
                ${activity.alternatives.map((alt: string) => `<li><strong>${alt}</strong></li>`).join('')}
            </ul>
        </div>` : ''}
    </div>
  `).join('');

  return `
  <div class="sample-day">
      <h2>
          <div class="blue-line"></div>
          <div class="section-icon">📅</div>
          Sample Day: Day ${sampleDay.day} – ${sampleDay.title}
      </h2>
      ${activities}
  </div>`;
}

function getActivityIcon(time: string): string {
  if (time.toLowerCase().includes('morning')) return '🗼';
  if (time.toLowerCase().includes('lunch')) return '🍣';
  if (time.toLowerCase().includes('afternoon')) return '🛍️';
  if (time.toLowerCase().includes('evening')) return '🌆';
  return '📍';
}

function generateSafetyTips(tips: string[], persona: string): string {
  if (!tips || tips.length === 0) {
    return `
    <div class="safety-tips">
        <h2>
            <div class="blue-line"></div>
            <div class="section-icon">🛡️</div>
            Essential Safety Tips
        </h2>
        
        <div class="cultural-tip">
            <strong>Cultural Tip:</strong> Bowing is important in Japan. A slight nod is sufficient for tourists. Remove shoes when entering homes or some restaurants.
        </div>
        
        <ul>
            <li>Japan is extremely safe - violent crime is rare</li>
            <li>Learn basic train etiquette: no talking on phones, give up priority seats</li>
            <li>Always carry cash - many places don't accept cards</li>
            <li>Download offline maps - cell service can be spotty underground</li>
            <li>Respect photography rules at temples and shrines</li>
            <li>Don't eat or drink while walking - it's considered rude</li>
        </ul>
    </div>`;
  }

  const tipItems = tips.map(tip => `<li>${tip}</li>`).join('\n        ');
  const title = getSafetyTipsTitle(persona);

  return `
  <div class="safety-tips">
      <h2>
          <div class="blue-line"></div>
          <div class="section-icon">🛡️</div>
          ${title}
      </h2>
      <ul>
          ${tipItems}
      </ul>
  </div>`;
}

function generatePackingList(items: string[], persona: string): string {
  if (!items || items.length === 0) {
    return `
    <div class="packing-list">
        <h2>
            <div class="blue-line"></div>
            <div class="section-icon">🎒</div>
            New Traveler Packing List
        </h2>
        <ul>
            <li>Comfortable walking shoes (you'll walk 15,000+ steps daily)</li>
            <li>Lightweight layers for variable weather</li>
            <li>Portable WiFi device or international SIM card</li>
            <li>Cash wallet - Japan is still largely cash-based</li>
            <li>Compact umbrella for sudden rain showers</li>
            <li>Hand towel (public restrooms often don't provide them)</li>
            <li>Slippers for traditional accommodations</li>
        </ul>
    </div>`;
  }

  const listItems = items.map(item => `<li>${item}</li>`).join('\n        ');
  const title = getPackingListTitle(persona);

  return `
  <div class="packing-list">
      <h2>
          <div class="blue-line"></div>
          <div class="section-icon">🎒</div>
          ${title}
      </h2>
      <ul>
          ${listItems}
      </ul>
  </div>`;
}

function generatePhrases(phrases: any[], persona: string): string {
  if (!phrases || phrases.length === 0) {
    return `
    <div class="phrases-section">
        <h2>
            <div class="blue-line"></div>
            <div class="section-icon">🗣️</div>
            Essential Japanese Phrases
        </h2>
        <ul>
            <li><strong>Hello:</strong> Konnichiwa (kon-nee-chee-wah)</li>
            <li><strong>Thank you:</strong> Arigatou gozaimasu (ah-ree-gah-toh goh-zai-mas)</li>
            <li><strong>Excuse me:</strong> Sumimasen (soo-mee-mah-sen)</li>
            <li><strong>I don't understand:</strong> Wakarimasen (wah-kah-ree-mah-sen)</li>
            <li><strong>Where is...?:</strong> ...wa doko desu ka? (...wah doh-koh des kah)</li>
            <li><strong>How much?:</strong> Ikura desu ka? (ee-koo-rah des kah)</li>
            <li><strong>Help:</strong> Tasukete (tah-soo-keh-teh)</li>
        </ul>
    </div>`;
  }

  const phraseItems = phrases.map(phrase => 
    `<li><strong>${phrase.english}:</strong> ${phrase.japanese} (${phrase.pronunciation})</li>`
  ).join('\n        ');

  return `
  <div class="phrases-section">
      <h2>
          <div class="blue-line"></div>
          <div class="section-icon">🗣️</div>
          Essential Japanese Phrases
      </h2>
      <ul>
          ${phraseItems}
      </ul>
  </div>`;
}

function generateEmergencyContacts(contacts: any[], persona: string): string {
  if (!contacts || contacts.length === 0) {
    return `
    <div class="emergency-contacts">
        <h2>
            <div class="blue-line"></div>
            <div class="section-icon">🆘</div>
            Emergency ICE Card
        </h2>
        <ul>
            <li>Emergency Services: 110 (Police) / 119 (Fire/Ambulance)</li>
            <li>Tourist Hotline: 050-3816-2787</li>
            <li>US Embassy Tokyo: +81-3-3224-5000</li>
            <li>Your Emergency Contact: ________________</li>
            <li>Travel Insurance: ________________</li>
        </ul>
    </div>`;
  }

  const contactItems = contacts.map(contact => 
    `<li>${contact.name}: ${contact.number}${contact.description ? ` - ${contact.description}` : ''}</li>`
  ).join('\n        ');

  return `
  <div class="emergency-contacts">
      <h2>
          <div class="blue-line"></div>
          <div class="section-icon">🆘</div>
          Emergency ICE Card
      </h2>
      <ul>
          ${contactItems}
      </ul>
  </div>`;
}

function generateGearRecommendations(gear: string[], persona: string): string {
  if (!gear || gear.length === 0) {
    return `
    <div class="gear-recommendations">
        <h2>
            <div class="blue-line"></div>
            <div class="section-icon">🛒</div>
            Recommended Travel Gear
        </h2>
        <ul>
            <li><strong>JR Pass</strong> - Essential for intercity travel, buy before arrival</li>
            <li><strong>IC Card (Suica/Pasmo)</strong> - For local trains and convenience stores</li>
            <li><strong>Pocket WiFi</strong> - Stay connected for maps and translation</li>
            <li><strong>Portable Charger</strong> - Long days of sightseeing</li>
            <li><strong>Translation App</strong> - Google Translate with camera function</li>
        </ul>
    </div>`;
  }

  const gearItems = gear.map(item => `<li><strong>${item}</strong></li>`).join('\n        ');

  return `
  <div class="gear-recommendations">
      <h2>
          <div class="blue-line"></div>
          <div class="section-icon">🛒</div>
          ${getGearTitle(persona)}
      </h2>
      <ul>
          ${gearItems}
      </ul>
  </div>`;
}

function getTipClass(persona: string): string {
  const classes: { [key: string]: string } = {
    family: 'family',
    adventure: 'adventure',
    'solo-female': 'solo-female',
    'new-traveler': 'new-traveler',
    experienced: 'tip'
  };
  return classes[persona] || 'tip';
}

function getTipPrefix(persona: string): string {
  const prefixes: { [key: string]: string } = {
    family: 'Family Safety',
    adventure: 'Extreme Conditions',
    'solo-female': 'Safety Tip',
    'new-traveler': 'Pro Tip',
    experienced: 'Pro Tip'
  };
  return prefixes[persona] || 'Pro Tip';
}

function getSafetyTipsTitle(persona: string): string {
  const titles: { [key: string]: string } = {
    family: 'Family Safety Tips',
    adventure: 'Arctic Adventure Safety',
    'solo-female': 'Safety Tips',
    'new-traveler': 'Travel Safety Tips',
    experienced: 'Advanced Travel Tips'
  };
  return titles[persona] || 'Travel Tips';
}

function getPackingListTitle(persona: string): string {
  const titles: { [key: string]: string } = {
    family: 'Family Packing List',
    adventure: 'Cold Weather Adventure Gear',
    'solo-female': 'Solo Female Packing List',
    'new-traveler': 'New Traveler Packing List',
    experienced: 'Experienced Traveler Packing List'
  };
  return titles[persona] || 'Packing List';
}

function getGearTitle(persona: string): string {
  const titles: { [key: string]: string } = {
    family: 'Family Travel Gear',
    adventure: 'Arctic Adventure Checklist',
    'solo-female': 'Solo Female Travel Gear',
    'new-traveler': 'New Traveler Gear',
    experienced: 'Pro Travel Gear'
  };
  return titles[persona] || 'Travel Gear';
}

async function generatePDFFromHTML(
  html: string, 
  format: string = 'A4', 
  margin?: { top: string; right: string; bottom: string; left: string }
): Promise<string> {
  
  try {
    // Enhanced HTML with better print styles for PDF generation
    const enhancedHtml = html.replace(
      '<style>',
      `<style>
        @page {
          size: ${format};
          margin: ${margin?.top || '1cm'} ${margin?.right || '1cm'} ${margin?.bottom || '1cm'} ${margin?.left || '1cm'};
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: #fff;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .header-section {
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        
        .persona-info {
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        
        .destination-intro {
          page-break-inside: avoid;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          border: 3px solid #f59e0b !important;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1) !important;
        }
        
        .table-of-contents {
          page-break-inside: avoid;
          background: #f8fafc !important;
          border: 2px solid #cbd5e1 !important;
        }
        
        .booking-section {
          page-break-inside: avoid;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          border: 3px solid #f59e0b !important;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.15) !important;
        }
        
        .booking-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        
        .booking-card {
          page-break-inside: avoid;
          background: #ffffff !important;
          border: 2px solid #e0e7ff !important;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.08) !important;
        }
        
        .sample-day {
          page-break-inside: avoid;
        }
        
        .activity {
          page-break-inside: avoid;
          margin-bottom: 30px;
          background: #f8fafc !important;
          border-left: 4px solid #2563eb !important;
        }
        
        .new-traveler-tip {
          page-break-inside: avoid;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
          border: 3px solid #10b981 !important;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1) !important;
        }
        
        .cultural-tip {
          page-break-inside: avoid;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          border: 3px solid #f59e0b !important;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.15) !important;
        }
        
        .alternatives {
          page-break-inside: avoid;
          background: #f1f5f9 !important;
          border-left: 3px solid #64748b !important;
        }
        
        .safety-tips ul, .packing-list ul, .phrases-section ul, .gear-recommendations ul {
          page-break-inside: avoid;
          background: #f8fafc !important;
          border: 2px solid #cbd5e1 !important;
        }
        
        .emergency-contacts {
          page-break-inside: avoid;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
          border: 3px solid #ef4444 !important;
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.15) !important;
        }
        
        h1, h2, h3 {
          page-break-after: avoid;
        }
        
        h1 {
          color: #1e40af !important;
          font-size: 32px !important;
          font-weight: 800 !important;
        }
        
        h2 {
          color: #ffffff !important;
          font-size: 22px !important;
          font-weight: 700 !important;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
          padding: 12px 20px !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15) !important;
        }
        
        h3 {
          color: #1e40af !important;
          font-size: 19px !important;
          font-weight: 700 !important;
        }
        
        .blue-line {
          background: #ffffff !important;
          opacity: 0.9 !important;
        }
        
        .header-underline {
          background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%) !important;
        }
        
        .suitcase-icon {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
          color: white !important;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2) !important;
        }
        
        .section-icon {
          background: rgba(255, 255, 255, 0.2) !important;
        }
        
        .activity-icon, .card-icon {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
        }
        
        .booking-card h4 {
          color: #1e40af !important;
          border-bottom: 2px solid #dbeafe !important;
        }
        
        .persona-info {
          background: #f8fafc !important;
          border: 2px solid #e2e8f0 !important;
        }
        
        .persona-info strong {
          color: #1e40af !important;
        }
        
        .emergency-contacts h2 {
          color: #ffffff !important;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2) !important;
        }
        
        .new-traveler-tip strong {
          color: #047857 !important;
        }
        
        .cultural-tip strong {
          color: #92400e !important;
        }
        
        ul, ol {
          page-break-inside: avoid;
        }
        
        li {
          page-break-inside: avoid;
        }
      </style>`
    );

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `travel-brief-${timestamp}.html`;
    
    // Return the enhanced HTML as a data URL for PDF generation
    const dataUrl = `data:text/html;charset=utf-8;base64,${btoa(enhancedHtml)}`;
    
    return dataUrl;
    
  } catch (error) {
    console.error('Error generating PDF URL:', error);
    throw new Error('Failed to generate PDF URL');
  }
}

// Alternative implementation using Puppeteer (requires additional setup)
async function generatePDFWithPuppeteer(html: string): Promise<Buffer> {
  // This would require Puppeteer to be installed and configured
  // For now, we'll leave this as a placeholder for future implementation
  
  /*
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    margin: {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    }
  });
  
  await browser.close();
  return pdf;
  */
  
  throw new Error('Puppeteer PDF generation not implemented');
}