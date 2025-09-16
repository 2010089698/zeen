export type SessionPhase = 'idle' | 'running' | 'paused' | 'completed';

export type FocusFeedback = 'yes' | 'no' | null;

export interface SessionRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  scheduledDurationSec: number;
  actualDurationSec: number;
  pauseCount: number;
  focusFeedback: FocusFeedback;
  synced: boolean;
}

export interface CurrentSessionState {
  id: string;
  startedAt: number;
  scheduledDurationSec: number;
  elapsedSec: number;
  pauseCount: number;
}
