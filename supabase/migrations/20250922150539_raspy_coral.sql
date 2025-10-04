/*
  # Travel Brief Database Schema

  1. New Tables
    - `pending_sessions`
      - Stores user trip data before and after payment
      - Links to Stripe sessions for payment tracking
    - `booking_data`  
      - Extracted data from user uploads (OCR results)
    - `travel_briefs`
      - Generated travel briefs with file URLs
    - `user_emails`
      - User email tracking and plan management
    - `logs_errors` & `logs_performance`
      - System logging for debugging

  2. Security
    - Enable RLS on all tables
    - Functions serve as access layer for security

  3. Storage Buckets
    - `travel-uploads` for user uploaded files
    - `travel-packs` for generated HTML/PDF files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('travel-uploads', 'travel-uploads', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('travel-packs', 'travel-packs', false, 52428800, ARRAY['text/html', 'application/pdf']);

-- Pending sessions table
CREATE TABLE IF NOT EXISTS pending_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  persona text,
  passport_country_code text,
  passport_country_label text,
  start_date date,
  end_date date,
  trip_duration_days integer,
  destinations jsonb DEFAULT '[]'::jsonb,
  group_size integer,
  budget text,
  upload_keys jsonb DEFAULT '[]'::jsonb,
  client_ip text,
  customer_email text,
  has_paid boolean DEFAULT false,
  plan_type text, -- 'one_time' | 'yearly' | null
  paid_at timestamptz,
  status text DEFAULT 'pending', -- 'pending' | 'generating' | 'ready' | 'failed'
  brief_id uuid
);

-- Booking data table  
CREATE TABLE IF NOT EXISTS booking_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_session_id uuid REFERENCES pending_sessions(id) ON DELETE CASCADE,
  extracted jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Travel briefs table
CREATE TABLE IF NOT EXISTS travel_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_session_id uuid REFERENCES pending_sessions(id),
  customer_email text NOT NULL,
  plan_type text,
  persona text,
  passport_country_code text,
  passport_country_label text,
  start_date date,
  end_date date,
  destinations jsonb DEFAULT '[]'::jsonb,
  budget text,
  html_url text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

-- User emails table
CREATE TABLE IF NOT EXISTS user_emails (
  email text PRIMARY KEY,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  active_plan text DEFAULT 'none', -- 'yearly' | 'none' | 'one_time'
  plan_renewal_at timestamptz
);

-- Logs tables
CREATE TABLE IF NOT EXISTS logs_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  level text DEFAULT 'error',
  message text,
  meta jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS logs_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  operation text,
  duration_ms integer,
  meta jsonb DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pending_sessions_paid ON pending_sessions (has_paid, created_at);
CREATE INDEX IF NOT EXISTS idx_travel_briefs_email ON travel_briefs (customer_email, created_at);
CREATE INDEX IF NOT EXISTS idx_user_emails_plan ON user_emails (active_plan, plan_renewal_at);

-- RLS Policies
ALTER TABLE pending_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_performance ENABLE ROW LEVEL SECURITY;

-- Storage policies for travel-uploads bucket
CREATE POLICY "Allow authenticated uploads to travel-uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'travel-uploads');

CREATE POLICY "Allow authenticated read from travel-uploads"  
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'travel-uploads');

-- Storage policies for travel-packs bucket  
CREATE POLICY "Allow service role full access to travel-packs"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'travel-packs');

CREATE POLICY "Allow public read from travel-packs"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'travel-packs');