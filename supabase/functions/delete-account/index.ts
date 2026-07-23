import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const webOrigin = Deno.env.get("APP_ORIGIN") ?? "https://raschaski.github.io";

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const isLocalWeb = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isNativeApp = origin === "https://localhost" || origin === "capacitor://localhost";
  const permittedOrigin = origin === webOrigin || isLocalWeb || isNativeApp ? origin : webOrigin;

  return {
    "Access-Control-Allow-Origin": permittedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return jsonResponse(request, { error: "Methode nicht erlaubt" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return jsonResponse(request, { error: "Anmeldung erforderlich" }, 401);

  let payload: { confirmation?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(request, { error: "Ungültige Anfrage" }, 400);
  }
  if (payload.confirmation !== "DELETE") return jsonResponse(request, { error: "Bestätigung fehlt" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(request, { error: "Server-Konfiguration unvollständig" }, 503);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return jsonResponse(request, { error: "Ungültige Sitzung" }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Account deletion failed", deleteError.message);
    return jsonResponse(request, { error: "Konto konnte nicht gelöscht werden" }, 500);
  }

  return jsonResponse(request, { deleted: true });
});
