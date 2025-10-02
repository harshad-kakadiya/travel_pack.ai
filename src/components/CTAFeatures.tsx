import React from 'react';
import { Link } from 'react-router-dom';

export function CTAFeatures() {
  return (
    <section className="relative overflow-hidden rounded-3xl mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url('/images/beach.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative z-10 text-center p-10 sm:p-12 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Create Your Perfect Travel Brief?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of travelers who trust Travel Brief for their adventures. Get started in minutes and travel with confidence.
        </p>
        <Link
          to="/plan"
          className="bg-white hover:bg-gray-100 text-blue-950 px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          aria-label="Start Planning Your Trip"
        >
          Start Planning Your Trip
        </Link>
      </div>
    </section>
  );
}