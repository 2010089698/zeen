import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import SessionDurationSelector from '../components/SessionDurationSelector';
import SessionHistoryList from '../components/SessionHistoryList';
import { useSessionStore } from '../state/sessionStore';

const HomeScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Home'>> = ({
  navigation,
}) => {
  const [duration, setDuration] = useState(25);
  const startSession = useSessionStore((state) => state.startSession);
  const status = useSessionStore((state) => state.status);
  const history = useSessionStore((state) => state.history);
  const unsynced = useSessionStore((state) => state.unsynced);
  const syncPending = useSessionStore((state) => state.syncPending);

  useEffect(() => {
    if (status === 'active') {
      navigation.navigate('Session');
    } else if (status === 'paused') {
      navigation.navigate('Pause');
    } else if (status === 'summary') {
      navigation.navigate('Summary');
    }
  }, [status, navigation]);

  const handleStart = () => {
    startSession(duration);
    navigation.navigate('Session');
  };

  const handleSync = async () => {
    try {
      await syncPending();
      Alert.alert('同期完了', '同期待ちのセッションを送信しました');
    } catch {
      Alert.alert('同期エラー', '同期待ちデータの送信に失敗しました');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroSection}>
        <Text style={styles.title}>今日も集中しよう</Text>
        <Text style={styles.subtitle}>
          スマホの誘惑を断ち、集中時間を可視化します。セッション時間を選んでスタート！
        </Text>
      </View>
      <SessionDurationSelector value={duration} onChange={setDuration} />
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>セッションを開始</Text>
      </TouchableOpacity>
      {unsynced.length > 0 && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncText}>同期待ちのセッション: {unsynced.length}件</Text>
          <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
            <Text style={styles.syncButtonText}>今すぐ同期</Text>
          </TouchableOpacity>
        </View>
      )}
      <SessionHistoryList history={history} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0f172a',
  },
  heroSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5f5',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  syncBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  syncText: {
    color: '#facc15',
    fontWeight: '600',
    marginBottom: 8,
  },
  syncButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#38bdf8',
  },
  syncButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
});

export default HomeScreen;
