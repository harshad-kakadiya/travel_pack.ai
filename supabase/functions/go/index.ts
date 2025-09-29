/* deno-lint-ignore-file no-explicit-any */
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function notFound(msg = "Not found") {
  return new Response(JSON.stringify({ error: msg }), {
    status: 404,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  }
  if (req.method !== "GET") return notFound("Use GET");

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const slug = parts[parts.length - 1] || "";

    if (!slug) return notFound("Missing slug");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: link, error } = await supabase
      .from("affiliate_links")
      .select("url")
      .eq("slug", slug)
      .single();

    if (error || !link) return notFound("Link not found");

    // Fire-and-forget click log
    try {
      await supabase.from("affiliate_clicks").insert({
        slug,
        ua: req.headers.get("user-agent"),
        referrer: req.headers.get("referer") ?? req.headers.get("referrer"),
      });
    } catch (_) {}

    return new Response(null, {
      status: 302,
      headers: {
        "Location": link.url,
        "access-control-allow-origin": "*",
      },
    });
  } catch (e) {
    return notFound(e?.message ?? "Error");
  }
});
