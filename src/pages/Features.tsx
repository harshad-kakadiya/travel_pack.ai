import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { features } from '../data/features';
import { CTAFeatures } from '../components/CTAFeatures';
import Reveal from '../components/Reveal';

export function Features() {
  return (
    <>
      <SEOHead
        title="Features – TravelPack.ai"
        description="From personalized itineraries to safety guidance, packing lists, and offline access, see everything TravelPack.ai offers."
      />
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16" variant="fade" duration={800}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Perfect Travel
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Travel Pack combines AI intelligence with travel expertise to create 
            comprehensive, personalized travel guides that work offline.
          </p>
        </Reveal>

        {/* Hero Feature */}
        <Reveal className="bg-blue-600 rounded-2xl p-8 md:p-12 text-white mb-16" variant="fade-up">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                AI-Powered Personalization
              </h2>
              <p className="text-lg text-blue-100 mb-6">
                Our AI analyzes your travel style, destination, dates, and preferences
                to create a travel guide that's uniquely yours.
              </p>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Tailored to your travel experience level
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Passport-specific visa requirements
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Weather-based recommendations
                </li>
              </ul>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-4 bg-white bg-opacity-30 rounded"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-3/4"></div>
                <div className="h-4 bg-white bg-opacity-25 rounded w-1/2"></div>
                <div className="h-20 bg-white bg-opacity-15 rounded"></div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Feature Grid */}
        <Reveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" variant="fade-up">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Complete Itineraries
            </h3>
            <p className="text-gray-600">
              Day-by-day plans with must-see attractions, hidden gems, and optimal routing 
              based on your trip duration and interests.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Safety & Security
            </h3>
            <p className="text-gray-600">
              Local safety tips, emergency contacts, scam alerts, and cultural customs 
              to keep you safe and respectful during your travels.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🛂</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Visa & Documentation
            </h3>
            <p className="text-gray-600">
              Passport-specific entry requirements, visa information, and all the 
              documentation you need for hassle-free travel.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Time-Optimized Planning
            </h3>
            <p className="text-gray-600">
              Efficient routing, opening hours, and timing recommendations to maximize 
              your experience within your available time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Persona-Based Advice
            </h3>
            <p className="text-gray-600">
              Whether you're a first-time traveler, solo female, or traveling with family, 
              get advice tailored to your specific needs and situation.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Offline-Ready Format
            </h3>
            <p className="text-gray-600">
              Beautiful PDF format that works without internet. Perfect for when 
              you're exploring without data or WiFi connectivity.
            </p>
          </div>
        </Reveal>

        {/* Persona-Specific Features */}
        <Reveal className="bg-white rounded-2xl p-8 md:p-12 shadow-sm mb-16" variant="fade-up">
          <Reveal as="h2" className="text-3xl font-bold text-gray-900 mb-8 text-center" variant="fade">
            Tailored to Your Travel Style
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Reveal key={index} variant="fade-up" delay={index * 60}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full mb-3 inline-block">
                    {feature.category}
                  </span>
                  <div className="text-2xl mb-4">{feature.emoji}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
      {/* CTA Section */}
      <div className="mt-16">
        <CTAFeatures />
      </div>
    </div>
    </>
  );
}