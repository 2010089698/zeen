import { memo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
          {item.synced ? 'Synced' : 'Not Synced'}
        </Text>
      </View>
      <Text style={styles.itemDetail}>Scheduled: {formatDuration(item.scheduledDurationSec)}</Text>
      <Text style={styles.itemDetail}>Actual: {formatDuration(item.actualDurationSec)}</Text>
      <Text style={styles.itemDetail}>Interruptions: {item.pauseCount}</Text>
      <Text style={styles.itemDetail}>
        Were you able to concentrate?:
        <Text style={styles.feedbackText}>
          {item.focusFeedback === 'yes' ? ' Yes' : item.focusFeedback === 'no' ? ' No' : ' Unanswered'}
        </Text>
      </Text>
    </View>
  );
};

const keyExtractor = (item: SessionRecord) => item.id;

const SessionHistoryListComponent = ({ history, loading = false }: SessionHistoryListProps) => {
  const [expanded, setExpanded] = useState(false);
  const { height } = useWindowDimensions();
  // 画面高さに応じた最大高さ（過度に大きく/小さくならないように上下限）
  const listMaxHeight = Math.max(160, Math.min(360, height * 0.35));

  return (
    <View style={styles.container}>
      <Pressable style={styles.headingRow} onPress={() => setExpanded(v => !v)}>
        <Text style={styles.heading}>Recent Session History</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded && (
        loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>No sessions yet</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={[styles.list, { maxHeight: listMaxHeight }]}
            contentContainerStyle={styles.listContent}
            bounces={false}
          />
        )
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    marginRight: 8,
  },
  chevron: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  separator: {
    height: 20,
  },
  list: {
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 4,
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
