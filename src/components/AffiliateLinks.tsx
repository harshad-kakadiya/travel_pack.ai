import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';

interface AffiliateLink {
  slug: string;
  url: string;
  label: string;
  clicks: number;
}

interface AffiliateLinksProps {
  className?: string;
}

export function AffiliateLinks({ className = '' }: AffiliateLinksProps) {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAffiliateLinks();
  }, []);

  const fetchAffiliateLinks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/affiliate_links`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.ok) {
        const links = await response.json();
        setAffiliateLinks(links);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (slug: string, url: string) => {
    try {
      // Track the click
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/increment_affiliate_clicks`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link_slug: slug }),
      });

      // Open the link in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
      // Still open the link even if tracking fails
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (affiliateLinks.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Recommended Travel Resources
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        While we're preparing your personalized travel plan, check out these trusted partners:
      </p>

      <div className="grid gap-3">
        {affiliateLinks.map((link) => (
          <button
            key={link.slug}
            onClick={() => handleLinkClick(link.slug, link.url)}
            className="group flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                {link.label}
              </span>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>These links help support our free travel planning service</p>
      </div>
    </div>
  );
}