-- Fix user_emails table policies for admin dashboard access
-- Run this script in your Supabase SQL Editor to fix the admin dashboard user data issue

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service role can manage user_emails" ON user_emails;
DROP POLICY IF EXISTS "Authenticated users can insert their own email" ON user_emails;
DROP POLICY IF EXISTS "Authenticated users can update their own email" ON user_emails;
DROP POLICY IF EXISTS "Service role can manage pending_sessions" ON pending_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert pending_sessions" ON pending_sessions;
DROP POLICY IF EXISTS "Authenticated users can update their own pending_sessions" ON pending_sessions;
DROP POLICY IF EXISTS "Authenticated users can read their own pending_sessions" ON pending_sessions;
DROP POLICY IF EXISTS "Service role can manage travel_briefs" ON travel_briefs;
DROP POLICY IF EXISTS "Authenticated users can insert travel_briefs" ON travel_briefs;
DROP POLICY IF EXISTS "Authenticated users can read travel_briefs" ON travel_briefs;

-- Allow service role to perform all operations on user_emails (for admin dashboard)
CREATE POLICY "Service role can manage user_emails"
  ON user_emails
  FOR ALL
  TO service_role
  USING (true);

-- Allow authenticated users to insert their own email record
CREATE POLICY "Authenticated users can insert their own email"
  ON user_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own email record
CREATE POLICY "Authenticated users can update their own email"
  ON user_emails
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also fix pending_sessions table policies for admin access
CREATE POLICY "Service role can manage pending_sessions"
  ON pending_sessions
  FOR ALL
  TO service_role
  USING (true);

-- Allow authenticated users to insert their own pending sessions
CREATE POLICY "Authenticated users can insert pending_sessions"
  ON pending_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own pending sessions
CREATE POLICY "Authenticated users can update their own pending_sessions"
  ON pending_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own pending sessions
CREATE POLICY "Authenticated users can read their own pending_sessions"
  ON pending_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Also fix travel_briefs table policies for admin access  
CREATE POLICY "Service role can manage travel_briefs"
  ON travel_briefs
  FOR ALL
  TO service_role
  USING (true);

-- Allow authenticated users to insert travel briefs
CREATE POLICY "Authenticated users can insert travel_briefs"
  ON travel_briefs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read travel briefs
CREATE POLICY "Authenticated users can read travel_briefs"
  ON travel_briefs
  FOR SELECT
  TO authenticated
  USING (true);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_emails', 'pending_sessions', 'travel_briefs')
ORDER BY tablename, policyname;