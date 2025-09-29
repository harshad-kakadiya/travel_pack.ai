/*
  # Add cleanup function for old rate limit records

  1. Functions
    - `cleanup_old_rate_limits()` - Removes rate limit records older than 24 hours
    
  2. Purpose
    - Prevents the rate_limits table from growing indefinitely
    - Removes stale records that are no longer needed
    - Should be called periodically (e.g., via cron job or scheduled function)
*/

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete records older than 24 hours
  DELETE FROM rate_limits 
  WHERE last_reset_at < (now() - interval '24 hours');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup operation
  INSERT INTO logs_performance (operation, duration_ms, meta)
  VALUES (
    'cleanup_old_rate_limits',
    0,
    json_build_object(
      'deleted_records', deleted_count,
      'cleanup_time', now()
    )
  );
  
  RETURN deleted_count;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits() TO service_role;