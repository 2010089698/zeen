export type SessionStatus = 'idle' | 'active' | 'paused' | 'summary';
export type SessionRecordStatus = 'completed' | 'aborted';
export type SessionFeedback = 'yes' | 'no' | null;

export interface ActiveSession {
  id: string;
  plannedDurationMinutes: number;
  startedAt: string;
  elapsedSeconds: number;
  remainingSeconds: number;
  interruptions: number;
}

export interface SessionRecord {
  id: string;
  plannedDurationMinutes: number;
  startedAt: string;
  endedAt: string;
  actualDurationSeconds: number;
  interruptions: number;
  status: SessionRecordStatus;
  feedback: SessionFeedback;
}
