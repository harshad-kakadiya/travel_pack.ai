/* deno-lint-ignore-file no-explicit-any */
/* deno-lint-ignore-file no-explicit-any */
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "content-type": "application/json", "access-control-allow-origin": "*" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...headers,
        "access-control-allow-methods": "GET,OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const url = new URL(req.url);
    const publicId = url.searchParams.get("id") || url.pathname.split("/").pop();
    if (!publicId) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from("itineraries")
      .select("public_id, trip_id, trip_title, start_date, end_date, days, expires_at")
      .eq("public_id", publicId)
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers });
    if (new Date(data.expires_at) <= new Date()) {
      return new Response(JSON.stringify({ error: "Expired" }), { status: 404, headers });
    }

    return new Response(JSON.stringify({
      publicId: data.public_id,
      tripId: data.trip_id,
      tripTitle: data.trip_title,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days
    }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), { status: 500, headers });
  }
});