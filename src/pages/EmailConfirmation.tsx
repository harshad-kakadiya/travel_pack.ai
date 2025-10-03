import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if we have the confirmation tokens in the URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session using the tokens from the email confirmation link
          const { data, error } = await supabase?.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage('Invalid or expired confirmation link. Please try signing up again.');
          } else if (data.session && data.user) {
            setStatus('success');
            setMessage('Email confirmed successfully! Welcome to TravelBrief.ai!');
            
            // Redirect to the main app after a short delay
            setTimeout(() => {
              navigate('/plan');
            }, 3000);
          } else {
            setStatus('error');
            setMessage('Email confirmation failed. Please try again.');
          }
        } else if (type === 'recovery') {
          // Handle password reset confirmation
          setStatus('success');
          setMessage('Password reset link is valid. You can now reset your password.');
          setTimeout(() => {
            navigate('/reset-password');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email or try signing up again.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred during email confirmation. Please try again.');
      }
    };

    if (supabase) {
      handleEmailConfirmation();
    } else {
      setStatus('error');
      setMessage('Authentication service not available. Please try again later.');
    }
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {getStatusIcon()}
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Confirmation
            </h2>
            <p className={`mt-2 text-sm ${getStatusColor()}`}>
              {message}
            </p>
            
            {status === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  You will be redirected automatically in a few seconds...
                </p>
                <button
                  onClick={() => navigate('/plan')}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to App
                </button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-6">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Homepage
                  </button>
                  <button
                    onClick={() => navigate('/?signup=true')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Signing Up Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}