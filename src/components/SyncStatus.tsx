import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { getSyncMetrics, formatLastSyncTime, SyncMetrics } from '../services/syncMetrics';

interface SyncStatusProps {
  isOnline?: boolean;
}

export function SyncStatus({ isOnline = true }: SyncStatusProps) {
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getSyncMetrics();
        setMetrics(data);
      } catch (error) {
        console.warn('Failed to load sync metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6b7280" />
        <Text style={styles.text}>同期状態を読み込み中...</Text>
      </View>
    );
  }

  if (!metrics) {
    return null;
  }

  const lastSyncText = formatLastSyncTime(metrics.lastSyncAt);
  const hasUnsyncedData = metrics.failedCount > 0 || metrics.retryCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.label}>最後の同期:</Text>
        <Text style={[styles.value, hasUnsyncedData && styles.warning]}>
          {lastSyncText}
        </Text>
      </View>
      
      {!isOnline && (
        <Text style={styles.offlineText}>オフライン - 接続時に自動同期します</Text>
      )}
      
      {hasUnsyncedData && isOnline && (
        <Text style={styles.retryText}>
          {metrics.retryCount > 0 && `${metrics.retryCount}件の再試行中`}
          {metrics.failedCount > 0 && ` ${metrics.failedCount}件の同期失敗`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginVertical: 0,
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
  },
  value: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
  },
  warning: {
    color: '#b45309',
  },
  offlineText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
    fontStyle: 'normal',
  },
  retryText: {
    fontSize: 10,
    color: '#b45309',
    marginTop: 2,
  },
});
