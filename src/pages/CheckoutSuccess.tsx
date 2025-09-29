import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Loader } from 'lucide-react';
import { verifySessionAndStatus } from '../lib/stripe';

interface SessionData {
  customer_email?: string;
  payment_status?: string;
  plan_type?: string;
  html_url?: string;
  pdf_url?: string;
}

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    verifySession();
  }, [sessionId]);

  const verifySession = async () => {
    try {
      const data = await verifySessionAndStatus(sessionId!);
      setSessionData(data);
      
      // If PDF is not ready yet, start generation
      if (!data.pdf_url && data.payment_status === 'paid') {
        setGenerating(true);
        // Call generate function
        await generateTravelBrief();
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to verify payment. Please contact support.');
      setLoading(false);
    }
  };

  const generateTravelBrief = async () => {
    try {
      // In real implementation, this would call the generate-travel-brief function
      // For demo purposes, we'll simulate the generation
      setTimeout(() => {
        setGenerating(false);
        setSessionData(prev => ({
          ...prev,
          pdf_url: 'https://example.com/demo-travel-pack.pdf',
          html_url: 'https://example.com/demo-travel-pack.html'
        }));
      }, 3000);
    } catch (err) {
      setError('Failed to generate travel pack. Please contact support.');
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (sessionData.pdf_url) {
      // In real implementation, this would trigger the download
      window.open(sessionData.pdf_url, '_blank');
    }
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
          <div className="text-red-600 mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="mailto:support@travelpack.ai" className="text-blue-600 hover:text-blue-800">
            Contact Support
          </a>
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
              Thank you for your purchase. Your travel pack is being prepared.
            </p>
          </div>

          {sessionData.customer_email && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                A confirmation has been sent to <strong>{sessionData.customer_email}</strong>
              </p>
            </div>
          )}

          {generating ? (
            <div className="py-8">
              <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Generating Your TravelPack.ai...
              </h2>
              <p className="text-gray-600 mb-4">
                Our AI is crafting your personalized travel brief. This usually takes 1-2 minutes.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : sessionData.pdf_url ? (
            <div className="py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Travel Pack is Ready! 📋
              </h2>
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                
                <div className="text-sm text-gray-600">
                  <p>We've also emailed you the link for future access.</p>
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
                onClick={verifySession}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Check Status
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Plan:</strong> {sessionData.plan_type === 'yearly' ? 'Yearly Unlimited' : 'One-Time Pack'}
              </div>
              <div>
                <strong>Status:</strong> {sessionData.payment_status === 'paid' ? 'Paid' : 'Processing'}
              </div>
              <div>
                <strong>Email:</strong> {sessionData.customer_email || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}