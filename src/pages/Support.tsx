import React from 'react';
import { Mail, MessageCircle, Book, Clock } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export function Support() {
  return (
    <>
      <SEOHead
        title="Support"
        description="Get help with TravelPack.ai. Find answers to common questions, contact our support team, and learn how to make the most of your travel briefs."
      />
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get support, find answers, and connect with our team
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Email Support
            </h2>
            <p className="text-gray-600 mb-4">
              Get in touch with our support team for any questions or issues.
            </p>
            <a
              href="mailto:support@travelpack.ai"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              support@travelpack.ai
            </a>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">⏱️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Response Time
            </h2>
            <p className="text-gray-600 mb-4">
              We typically respond within 24 hours during business days.
            </p>
            <span className="text-green-600 font-medium">
              Usually much faster!
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How quickly will I receive my Travel Pack?
              </h3>
              <p className="text-gray-600">
                Most Travel Packs are generated within 1-2 minutes after payment. 
                You'll receive an email with download links once it's ready.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What if I need to change my trip details after purchase?
              </h3>
              <p className="text-gray-600">
                With our Yearly Unlimited plan, you can generate new Travel Packs for updated trips. 
                For one-time purchases, contact support and we'll help you out.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I use Travel Pack offline?
              </h3>
              <p className="text-gray-600">
                Yes! Travel Packs are delivered as PDF files that work completely offline. 
                Perfect for when you don't have internet access while traveling.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards and digital payment methods through Stripe, 
                our secure payment processor.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We want you to be completely satisfied. If you're not happy with your Travel Pack, 
                contact us within 7 days for a full refund.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How accurate is the travel information?
              </h3>
              <p className="text-gray-600">
                Our AI is trained on up-to-date travel data, but we always recommend verifying 
                critical information like visa requirements directly with official sources.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Still need help? We're here for you.
          </p>
          <a
            href="mailto:support@travelpack.ai"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold mt-4 transition-colors"
          >
            <Mail className="h-5 w-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
    </>
  );
}