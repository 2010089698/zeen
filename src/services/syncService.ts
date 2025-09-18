import { SessionRecord } from '../types';
import { getAnonId } from './anonId';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com';
const BATCH_SIZE = 50;
const TIMEOUT_MS = 5000;
// NOTE: Read real-sync flag at call time to respect runtime env overrides in tests
function isRealSyncEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_REAL_SYNC === 'true';
}

type BatchResponse = {
  saved: string[];
  skipped: string[];
  errors: { id?: string; message: string }[];
};

async function timeoutFetch(input: RequestInfo, init: RequestInit = {}, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function postBatch(records: SessionRecord[]): Promise<BatchResponse> {
  const anonId = await getAnonId();
  const url = `${API_BASE}/sessions-batch`;
  
  console.log('📤 postBatch called with:', records.length, 'records');
  console.log('🔗 URL:', url);
  console.log('🆔 AnonId:', anonId);
  
  const res = await timeoutFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Anon-Id': anonId,
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
      'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify({
      sessions: records.map(({ synced, ...r }) => r), // サーバーにsyncedは不要
    }),
  }, TIMEOUT_MS);

  console.log('📊 Response status:', res.status);
  
  if (!res.ok) {
    console.error('❌ HTTP error:', res.status, res.statusText);
    const errorText = await res.text();
    console.error('❌ Error response body:', errorText);
    
    // サーバー側が全部NGを返したケース。5xxならリトライ候補。
    // 注意: 現在の実装では400系エラーも再試行対象としているが、
    // ペイロードが悪い場合はエラーログだけ出して破棄する仕様に変更する場合は
    // 以下のように修正することを検討:
    // const retryable = res.status >= 500 || res.status === 429;
    // if (!retryable) {
    //   console.error(`Client error ${res.status}:`, await res.text());
    //   return { saved: [], skipped: [], errors: [] };
    // }
    const retryable = res.status >= 500 || res.status === 429;
    console.log('🔄 Retryable error:', retryable);
    return {
      saved: [],
      skipped: [],
      errors: records.map(r => ({ id: r.id, message: `HTTP ${res.status}` })),
    };
  }
  
  // 期待レスポンス: { saved: string[], skipped: string[], errors: [{id?, message}] }
  const json = await res.json();
  console.log('✅ Response data:', json);
  return {
    saved: json.saved ?? [],
    skipped: json.skipped ?? [],
    errors: json.errors ?? [],
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let attempt = 0;
  let wait = 500; // 0.5s, 1s, 2s
  let lastErr: any;
  
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      attempt++;
      if (attempt >= maxAttempts) break;
      await sleep(wait);
      wait *= 2;
    }
  }
  throw lastErr;
}

// ネットワーク状態をチェックする関数（React Native用）
function isOnline(): boolean {
  // React Nativeでは、ネットワーク状態の詳細なチェックが必要な場合がありますが、
  // 基本的にはnavigator.onLineの代替として、fetchのエラーハンドリングで対応
  return true; // デフォルトでオンラインと仮定
}

export async function syncSessions(records: SessionRecord[]): Promise<{ syncedIds: string[], retryIds: string[] }> {
  console.log('syncSessions called with:', records.length, 'records');
  console.log('ENABLE_REAL_SYNC:', isRealSyncEnabled());
  console.log('API_BASE:', API_BASE);
  
  if (!records.length) {
    console.log('No records to sync, returning empty result');
    return { syncedIds: [], retryIds: [] };
  }

  // 実同期が無効な場合はモック動作
  if (!isRealSyncEnabled()) {
    console.log('Mock sync mode: simulating successful sync');
    await new Promise(resolve => setTimeout(resolve, 400)); // モック遅延
    return { syncedIds: records.map(r => r.id), retryIds: [] };
  }

  if (!isOnline()) {
    // オフラインなら即終了して、後で再試行させる
    return { syncedIds: [], retryIds: records.map(r => r.id) };
  }

  const chunks: SessionRecord[][] = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    chunks.push(records.slice(i, i + BATCH_SIZE));
  }

  const syncedIds: string[] = [];
  const retryIds: string[] = [];

  for (const chunk of chunks) {
    try {
      console.log('Processing chunk with', chunk.length, 'records');
      // リトライ付きでバッチ送信
      const result = await withRetry(() => postBatch(chunk));
      
      console.log('Chunk result:', {
        saved: result.saved.length,
        skipped: result.skipped.length,
        errors: result.errors.length
      });
      
      syncedIds.push(...result.saved);
      // skippedは成功として扱う（既に同期済み）
      syncedIds.push(...result.skipped);
      // errorsは全てリトライ対象とする
      for (const error of result.errors) {
        if (error.id) retryIds.push(error.id);
      }
    } catch (e) {
      // ネットワーク断など
      console.warn('Batch sync failed:', e);
      retryIds.push(...chunk.map(r => r.id));
    }
  }
  
  console.log('Final sync result:', {
    syncedIds: syncedIds.length,
    retryIds: retryIds.length
  });
  
  return { syncedIds, retryIds };
}
