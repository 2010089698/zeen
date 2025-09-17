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
    marginTop: 32,
    borderTopWidth: 0,
    borderColor: 'transparent',
    paddingTop: 0,
  },
  heading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  separator: {
    height: 20,
  },
  item: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginBottom: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2F4F4F',
  },
  syncBadge: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    fontSize: 12,
    overflow: 'hidden',
  },
  synced: {
    backgroundColor: 'transparent',
    color: '#9ca3af',
  },
  pending: {
    backgroundColor: 'transparent',
    color: '#b45309',
  },
  itemDetail: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  feedbackText: {
    fontWeight: '400',
  },
});
