import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useSessionStore } from '../state/sessionStore';
import { formatDuration } from '../utils/time';

const PauseScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Pause'>> = ({
  navigation,
}) => {
  const status = useSessionStore((state) => state.status);
  const currentSession = useSessionStore((state) => state.currentSession);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const abortSession = useSessionStore((state) => state.abortSession);

  useEffect(() => {
    if (status === 'active') {
      navigation.replace('Session');
    } else if (status === 'summary') {
      navigation.replace('Summary');
    } else if (status === 'idle') {
      navigation.replace('Home');
    }
  }, [status, navigation]);

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>中断中のセッションはありません</Text>
        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>ホームへ戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>セッションを一時停止しました</Text>
      <Text style={styles.subTitle}>残り時間 {formatDuration(currentSession.remainingSeconds)}</Text>
      <Text style={styles.description}>
        集中を続ける準備ができたら「再開」をタップしてください。セッションを終了する場合は「終了」を選択できます。
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, styles.leftButton]}
          onPress={() => {
            resumeSession();
            navigation.replace('Session');
          }}
        >
          <Text style={styles.secondaryButtonText}>再開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            abortSession();
            navigation.replace('Summary');
          }}
        >
          <Text style={styles.primaryButtonText}>終了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  subTitle: {
    color: '#38bdf8',
    fontSize: 18,
    marginBottom: 16,
  },
  description: {
    color: '#cbd5f5',
    lineHeight: 20,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
  leftButton: {
    marginRight: 12,
  },
  infoText: {
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default PauseScreen;
