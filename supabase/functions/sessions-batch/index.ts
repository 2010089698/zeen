// supabase/functions/sessions-batch/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Session = {
  id: string;
  startedAt: string;
  endedAt: string;
  metrics?: Record<string, unknown>;
  notes?: string | null;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Anon-Id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  const anonId = req.headers.get("X-Anon-Id");
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  }
  if (!anonId) {
    return new Response(JSON.stringify({ error: "Missing X-Anon-Id" }), { status: 401, headers: CORS });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad JSON", detail: String(e) }), { status: 400, headers: CORS });
  }

  const sessions = (body as any)?.sessions;
  if (!Array.isArray(sessions)) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: CORS });
  }

  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,          // ダッシュボードの Project URL を Secrets に設定済み
    Deno.env.get("SERVICE_ROLE_KEY")!      // service_role key を Secrets に設定済み
  );

  const saved: string[] = [];
  const skipped: string[] = [];
  const errors: { id?: string; message: string }[] = [];

  for (const raw of sessions as Session[]) {
    if (!raw?.id || !raw?.startedAt || !raw?.endedAt) {
      errors.push({ id: raw?.id, message: "missing required fields" });
      continue;
    }
    const { error } = await supabase
      .from("sessions")
      .upsert(
        {
          id: raw.id,
          anon_id: anonId,
          started_at: raw.startedAt,
          ended_at: raw.endedAt,
          metrics: raw.metrics ?? {},
          notes: raw.notes ?? null,
        },
        { onConflict: "id" }
      );
    if (error) errors.push({ id: raw.id, message: error.message });
    else saved.push(raw.id);
  }

  return new Response(JSON.stringify({ saved, skipped, errors }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
});