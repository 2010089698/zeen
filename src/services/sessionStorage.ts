import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionRecord } from '../types/session';

const HISTORY_KEY = '@zeen/sessionHistory';
const PENDING_KEY = '@zeen/pendingSync';

const parseRecords = (value: string | null): SessionRecord[] => {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value) as SessionRecord[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('Failed to parse stored session records', error);
    return [];
  }
};

export const loadHistory = async (): Promise<SessionRecord[]> => {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    return parseRecords(stored);
  } catch (error) {
    console.warn('Failed to load session history', error);
    return [];
  }
};

export const persistHistory = async (history: SessionRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to persist session history', error);
  }
};

export const loadPendingRecords = async (): Promise<SessionRecord[]> => {
  try {
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    return parseRecords(stored);
  } catch (error) {
    console.warn('Failed to load pending session records', error);
    return [];
  }
};

export const persistPendingRecords = async (records: SessionRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('Failed to persist pending session records', error);
  }
};
