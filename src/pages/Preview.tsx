import { SEOHead } from '../components/SEOHead';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTripContext } from '../context/TripContext';
import { useAdminContext } from '../context/AdminContext';
import { ArrowLeft, Shield, Globe, Clock, CheckCircle, ExternalLink, Crown } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import Reveal from '../components/Reveal';
import { v4 as uuidv4 } from "uuid";
interface AffiliateProduct {
  id: string;
  title: string;
  description: string;
  affiliate_url: string;
  image_url: string;
  price: string;
  category: string;
}

export function Preview() {
  const { tripData } = useTripContext();
  const { isAdmin, adminEmail, isWhitelisted } = useAdminContext();
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load affiliate products on component mount
  useEffect(() => {
    loadAffiliateProducts();
  }, []);

  const loadAffiliateProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(6);

      if (error) {
        console.error('Error loading affiliate products:', error);
      } else {
        setAffiliateProducts(data || []);
      }
    } catch (error) {
      console.error('Error loading affiliate products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };
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
          id:uuidv4(),
          created_at: new Date().toISOString(),
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
          customer_email:null,
          has_paid:true,
          plan_type:"Basic",
          paid_at:new Date().toISOString(),
          status:'Pending',
          brief_id:uuidv4(),
        })
        .select('id')
        .single();
    if (error) {
      throw new Error('Failed to create session');
    }

    return data.id;
  };
  const handleCheckout = async (priceType: 'one_time' | 'yearly') => {
    if (!tripData || !tripData.persona) {
      alert('Please complete your trip planning first.');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, we'd first create a pending session
      const mockSessionId = 'mock-session-' + Date.now();

      const { url } = await createCheckoutSession({
        client_reference_id: mockSessionId,
        price_type: priceType
      });

      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleOneTimeClick = async () => {
    handleCheckout('one_time');

    try {
      // First create a pending session in the database
      const pendingSessionId = await createPendingSession();

      // Store the pending session ID in localStorage for retrieval after payment
      localStorage.setItem('pending_session_id', pendingSessionId);

      // Also store trip data for later use
      localStorage.setItem('travel-pack-trip-data', JSON.stringify(tripData));

      const { url } = await createCheckoutSession({
        plan: 'onetime',
        pending_session_id: pendingSessionId
      });

      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearlyClick = async () => {
    handleCheckout('yearly');

    setIsLoading(true);
    try {
      // First create a pending session in the database
      const pendingSessionId = await createPendingSession();

      // Store the pending session ID in localStorage for retrieval after payment
      localStorage.setItem('pending_session_id', pendingSessionId);

      // Also store trip data for later use
      localStorage.setItem('travel-pack-trip-data', JSON.stringify(tripData));

      const { url } = await createCheckoutSession({
        plan: 'yearly',
        pending_session_id: pendingSessionId
      });

      window.open(url, '_blank');
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAdminGenerate = async () => {
    if (!isAdmin || !isWhitelisted(adminEmail)) {
      alert('Admin access required');
      return;
    }
    
    // In real implementation, this would call generate-travel-brief with force=true
    alert('Admin generation would be implemented here');
  };

  return (
    <>
      <SEOHead title="Preview — Travel Brief" description="Preview your personalized Travel Brief before purchase." image="/images/og-default.png" />
      <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/examples-checkout-step" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Examples
            </Link>
            <div className="text-sm text-gray-500">
              Step 3 of 3
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Blurred Preview */}
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <Reveal className="bg-white rounded-lg shadow-sm overflow-hidden" variant="fade-up">
              <Reveal className="p-6 border-b border-gray-200" variant="fade">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Personalized Travel Brief is Ready to Unlock 🎒✨
                </h1>
                <p className="text-gray-600">
                  A complete itinerary, safety info, packing lists, and must-sees — beautifully formatted for offline use.
                </p>
              </Reveal>

              {/* Trust Badges */}
              <Reveal className="p-6 bg-gray-50 border-b border-gray-200" variant="fade-up" delay={200}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Works offline</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Personalized for you</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Ready in minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Secure payment</span>
                  </div>
                </div>
              </Reveal>

              {/* Blurred Preview Content */}
              <div className="relative">
                <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Unlock Your Travel Brief
                    </h3>
                    
                    <div className="space-y-4">
                      {/* One-time Purchase */}
                      <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">One-Time Brief</h4>
                          <span className="text-2xl font-bold text-gray-900">$5</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Perfect for this specific trip
                        </p>
                        <button
                          onClick={() => {
                            handleOneTimeClick()
                          }}
                          disabled={isLoading}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Processing...' : 'Get This Brief'}
                        </button>
                      </div>

                      {/* Yearly Subscription */}
                      <div className="border-2 border-blue-300 rounded-lg p-4 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <Crown className="h-3 w-3 mr-1" />
                            Best Value
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Unlimited Yearly</h4>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">$29</span>
                            <div className="text-xs text-gray-500">per year</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Unlimited travel briefs for all your trips
                        </p>
                        <button
                          onClick={() => {
                            handleYearlyClick()
                          }}
                          disabled={isLoading}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Processing...' : 'Get Unlimited Access'}
                        </button>
                      </div>
                    </div>

                    {/* Admin Generate Button */}
                    {isAdmin && isWhitelisted(adminEmail) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleAdminGenerate}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Admin Generate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 space-y-6 filter blur-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to Your Adventure</h2>
                    <p className="text-gray-600">
                      You're about to embark on an incredible journey! This comprehensive travel brief has been 
                      personalized specifically for your travel style and destination. From the moment you land 
                      to your safe return home, we've got you covered with detailed insights, safety tips, and 
                      local knowledge that will make your trip unforgettable.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Visa & Entry Requirements</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Based on your passport country, here are the specific entry requirements...
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety & Local Etiquette</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Essential safety tips for your destination</li>
                      <li>• Cultural customs and etiquette guidelines</li>
                      <li>• Emergency contacts and important numbers</li>
                      <li>• Local scams to avoid and how to stay safe</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Day-by-Day Itinerary</h3>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-medium text-gray-900">Day 1: Arrival & Exploration</h4>
                        <p className="text-sm text-gray-600">Morning arrival, hotel check-in, initial neighborhood exploration...</p>
                      </div>
                      <div className="border-l-4 border-green-600 pl-4">
                        <h4 className="font-medium text-gray-900">Day 2: Must-See Highlights</h4>
                        <p className="text-sm text-gray-600">Visit the most iconic attractions and hidden local gems...</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Packing Essentials</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Clothing</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Weather-appropriate clothing</li>
                          <li>• Comfortable walking shoes</li>
                          <li>• Local dress code considerations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Tech & Documents</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Passport and visa documents</li>
                          <li>• Power adapters and chargers</li>
                          <li>• Important app downloads</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column - Pricing & Recommendations */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Recommended Travel Essentials */}
              <Reveal className="bg-white rounded-lg shadow-sm p-6" variant="fade-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommended Travel Essentials
                </h3>
                
                {loadingProducts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading recommendations...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {affiliateProducts.map((product) => (
                      <Reveal key={product.id} variant="fade-up" delay={product.id.length * 20}>
                        <div className="flex space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            loading="lazy"
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                {product.title}
                                {product.category === 'Electronics' && (
                                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    Popular
                                  </span>
                                )}
                              </h4>
                              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap ml-2">
                                {product.price}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <a
                              href={product.affiliate_url}
                              target="_blank"
                              rel="nofollow sponsored"
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}