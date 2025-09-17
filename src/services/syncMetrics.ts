import AsyncStorage from '@react-native-async-storage/async-storage';

const METRICS_KEYS = {
  LAST_SYNC_AT: 'lastSyncAt',
  SUCCESS_COUNT: 'successCount',
  RETRY_COUNT: 'retryCount',
  FAILED_COUNT: 'failedCount',
} as const;

export interface SyncMetrics {
  lastSyncAt: string | null;
  successCount: number;
  retryCount: number;
  failedCount: number;
}

export async function getSyncMetrics(): Promise<SyncMetrics> {
  const [lastSyncAt, successCount, retryCount, failedCount] = await Promise.all([
    AsyncStorage.getItem(METRICS_KEYS.LAST_SYNC_AT),
    AsyncStorage.getItem(METRICS_KEYS.SUCCESS_COUNT),
    AsyncStorage.getItem(METRICS_KEYS.RETRY_COUNT),
    AsyncStorage.getItem(METRICS_KEYS.FAILED_COUNT),
  ]);

  return {
    lastSyncAt,
    successCount: successCount ? parseInt(successCount, 10) : 0,
    retryCount: retryCount ? parseInt(retryCount, 10) : 0,
    failedCount: failedCount ? parseInt(failedCount, 10) : 0,
  };
}

export async function updateSyncMetrics(updates: Partial<SyncMetrics>): Promise<void> {
  const promises: Promise<void>[] = [];

  if (updates.lastSyncAt !== undefined) {
    promises.push(AsyncStorage.setItem(METRICS_KEYS.LAST_SYNC_AT, updates.lastSyncAt));
  }
  if (updates.successCount !== undefined) {
    promises.push(AsyncStorage.setItem(METRICS_KEYS.SUCCESS_COUNT, updates.successCount.toString()));
  }
  if (updates.retryCount !== undefined) {
    promises.push(AsyncStorage.setItem(METRICS_KEYS.RETRY_COUNT, updates.retryCount.toString()));
  }
  if (updates.failedCount !== undefined) {
    promises.push(AsyncStorage.setItem(METRICS_KEYS.FAILED_COUNT, updates.failedCount.toString()));
  }

  await Promise.all(promises);
}

export function formatLastSyncTime(lastSyncAt: string | null): string {
  if (!lastSyncAt) {
    return '未同期';
  }
  
  const date = new Date(lastSyncAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'たった今';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffMinutes < 1440) { // 24時間
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}時間前`;
  } else {
    const diffDays = Math.floor(diffMinutes / 1440);
    return `${diffDays}日前`;
  }
}
