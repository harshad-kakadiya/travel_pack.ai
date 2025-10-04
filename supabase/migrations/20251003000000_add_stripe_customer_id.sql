/*
  # Add stripe_customer_id to pending_sessions

  Reason: Edge function `verify-session-and-status` updates
  `pending_sessions` with `stripe_customer_id`. If the column
  doesn't exist, updates fail after successful payment verification
  with error "Payment verified but failed to update database".
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pending_sessions'
      AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.pending_sessions
    ADD COLUMN stripe_customer_id text;

    -- Optional index if you will query by Stripe customer frequently
    CREATE INDEX IF NOT EXISTS idx_pending_sessions_stripe_customer
      ON public.pending_sessions (stripe_customer_id);
  END IF;
END $$;

