import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">✈️</span>
              <span className="text-lg font-bold text-gray-900">TravelBrief.ai</span>
            </Link>
            <p className="text-gray-600 text-sm max-w-md">
              Generate personalized, AI-powered travel briefs that work offline.
              Perfect for every type of traveler.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <div className="space-y-3">
              <Link to="/features" className="block text-sm text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link to="/pricing" className="block text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/examples" className="block text-sm text-gray-600 hover:text-gray-900">
                Examples
              </Link>
              <Link to="/blog" className="block text-sm text-gray-600 hover:text-gray-900">
                Blog
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <div className="space-y-3">
              <Link to="/support" className="block text-sm text-gray-600 hover:text-gray-900">
                Help Center
              </Link>

              <Link to="/privacy" className="block text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link to="/terms" className="block text-sm text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              <Link to="/refund-policy" className="block text-sm text-gray-600 hover:text-gray-900">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2025 TravelBrief.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
