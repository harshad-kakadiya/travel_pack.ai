/* deno-lint-ignore-file no-explicit-any */
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  try {
    const { tripId, tripTitle, startDate, endDate, days } = await req.json();
    if (!tripId || !startDate || !endDate || !Array.isArray(days)) {
      return json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from("itineraries")
      .insert({ trip_id: tripId, trip_title: tripTitle ?? null, start_date: startDate, end_date: endDate, days })
      .select("public_id")
      .single();

    if (error) return json({ error: error.message }, { status: 400 });

    const base = Deno.env.get("PUBLIC_BASE_URL") ?? "https://www.travelpack.ai";
    const link = `${base}/itinerary/${data.public_id}/day/1`;
    return json({ publicId: data.public_id, link }, { status: 200 });
  } catch (e) {
    return json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
});