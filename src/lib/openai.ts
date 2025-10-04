/**
 * Direct OpenAI API Client
 * 
 * WARNING: Calling OpenAI directly from the frontend exposes your API key.
 * This should only be used for:
 * 1. Testing/development with a separate API key
 * 2. Server-side calls (like in Supabase Edge Functions)
 * 
 * For production, use the Supabase Edge Function: generate-travel-brief
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Call OpenAI Chat Completions API directly
   */
  async chat(request: OpenAIRequest): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
    }

    return await response.json();
  }

  /**
   * Simple text completion helper
   */
  async complete(prompt: string, options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}): Promise<string> {
    const {
      model = 'gpt-4o',
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    const response = await this.chat({
      model,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T = any>(
    systemPrompt: string,
    userPrompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<T> {
    const {
      model = 'gpt-4o',
      maxTokens = 4000,
      temperature = 0.7,
    } = options;

    const response = await this.chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  /**
   * Generate travel brief (same as Edge Function but client-side)
   * 
   * WARNING: This exposes your API key! Use the Edge Function instead.
   */
  async generateTravelBrief(tripData: {
    persona: string;
    passport_country_label: string;
    passport_country_code: string;
    start_date: string;
    end_date: string;
    destinations: Array<{
      cityName: string;
      country?: string;
      daysAllocated: number;
    }>;
    group_size?: number;
    budget?: string;
    activity_preferences?: string[];
    ages?: string;
  }) {
    const systemPrompt = `You are Travel Brief, a world-class travel researcher, editor, and concierge.
You generate paid, premium-quality travel briefs for travelers.
Output valid JSON with pre-defined fields containing HTML with inline CSS styling.

Required JSON keys:
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

Include real names, actual dates, "Why?" explanations, and persona-tailored content.`;

    const startDate = new Date(tripData.start_date);
    const endDate = new Date(tripData.end_date);
    const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const destinationNames = tripData.destinations.map(d => d.cityName).join(', ');

    const userPrompt = `
TRAVELER PROFILE:
- Persona: ${tripData.persona}
- Passport Country: ${tripData.passport_country_label} (${tripData.passport_country_code})
- Travel Dates: ${tripData.start_date} to ${tripData.end_date}
- Trip Duration: ${tripDuration} days
- Destinations: ${destinationNames}
- Group Size: ${tripData.group_size || 1} ${tripData.group_size === 1 ? 'person' : 'people'}
- Budget Level: ${tripData.budget || 'Not specified'}
${tripData.ages ? `- Ages: ${tripData.ages}` : ''}

${tripData.activity_preferences && tripData.activity_preferences.length > 0 ? `
ACTIVITY PREFERENCES:
${tripData.activity_preferences.map(pref => `- ${pref}`).join('\n')}
` : ''}

DESTINATIONS & DURATION:
${tripData.destinations.map(dest => 
  `- ${dest.cityName}${dest.country ? `, ${dest.country}` : ''}: ${dest.daysAllocated} day${dest.daysAllocated !== 1 ? 's' : ''}`
).join('\n')}

Generate a complete travel brief following the JSON specification above.`;

    return await this.generateJSON(systemPrompt, userPrompt, {
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.7,
    });
  }
}

/**
 * Get OpenAI client instance with API key from environment
 */
export function getOpenAIClient(): OpenAIClient {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Set VITE_OPENAI_API_KEY in your .env file'
    );
  }

  return new OpenAIClient(apiKey);
}

/**
 * Direct API call helper (for quick testing)
 */
export async function callOpenAI(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const client = getOpenAIClient();
  return await client.complete(prompt, options);
}

/**
 * Example usage:
 * 
 * import { callOpenAI, OpenAIClient, getOpenAIClient } from '@/lib/openai';
 * 
 * // Simple text completion
 * const response = await callOpenAI('Write a haiku about travel');
 * 
 * // Using client directly
 * const client = getOpenAIClient();
 * const result = await client.complete('Tell me about Paris');
 * 
 * // Generate JSON
 * const jsonResult = await client.generateJSON(
 *   'You are a travel expert. Output JSON only.',
 *   'List 3 must-see places in Tokyo',
 *   { maxTokens: 500 }
 * );
 */
