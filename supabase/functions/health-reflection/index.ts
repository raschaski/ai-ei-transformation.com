import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const allowedOrigin = Deno.env.get("APP_ORIGIN") ?? "https://raschaski.github.io";

function projectKey(dictionaryName: string, legacyName: string) {
  const dictionary = Deno.env.get(dictionaryName);
  if (dictionary) {
    try {
      const keys = JSON.parse(dictionary) as Record<string, unknown>;
      if (typeof keys.default === "string") return keys.default;
    } catch {
      // Bei älteren Projekten stehen weiterhin die Legacy-Variablen bereit.
    }
  }
  return Deno.env.get(legacyName);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const isLocalWeb = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  const isNativeApp = origin === "https://localhost" || origin === "capacitor://localhost";
  const permittedOrigin = origin === allowedOrigin || isLocalWeb || isNativeApp
    ? origin
    : allowedOrigin;

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

function validCheckIn(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["mood", "stress", "loneliness", "sleep"].every(
    (key) => Number.isInteger(item[key]) && Number(item[key]) >= 1 && Number(item[key]) <= 5,
  ) && Number.isInteger(item.ai_minutes) && Number(item.ai_minutes) >= 0 && Number(item.ai_minutes) <= 1440;
}

function extractOutputText(response: Record<string, unknown>) {
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? (item as Record<string, unknown>).content as Array<Record<string, unknown>>
      : [];
    const textItem = content.find((entry) => entry.type === "output_text");
    if (typeof textItem?.text === "string") return textItem.text;
  }
  return null;
}

type HealthReflection = {
  headline: string;
  summary: string;
  observations: string[];
  reflection_questions: string[];
  safety_note: string;
};

const internalOutputPattern =
  /(?:__|placeholder|not[_ -]?used|valid[_ -]?json|internal[_ -]?instruction|just[_ -]?final[_ -]?json|no[_ -]?comments|schema[_ -]?(?:fix|field|required)|safety[_ -]?note[_ -]?field)/i;

function isUserFacingText(value: unknown, minLength: number, maxLength: number): value is string {
  if (typeof value !== "string") return false;
  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength && !internalOutputPattern.test(text);
}

function isHealthReflection(value: unknown): value is HealthReflection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<HealthReflection>;
  return isUserFacingText(item.headline, 10, 180)
    && isUserFacingText(item.summary, 40, 1200)
    && Array.isArray(item.observations) && item.observations.length >= 2 && item.observations.length <= 4
    && item.observations.every((entry) => isUserFacingText(entry, 15, 450))
    && Array.isArray(item.reflection_questions) && item.reflection_questions.length >= 2 && item.reflection_questions.length <= 4
    && item.reflection_questions.every((entry) => isUserFacingText(entry, 15, 450))
    && isUserFacingText(item.safety_note, 40, 800);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return jsonResponse(request, { error: "Methode nicht erlaubt" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return jsonResponse(request, { error: "Anmeldung erforderlich" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabasePublishableKey = projectKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
  const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !supabasePublishableKey || !openAiApiKey) {
    return jsonResponse(request, { error: "Server-Konfiguration unvollständig" }, 503);
  }

  const client = createClient(supabaseUrl, supabasePublishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return jsonResponse(request, { error: "Ungültige Sitzung" }, 401);

  let payload: { checkIns?: unknown[] };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(request, { error: "Ungültige Anfrage" }, 400);
  }

  const checkIns = payload.checkIns;
  if (!Array.isArray(checkIns) || checkIns.length < 1 || checkIns.length > 14 || !checkIns.every(validCheckIn)) {
    return jsonResponse(request, { error: "Es werden 1 bis 14 gültige Check-ins benötigt" }, 400);
  }

  const safetyIdentifierBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.id));
  const safetyIdentifier = Array.from(new Uint8Array(safetyIdentifierBytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);

  const modelResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      store: false,
      safety_identifier: safetyIdentifier,
      reasoning: { effort: "medium" },
      input: [
        {
          role: "system",
          content: "Du formulierst kurze, behutsame Reflexionen zu freiwillig selbst erfassten Wohlbefindensdaten. Beschreibe nur die ausdrücklich eingegebenen Werte und beobachtbare Tendenzen. Bei genau einem Check-in beschreibst du ausschließlich diesen einen Tag und behauptest weder Veränderung, Vergleich, Zusammenhang noch Trend. Bei zwei Check-ins darfst du nur konkrete Unterschiede zwischen diesen beiden Einträgen benennen. Erst ab drei Check-ins darfst du vorsichtig wiederkehrende zeitliche Muster formulieren. Leite keine unbekannten Emotionen, Absichten, Persönlichkeit, Arbeitsleistung, Eignung oder Arbeitsfähigkeit ab. Behaupte niemals Kausalität. Stelle keine Diagnose, Krisenbewertung, Therapie- oder Medikamentenempfehlung und triff keine Entscheidung. Ermutige nicht zu emotionaler Abhängigkeit von KI. Verwende in allen Feldern ausschließlich natürliches, direkt an die nutzende Person gerichtetes Deutsch. Schreibe keine Platzhalter, Feldnamen, Schemahinweise, Meta-Kommentare, Entschuldigungen oder internen Arbeitsnotizen in die Werte. Erstelle zwei bis vier vorsichtig formulierte Beobachtungen und zwei bis vier offene Reflexionsfragen. Mache im Sicherheitshinweis deutlich, dass der Text KI-generiert ist, fehlerhaft sein kann, keine Diagnose darstellt und menschlich geprüft werden sollte.",
        },
        {
          role: "user",
          content: `Erstelle eine verständliche Reflexion zu diesen Check-ins. Freie Tagebuchtexte werden absichtlich nicht übermittelt: ${JSON.stringify(checkIns)}`,
        },
      ],
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "health_reflection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              headline: { type: "string" },
              summary: { type: "string" },
              observations: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
              reflection_questions: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
              safety_note: { type: "string" },
            },
            required: ["headline", "summary", "observations", "reflection_questions", "safety_note"],
            additionalProperties: false,
          },
        },
      },
      max_output_tokens: 1800,
    }),
  });

  if (!modelResponse.ok) {
    console.error("OpenAI request failed", modelResponse.status);
    return jsonResponse(request, { error: "Die Reflexion konnte nicht erstellt werden" }, 502);
  }

  const modelData = await modelResponse.json() as Record<string, unknown>;
  const outputText = extractOutputText(modelData);
  if (!outputText) return jsonResponse(request, { error: "Keine verwertbare Reflexion erhalten" }, 502);

  try {
    const result = JSON.parse(outputText) as unknown;
    if (!isHealthReflection(result)) {
      console.error("OpenAI response failed semantic validation");
      return jsonResponse(request, { error: "Die KI-Ausgabe konnte nicht sicher verwendet werden" }, 502);
    }
    return jsonResponse(request, result);
  } catch {
    return jsonResponse(request, { error: "Ungültiges Reflexionsformat" }, 502);
  }
});
