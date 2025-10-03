import React from 'react';
import { SEOHead } from '../components/SEOHead';

export function RefundPolicy() {
  return (
    <>
      <SEOHead
        title="Refund Policy – TravelBrief.ai"
        description="Read the TravelBrief.ai Refund Policy."
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Refund Policy
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Effective Date: September 22, 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. One-Time Travel Briefs</h2>
              <p className="text-gray-600 mb-6">
                Due to the instant digital nature of our product, refunds are generally not available once your travel brief is generated. If you encounter an error or did not receive your PDF, please contact support and we will resolve the issue.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Yearly Subscriptions</h2>
              <p className="text-gray-600 mb-6">
                - You may cancel your subscription at any time.<br />
                - Refunds are not issued for partial subscription periods already used.<br />
                - If you cancel before renewal, you will not be charged again.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Technical Issues</h2>
              <p className="text-gray-600 mb-6">
                If a technical failure prevents generation of your travel brief, we will either regenerate it or issue a refund at our discretion.
              </p>

              <p className="text-gray-600 mb-6">
                For support or refund inquiries, email: contact@travelbrief.ai
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
