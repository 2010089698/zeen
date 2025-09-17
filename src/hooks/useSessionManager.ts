import { useCallback, useEffect, useRef, useState } from 'react';
import { CurrentSessionState, FocusFeedback, SessionPhase, SessionRecord } from '../types';
import { loadSessions, saveSessions } from '../storage/sessionStorage';
import { syncSessions } from '../services/syncService';
import { updateSyncMetrics } from '../services/syncMetrics';

const HISTORY_LIMIT = 10;

function createSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampDuration(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(60, Math.floor(value));
}

export function useSessionManager() {
  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [currentSession, setCurrentSession] = useState<CurrentSessionState | null>(null);
  const [lastCompletedSession, setLastCompletedSession] = useState<SessionRecord | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const timerStartRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    (async () => {
      setLoadingHistory(true);
      const stored = await loadSessions();
      if (!isMountedRef.current) {
        return;
      }
      setHistory(stored.slice(0, HISTORY_LIMIT));
      setLoadingHistory(false);
    })();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // オンライン復帰時の自動再同期
  // React Nativeでは、ネットワーク状態の監視には@react-native-community/netinfoを使用する必要があります
  // 現在はこの機能を無効化しています
  // useEffect(() => {
  //   const onOnline = () => {
  //     // オンライン復帰で履歴の更新トリガーを軽く発火
  //     setHistory(prev => [...prev]);
  //   };
  //   
  //   // React Nativeでは、ネットワーク状態の監視が必要な場合があります
  //   // ここでは基本的な実装のみ
  //   window.addEventListener('online', onOnline);
  //   return () => window.removeEventListener('online', onOnline);
  // }, []);

  useEffect(() => {
    if (phase !== 'running' || timerStartRef.current === null) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentSession((prev) => {
        if (!prev || timerStartRef.current === null) {
          return prev;
        }
        const elapsedSinceResume = Math.floor((Date.now() - timerStartRef.current) / 1000);
        const nextElapsed = elapsedBeforePauseRef.current + elapsedSinceResume;
        if (nextElapsed === prev.elapsedSec) {
          return prev;
        }
        return {
          ...prev,
          elapsedSec: nextElapsed,
        };
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [phase]);

  const startSession = useCallback((durationSec: number) => {
    const safeDuration = clampDuration(durationSec);
    const now = Date.now();
    elapsedBeforePauseRef.current = 0;
    timerStartRef.current = now;
    setCurrentSession({
      id: createSessionId(),
      startedAt: now,
      scheduledDurationSec: safeDuration,
      elapsedSec: 0,
      pauseCount: 0,
    });
    setLastCompletedSession(null);
    setPhase('running');
  }, []);

  const pauseSession = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev || phase !== 'running') {
        return prev;
      }
      const now = Date.now();
      const additional =
        timerStartRef.current !== null
          ? Math.floor((now - timerStartRef.current) / 1000)
          : 0;
      const nextElapsed = Math.max(prev.elapsedSec, elapsedBeforePauseRef.current + additional);
      elapsedBeforePauseRef.current = nextElapsed;
      timerStartRef.current = null;
      setPhase('paused');
      return {
        ...prev,
        elapsedSec: nextElapsed,
        pauseCount: prev.pauseCount + 1,
      };
    });
  }, [phase]);

  const resumeSession = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev || phase !== 'paused') {
        return prev;
      }
      elapsedBeforePauseRef.current = prev.elapsedSec;
      timerStartRef.current = Date.now();
      setPhase('running');
      return prev;
    });
  }, [phase]);

  const completeSession = useCallback(
    async (feedback?: FocusFeedback) => {
      if (!currentSession) {
        return;
      }
      const now = Date.now();
      const additional =
        phase === 'running' && timerStartRef.current !== null
          ? Math.floor((now - timerStartRef.current) / 1000)
          : 0;
      const computedElapsed = Math.max(
        currentSession.elapsedSec,
        elapsedBeforePauseRef.current + additional,
      );
      const record: SessionRecord = {
        id: currentSession.id,
        startedAt: new Date(currentSession.startedAt).toISOString(),
        endedAt: new Date(now).toISOString(),
        scheduledDurationSec: currentSession.scheduledDurationSec,
        actualDurationSec: computedElapsed,
        pauseCount: currentSession.pauseCount,
        focusFeedback: feedback ?? null,
        synced: false,
      };
      timerStartRef.current = null;
      elapsedBeforePauseRef.current = 0;
      setCurrentSession(null);
      setPhase('completed');
      setLastCompletedSession(record);
      setHistory((prev) => {
        const updated = [record, ...prev].slice(0, HISTORY_LIMIT);
        void saveSessions(updated);
        return updated;
      });
    },
    [currentSession, phase],
  );

  const endSession = useCallback(async () => {
    await completeSession();
  }, [completeSession]);

  const submitFocusFeedback = useCallback(
    async (feedback: Exclude<FocusFeedback, null>) => {
      if (!lastCompletedSession) {
        return;
      }
      const updatedRecord: SessionRecord = {
        ...lastCompletedSession,
        focusFeedback: feedback,
      };
      setLastCompletedSession(updatedRecord);
      setHistory((prev) => {
        const updated = prev.map((record) =>
          record.id === updatedRecord.id ? { ...record, focusFeedback: feedback } : record,
        );
        void saveSessions(updated);
        return updated;
      });
    },
    [lastCompletedSession],
  );

  const resetSession = useCallback(() => {
    timerStartRef.current = null;
    elapsedBeforePauseRef.current = 0;
    setCurrentSession(null);
    setPhase('idle');
    setLastCompletedSession(null);
  }, []);

  useEffect(() => {
    if (phase === 'running' && currentSession) {
      if (currentSession.elapsedSec >= currentSession.scheduledDurationSec) {
        void completeSession();
      }
    }
  }, [completeSession, currentSession, phase]);

  useEffect(() => {
    if (!history.length) {
      return;
    }
    const unsynced = history.filter((record) => !record.synced);
    if (!unsynced.length) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { syncedIds, retryIds } = await syncSessions(unsynced);
      if (cancelled) {
        return;
      }
      
      if (syncedIds.length) {
        // 同期済みフラグを更新
        setHistory((prev) => {
          const syncedSet = new Set(syncedIds);
          const updated = prev.map((record) =>
            syncedSet.has(record.id) ? { ...record, synced: true } : record,
          );
          void saveSessions(updated);
          return updated;
        });
        setLastCompletedSession((prev) => {
          if (!prev) {
            return prev;
          }
          return syncedIds.includes(prev.id) ? { ...prev, synced: true } : prev;
        });
        
        // 同期成功メトリクスを更新
        void updateSyncMetrics({
          lastSyncAt: new Date().toISOString(),
          successCount: syncedIds.length,
        });
      }
      
      if (retryIds.length) {
        // リトライが必要なIDをログに記録
        console.log('Sessions requiring retry:', retryIds);
        
        // リトライメトリクスを更新
        void updateSyncMetrics({
          retryCount: retryIds.length,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [history]);

  return {
    phase,
    currentSession,
    lastCompletedSession,
    history,
    loadingHistory,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    submitFocusFeedback,
    resetSession,
  };
}
