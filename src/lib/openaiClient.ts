import { supabase } from './supabase';

export interface TripFormData {
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

export interface OpenAIResponse {
  success: boolean;
  response: string;
  prompt: string;
  error?: string;
}

export type PromptType = 'travel_brief' | 'itinerary' | 'recommendations' | 'safety';

/**
 * Validates trip form data before sending to OpenAI
 */
export function validateTripData(tripData: TripFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!tripData.persona) {
    errors.push('Traveler persona is required');
  }

  if (!tripData.passportCountry) {
    errors.push('Passport country is required');
  }

  if (!tripData.startDate || !tripData.endDate) {
    errors.push('Travel dates are required');
  } else {
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      errors.push('Start date cannot be in the past');
    }

    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }

    const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (tripDuration > 365) {
      errors.push('Trip duration cannot exceed 365 days');
    }
  }

  if (!tripData.destinations || tripData.destinations.length === 0) {
    errors.push('At least one destination is required');
  } else {
    const totalDaysAllocated = tripData.destinations.reduce((sum, dest) => sum + dest.daysAllocated, 0);
    const tripDuration = tripData.startDate && tripData.endDate ? 
      Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
    
    if (totalDaysAllocated !== tripDuration) {
      errors.push(`Total allocated days (${totalDaysAllocated}) must match trip duration (${tripDuration})`);
    }

    // Check for duplicate destinations
    const destinationNames = tripData.destinations.map(dest => dest.name.toLowerCase());
    const uniqueNames = new Set(destinationNames);
    if (destinationNames.length !== uniqueNames.size) {
      errors.push('Duplicate destinations are not allowed');
    }

    // Validate destination names
    tripData.destinations.forEach((dest, index) => {
      if (!dest.name.trim()) {
        errors.push(`Destination ${index + 1} name cannot be empty`);
      }
      if (dest.daysAllocated <= 0) {
        errors.push(`Destination ${index + 1} must have at least 1 day allocated`);
      }
      if (dest.daysAllocated > 30) {
        errors.push(`Destination ${index + 1} cannot have more than 30 days allocated`);
      }
    });
  }

  // Optional field validations
  if (tripData.groupSize !== undefined) {
    if (tripData.groupSize < 1 || tripData.groupSize > 20) {
      errors.push('Group size must be between 1 and 20');
    }
  }

  if (tripData.activityPreferences && tripData.activityPreferences.length > 10) {
    errors.push('Too many activity preferences selected (maximum 10)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calls the OpenAI function with trip data and returns the response
 */
export async function callOpenAITravelPlanning(
  tripData: TripFormData, 
  promptType: PromptType = 'travel_brief'
): Promise<OpenAIResponse> {
  // Validate trip data first
  const validation = validateTripData(tripData);
  if (!validation.isValid) {
    return {
      success: false,
      response: '',
      prompt: '',
      error: `Validation failed: ${validation.errors.join(', ')}`
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        tripData,
        promptType
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to call OpenAI function');
    }

    return data as OpenAIResponse;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return {
      success: false,
      response: '',
      prompt: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Helper function to format trip data for display
 */
export function formatTripDataForDisplay(tripData: TripFormData): string {
  const parts: string[] = [];

  if (tripData.persona) {
    parts.push(`Persona: ${tripData.persona}`);
  }

  if (tripData.passportCountry) {
    parts.push(`Passport: ${tripData.passportCountry.label}`);
  }

  if (tripData.startDate && tripData.endDate) {
    const start = new Date(tripData.startDate).toLocaleDateString();
    const end = new Date(tripData.endDate).toLocaleDateString();
    parts.push(`Dates: ${start} - ${end}`);
  }

  if (tripData.destinations && tripData.destinations.length > 0) {
    const dests = tripData.destinations.map(d => `${d.name} (${d.daysAllocated}d)`).join(', ');
    parts.push(`Destinations: ${dests}`);
  }

  if (tripData.groupSize) {
    parts.push(`Group: ${tripData.groupSize}${tripData.ages ? ` (${tripData.ages})` : ''}`);
  }

  if (tripData.budget) {
    parts.push(`Budget: ${tripData.budget}`);
  }

  if (tripData.activityPreferences && tripData.activityPreferences.length > 0) {
    parts.push(`Activities: ${tripData.activityPreferences.join(', ')}`);
  }

  return parts.join(' | ');
}