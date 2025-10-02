/* deno-lint-ignore-file no-explicit-any */
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helpers
function json(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

function corsHeaders(methods: string) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": methods,
    "access-control-allow-headers": "*",
  };
}

// Main
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders("POST,OPTIONS") });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publicBase = Deno.env.get("PUBLIC_BASE_URL") ?? "https://www.travelbrief.ai";

  if (!secretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return json({ error: "Missing required environment variables" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const sig = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    // Use raw body + webhook secret to verify authenticity
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
  } catch (e: any) {
    console.error("[stripe-webhook] signature verification failed:", e?.message);
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  // Prepare DB client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session: any = event.data.object;
        // Expect your Checkout Session to include itinerary data in metadata
        // e.g., metadata.itinerary = JSON.stringify({ tripId, tripTitle, startDate, endDate, days })
        const meta = session?.metadata || {};
        let itinerary: any = null;
        try {
          if (typeof meta.itinerary === "string") {
            itinerary = JSON.parse(meta.itinerary);
          }
        } catch {}

        if (itinerary && itinerary.tripId && itinerary.startDate && itinerary.endDate && Array.isArray(itinerary.days)) {
          // Insert itinerary and return public link
          const { data, error } = await supabase
            .from("itineraries")
            .insert({
              trip_id: itinerary.tripId,
              trip_title: itinerary.tripTitle ?? null,
              start_date: itinerary.startDate,
              end_date: itinerary.endDate,
              days: itinerary.days,
            })
            .select("public_id")
            .single();

          if (error) {
            console.error("[stripe-webhook] DB insert error:", error.message);
          } else {
            const link = `${publicBase}/itinerary/${data.public_id}/day/1`;
            console.log("[stripe-webhook] itinerary created:", link);
          }
        } else {
          console.log("[stripe-webhook] no itinerary metadata present; skipping DB insert.");
        }
        break;
      }
      default: {
        // You can log other events or ignore
        console.log("[stripe-webhook] event:", event.type);
      }
    }

    return json({ received: true }, { status: 200 });
  } catch (e: any) {
    console.error("[stripe-webhook] handler error:", e?.message);
    return json({ error: e?.message ?? "Unhandled error" }, { status: 500 });
  }
});