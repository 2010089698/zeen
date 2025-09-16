import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionRecord } from '../types';

const STORAGE_KEY = 'zeen:sessions';
const MAX_SESSIONS = 10;

export async function loadSessions(): Promise<SessionRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed: SessionRecord[] = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to load sessions from storage', error);
    return [];
  }
}

export async function saveSessions(sessions: SessionRecord[]): Promise<void> {
  try {
    const trimmed = sessions.slice(0, MAX_SESSIONS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to save sessions to storage', error);
  }
}
