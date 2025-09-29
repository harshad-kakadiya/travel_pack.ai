/*
  # Add activity preferences to pending sessions

  1. Schema Changes
    - Add activity_preferences column to pending_sessions table
    - Column stores JSON array of selected activity preference IDs

  2. Data Migration
    - Existing records will have empty array as default
    - New records can store user's activity preferences

  3. Integration
    - Frontend form captures activity preferences
    - Data flows through to travel brief generation
    - GPT prompt can use preferences for personalization
*/

-- Add activity_preferences column to pending_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pending_sessions' AND column_name = 'activity_preferences'
  ) THEN
    ALTER TABLE pending_sessions 
    ADD COLUMN activity_preferences jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update existing records to have empty array if null
UPDATE pending_sessions 
SET activity_preferences = '[]'::jsonb 
WHERE activity_preferences IS NULL;