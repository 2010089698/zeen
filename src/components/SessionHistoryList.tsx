import { memo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SessionRecord } from '../types';
import { formatDateTime, formatDuration } from '../utils/time';

interface SessionHistoryListProps {
  history: SessionRecord[];
  loading?: boolean;
}

const renderItem = ({ item }: { item: SessionRecord }) => {
  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{formatDateTime(item.startedAt)}</Text>
        <Text style={[styles.syncBadge, item.synced ? styles.synced : styles.pending]}>
          {item.synced ? '同期済み' : '未同期'}
        </Text>
      </View>
      <Text style={styles.itemDetail}>予定: {formatDuration(item.scheduledDurationSec)}</Text>
      <Text style={styles.itemDetail}>実績: {formatDuration(item.actualDurationSec)}</Text>
      <Text style={styles.itemDetail}>中断回数: {item.pauseCount}</Text>
      <Text style={styles.itemDetail}>
        集中できた?:
        <Text style={styles.feedbackText}>
          {item.focusFeedback === 'yes' ? ' はい' : item.focusFeedback === 'no' ? ' いいえ' : ' 未回答'}
        </Text>
      </Text>
    </View>
  );
};

const keyExtractor = (item: SessionRecord) => item.id;

const SessionHistoryListComponent = ({ history, loading = false }: SessionHistoryListProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>直近のセッション履歴</Text>
      {loading ? (
        <Text style={styles.emptyText}>読み込み中...</Text>
      ) : history.length === 0 ? (
        <Text style={styles.emptyText}>まだセッションがありません</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

export const SessionHistoryList = memo(SessionHistoryListComponent);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  separator: {
    height: 12,
  },
  item: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
  },
  synced: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  pending: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  itemDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  feedbackText: {
    fontWeight: '600',
  },
});
