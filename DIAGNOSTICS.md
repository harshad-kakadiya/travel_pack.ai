# Launch Checklist (auto-generated)
- [x] Hero image present: /mathew-schwartz-s87bBFZviAU-unsplash.jpg (+webp)
- [x] Home CTA image present: /saud-edum-ECteVg5suUg-unsplash.jpg (+webp)
- [x] Features CTA image present: /images/features-cta.jpg (+webp)
- [x] Cancel page added at /cancel and routed
- [x] Stripe create-checkout-session function present (two prices, promo + tax on)
- [x] Stripe webhook function present (creates itinerary when metadata provided)
- [x] Itineraries SQL & functions present
- [x] Affiliate redirect system added (optional)
- [x] sitemap.xml present

## Next steps (manual)
1. Supabase Functions env:
   - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_BASE_URL
   - (optional) STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL
2. Deploy functions:
   supabase login && supabase link --project-ref <REF> &&
   supabase functions deploy create-checkout-session &&
   supabase functions deploy stripe-webhook &&
   supabase functions deploy get-itinerary &&
   supabase functions deploy purge-itineraries &&
   supabase functions deploy go
3. Stripe dashboard:
   - Create webhook (Test), copy Signing secret to Supabase env
   - Enable Stripe Tax, set business location
4. Frontend hosting env:
   - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
   - (Optional) VITE_FUNCTIONS_BASE=https://<REF>.functions.supabase.co  (for ItineraryViewer fetch)
