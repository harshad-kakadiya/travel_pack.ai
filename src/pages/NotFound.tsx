import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import Reveal from '../components/Reveal';

export function NotFound() {
  return (
    <>
      <SEOHead
        title="Page Not Found – TravelBrief.ai"
        description="The page you're looking for doesn't exist. Return to TravelBrief.ai to plan your perfect trip."
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <Reveal variant="zoom" duration={800}>
            <div className="text-6xl mb-6">🧳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like this page went on its own adventure! The page you're looking for doesn't exist or may have been moved.
            </p>
          </Reveal>
          <Reveal className="space-y-4" variant="fade-up" delay={400}>
            <Link
              to="/"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="h-5 w-5" />
              Return to Homepage
            </Link>
            <Link
              to="/support"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="h-5 w-5" />
              Get Help
            </Link>
          </Reveal>
        </div>
      </div>
    </>
  );
}