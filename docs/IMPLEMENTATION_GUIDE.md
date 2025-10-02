## Implementation Guide: OpenAI, Affiliate Links, Auth, Images, Stripe

This document explains how we implemented and configured the following features:
- OpenAI integration (client helpers and Supabase Functions)
- Affiliate links (listing, tracking clicks)
- Authentication (Supabase Auth context)
- Image handling fixes (public uploads to `blog_image` bucket)
- Stripe payments (checkout + session verification)
 - Admin dashboard at `/admin` with full blog CRUD

### OpenAI Integration

There are two layers:

1) Client helper (dev/testing only)
```1:60:src/lib/openai.ts
/**
 * Direct OpenAI API Client
 * 
 * WARNING: Calling OpenAI directly from the frontend exposes your API key.
 * This should only be used for:
 * 1. Testing/development with a separate API key
 * 2. Server-side calls (like in Supabase Edge Functions)
 */
export class OpenAIClient {
  // ... chat, complete, generateJSON, generateTravelBrief
}
```

2) Supabase Function (recommended for prod)
```1:50:supabase/functions/create-itinerary/index.ts
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ... POST handler, insert into itineraries, return public link using PUBLIC_BASE_URL
```

Additional client wrapper that invokes an OpenAI function via Supabase Functions:
```1:40:src/lib/openaiClient.ts
export async function callOpenAITravelPlanning(tripData, promptType = 'travel_brief') {
  // validateTripData(...) then supabase.functions.invoke('openai', { body: { tripData, promptType } })
}
```

Env vars:
- `VITE_OPENAI_API_KEY` (dev only in browser)
- Function secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_BASE_URL`

### Affiliate Links

Component to render and track partner links:
```1:118:src/components/AffiliateLinks.tsx
// Fetches from /rest/v1/affiliate_links using anon key
// Tracks clicks via RPC increment_affiliate_clicks
// Opens partner URL in a new tab
```

Simple helper for internal redirect paths (optional):
```1:6:src/components/AffiliateLink.tsx
export default function AffiliateLink({ slug, children, ...props }) {
  return <a href={`/go/${slug}`} rel="nofollow sponsored" {...props}>{children}</a>;
}
```

Required env:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Database requirements:
- Table `affiliate_links` with columns: slug, url, label, clicks
- SQL RPC: `increment_affiliate_clicks(link_slug text)` to track clicks

### Authentication (Supabase)

Centralized auth context:
```1:80:src/context/AuthContext.tsx
// Initializes session from supabase.auth.getSession(),
// subscribes to onAuthStateChange, exposes signUp/signIn/signOut/resetPassword
```

Usage:
- Wrap app in `AuthProvider` (already in `src/App.tsx`)
- Call `useAuth()` to access `user`, `session`, and auth actions

Env:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Image Handling Fixes (Blog Image Uploads)

Public client and upload helper:
```1:62:src/lib/supabasePublic.ts
export const supabasePublic = createClient(...persistSession:false);
export async function uploadImageToBlogBucket(file, filename) { /* uploads to blog_image and returns public URL */ }
```

UI component with validation, progress, filters, and URL support:
```1:120:src/components/ImageUpload.tsx
// Validates type/size, previews image, simulates progress,
// uploads to `blog_image` bucket via uploadImageToBlogBucket,
// supports simple grayscale/sepia/brightness filters and direct URL input
```

Server configuration:
- Storage bucket: `blog_image` (public)
- Policies: allow public uploads as configured in `supabase/migrations/*_create_blog_image_bucket.sql` and related fixes

### Stripe Payments

Client helpers:
```1:52:src/lib/stripe.ts
export async function createCheckoutSession(params) { /* calls functions/v1/create-checkout-session */ }
export async function verifySessionAndStatus(sessionId) { /* calls functions/v1/verify-session-and-status */ }
```

Supabase Functions (server-side):
- `create-checkout-session`: Creates Stripe Checkout Session and returns URL
- `verify-session-and-status`: Verifies successful payment and updates status
- `stripe-webhook`: Processes Stripe events (if enabled)

Env:
- Client: `VITE_STRIPE_PUBLISHABLE_KEY`
- Server: `STRIPE_SECRET_KEY`
- Supabase Function secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, any Stripe keys as needed

### Admin Dashboard (/admin) and Blog CRUD

Route and access:
- Admin login: `/admin/login` (password-gated via API token). On success, redirects to `/admin`.
- Dashboard + Blog management live at `/admin` with tabs.

UI implementation:
```1:60:src/pages/admin/login.tsx
// Simple password form posts to /api/admin/login and redirects to /admin on success
```

```1:120:src/pages/admin/index.tsx
// Tabs for Dashboard and Blog Management
// Dashboard shows stats and Stripe summary (via /api/admin/stats and /api/admin/stripe-summary)
// Blog Management provides create, update, delete (CRUD) for posts
```

API endpoints (server):
```1:105:src/pages/api/admin/blog/index.ts
// GET: list posts; POST: create post (uploads data-URL images to `blog_image` bucket)
```

```1:116:src/pages/api/admin/blog/[id].ts
// PUT: update post (handles data-URL image uploads); DELETE: remove post
```

Auth for admin APIs:
- Admin token utilities: `getAdminTokenFromRequest`, `isAdminTokenValid` are used to protect routes
- Configure the admin secret/password in environment per `VITE_ADMIN_PASSWORD` (and matching server validation)

Dynamic blog on the site:
```1:120:src/pages/Blog.tsx
// Lists published posts from Supabase `blog_posts` with graceful fallback content
```

```1:260:src/pages/BlogPost.tsx
// Fetches a post by slug; falls back to static content if not found
```

Database requirements:
- Table `blog_posts` with fields: id (uuid), title, slug (unique), content (text), published_date (timestamptz), read_time (text), image_url (text), created_at, updated_at
- Storage bucket: `blog_image` (public) for post images
- RLS policies allowing read for public posts; admin CRUD via service role

### Testing Checklist
- OpenAI: Validate trip form → call function → verify JSON structure
- Affiliate: Verify list renders and clicks increment via RPC
- Auth: Sign up/in/out flows; password reset email redirect to `/reset-password`
- Images: Upload JPEG/PNG/WebP under 10MB; confirm public URL works
- Stripe: Create session → redirect to Checkout → success/cancel callbacks → status verified

### Troubleshooting
- 401/403 from Supabase: check anon key and RLS policies
- CORS errors on functions: ensure `access-control-allow-origin` header and OPTIONS are handled
- Image upload fails: verify bucket name `blog_image`, public read, correct content-type
- Stripe checkout URL missing: confirm function deployed and keys set

