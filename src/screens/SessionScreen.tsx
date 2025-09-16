import React, { useCallback, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useSessionStore } from '../state/sessionStore';
import { formatDuration } from '../utils/time';

const SessionScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Session'>> = ({
  navigation,
}) => {
  const status = useSessionStore((state) => state.status);
  const currentSession = useSessionStore((state) => state.currentSession);
  const tick = useSessionStore((state) => state.tick);
  const pauseSession = useSessionStore((state) => state.pauseSession);
  const endSession = useSessionStore((state) => state.endSession);

  useFocusEffect(
    useCallback(() => {
      if (status !== 'active') {
        return () => undefined;
      }
      const interval = setInterval(() => {
        tick();
      }, 1000);
      return () => clearInterval(interval);
    }, [status, tick]),
  );

  useEffect(() => {
    if (status === 'paused') {
      navigation.replace('Pause');
    } else if (status === 'summary') {
      navigation.replace('Summary');
    } else if (status === 'idle') {
      navigation.replace('Home');
    }
  }, [status, navigation]);

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>セッション情報が見つかりませんでした</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.primaryButtonText}>ホームへ戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sessionTitle}>集中セッション中</Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatDuration(currentSession.remainingSeconds)}</Text>
        <Text style={styles.plannedText}>
          予定: {currentSession.plannedDurationMinutes}分 / 中断 {currentSession.interruptions}回
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, styles.buttonLeft]}
          onPress={pauseSession}
        >
          <Text style={styles.secondaryButtonText}>一時停止</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={endSession}>
          <Text style={styles.primaryButtonText}>セッション終了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sessionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 32,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  timerText: {
    fontSize: 64,
    color: '#38bdf8',
    fontWeight: '700',
    letterSpacing: 2,
  },
  plannedText: {
    color: '#cbd5f5',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLeft: {
    marginRight: 12,
  },
  infoText: {
    color: '#e2e8f0',
    marginBottom: 16,
  },
});

export default SessionScreen;
