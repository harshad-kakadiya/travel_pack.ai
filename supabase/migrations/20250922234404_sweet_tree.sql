/*
  # Create rate limits table for abuse protection

  1. New Tables
    - `rate_limits`
      - `ip_address` (text, primary key) - Client IP address
      - `request_count` (integer, default 0) - Current request count in window
      - `last_reset_at` (timestamp) - When the count was last reset
      - `created_at` (timestamp) - When the record was created

  2. Security
    - Enable RLS on `rate_limits` table
    - Add policy for service role access only

  3. Indexes
    - Primary key on ip_address for fast lookups
    - Index on last_reset_at for cleanup operations
*/

CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address text PRIMARY KEY,
  request_count integer DEFAULT 0 NOT NULL,
  last_reset_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (for Edge Functions)
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for efficient cleanup of old records
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_reset 
  ON rate_limits (last_reset_at);

-- Index for efficient lookups by IP
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip 
  ON rate_limits (ip_address);