import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEOHead({ 
  title,
  description = "Generate personalized, AI-powered travel briefs with itineraries, packing lists, safety info, and offline tips. Tailored for every type of traveler.",
  image = "/og-image.png",
  url = "https://travelbrief.ai"
}: SEOHeadProps) {
  const pageTitle = title ? `${title} | TravelBrief.ai` : "TravelBrief.ai – AI-Powered Travel Packs in Minutes";
  const ogTwitterTitle = "TravelBrief.ai";
  const ogTwitterDescription = "Generate personalized, AI-powered travel briefs with itineraries, packing lists, safety info, and offline tips. Tailored for every type of traveler.";
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph */}
      <meta property="og:title" content={ogTwitterTitle} />
      <meta property="og:description" content={ogTwitterDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Travel Brief" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTwitterTitle} />
      <meta name="twitter:description" content={ogTwitterDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Helmet>
  );
}