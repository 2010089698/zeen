import { SessionRecord } from '../types';

const SYNC_DELAY_MS = 400;

export async function syncSessions(records: SessionRecord[]): Promise<string[]> {
  if (!records.length) {
    return [];
  }
  try {
    await new Promise((resolve) => setTimeout(resolve, SYNC_DELAY_MS));
    return records.map((record) => record.id);
  } catch (error) {
    console.warn('Failed to sync sessions', error);
    return [];
  }
}
