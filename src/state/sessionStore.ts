import create from 'zustand';

import {
  ActiveSession,
  SessionFeedback,
  SessionRecord,
  SessionRecordStatus,
  SessionStatus,
} from '../types/session';
import {
  loadHistory,
  loadPendingRecords,
  persistHistory,
  persistPendingRecords,
} from '../services/sessionStorage';
import { syncPendingRecords } from '../services/syncService';
import { generateId } from '../utils/uuid';

interface SessionStore {
  status: SessionStatus;
  currentSession: ActiveSession | null;
  summary: SessionRecord | null;
  history: SessionRecord[];
  unsynced: SessionRecord[];
  isInitializing: boolean;
  initialize: () => Promise<void>;
  startSession: (durationMinutes: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  tick: () => void;
  endSession: () => void;
  abortSession: () => void;
  recordFeedback: (feedback: Exclude<SessionFeedback, null>) => void;
  resetSession: () => void;
  syncPending: () => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => {
  const finalizeSession = (
    session: ActiveSession,
    status: SessionRecordStatus,
    actualDurationSeconds: number,
  ) => {
    const record: SessionRecord = {
      id: session.id,
      plannedDurationMinutes: session.plannedDurationMinutes,
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
      actualDurationSeconds,
      interruptions: session.interruptions,
      status,
      feedback: null,
    };

    set((state) => {
      const updatedHistory = [record, ...state.history].slice(0, 10);
      const updatedUnsynced = [record, ...state.unsynced];
      void persistHistory(updatedHistory);
      void persistPendingRecords(updatedUnsynced);
      return {
        status: 'summary' as SessionStatus,
        summary: record,
        history: updatedHistory,
        unsynced: updatedUnsynced,
        currentSession: null,
      };
    });
  };

  return {
    status: 'idle',
    currentSession: null,
    summary: null,
    history: [],
    unsynced: [],
    isInitializing: true,
    initialize: async () => {
      try {
        const [history, unsynced] = await Promise.all([loadHistory(), loadPendingRecords()]);
        set({ history, unsynced, isInitializing: false });
      } catch (error) {
        console.warn('Failed to initialize session store', error);
        set({ history: [], unsynced: [], isInitializing: false });
      }
    },
    startSession: (durationMinutes: number) => {
      const minutes = Number.isFinite(durationMinutes)
        ? Math.max(Math.round(durationMinutes), 1)
        : 25;
      const session: ActiveSession = {
        id: generateId(),
        plannedDurationMinutes: minutes,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        remainingSeconds: minutes * 60,
        interruptions: 0,
      };
      set({ status: 'active', currentSession: session, summary: null });
    },
    pauseSession: () => {
      const { status, currentSession } = get();
      if (status !== 'active' || !currentSession) {
        return;
      }
      set({
        status: 'paused',
        currentSession: {
          ...currentSession,
          interruptions: currentSession.interruptions + 1,
        },
      });
    },
    resumeSession: () => {
      const { status, currentSession } = get();
      if (status !== 'paused' || !currentSession) {
        return;
      }
      set({ status: 'active' });
    },
    tick: () => {
      const { status, currentSession } = get();
      if (status !== 'active' || !currentSession) {
        return;
      }
      const elapsedSeconds = currentSession.elapsedSeconds + 1;
      const remainingSeconds = Math.max(currentSession.remainingSeconds - 1, 0);
      if (remainingSeconds <= 0) {
        finalizeSession({ ...currentSession, elapsedSeconds, remainingSeconds: 0 }, 'completed', elapsedSeconds);
      } else {
        set({
          currentSession: {
            ...currentSession,
            elapsedSeconds,
            remainingSeconds,
          },
        });
      }
    },
    endSession: () => {
      const { currentSession } = get();
      if (!currentSession) {
        return;
      }
      finalizeSession(currentSession, 'completed', currentSession.elapsedSeconds);
    },
    abortSession: () => {
      const { currentSession } = get();
      if (!currentSession) {
        return;
      }
      finalizeSession(currentSession, 'aborted', currentSession.elapsedSeconds);
    },
    recordFeedback: (feedback) => {
      const { summary, history, unsynced } = get();
      if (!summary) {
        return;
      }
      const updatedSummary: SessionRecord = { ...summary, feedback };
      const updatedHistory = history.map((item) =>
        item.id === summary.id ? { ...item, feedback } : item,
      );
      const updatedUnsynced = unsynced.map((item) =>
        item.id === summary.id ? { ...item, feedback } : item,
      );
      set({ summary: updatedSummary, history: updatedHistory, unsynced: updatedUnsynced });
      void persistHistory(updatedHistory);
      void persistPendingRecords(updatedUnsynced);
    },
    resetSession: () => {
      set({ status: 'idle', summary: null, currentSession: null });
    },
    syncPending: async () => {
      const { unsynced } = get();
      if (unsynced.length === 0) {
        return;
      }
      try {
        const syncedIds = await syncPendingRecords(unsynced);
        if (syncedIds.length === 0) {
          return;
        }
        const remaining = unsynced.filter((item) => !syncedIds.includes(item.id));
        set({ unsynced: remaining });
        void persistPendingRecords(remaining);
      } catch (error) {
        console.warn('Failed to sync session records', error);
      }
    },
  };
});
