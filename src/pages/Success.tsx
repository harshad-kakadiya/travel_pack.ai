import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { trackDownloadComplete } from '../components/Analytics';

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
      const pendingSessionId = localStorage.getItem('pending_session_id');
      
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
    }
  };

  const generateTravelBrief = async (pendingSessionId: string) => {
    setGeneratingBrief(true);
    
    try {
      const generateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-travel-brief`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_reference_id: pendingSessionId
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate travel brief');
      }

      const briefData: GenerateBriefResponse = await generateResponse.json();
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
      console.error('Brief generation error:', err);
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

  const handleDownload = (url: string, filename: string) => {
    trackDownloadComplete('pdf');
    trackDownloadComplete('pdf');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
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

          {generatingBrief ? (
            <div className="py-8">
              <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Generating Your TravelPack.ai...
              </h2>
              <p className="text-gray-600 mb-4">
                Our AI is crafting your personalized travel brief. This usually takes 1-2 minutes.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : briefData ? (
            <div className="py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Travel Pack is Ready! 📋
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleDownload(briefData.pdf_url, 'travel-pack.pdf')}
                   className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
                  </button>
                  
                  <a
                    href={briefData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                   className="bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
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
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Check Status
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