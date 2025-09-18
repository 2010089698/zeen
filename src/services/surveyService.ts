import { getAnonId } from './anonId';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const TIMEOUT_MS = 15000;

function timeoutFetch(input: RequestInfo, init: RequestInit = {}, ms: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timeout')), ms);
    fetch(input, init)
      .then((res) => { clearTimeout(timer); resolve(res); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

export type SurveyPayload = {
  surveyKey: string;
  answers: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
};

export async function submitSurvey(payload: SurveyPayload): Promise<void> {
  const anonId = await getAnonId();
  const url = `${API_BASE}/survey-submit`;

  const res = await timeoutFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Anon-Id': anonId,
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify(payload),
  }, TIMEOUT_MS);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Survey submit failed: ${res.status} ${text}`);
  }
}


