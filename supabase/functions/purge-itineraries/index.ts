import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase
    .from("itineraries")
    .delete()
    .lt("expires_at", new Date().toISOString());

  return new Response(JSON.stringify({ ok: !error, error: error?.message }), {
    headers: { "content-type": "application/json" },
    status: error ? 500 : 200
  });
});