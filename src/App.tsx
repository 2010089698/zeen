import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DurationPicker } from './components/DurationPicker';
import { SessionHistoryList } from './components/SessionHistoryList';
import { useSessionManager } from './hooks/useSessionManager';
import { formatDuration } from './utils/time';
import { getTheme, Theme } from './theme';

const DURATION_OPTIONS = [300, 900, 1500, 2700];

function AppInner() {
  const [selectedDuration, setSelectedDuration] = useState<number>(1500);
  const [submitting, setSubmitting] = useState(false);
  // TODO: フォローアップでシステムテーマを拾う。現状はライト固定。
  const theme: Theme = getTheme('light');
  const insets = useSafeAreaInsets();
  const FIREFLY_COUNT = 18;
  const fireflies = useMemo(
    () =>
      Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
        anim: new Animated.Value(Math.random()),
        pos: new Animated.ValueXY({ x: 0, y: 0 }),
        delay: Math.floor(Math.random() * 4000),
        duration: 9000 + ((i % 5) * 1000),
        startX: -40 + ((i * 53) % 360),
        startY:  40 + ((i * 89) % 560),
        dx: 20 + ((i % 4) * 8),
        dy: 14 + ((i % 3) * 8),
        right: i % 3 === 0 ? 20 : undefined,
      })),
    []
  );
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

  const handleFeedback = async (value: 'yes' | 'no') => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitFocusFeedback(value);
      // 成功時のみホームへ戻す
      resetSession();
    } catch (e) {
      Alert.alert('保存に失敗しました', '通信状態を確認して、もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  // 明滅（パルス）
  const startPulseAnimation = (val: Animated.Value, delay: number, duration: number) => {
    const core = Animated.sequence([
      Animated.timing(val, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(val, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]);
    if (delay > 0) {
      Animated.sequence([Animated.delay(delay), Animated.loop(core)]).start();
    } else {
      Animated.loop(core).start();
    }
  };

  // 位置の徘徊（小さな目標点へ連続遷移）
  const startWander = (pos: Animated.ValueXY, dx: number, dy: number) => {
    const next = {
      x: (Math.random() * 2 - 1) * dx,
      y: (Math.random() * 2 - 1) * dy,
    };
    const dur = 3000 + Math.random() * 4000; // 3〜7秒
    Animated.timing(pos, {
      toValue: next,
      duration: dur,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      startWander(pos, dx, dy);
    });
  };

  useMemo(() => {
    fireflies.forEach(f => {
      startPulseAnimation(f.anim, f.delay, f.duration);
      startWander(f.pos, f.dx, f.dy);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderIdle = () => (
    <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.appTitle, { color: theme.colors.text }]}>Zeen</Text>
      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
        onPress={handleStart}
      >
        <Text style={styles.primaryButtonText}>Start Focus</Text>
      </Pressable>
      <Text style={[styles.helperText, { color: theme.colors.textSubtle }]}>Ready to focus</Text>
    </View>
  );

  const renderRunning = () => (
    <View style={[styles.focusScreen, { backgroundColor: '#111312' }]}>
      <View style={styles.blobContainer} pointerEvents="none">
        {fireflies.map((f, i) => (
          <Animated.View
            key={i}
            style={[
              styles.firefly,
              f.right ? { right: f.right } : { left: f.startX },
              { top: f.startY },
              {
                transform: [
                  { translateX: f.pos.x },
                  { translateY: f.pos.y },
                  { scale: f.anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) },
                ],
                opacity: f.anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }),
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.focusSubtitle, { color: '#A9AFA7' }]}>Focusing...</Text>
      <Text style={[styles.focusTimer]}>{formatDuration(remainingTime)}</Text>
      <Text style={[styles.focusCaption, { color: '#A9AFA7' }]}>Stay concentrated</Text>
      <View style={styles.buttonRow}>
        <Pressable style={[styles.secondaryButton, styles.flexButton, styles.buttonSpacing, { borderColor: '#6E8B77' }]} onPress={pauseSession}>
          <Text style={[styles.secondaryButtonText, { color: '#6E8B77' }]}>一時停止</Text>
        </Pressable>
        <Pressable style={[styles.primaryButton, styles.flexButton, { backgroundColor: '#6E8B77' }]} onPress={() => void endSession()}>
          <Text style={styles.primaryButtonText}>終了</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderPaused = () => (
    <View style={[styles.focusScreen, { backgroundColor: '#111312' }]}>
      <Text style={[styles.focusSubtitle, { color: '#A9AFA7' }]}>Paused</Text>
      <Text style={[styles.focusTimer]}>{formatDuration(remainingTime)}</Text>
      <Text style={[styles.focusCaption, { color: '#A9AFA7' }]}>Tap to resume or end</Text>
      <View style={styles.buttonRow}>
        <Pressable style={[styles.primaryButton, styles.flexButton, styles.buttonSpacing, { backgroundColor: '#6E8B77' }]} onPress={resumeSession}>
          <Text style={styles.primaryButtonText}>再開</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, styles.flexButton, { borderColor: '#6E8B77' }]} onPress={() => void endSession()}>
          <Text style={[styles.secondaryButtonText, { color: '#6E8B77' }]}>終了</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderCompleted = () => {
    if (!lastCompletedSession) {
      return (
        <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      );
    }
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.titleSummary, { color: theme.colors.text }]}>おつかれさまでした</Text>
        <Text style={[styles.summaryText, { color: theme.colors.textSubtle }]}>予定: {formatDuration(lastCompletedSession.scheduledDurationSec)}</Text>
        <Text style={[styles.summaryText, { color: theme.colors.textSubtle }]}>実績: {formatDuration(lastCompletedSession.actualDurationSec)}</Text>
        <Text style={[styles.summaryText, { color: theme.colors.textSubtle }]}>中断回数: {lastCompletedSession.pauseCount}回</Text>
        <Text style={[styles.subtitle, styles.feedbackSubtitle, { color: theme.colors.text }]}>集中できましたか？</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.primaryButton, styles.flexButton, styles.buttonSpacing, { backgroundColor: theme.colors.accent }, (submitting || lastCompletedSession.focusFeedback === 'yes') && styles.disabledButton]}
            disabled={submitting || lastCompletedSession.focusFeedback === 'yes'}
            onPress={() => handleFeedback('yes')}
          >
            {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryButtonText}>はい</Text>}
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, styles.flexButton, { borderColor: theme.colors.accent }, (submitting || lastCompletedSession.focusFeedback === 'no') && styles.disabledSecondary]}
            disabled={submitting || lastCompletedSession.focusFeedback === 'no'}
            onPress={() => handleFeedback('no')}
          >
            {submitting
              ? <ActivityIndicator size="small" color={theme.colors.accent} />
              : <Text style={[styles.secondaryButtonText, { color: theme.colors.accent }]}>いいえ</Text>}
          </Pressable>
        </View>
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
    <SafeAreaView
      edges={['top','left','right','bottom']}
      style={[
        styles.safeArea,
        { backgroundColor: (phase === 'running' || phase === 'paused') ? '#111312' : theme.colors.background },
      ]}
    >
      <StatusBar style={phase === 'running' || phase === 'paused' ? 'light' : 'dark'} />
      <View style={[styles.scrollContent, { paddingTop: 16 }]}>{content}</View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    overflow: 'visible',
  },
  appTitle: {
    fontSize: 44,
    lineHeight: 53,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginBottom: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  focusScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(110,139,119,0.12)',
    top: 120,
    left: -20,
  },
  blobSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(110,139,119,0.12)',
    top: 80,
  },
  firefly: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(110,139,119,0.85)',
    shadowColor: '#6E8B77',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  focusSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    marginBottom: 24,
    textAlign: 'center',
  },
  focusTimer: {
    fontSize: 80,
    fontWeight: '300',
    textAlign: 'center',
    marginVertical: 24,
    color: '#FFD54F',
  },
  focusCaption: {
    fontSize: 16,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  buttonSpacing: {
    marginRight: 16,
  },
  flexButton: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
    marginTop: 24,
  },
  primaryButton: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '400',
  },
  startButton: {
    marginTop: 32,
  },
  helperText: {
    marginTop: 16,
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 8,
  },
  titleSummary: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    marginTop: 32,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledSecondary: {
    opacity: 0.4,
  },
});
