# Supabase itineraries (auto-expiring links)

1) Run SQL in Studio → SQL:
   supabase/sql/001_itineraries.sql

2) Deploy Edge Functions (Supabase CLI):
   supabase login
   supabase link --project-ref <YOUR_PROJECT_REF>
   supabase functions deploy create-itinerary
   supabase functions deploy get-itinerary
   supabase functions deploy purge-itineraries

3) Set Function env vars (Studio → Project Settings → Functions → Environment Variables):
   SUPABASE_URL = https://<YOUR_REF>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = <service role key>
   PUBLIC_BASE_URL = https://www.travelpack.ai

4) Schedule purge (Studio → Edge Functions → Schedules):
   Run "purge-itineraries" daily, e.g. cron "0 3 * * *".

5) App env: VITE_FUNCTIONS_BASE=https://<REF>.functions.supabase.co.

## Stripe Webhook (Supabase Edge Function)

**What it does:** Verifies Stripe webhook signatures (using STRIPE_WEBHOOK_SECRET). On `checkout.session.completed`, it reads `session.metadata.itinerary` (JSON) and inserts into `public.itineraries`, then logs the public link.

### Environment variables (Studio → Project Settings → Functions → Environment Variables)
- `STRIPE_SECRET_KEY` — your Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET` — the `whsec_...` from your Stripe webhook endpoint
- `SUPABASE_URL` — https://<YOUR_REF>.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` — service role key
- `PUBLIC_BASE_URL` — e.g., https://www.travelpack.ai

### Deploy
```bash
supabase functions deploy stripe-webhook
```