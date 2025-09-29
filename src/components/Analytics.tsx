import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export function Analytics() {
  const location = useLocation();
  const GA_ID = import.meta.env.VITE_GA_ID;

  useEffect(() => {
    if (!GA_ID) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    return () => {
      document.head.removeChild(script);
    };
  }, [GA_ID]);

  // Track page views
  useEffect(() => {
    if (!GA_ID || !window.gtag) return;

    window.gtag('config', GA_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location, GA_ID]);

  return null;
}

// Analytics event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  const GA_ID = import.meta.env.VITE_GA_ID;
  if (!GA_ID || !window.gtag) return;

  window.gtag('event', eventName, {
    event_category: 'engagement',
    ...parameters,
  });
};

export const trackPricingCTA = (plan: string) => {
  trackEvent('pricing_cta_click', {
    event_category: 'conversion',
    plan_type: plan,
  });
};

export const trackCheckoutRedirect = (plan: string) => {
  trackEvent('checkout_redirect', {
    event_category: 'conversion',
    plan_type: plan,
  });
};

export const trackDownloadComplete = (fileType: string) => {
  trackEvent('travel_pack_download', {
    event_category: 'conversion',
    file_type: fileType,
  });
};