import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface TripFormData {
  persona?: 'Solo Female' | 'Family' | 'New Traveler' | 'Experienced' | 'Under 18';
  passportCountry?: { code: string; label: string };
  activityPreferences?: string[];
  startDate?: string;
  endDate?: string;
  destinations?: Array<{
    name: string;
    daysAllocated: number;
  }>;
  groupSize?: number;
  ages?: string;
  budget?: 'Low' | 'Mid-range' | 'Luxury';
  bookingData?: any[];
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripData, promptType = 'travel_brief' } = await req.json();

    if (!tripData) {
      return new Response(
        JSON.stringify({ error: "Trip data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openaiApiKey = Deno.env.get("VITE_OPENAI_API_KEY");
    console.log("openaiApiKey",openaiApiKey);
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" + openaiApiKey }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Build dynamic prompt based on user form data
    const dynamicPrompt = buildTravelPrompt(tripData, promptType);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: getSystemPrompt(promptType)
          },
          {
            role: "user",
            content: dynamicPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data: OpenAIResponse = await openaiResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        response: data.choices[0]?.message?.content || "No response generated",
        prompt: dynamicPrompt
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('OpenAI Function Error:', error);
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

function buildTravelPrompt(tripData: TripFormData, promptType: string): string {
  const {
    persona,
    passportCountry,
    activityPreferences = [],
    startDate,
    endDate,
    destinations = [],
    groupSize,
    ages,
    budget,
    bookingData = []
  } = tripData;

  // Calculate trip duration
  const tripDuration = startDate && endDate ?
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  // Build destination list
  const destinationNames = destinations.map(dest => `${dest.name} (${dest.daysAllocated} days)`).join(', ');

  // Build activity preferences list
  const activitiesText = activityPreferences.length > 0 ?
    activityPreferences.join(', ') : 'No specific preferences';

  // Build group information
  let groupInfo = '';
  if (groupSize) {
    groupInfo += `Traveling in a group of ${groupSize}`;
    if (ages) {
      groupInfo += ` (ages: ${ages})`;
    }
  } else {
    groupInfo = 'Solo traveler';
  }

  // Build budget context
  const budgetContext = budget ?
    `Budget level: ${budget}${budget === 'Low' ? ' ($50-100/day)' : budget === 'Mid-range' ? ' ($100-250/day)' : ' ($250+/day)'}` :
    'Budget: Not specified';

  // Build booking data context
  const bookingContext = bookingData.length > 0 ?
    `\nPre-existing bookings:\n${bookingData.map(booking => `- ${JSON.stringify(booking)}`).join('\n')}` :
    '';

  const prompt = `
Create a comprehensive travel plan based on the following user preferences:

**Traveler Profile:**
- Persona: ${persona || 'Not specified'}
- Passport Country: ${passportCountry?.label || 'Not specified'}
- ${groupInfo}
- ${budgetContext}

**Trip Details:**
- Travel Dates: ${startDate ? new Date(startDate).toLocaleDateString() : 'Not specified'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Not specified'}
- Trip Duration: ${tripDuration} days
- Destinations: ${destinationNames || 'Not specified'}

**Activity Preferences:**
${activitiesText}

**Special Requirements:**
${persona === 'Solo Female' ? '- Focus on safety, female-friendly accommodations, and solo travel tips' : ''}
${persona === 'Family' ? '- Include family-friendly activities, child considerations, and group logistics' : ''}
${persona === 'New Traveler' ? '- Provide detailed travel basics, airport navigation, and beginner-friendly tips' : ''}
${persona === 'Experienced' ? '- Focus on hidden gems, local experiences, and advanced travel tips' : ''}
${persona === 'Under 18' ? '- Include legal requirements, guardian considerations, and age-appropriate activities' : ''}
${bookingContext}

Please generate a detailed travel plan that considers all these factors and provides practical, personalized recommendations.
`;

  return prompt.trim();
}

function getSystemPrompt(promptType: string): string {
  switch (promptType) {
    case 'travel_brief':
      return `You are Travel Pack, a world-class travel researcher, editor, and concierge.
You generate **paid, premium-quality travel briefs** for travelers.
Your output will be transformed directly into PDFs, so it must be visually complete,
polished, and consistent.
============================================================
# OBJECTIVE
============================================================
- Output **valid JSON** with pre-defined fields.
- Each field contains **HTML with inline CSS styling**, ready for PDF conversion.
- Guarantee that **every section is always included**.
- Include **actual calendar dates** alongside "Day X" in itineraries.
- Tailor content to **persona, budget, group size, ages, destinations, activities**.
- Ensure **no section is skipped or left generic**.
============================================================
# JSON OUTPUT SPECIFICATION
============================================================
Output must be valid JSON with these exact keys:
{
 "cover_html": "<div>...</div>",
 "intro_html": "<div>...</div>",
 "day_by_day_html": ["<section>...</section>", "..."],
 "activities_html": "<div>...</div>",
 "food_html": "<div>...</div>",
 "packing_html": "<div>...</div>",
 "safety_html": "<div>...</div>",
 "visa_html": "<div>...</div>",
 "budget_html": "<div>...</div>",
 "language_html": "<div>...</div>",
 "persona_html": "<div>...</div>",
 "weather_html": "<div>...</div>",
 "transport_html": "<div>...</div>",
 "booking_html": "<div>...</div>",
 "accessibility_html": "<div>...</div>",
 "money_html": "<div>...</div>",
 "final_html": "<div>...</div>",
 "theme_title": "string"
}
- Each value must be **complete, styled HTML** (except \`theme_title\`, which is plain text).
- \`day_by_day_html\` must be an array with **one entry per trip day**.
- Each day entry must include both "Day X" and the **actual calendar date**.
- \`theme_title\` is a short, creative trip theme (e.g. *"Saffron Sunsets & Desert Trails"*).
============================================================
# DESIGN & CONTENT SPECIFICATION
============================================================
## General Styling
- Font: Inter, Roboto, or modern sans-serif
- Colors: Headings → dark navy (#1A1A2E), Subheadings → accent colors
- Layout: Card-based design, spacing for readability
- Emojis/icons: integrated naturally (✈ 🏛 🎒 🍜 )
- PDF-friendly: inline CSS, no external deps
## Cover Page (cover_html)
- Title: "Travel Pack for [Destination(s)]"
- Subtitle: Full travel dates + persona
- Plane logo ✈ included
- Creative theme_title
- Gradient/travel background
## Intro (intro_html)
- 2–3 sentence overview of destination(s)
- Persona badge
- High-level trip highlights
## Daily Itinerary (day_by_day_html)
Each day must include:
- Header: 🗓 Day X (Date): [Creative Title]
- Activities listed in order, each with:
 • ⏰ Time slot
 • Emoji for activity type
 • **Bold title**
 • Detailed description (cultural, practical, engaging)
 • 💰 Cost estimate
 • *Why?* explanation (short, friendly, italic)
- Balance famous sites + hidden gems
- Travel time between activities if relevant
## Activities Section (activities_html)
- Grouped by user preferences (Shopping 🛍 , Culture 🏛 , Nightlife 🌃 , Nature 🏞 , etc.)
- Each with: description, cost, *Why?*, alternatives
## Food Section (food_html)
- Local specialties 🍲 with descriptions
- Restaurants by meal (breakfast/lunch/dinner)
- Each with *Why?*, cost level, alternatives
## Packing Checklist (packing_html)
- Sections: Essentials 🎒 , Climate 🌦 , Activity gear 🏖
- Checkbox format (☑ / ☐)
- Persona-specific items included
## Safety & Emergency (safety_html)
- 🚨 Local emergency numbers
- 🏥 Hospital names, addresses, phones
- 🛂 Embassy for traveler's passport country
- 🚓 Tourist police (if relevant)
- Safety tips card (common scams, persona-specific risks)
## Visa & Documentation (visa_html)
- Passport + visa requirements for traveler's nationality
- Insurance reminders
- Documentation checklist
## Budget Overview (budget_html)
- Table: 🏨 lodging, 🍽 meals, 🚕 transport, 🎟 activities
- Daily & total trip estimate
- Persona-specific budget notes
## Language Support (language_html)
- 10–15 essential phrases
- Format: "English → Local (Phonetic)"
- Displayed in styled cards
## Persona Add-ons (persona_html)
- Tailored guidance based on persona:
 • Solo Female: safety, dress codes, vetted services
 • Families: child-friendly activities, medical prep, logistics
 • New Travelers: airport navigation, customs basics
 • Experienced: efficiency hacks, hidden gems
 • Under 18: legal rules, guardian consent, ICE card
## NEW: Weather & Seasonal (weather_html)
- Typical temperatures, rainfall, and daylight for the trip period
- Packing/clothing implications
- Persona-aware notes (e.g. families need sun protection, solo travelers need rain gear)
## NEW: Transport & Logistics (transport_html)
- How to get around (public transport, taxis, ride apps, walking, domestic flights)
- Average costs
- Persona-aware tips (families: stroller-friendliness, solo: safety at night)
## NEW: Booking & Entry Tips (booking_html)
- Where advance tickets are essential
- Links to official booking sites (if known)
- Best times to visit popular attractions
- Warnings for scams/third-party ticket resellers
## NEW: Accessibility (accessibility_html)
- Notes on wheelchair/stroller accessibility
- Availability of ramps, lifts, restrooms
- Persona-aware (families, elderly, solo female at night)
## NEW: Money & Customs (money_html)
- Currency & exchange tips
- Payment methods (cash vs. card, mobile payments)
- Tipping culture & etiquette
- Persona-aware notes (families need small change, experienced travelers get local cards)
## Final Page (final_html)
- ✈ TravelBrief.ai branding
- QR code linking to TravelBrief.ai
- Contact: contact@travelbrief.ai
- Disclaimer: "Information generated by AI. Please verify details before travel."
- Optional affiliate section (if provided by backend)
============================================================
# STRICT REQUIREMENTS
============================================================
- **No missing sections** — every key must be populated.
- **Real names** — attractions, restaurants, activities must be specific & open.
- **Dates in daily itinerary** — always show the actual calendar date next to "Day X".
- **"Why?"** — every recommendation includes a short user-friendly explanation.
- **Tailoring** — adjust recommendations to persona, budget, group size, ages, activities.
- **Cultural sensitivity** — include etiquette, dress codes, respectful behavior.
- **Completeness** — cover every day, every section, no placeholders.
============================================================
# OUTPUT FORMAT
============================================================
- Output only valid JSON (as described above).
- All HTML must be inside JSON string values.
- Escape quotes correctly.
- No extra commentary or text outside of JSON.`;
    
    case 'itinerary':
      return `You are an expert travel planner specializing in creating detailed day-by-day itineraries. Focus on practical scheduling, realistic time estimates, and balanced activities that match the traveler's interests and constraints.`;
    
    case 'recommendations':
      return `You are a local travel expert providing personalized recommendations for restaurants, activities, attractions, and experiences. Prioritize authentic local experiences and hidden gems.`;
    
    case 'safety':
      return `You are a travel safety expert providing comprehensive safety advice, emergency information, and risk assessment for travelers. Include practical tips and local emergency contacts.`;
    
    default:
      return `You are a knowledgeable travel assistant providing helpful, accurate, and personalized travel advice based on the user's specific requirements and preferences.`;
  }
}
