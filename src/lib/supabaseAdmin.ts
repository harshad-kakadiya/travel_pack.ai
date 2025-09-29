import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateLink {
  slug: string;
  url: string;
  label: string;
  created_at: string;
}

export interface AffiliateClick {
  id: string;
  slug: string;
  ts: string;
  ua: string | null;
  referrer: string | null;
}

export interface Itinerary {
  id: string;
  public_id: string;
  trip_title: string | null;
  persona: string | null;
  destinations: any | null;
  web_link: string | null;
  paid: boolean;
  created_at: string;
  start_date: string;
  end_date: string;
}