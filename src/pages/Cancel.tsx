import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export default function Cancel() {
  return (
    <main className="min-h-screen bg-gray-50">
      <SEOHead title="Checkout canceled — TravelBrief.ai" description="Your checkout was canceled. No charge was made." image="/images/og-default.png" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-semibold">Checkout canceled</h1>
          </div>
          <p className="text-gray-600 mb-6">
            No charge was made. You can return to the pricing page and try again whenever you’re ready.
          </p>
          <Link to="/pricing" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
