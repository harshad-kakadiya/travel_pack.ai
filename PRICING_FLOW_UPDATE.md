# Updated Payment Flow: $39 Plan from Pricing Page

## Summary of Changes

The payment flow has been updated to handle two distinct scenarios:

### Flow 1: $39 Plan Selected from Pricing Page (NEW)
When users select the $39 yearly plan **before** filling out trip details:

1. **Pricing Page** → User clicks "Yearly Unlimited ($39)"
2. **Authentication** → Sign up / Login (if not authenticated)
3. **Stripe Payment** → Complete $39 subscription payment
4. **Redirect to /plan** → User lands on plan page with success banner
5. **Fill Trip Details** → User fills out travel information
6. **Generate PDF** → User completes form and generates their first travel brief

### Flow 2: Standard Flow with Existing Trip Data
When users already have trip data (either $5 or $39 plan):

1. **Plan Page** → Fill out trip details
2. **Preview/Payment** → Choose plan and complete payment
3. **Success Page** → Automatic PDF generation

## Technical Implementation

### 1. Frontend Changes

#### `src/pages/Pricing.tsx`
- Modified `handleYearlyCheckout()` to detect if user has valid trip data
- If **no trip data** exists:
  - Sets `yearly_subscription_pending` flag in localStorage
  - Passes `redirectToPlan: true` to checkout session
  - User redirected to `/plan` after payment
- If **trip data exists**:
  - Creates pending session with trip data
  - User redirected to `/success` for immediate PDF generation

#### `src/pages/Plan.tsx`
- Added `useSearchParams` to detect `subscription_complete=true` parameter
- Added subscription success banner with:
  - Green success styling
  - Congratulatory message about unlimited briefs
  - Clear call-to-action to fill out trip details
  - Dismissible close button
- Auto-clears URL parameter and localStorage flag after display

#### `src/lib/stripe.ts`
- Updated `CreateCheckoutSessionRequest` interface
- Added optional `redirectToPlan?: boolean` parameter

### 2. Backend Changes

#### `supabase/functions/create-checkout-session/index.ts`
- Extracts `redirectToPlan` from request body
- Conditionally sets Stripe success URL:
  - If `redirectToPlan = true`: redirects to `/plan?subscription_complete=true`
  - Otherwise: redirects to `/success?session_id={CHECKOUT_SESSION_ID}`

## User Experience

### Scenario A: Direct $39 Purchase (No Trip Data)
```
User Journey:
1. Visit Pricing Page
2. Click "Yearly Unlimited ($39)"
3. Sign up/Login
4. Complete Stripe payment
5. ✅ Success banner appears on /plan page
6. Fill out trip details
7. Generate unlimited travel briefs
```

### Scenario B: Standard Flow with Trip Data
```
User Journey:
1. Fill out trip details on /plan
2. Preview and select plan
3. Complete payment (either $5 or $39)
4. ✅ Automatic PDF generation on /success page
```

## Key Features

✅ **Smart Detection**: Automatically detects if trip data exists  
✅ **Seamless UX**: No confusion - users know exactly what to do next  
✅ **Clear Messaging**: Success banner confirms subscription activation  
✅ **Flexible Payment**: Both flows supported without conflicts  
✅ **No Data Loss**: localStorage flags ensure proper routing  

## Environment Variables (Optional)

You can optionally set these environment variables in Supabase:

- `STRIPE_SUCCESS_URL_PLAN`: Custom URL for plan page redirect (default: `https://travelbrief.ai/plan?subscription_complete=true`)
- `STRIPE_SUCCESS_URL`: Standard success URL (default: `https://travelbrief.ai/success?session_id={CHECKOUT_SESSION_ID}`)

## Testing Checklist

- [ ] Click $39 plan from pricing page (not logged in) → Should show auth modal
- [ ] Complete auth → Should redirect to Stripe
- [ ] Complete Stripe payment → Should redirect to /plan with success banner
- [ ] Success banner should be green with checkmark icon
- [ ] Banner should be dismissible
- [ ] Fill out trip form → Should work normally
- [ ] Generate PDF → Should work with subscription
- [ ] Test with existing trip data → Should still redirect to /success
- [ ] Test $5 plan → Should still work normally

## Files Modified

1. `src/pages/Pricing.tsx` - Added trip data detection logic
2. `src/pages/Plan.tsx` - Added subscription success banner
3. `src/lib/stripe.ts` - Added TypeScript interface update
4. `supabase/functions/create-checkout-session/index.ts` - Added conditional redirect logic

## No Breaking Changes

✅ All existing flows continue to work as before  
✅ Backward compatible with current user behavior  
✅ No database schema changes required  
