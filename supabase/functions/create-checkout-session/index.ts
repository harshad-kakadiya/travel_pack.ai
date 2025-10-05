/* deno-lint-ignore-file no-explicit-any */ import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12?target=deno";
function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    }
  });
}
function cors(methods) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": methods,
    "access-control-allow-headers": "*"
  };
}
// Fixed price IDs for TravelPack.ai (test or live depend on your VITE_STRIPE_SECRET_KEY env)
const PRICE_ONETIME = "price_1SAFT3PPr9IU2n0HEGf02sj4";
const PRICE_YEARLY = "price_1SAFW9PPr9IU2n0Huar8uTwj";
function resolvePrice(plan) {
  const key = (plan ?? "onetime").toLowerCase();
  if (key === "yearly") return {
    price: PRICE_YEARLY,
    mode: "subscription"
  };
  return {
    price: PRICE_ONETIME,
    mode: "payment"
  };
}
serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    headers: cors("POST,OPTIONS")
  });
  if (req.method !== "POST") return json({
    error: "Method not allowed"
  }, {
    status: 405
  });
  try {
    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret) return json({
      error: "Missing VITE_STRIPE_SECRET_KEY"
    }, {
      status: 500
    });
    // Directly use localhost:5173 for development
    const successUrl = "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}";
    const cancelUrl = "http://localhost:5173/cancel";
    const body = await req.json().catch(()=>({}));
    const { plan, tripId, tripTitle, startDate, endDate, days } = body ?? {};
    const { price, mode } = resolvePrice(plan);
    // Optional itinerary metadata (stringified)
    const metadata = {};
    try {
      if (tripId && startDate && endDate && Array.isArray(days)) {
        metadata.itinerary = JSON.stringify({
          tripId,
          tripTitle,
          startDate,
          endDate,
          days
        });
      }
    } catch  {}
    const stripe = new Stripe(secret, {
      apiVersion: "2024-06-20"
    });
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true
      },
      metadata
    });
    console.log(session, session?.url);
    return json({
      url: session.url
    }, {
      status: 200
    });
  } catch (e) {
    return json({
      error: e?.message ?? "Unknown error"
    }, {
      status: 500
    });
  }
});
