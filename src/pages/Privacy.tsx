import React from 'react';
import { SEOHead } from '../components/SEOHead';

export function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy – TravelPack.ai"
        description="Learn how TravelPack.ai protects your privacy and handles your personal information when creating AI-curated travel briefs."
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Effective Date: September 22, 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-6">
                - Travel details you enter (destinations, dates, preferences).<br />
                - Uploaded documents (tickets, hotel confirmations).<br />
                - Payment details (processed securely via Stripe; we never store full card details).
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
              <p className="text-gray-600 mb-6">
                - To generate your personalized travel pack.<br />
                - To process payments.<br />
                - To improve our services (analytics, anonymized trends).
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage & Security</h2>
              <p className="text-gray-600 mb-6">
                Uploaded files are stored securely in Supabase and only used to create your travel pack. We implement strict access controls and encryption where possible.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing Information</h2>
              <p className="text-gray-600 mb-6">
                We do not sell or share your personal data with third parties, except:<br />
                - Payment processors (Stripe).<br />
                - Service providers required to run Travel Pack.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 mb-6">
                You may request deletion of your data at any time by contacting us.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies & Analytics</h2>
              <p className="text-gray-600 mb-6">
                We use cookies and analytics (Google Analytics or similar) to measure performance and improve user experience.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Policy Updates</h2>
              <p className="text-gray-600 mb-6">
                Updates will be posted here. Continued use of Travel Pack indicates acceptance.
              </p>

              <p className="text-gray-600 mb-6">
                For questions, contact: support@travelpack.ai
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}