import { SEOHead } from '../components/SEOHead';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Persona, Destination, useTripContext } from '../context/TripContext';
import { PersonaSelector } from '../components/PersonaSelector';
import { CountrySelector } from '../components/CountrySelector';
import { ActivityPreferences } from '../components/ActivityPreferences';
import { DateSelector } from '../components/DateSelector';
import { DestinationForm } from '../components/DestinationForm';
import { FileUpload } from '../components/FileUpload';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

// Local form state interface for Step 1
interface LocalTripData {
  persona?: Persona;
  passportCountry?: { code: string; label: string };
  activityPreferences: string[];
  startDate?: string;
  endDate?: string;
  destinations: Destination[];
  groupSize?: number;
  ages?: string;
  budget?: 'Low' | 'Mid-range' | 'Luxury';
  uploads: File[];
  uploadKeys?: string[];
  parsedBookingData?: any[];
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

export function Plan() {
  const navigate = useNavigate();
  const { updateTripData } = useTripContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check if user just completed subscription
  const subscriptionComplete = searchParams.get('subscription_complete') === 'true';
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(subscriptionComplete);
  
  // Local state for Step 1 form (no persistence)
  const [localTripData, setLocalTripData] = useState<LocalTripData>({
    destinations: [],
    uploads: [],
    activityPreferences: []
  });
  
  const [pendingSessionId, setPendingSessionId] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [tripDurationError, setTripDurationError] = useState<string>('');
  
  // Clear subscription_complete param after showing banner
  React.useEffect(() => {
    if (subscriptionComplete) {
      // Remove the query param from URL without reloading
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('subscription_complete');
      setSearchParams(newParams, { replace: true });
      
      // Clear the localStorage flag
      localStorage.removeItem('yearly_subscription_pending');
    }
  }, [subscriptionComplete]);

  // Calculate trip duration from local state
  const tripDuration = React.useMemo(() => {
    if (!localTripData.startDate || !localTripData.endDate) return 0;
    const start = new Date(localTripData.startDate);
    const end = new Date(localTripData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [localTripData.startDate, localTripData.endDate]);

  // Calculate allocated days from local state
  const allocatedDays = React.useMemo(() => {
    return localTripData.destinations.reduce((sum, dest) => sum + dest.daysAllocated, 0);
  }, [localTripData.destinations]);

  // Validation based on local state
  const isValid = React.useMemo(() => {
    return !!(
      localTripData.persona &&
      localTripData.passportCountry &&
      localTripData.startDate &&
      localTripData.endDate &&
      localTripData.destinations.length > 0 &&
      tripDuration > 0 &&
      allocatedDays === tripDuration
    );
  }, [localTripData, tripDuration, allocatedDays]);

  // Update local trip data
  const updateLocalTripData = (data: Partial<LocalTripData>) => {
    setLocalTripData(prev => ({ ...prev, ...data }));
  };

  // Generate pending session ID when component mounts (if not already set)
  React.useEffect(() => {
    if (!pendingSessionId) {
      // Generate a UUID-like string for the pending session
      const newSessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      setPendingSessionId(newSessionId);
    }
  }, [pendingSessionId, setPendingSessionId]);

  const handleUploadComplete = (uploadKeys: string[], parsedData?: any[]) => {
    console.log('Upload completed:', { uploadKeys, parsedData });
    updateLocalTripData({ 
      uploadKeys,
      parsedBookingData: parsedData 
    });
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    let durationError = '';
    
    if (!localTripData.persona) {
      newErrors.push('Please select a travel persona');
    }
    
    if (!localTripData.passportCountry) {
      newErrors.push('Please select your passport country');
    }
    
    if (!localTripData.startDate) {
      newErrors.push('Please select a start date');
    } else {
      const start = new Date(localTripData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        newErrors.push('Start date cannot be in the past');
      }
    }
    
    if (!localTripData.endDate) {
      newErrors.push('Please select an end date');
    } else if (localTripData.startDate) {
      const start = new Date(localTripData.startDate);
      const end = new Date(localTripData.endDate);
      if (end < start) {
        newErrors.push('End date must be after start date');
      }
    }
    
    // Check trip duration limit (21 days maximum)
    if (tripDuration > 21) {
      durationError = getTripDurationErrorMessage(localTripData.persona);
      newErrors.push('Trip duration exceeds 21 days maximum');
    }
    
    if (localTripData.destinations.length === 0) {
      newErrors.push('Please add at least one destination');
    }
    
    if (tripDuration > 0 && allocatedDays !== tripDuration) {
      newErrors.push(`Your trip is ${tripDuration} days, but you allocated ${allocatedDays} days across cities. Please adjust.`);
    }

    setErrors(newErrors);
    setTripDurationError(durationError);
    return newErrors.length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Save to TripContext only when continuing to next step
      updateTripData(localTripData);
      navigate('/examples-checkout-step');
    }
  };

  return (
    <>
      <SEOHead title="Start — Build your Travel Brief" description="Enter your destinations, dates, and details to generate your Travel Brief." image="/images/og-default.png" />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="text-sm text-gray-500">
              Step 1 of 3
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
          </div>
        </div>

        {/* Subscription Complete Banner */}
        {showSubscriptionBanner && (
          <Reveal className="mb-6" variant="fade-up">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-1">
                    🎉 Subscription Activated!
                  </h3>
                  <p className="text-green-800 mb-2">
                    Your yearly unlimited subscription is now active. You can create unlimited travel briefs throughout the year!
                  </p>
                  <p className="text-green-700 text-sm">
                    Fill out your trip details below to create your first travel brief.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubscriptionBanner(false)}
                  className="ml-auto text-green-600 hover:text-green-800"
                  aria-label="Close banner"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </Reveal>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <Reveal className="mb-8" variant="fade" duration={800}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Plan Your Perfect Trip
            </h1>
            <p className="text-gray-600">
              Tell us about your travel style and destination to create a personalized travel brief.
            </p>
          </Reveal>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Reveal className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg" variant="fade-up">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-medium text-red-900">Please fix the following issues:</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </Reveal>
          )}

          <div className="space-y-8">
            {/* Persona Selection */}
            <Reveal variant="fade-up">
              <PersonaSelector
                selected={localTripData.persona}
                onSelect={(persona) => updateLocalTripData({ persona })}
              />
            </Reveal>

            {/* Country Selection */}
            <Reveal variant="fade-up">
              <div data-testid="section-passport">
              <CountrySelector
                selected={localTripData.passportCountry}
                onSelect={(country) => updateLocalTripData({ passportCountry: country })}
              />
              </div>
            </Reveal>

            {/* Destinations */}
            <Reveal variant="fade-up">
              <div data-testid="section-destination">
              <DestinationForm
                destinations={localTripData.destinations}
                onUpdate={(destinations) => updateLocalTripData({ destinations })}
                tripDuration={tripDuration}
              />
              </div>
            </Reveal>

            {/* Date Selection */}
            <Reveal variant="fade-up">
              <div data-testid="section-dates">
              <DateSelector
                startDate={localTripData.startDate}
                endDate={localTripData.endDate}
                onDateChange={(dates) => updateLocalTripData(dates)}
              />
              </div>
            </Reveal>

            {/* Trip Duration Error */}
            {tripDurationError && (
              <Reveal className="bg-red-50 border border-red-200 rounded-lg p-4" variant="fade-up">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-red-800 text-sm font-medium">
                    {tripDurationError}
                  </p>
                </div>
              </Reveal>
            )}

            {/* Trip Duration Display */}
            {tripDuration > 0 && (
              <Reveal className="bg-blue-50 p-4 rounded-lg border border-blue-200" variant="fade-up">
                <p className="text-blue-900 font-medium">
                  Trip Duration: {tripDuration} day{tripDuration !== 1 ? 's' : ''}
                  {tripDuration > 21 && (
                    <span className="text-red-600 ml-2 font-semibold">
                      (Exceeds 21-day limit)
                    </span>
                  )}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Allocated: {allocatedDays}/{tripDuration} days
                  {allocatedDays !== tripDuration && (
                    <span className="text-red-600 ml-2">
                      ⚠ Please adjust city allocations
                    </span>
                  )}
                </p>
              </Reveal>
            )}

            {/* Additional Details */}
            <Reveal className="grid md:grid-cols-2 gap-6" variant="fade-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Size (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={localTripData.groupSize || ''}
                  onChange={(e) => updateLocalTripData({ groupSize: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of travelers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Level
                </label>
                <select
                  value={localTripData.budget || ''}
                  onChange={(e) => updateLocalTripData({ budget: e.target.value as 'Low' | 'Mid-range' | 'Luxury' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select budget level</option>
                  <option value="Low">Low ($50-100/day)</option>
                  <option value="Mid-range">Mid-range ($100-250/day)</option>
                  <option value="Luxury">Luxury ($250+/day)</option>
                </select>
              </div>
            </Reveal>

            {/* Activity Preferences */}
            <Reveal variant="fade-up">
              <ActivityPreferences
                selected={localTripData.activityPreferences}
                onSelect={(activities) => updateLocalTripData({ activityPreferences: activities })}
              />
            </Reveal>

            {localTripData.persona === 'Family' && (
              <Reveal variant="fade-up">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children's Ages (optional)
                </label>
                <input
                  type="text"
                  value={localTripData.ages || ''}
                  onChange={(e) => updateLocalTripData({ ages: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5, 8, 12"
                />
                </div>
              </Reveal>
            )}

            {/* File Upload */}
            <Reveal variant="fade-up">
              <FileUpload
                files={localTripData.uploads}
                onFilesChange={(uploads) => updateLocalTripData({ uploads })}
                onUploadComplete={handleUploadComplete}
                pendingSessionId={pendingSessionId}
              />
            </Reveal>
          </div>

          {/* Continue Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleContinue}
              disabled={!isValid}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Examples
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}