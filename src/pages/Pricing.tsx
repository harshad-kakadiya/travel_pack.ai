import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { Persona } from '../context/TripContext';
import { createCheckoutSession } from '../lib/stripe';
import { trackPricingCTA, trackCheckoutRedirect } from '../components/Analytics';
import { SEOHead } from '../components/SEOHead';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [pendingYearlyCheckout, setPendingYearlyCheckout] = React.useState(false);

  // Handle auth state change to trigger checkout after successful signup/login
  React.useEffect(() => {
    if (user && pendingYearlyCheckout && authModalOpen) {
      // User just authenticated, close modal and proceed to checkout
      setAuthModalOpen(false);
      setPendingYearlyCheckout(false);
      handleYearlyCheckout();
    }
  }, [user, pendingYearlyCheckout, authModalOpen]);

  // Check for pending checkout from email confirmation
  React.useEffect(() => {
    const pendingCheckout = sessionStorage.getItem('pendingYearlyCheckout');
    if (user && pendingCheckout && user.email_confirmed_at) {
      // User returned from email confirmation, proceed to checkout
      sessionStorage.removeItem('pendingYearlyCheckout');
      handleYearlyCheckout();
    }
  }, [user]);


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
        trip_duration_days: Math.ceil((new Date(tripData.endDate!).getTime() - new Date(tripData.startDate!).getTime()) / (1000 * 60 * 60 * 24)) + 1,
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

    // Always navigate to plan page first for $5 plan
    navigate('/plan');
  };

  const handleYearlyCheckout = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Check if we have valid trip data
      const hasValidTripData = isValid && tripData.persona && tripData.destinations?.length > 0;
      
      if (hasValidTripData) {
        // User has trip data - create pending session and redirect to success after payment
        const pendingSessionId = await createPendingSession();
        localStorage.setItem('pending_session_id', pendingSessionId);
        localStorage.setItem('travel-pack-trip-data', JSON.stringify(tripData));

        const { url } = await createCheckoutSession({
          plan: 'yearly'
        });

        trackCheckoutRedirect('yearly');
        window.location.href = url;
      } else {
        // User clicked from pricing page without trip data
        // Set flag to redirect to /plan after payment
        localStorage.setItem('yearly_subscription_pending', 'true');
        
        const { url } = await createCheckoutSession({
          plan: 'yearly',
          redirectToPlan: true
        });

        trackCheckoutRedirect('yearly');
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearlyClick = async () => {
    trackPricingCTA('yearly');
    
    // Check if user is already authenticated
    if (user) {
      // User is already signed in, proceed to checkout
      handleYearlyCheckout();
    } else {
      // User is not authenticated, open sign-up modal
      setPendingYearlyCheckout(true);
      sessionStorage.setItem('pendingYearlyCheckout', 'true');
      setAuthModalOpen(true);
    }
  };


  return (
    <>
      <SEOHead
        title="Pricing – TravelBrief.ai"
        description="Choose between one-time briefs or yearly access. Simple, transparent pricing for AI-curated travel planning."
      />
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 pb-24 sm:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your travel style
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
          {/* One-Time Plan */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                One-Time Brief
              </h2>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                $5
              </div>
              <p className="text-sm sm:text-base text-gray-600">
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
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm active:translate-y-px"
            >
              {isLoading ? 'Loading...' : isValid ? 'Get This Brief' : 'Get Started'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-6 sm:p-8 relative">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 shadow">
                <Crown className="h-4 w-4" />
                Best Value
              </span>
            </div>

            <div className="text-center mb-5 sm:mb-6 mt-3 sm:mt-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                Yearly Unlimited
              </h2>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                $39
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">per year</p>
              <p className="text-blue-600 font-medium text-sm sm:text-base">
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm active:translate-y-px"
            >
              {isLoading ? 'Loading...' : user ? 'Go Unlimited' : 'Sign Up & Go Unlimited'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
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

      {/* Sticky Mobile Checkout Bar */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleYearlyClick}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-sm active:translate-y-px"
            >
              {isLoading ? 'Loading…' : user ? 'Go Unlimited ($39/yr)' : 'Sign Up for $39/yr'}
            </button>
            <button
              onClick={handleOneTimeClick}
              disabled={isLoading}
              className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              {isValid ? 'One-Time $5' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        startInSignUp={true}
      />
    </div>
    </>
  );
}
