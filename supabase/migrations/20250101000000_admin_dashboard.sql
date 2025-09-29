-- Admin Dashboard Migration
-- Creates tables for blog posts, affiliate tracking, and admin functionality

-- Create blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read blog posts
CREATE POLICY "Public can read blog posts"
  ON public.blog_posts
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update/delete blog posts
CREATE POLICY "Service role can manage blog posts"
  ON public.blog_posts
  FOR ALL
  TO service_role
  USING (true);

-- Create affiliate links table
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  slug text PRIMARY KEY,
  url text NOT NULL,
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on affiliate_links
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Public can read affiliate links
CREATE POLICY "Public can read affiliate links"
  ON public.affiliate_links
  FOR SELECT
  TO public
  USING (true);

-- Only service role can manage affiliate links
CREATE POLICY "Service role can manage affiliate links"
  ON public.affiliate_links
  FOR ALL
  TO service_role
  USING (true);

-- Create affiliate clicks table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL REFERENCES public.affiliate_links(slug) ON DELETE CASCADE,
  ts timestamptz DEFAULT now(),
  ua text,
  referrer text
);

-- Enable RLS on affiliate_clicks
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Public can insert clicks
CREATE POLICY "Public can insert affiliate clicks"
  ON public.affiliate_clicks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only service role can read affiliate clicks
CREATE POLICY "Service role can read affiliate clicks"
  ON public.affiliate_clicks
  FOR SELECT
  TO service_role
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_slug ON public.affiliate_clicks(slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ts ON public.affiliate_clicks(ts);

-- Update itineraries table to include persona and destinations for admin stats
-- Add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itineraries' AND column_name = 'persona') THEN
    ALTER TABLE public.itineraries ADD COLUMN persona text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itineraries' AND column_name = 'destinations') THEN
    ALTER TABLE public.itineraries ADD COLUMN destinations jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itineraries' AND column_name = 'web_link') THEN
    ALTER TABLE public.itineraries ADD COLUMN web_link text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itineraries' AND column_name = 'paid') THEN
    ALTER TABLE public.itineraries ADD COLUMN paid boolean DEFAULT false;
  END IF;
END $$;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_itineraries_persona ON public.itineraries(persona);
CREATE INDEX IF NOT EXISTS idx_itineraries_paid ON public.itineraries(paid);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at);