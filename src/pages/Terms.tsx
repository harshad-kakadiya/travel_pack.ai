import React from 'react';
import { SEOHead } from '../components/SEOHead';

export function Terms() {
  return (
    <>
      <SEOHead
        title="Terms of Service – Travel Brief"
        description="Read the Travel Brief Terms of Service."
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Effective Date: September 22, 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Service Provided</h2>
              <p className="text-gray-600 mb-6">
                Travel Brief generates AI-powered travel briefs and downloadable PDFs based on user input. These are for informational purposes only and do not replace professional travel advice.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-600 mb-6">
                You must be at least 18 years old to purchase or use our paid services.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Payments</h2>
              <p className="text-gray-600 mb-6">
                Payments are processed securely via Stripe. Subscriptions renew automatically unless canceled before the renewal date.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Use of Service</h2>
              <p className="text-gray-600 mb-6">
                You agree not to misuse Travel Brief, attempt unauthorized access, or resell our service without permission.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-600 mb-6">
                All site content, branding, and generated materials remain the property of Travel Brief. You may use generated travel briefs for personal use only.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 mb-6">
                Travel Brief is not responsible for errors, outdated recommendations, closures of venues, or changes to travel regulations. Always verify important details before travel.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
              <p className="text-gray-600 mb-6">
                We may update these terms at any time. Updates will be posted on this page.
              </p>

              <p className="text-gray-600 mb-6">
                For questions, contact: contact@travelbrief.ai
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}