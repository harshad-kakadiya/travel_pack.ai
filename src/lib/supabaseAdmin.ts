import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

let supabaseAdminClient = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  if (import.meta.env.DEV) {
    console.warn('[supabaseAdmin] Missing VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.');
  }
}

export const supabaseAdmin = supabaseAdminClient;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  published_date: string | null;
  read_time: string | null;
  image_url: string | null;
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