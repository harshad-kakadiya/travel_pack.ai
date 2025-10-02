import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { Persona } from '../context/TripContext';
import { createCheckoutSession } from '../lib/stripe';
import { trackPricingCTA, trackCheckoutRedirect } from '../components/Analytics';
import { SEOHead } from '../components/SEOHead';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get persona-specific trip duration error message
const getTripDurationErrorMessage = (persona?: Persona): string => {
  switch (persona) {
    case 'New Traveler':
      return '⚠️ Travel Briefs for new travelers are limited to 3 weeks to avoid overwhelm. Please adjust your dates.';
    case 'Experienced Traveler':
      return '⚠️ Travel Briefs are optimized for intensive trips of up to 3 weeks. Please shorten your trip to proceed.';
    case 'Minor/Under 18':
      return '⚠️ Travel Briefs for minors are limited to 3 weeks for safety and practicality. Please adjust your dates.';
    case 'Solo Female Traveler':
      return '⚠️ To ensure safety and quality, Travel Briefs are limited to 3 weeks. Please adjust your dates.';
    case 'Family':
      return '⚠️ Travel Briefs for families work best for trips of up to 3 weeks. Please adjust your dates.';
    default:
      return '⚠️ Travel Briefs are limited to 3 weeks maximum. Please adjust your dates.';
  }
};

export function Pricing() {
  const navigate = useNavigate();
  const { tripData, isValid } = useTripContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const createPendingSession = async () => {
    // Calculate trip duration for validation
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Check trip duration limit (21 days maximum)
      if (duration > 21) {
        throw new Error(getTripDurationErrorMessage(tripData.persona));
      }
    }

    const { data, error } = await supabase
      .from('pending_sessions')
      .insert({
        persona: tripData.persona,
        passport_country_code: tripData.passportCountry?.code,
        passport_country_label: tripData.passportCountry?.label,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        trip_duration_days: Math.ceil((new Date(tripData.endDate!) - new Date(tripData.startDate!)) / (1000 * 60 * 60 * 24)) + 1,
        destinations: tripData.destinations,
        group_size: tripData.groupSize,
        budget: tripData.budget,
        activity_preferences: tripData.activityPreferences,
        upload_keys: [], // Will be populated if user uploads files
        client_ip: null, // Could be populated from headers if needed
      })
      .select('id')
      .single();

    if (error) {
      throw new Error('Failed to create session');
    }

    return data.id;
  };
  const handleOneTimeClick = async () => {
    trackPricingCTA('one_time');
    
    if (!isValid) {
      // Redirect to planner if form not completed
      navigate('/plan');
      return;
    }

    // Proceed with checkout if form is completed
    setIsLoading(true);
    setError('');
    try {
      const { url } = await createCheckoutSession({
        plan: 'onetime'
      });
      
      trackCheckoutRedirect('one_time');
      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearlyClick = async () => {
    trackPricingCTA('yearly');
    
    setIsLoading(true);
    setError('');
    try {
      const { url } = await createCheckoutSession({
        plan: 'yearly'
      });
      
      trackCheckoutRedirect('yearly');
      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Pricing – TravelBrief.ai"
        description="Choose between one-time briefs or yearly access. Simple, transparent pricing for AI-curated travel planning."
      />
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your travel style
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* One-Time Plan */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                One-Time Brief
              </h2>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $5
              </div>
              <p className="text-gray-600">
                Perfect for a single trip
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>One personalized Travel Brief</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Complete itinerary & safety info</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Offline-ready PDF format</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Packing lists & local tips</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Email delivery & support</span>
              </li>
            </ul>

            <button
              onClick={handleOneTimeClick}
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : isValid ? 'Get This Brief' : 'Get Started'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Best Value
              </span>
            </div>

            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Yearly Unlimited
              </h2>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                $39
              </div>
              <p className="text-sm text-gray-600 mb-2">per year</p>
              <p className="text-blue-600 font-medium">
                Unlimited Travel Briefs
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Unlimited Travel Briefs</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>All one-time brief features</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Perfect for frequent travelers</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Create briefs for friends & family</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Priority email support</span>
              </li>
            </ul>

            <button
              onClick={handleYearlyClick}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Loading...' : 'Go Unlimited'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Have questions about our pricing?
          </h3>
          <Link
            to="/support"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Contact our support team →
          </Link>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
    </>
  );
}