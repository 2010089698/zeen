import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DurationPicker } from './components/DurationPicker';
import { SessionHistoryList } from './components/SessionHistoryList';
import { useSessionManager } from './hooks/useSessionManager';
import { formatDuration } from './utils/time';

const DURATION_OPTIONS = [300, 900, 1500, 2700];

export default function App() {
  const [selectedDuration, setSelectedDuration] = useState<number>(1500);
  const {
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
  } = useSessionManager();

  const remainingTime = useMemo(() => {
    if (!currentSession) {
      return 0;
    }
    return Math.max(currentSession.scheduledDurationSec - currentSession.elapsedSec, 0);
  }, [currentSession]);

  const handleStart = () => {
    startSession(selectedDuration);
  };

  const handleFeedback = (value: 'yes' | 'no') => {
    void submitFocusFeedback(value);
  };

  const renderIdle = () => (
    <View style={styles.card}>
      <Text style={styles.title}>集中セッションを開始</Text>
      <Text style={styles.subtitle}>時間を選択してください</Text>
      <DurationPicker options={DURATION_OPTIONS} selected={selectedDuration} onSelect={setSelectedDuration} />
      <Pressable style={[styles.primaryButton, styles.startButton]} onPress={handleStart}>
        <Text style={styles.primaryButtonText}>セッション開始</Text>
      </Pressable>
      <SessionHistoryList history={history} loading={loadingHistory} />
    </View>
  );

  const renderRunning = () => (
    <View style={styles.card}>
      <Text style={styles.phaseLabel}>集中モード</Text>
      <Text style={styles.timer}>{formatDuration(remainingTime)}</Text>
      <Text style={styles.timerCaption}>残り時間</Text>
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>経過: {formatDuration(currentSession?.elapsedSec ?? 0)}</Text>
        <Text style={styles.statsText}>中断: {currentSession?.pauseCount ?? 0}回</Text>
      </View>
      <View style={styles.buttonRow}>
        <Pressable style={[styles.secondaryButton, styles.flexButton, styles.buttonSpacing]} onPress={pauseSession}>
          <Text style={styles.secondaryButtonText}>一時停止</Text>
        </Pressable>
        <Pressable style={[styles.dangerButton, styles.flexButton]} onPress={() => void endSession()}>
          <Text style={styles.dangerButtonText}>終了する</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderPaused = () => (
    <View style={styles.card}>
      <Text style={styles.phaseLabel}>中断中</Text>
      <Text style={styles.timer}>{formatDuration(remainingTime)}</Text>
      <Text style={styles.timerCaption}>残り時間</Text>
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>経過: {formatDuration(currentSession?.elapsedSec ?? 0)}</Text>
        <Text style={styles.statsText}>中断: {currentSession?.pauseCount ?? 0}回</Text>
      </View>
      <View style={styles.buttonRow}>
        <Pressable style={[styles.primaryButton, styles.flexButton, styles.buttonSpacing]} onPress={resumeSession}>
          <Text style={styles.primaryButtonText}>再開する</Text>
        </Pressable>
        <Pressable style={[styles.dangerButton, styles.flexButton]} onPress={() => void endSession()}>
          <Text style={styles.dangerButtonText}>終了する</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderCompleted = () => {
    if (!lastCompletedSession) {
      return (
        <View style={styles.card}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      );
    }
    return (
      <View style={styles.card}>
        <Text style={styles.title}>おつかれさまでした！</Text>
        <Text style={styles.summaryText}>予定時間: {formatDuration(lastCompletedSession.scheduledDurationSec)}</Text>
        <Text style={styles.summaryText}>実際の時間: {formatDuration(lastCompletedSession.actualDurationSec)}</Text>
        <Text style={styles.summaryText}>中断回数: {lastCompletedSession.pauseCount}回</Text>
        <Text style={[styles.subtitle, styles.feedbackSubtitle]}>集中できましたか？</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.primaryButton, styles.flexButton, styles.buttonSpacing, lastCompletedSession.focusFeedback === 'yes' && styles.disabledButton]}
            disabled={lastCompletedSession.focusFeedback === 'yes'}
            onPress={() => handleFeedback('yes')}
          >
            <Text style={styles.primaryButtonText}>はい</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, styles.flexButton, lastCompletedSession.focusFeedback === 'no' && styles.disabledSecondary]}
            disabled={lastCompletedSession.focusFeedback === 'no'}
            onPress={() => handleFeedback('no')}
          >
            <Text style={styles.secondaryButtonText}>いいえ</Text>
          </Pressable>
        </View>
        <Pressable style={[styles.secondaryButton, styles.fullWidthButton]} onPress={resetSession}>
          <Text style={styles.secondaryButtonText}>新しいセッションを始める</Text>
        </Pressable>
        <SessionHistoryList history={history} loading={loadingHistory} />
      </View>
    );
  };

  let content: JSX.Element;
  switch (phase) {
    case 'running':
      content = renderRunning();
      break;
    case 'paused':
      content = renderPaused();
      break;
    case 'completed':
      content = renderCompleted();
      break;
    default:
      content = renderIdle();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.scrollContent}>{content}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  timerCaption: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsText: {
    fontSize: 16,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  buttonSpacing: {
    marginRight: 12,
  },
  flexButton: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#dc2626',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    marginTop: 24,
  },
  summaryText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledSecondary: {
    opacity: 0.6,
  },
});
