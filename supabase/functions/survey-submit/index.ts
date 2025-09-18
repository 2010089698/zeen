// @ts-ignore - URL import is resolved by Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore - URL import is resolved by Deno runtime
import "https://deno.land/x/xhr@0.4.0/mod.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

type Payload = {
  surveyKey: string;
  answers: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Anon-Id, Authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  const anonId = req.headers.get("X-Anon-Id");
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  }
  if (!anonId) {
    return new Response(JSON.stringify({ error: "Missing X-Anon-Id" }), { status: 401, headers: CORS });
  }

  let body: Payload | null = null;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad JSON", detail: String(e) }), { status: 400, headers: CORS });
  }

  if (!body?.surveyKey || !body?.answers || typeof body.answers !== "object") {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: CORS });
  }

  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase
    .from("survey_responses")
    .insert({
      anon_id: anonId,
      survey_key: body.surveyKey,
      answers: body.answers,
      metadata: body.metadata ?? null,
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS });
});


