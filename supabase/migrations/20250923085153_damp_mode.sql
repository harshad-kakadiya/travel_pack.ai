/*
  # Update activity preferences column type

  1. Changes
    - Convert activity_preferences column from jsonb to text[] in pending_sessions table
    - Migrate existing data safely
    - Set proper default value

  2. Migration Strategy
    - Rename existing column
    - Add new column with correct type
    - Migrate data from jsonb to text[]
    - Drop old column
*/

-- Convert activity_preferences from jsonb to text[]
ALTER TABLE public.pending_sessions
RENAME COLUMN activity_preferences TO activity_preferences_old;

-- Add new column with text[] type
ALTER TABLE public.pending_sessions
ADD COLUMN activity_preferences text[] DEFAULT '{}';

-- Migrate existing data from jsonb to text[]
UPDATE public.pending_sessions
SET activity_preferences = CASE 
  WHEN activity_preferences_old IS NOT NULL AND jsonb_typeof(activity_preferences_old) = 'array'
  THEN ARRAY(SELECT jsonb_array_elements_text(activity_preferences_old))
  ELSE '{}'::text[]
END;

-- Drop the old column
ALTER TABLE public.pending_sessions
DROP COLUMN activity_preferences_old;

-- Add comment for documentation
COMMENT ON COLUMN public.pending_sessions.activity_preferences IS 'Array of selected activity preference IDs (cultural, adventure, food, etc.)';