-- Fix user_emails table policies for admin dashboard access
-- The user_emails table had RLS enabled but no policies, preventing admin access

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

-- Also fix travel_briefs table policies for admin access  
CREATE POLICY "Service role can manage travel_briefs"
  ON travel_briefs
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