# Stripe Integration Setup Guide

## Overview
This guide will help you set up Stripe payment integration with your TravelBrief.ai project using Supabase Edge Functions.

## Prerequisites
- Stripe account (test mode for development)
- Supabase project with Edge Functions enabled
- Node.js and npm installed

## Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification
3. Switch to **Test mode** for development

### 1.2 Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)

## Step 2: Create Products and Prices

### 2.1 One-Time Pack Product
1. Go to **Products** → **Add Product**
2. **Name**: "Travel Pack - One Time"
3. **Description**: "One personalized Travel Pack with complete itinerary & safety info"
4. **Price**: $5.00 USD
5. **Billing**: One-time
6. **Copy the Price ID** (starts with `price_`)

### 2.2 Yearly Subscription Product
1. Go to **Products** → **Add Product**
2. **Name**: "Travel Pack - Yearly Unlimited"
3. **Description**: "Unlimited Travel Packs for one year"
4. **Price**: $39.00 USD
5. **Billing**: Recurring (yearly)
6. **Copy the Price ID** (starts with `price_`)

## Step 3: Environment Configuration

### 3.1 Update .env file
```bash
# Copy example file
cp env.example .env
```

### 3.2 Fill in your values
```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_STRIPE_SECRET_KEY=sk_test_your_actual_key_here

# Stripe Price IDs
STRIPE_PRICE_ONETIME=price_your_onetime_id_here
STRIPE_PRICE_YEARLY=price_your_yearly_id_here

# Stripe Webhook Secret (get this after creating webhook)
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 4: Deploy Supabase Functions

### 4.1 Deploy Edge Functions
```bash
# Deploy all functions
npm run supabase:deploy:functions

# Or deploy individually
supabase functions deploy create-checkout-session
supabase functions deploy verify-session-and-status
supabase functions deploy stripe-webhook
```

### 4.2 Set Environment Variables in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add the following environment variables:
   - `VITE_STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ONETIME`
   - `STRIPE_PRICE_YEARLY`
   - `VITE_STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Step 5: Set Up Stripe Webhook

### 5.1 Create Webhook Endpoint
1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
4. **Copy the Webhook Signing Secret** (starts with `whsec_`)

### 5.2 Update Environment
Add the webhook secret to your `.env` file and Supabase environment variables.

## Step 6: Test the Integration

### 6.1 Test One-Time Payment
1. Start your development server: `npm run dev`
2. Navigate to `/pricing`
3. Fill out the trip form
4. Click "Get This Pack" for one-time payment
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete the payment flow

### 6.2 Test Yearly Subscription
1. Click "Go Unlimited" for yearly subscription
2. Use the same test card
3. Verify subscription is created in Stripe Dashboard

### 6.3 Test Webhook
1. Check Supabase logs for webhook events
2. Verify `pending_sessions` table is updated
3. Check `user_emails` table for customer data

## Step 7: Production Setup

### 7.1 Switch to Live Mode
1. In Stripe Dashboard, switch to **Live mode**
2. Create live products and prices
3. Update environment variables with live keys
4. Update webhook endpoint URL
5. Redeploy functions

### 7.2 Security Considerations
- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Enable webhook signature verification
- Monitor webhook events for failures

## Troubleshooting

### Common Issues

1. **"Missing VITE_STRIPE_SECRET_KEY" error**
   - Check environment variables are set in Supabase
   - Verify the key format (starts with `sk_test_` or `sk_live_`)

2. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook secret is set
   - Check Supabase function logs

3. **Payment not updating database**
   - Check webhook events in Stripe Dashboard
   - Verify `pending_session_id` is passed correctly
   - Check database permissions

4. **CORS errors**
   - Ensure CORS headers are set in Edge Functions
   - Check domain is allowed in Stripe settings

### Debug Commands

```bash
# Check Supabase function logs
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook

# Test webhook locally
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## File Structure

```
src/
├── components/
│   ├── StripeCheckout.tsx     # Optional Stripe Elements component
│   └── ...
├── lib/
│   └── stripe.ts              # Stripe API functions
├── pages/
│   ├── Pricing.tsx            # Pricing page with checkout
│   ├── CheckoutSuccess.tsx    # Success page
│   └── ...
└── ...

supabase/functions/
├── create-checkout-session/   # Creates Stripe checkout sessions
├── verify-session-and-status/ # Verifies payment status
└── stripe-webhook/           # Handles Stripe webhooks
```

## Support

For issues with this integration:
1. Check the troubleshooting section above
2. Review Stripe Dashboard for payment status
3. Check Supabase logs for function errors
4. Verify all environment variables are set correctly
