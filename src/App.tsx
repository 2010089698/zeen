import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
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
  const blob1 = useState(new Animated.Value(0))[0];
  const blob2 = useState(new Animated.Value(0))[0];
  const blob3 = useState(new Animated.Value(0))[0];
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

  const startBlobAnimation = (val: Animated.Value, delay: number, duration: number) => {
    const loop = () => {
      val.setValue(0);
      Animated.timing(val, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  };

  useMemo(() => {
    // 20〜30秒周期
    startBlobAnimation(blob1, 0, 24000);
    startBlobAnimation(blob2, 4000, 28000);
    startBlobAnimation(blob3, 8000, 26000);
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
        <Animated.View
          style={[
            styles.blob,
            {
              transform: [
                { translateX: blob1.interpolate({ inputRange: [0, 1], outputRange: [-40, 30] }) },
                { translateY: blob1.interpolate({ inputRange: [0, 1], outputRange: [10, -20] }) },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blobSmall,
            {
              right: 40,
              transform: [
                { translateX: blob2.interpolate({ inputRange: [0, 1], outputRange: [20, -30] }) },
                { translateY: blob2.interpolate({ inputRange: [0, 1], outputRange: [-10, 30] }) },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            {
              bottom: 120,
              left: 60,
              transform: [
                { translateX: blob3.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
                { translateY: blob3.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
              ],
            },
          ]}
        />
      </View>
      <Text style={[styles.focusSubtitle, { color: '#A9AFA7' }]}>Focusing...</Text>
      <Text style={[styles.focusTimer, { color: '#E8E8E6' }]}>{formatDuration(remainingTime)}</Text>
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
      <Text style={[styles.focusTimer, { color: '#E8E8E6' }]}>{formatDuration(remainingTime)}</Text>
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
    <SafeAreaView edges={['left','right','bottom']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={phase === 'running' || phase === 'paused' ? 'light' : 'dark'} />
      <View style={[styles.scrollContent, { paddingTop: insets.top + 16 }]}>{content}</View>
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
