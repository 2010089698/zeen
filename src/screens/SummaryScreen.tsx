import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useSessionStore } from '../state/sessionStore';
import { formatDuration } from '../utils/time';

const SummaryScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Summary'>> = ({
  navigation,
}) => {
  const status = useSessionStore((state) => state.status);
  const summary = useSessionStore((state) => state.summary);
  const resetSession = useSessionStore((state) => state.resetSession);
  const recordFeedback = useSessionStore((state) => state.recordFeedback);

  useEffect(() => {
    if (!summary) {
      navigation.replace('Home');
    }
  }, [summary, navigation]);

  useEffect(() => {
    if (status === 'active') {
      navigation.replace('Session');
    } else if (status === 'paused') {
      navigation.replace('Pause');
    }
  }, [status, navigation]);

  if (!summary) {
    return null;
  }

  const handleFinish = () => {
    resetSession();
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>セッション結果</Text>
      <View style={styles.card}>
        <Text style={styles.statLabel}>合計集中時間</Text>
        <Text style={styles.statValue}>{formatDuration(summary.actualDurationSeconds)}</Text>
        <View style={styles.statRow}>
          <Text style={styles.statItem}>予定 {summary.plannedDurationMinutes}分</Text>
          <Text style={styles.statItem}>中断 {summary.interruptions}回</Text>
          <Text style={styles.statItem}>状態 {summary.status === 'completed' ? '完了' : '中断終了'}</Text>
        </View>
      </View>
      <Text style={styles.question}>集中できましたか？</Text>
      <View style={styles.feedbackRow}>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            styles.feedbackButtonLeft,
            summary.feedback === 'yes' && styles.feedbackSelectedYes,
          ]}
          onPress={() => recordFeedback('yes')}
        >
          <Text style={styles.feedbackText}>はい</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.feedbackButton, summary.feedback === 'no' && styles.feedbackSelectedNo]}
          onPress={() => recordFeedback('no')}
        >
          <Text style={styles.feedbackText}>いいえ</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>ホームに戻る</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statLabel: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    color: '#cbd5f5',
  },
  question: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  feedbackButtonLeft: {
    marginRight: 12,
  },
  feedbackSelectedYes: {
    backgroundColor: '#22c55e',
  },
  feedbackSelectedNo: {
    backgroundColor: '#ef4444',
  },
  feedbackText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 16,
    borderRadius: 12,
  },
  finishButtonText: {
    textAlign: 'center',
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SummaryScreen;
