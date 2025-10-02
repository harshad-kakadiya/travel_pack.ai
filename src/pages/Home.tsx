import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin, Clock, Shield, Globe, Calendar, Navigation, Phone, FileText, Package, AlertTriangle, MessageCircle, CreditCard, Map, User, Camera, ShoppingBag } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { features } from '../data/features';
import Reveal from '../components/Reveal';
import { AuthExample } from '../components/AuthExample';

export function Home() {
  return (
    <>
      <SEOHead
        title="TravelPack.ai – Your Trip, Planned in Minutes"
        description="Generate personalized, AI-powered travel briefs with itineraries, packing lists, safety info, and offline tips. Tailored for every type of traveler."
      />
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <picture aria-hidden="true" className="absolute inset-0 block">
          <source type="image/webp" srcSet="/images/mathew-schwartz-s87bBFZviAU-unsplash.webp" />
          <img src="/images/mathew-schwartz-s87bBFZviAU-unsplash.jpg" alt="" className="w-full h-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal variant="fade" duration={800}>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Your Perfect Trip,
                <span className="text-amber-500"> Personalized</span>
              </h1>
            </Reveal>
            
            <Reveal variant="fade-up" delay={200}>
              <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Your trip, planned in minutes. A complete AI-curated guide with itineraries, safety tips, packing essentials and more, beautifully formatted as a PDF.
              </p>
            </Reveal>
            
            <Reveal variant="fade-up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/plan"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Your Travel Pack
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/examples"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 transition-colors"
                >
                  See Examples
                </Link>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={600}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">📥</span>
                  <span className="text-sm font-medium text-gray-100">Works Offline</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">🎨</span>
                  <span className="text-sm font-medium text-gray-100">Personalized</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">⚡</span>
                  <span className="text-sm font-medium text-gray-100">Ready in Minutes</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">🔒</span>
                  <span className="text-sm font-medium text-gray-100">Secure Payment</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <Reveal as="section" className="bg-white py-20" variant="fade-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16" variant="fade">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop juggling apps and websites. Upload your tickets and bookings to instantly create a complete AI-powered travel brief that works offline and fits in your pocket.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Reveal variant="fade-up" delay={0}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Persona-Based Planning
                </h3>
                <p className="text-gray-600">
                  Whether you're a first-time traveler or a seasoned explorer, 
                  get advice tailored to your experience level and travel style.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={60}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Complete Itineraries
                </h3>
                <p className="text-gray-600">
                  Day-by-day plans with must-see attractions, local tips, 
                  and hidden gems based on your trip duration and interests.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">🛂</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Safety & Visa Info
                </h3>
                <p className="text-gray-600">
                  Passport-specific visa requirements, safety tips, 
                  and local customs to keep you prepared and secure.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={180}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">🎒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Smart Packing Lists
                </h3>
                <p className="text-gray-600">
                  Climate-aware packing suggestions and travel essentials 
                  customized for your destination and travel dates.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={240}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">💸</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Budget Planning
                </h3>
                <p className="text-gray-600">
                  Cost breakdowns, money-saving tips, and budget-appropriate 
                  recommendations for your chosen spending level.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">📑</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Upload Your Travel Docs
                </h3>
                <p className="text-gray-600">
                  Upload your tickets and bookings to instantly create a complete AI-curated Travel Pack — no extra effort needed.
                </p>
              </div>
            </Reveal>
          </div>

        </div>
      </Reveal>

      {/* Testimonials Section */}
      <Reveal as="section" className="bg-white py-20" variant="fade-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16" variant="fade">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Travelers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of travelers who trust Travel Pack for their adventures
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* New Traveler */}
            <Reveal variant="fade-up" delay={0}>
              <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    New Traveler
                  </span>
                </div>
                <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                  "As a first-time traveler, this gave me confidence from the airport to my hotel. No stress at all."
                </blockquote>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Anna, 22</span> • USA
                </div>
              </div>
            </Reveal>

            {/* Experienced Traveler */}
            <Reveal variant="fade-up" delay={60}>
              <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Experienced Traveler
                  </span>
                </div>
                <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                  "I've been to 30+ countries, but this packed everything I needed into one place. Saved me hours."
                </blockquote>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Daniel, 34</span> • UK
                </div>
              </div>
            </Reveal>

            {/* Solo Female Traveler */}
            <Reveal variant="fade-up" delay={120}>
              <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Solo Female Traveler
                  </span>
                </div>
                <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                  "Safety tips and vetted services made me feel secure exploring on my own."
                </blockquote>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Aisha, 28</span> • Canada
                </div>
              </div>
            </Reveal>

            {/* Minor/Under 18 */}
            <Reveal variant="fade-up" delay={180}>
              <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 md:col-start-1 lg:col-start-auto">
                <div className="mb-4">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    Minor / Under 18
                  </span>
                </div>
                <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                  "Traveling with my parents was so much easier when we had all the rules and contacts ready."
                </blockquote>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Leo, 17</span> • Germany
                </div>
              </div>
            </Reveal>

            {/* Family Traveler */}
            <Reveal variant="fade-up" delay={240}>
              <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 md:col-start-2 lg:col-start-auto">
                <div className="mb-4">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Family Traveler
                  </span>
                </div>
                <blockquote className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                  "Packing lists and child-friendly plans were a lifesaver. Our kids had the best trip ever."
                </blockquote>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Sofia, 38</span> • Spain
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>

      {/* Authentication Example - Remove this in production */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Demo</h2>
            <p className="text-gray-600 mb-6">
              This section demonstrates the authentication system. Try signing in/up using the buttons in the header.
            </p>
          </div>
          <AuthExample />
        </div>
      </section>

      {/* Comprehensive Features Section */}
      <Reveal as="section" className="bg-gray-50 py-20" variant="fade-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16" variant="fade">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What's Included in Your Smart Travel PDF
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every travel pack includes these essential features, personalized for your specific trip and travel style. No hidden extras, no upsells.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </Reveal>

      {/* Credibility/Why-Us Section */}
      <Reveal as="section" className="bg-white py-20" variant="fade-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16" variant="fade">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Trusted by Travelers Worldwide
            </h2>
            
            {/* Stats Row */}
            <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" variant="fade-up" delay={200}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  10,000+
                </div>
                <p className="text-gray-600 text-lg">
                  Travel packs created
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  4.9/5
                </div>
                <p className="text-gray-600 text-lg">
                  Average rating
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  150+
                </div>
                <p className="text-gray-600 text-lg">
                  Countries covered
                </p>
              </div>
            </Reveal>
          </Reveal>

          {/* Why TravelPack.ai Sub-section */}
          <Reveal className="text-center mb-12" variant="fade">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why TravelPack.ai?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No more scattered bookings, forgotten details, or last-minute panic. Everything you need, beautifully organized.
            </p>
          </Reveal>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Reveal variant="fade-up" delay={0}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Personalized for You
                </h4>
                <p className="text-gray-600">
                  Every pack is tailored to your travel style, from solo female to family adventures.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={60}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">📱</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Works Offline
                </h4>
                <p className="text-gray-600">
                  Download your PDF and access everything without internet. Perfect for remote areas.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Generated in Seconds
                </h4>
                <p className="text-gray-600">
                  Upload your messy trip details and get a professional travel pack instantly.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>

      {/* CTA Section */}
      <section className="relative py-20">
        <picture aria-hidden="true" className="absolute inset-0 block">
          <source type="image/webp" srcSet="/images/saud-edum-ECteVg5suUg-unsplash.webp" />
          <img src="/images/saud-edum-ECteVg5suUg-unsplash.jpg" alt="" className="w-full h-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Reveal variant="zoom" duration={800}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Plan Your Perfect Trip?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who trust Travel Pack for their adventures. 
                Get started in minutes.
              </p>
              <Link
                to="/plan"
                className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Your Travel Pack
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}