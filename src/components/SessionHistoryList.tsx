import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { format } from 'date-fns';

import { SessionRecord } from '../types/session';
import { formatDuration, formatMinutes } from '../utils/time';

interface Props {
  history: SessionRecord[];
}

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>まだ履歴がありません</Text>
    <Text style={styles.emptySubText}>最初のセッションを開始して記録を作りましょう</Text>
  </View>
);

const SessionHistoryList: React.FC<Props> = ({ history }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>直近のセッション</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{format(new Date(item.startedAt), 'M/d HH:mm')}</Text>
                <Text style={styles.itemStatus}>
                  {item.status === 'completed' ? '完了' : '中断'}
                </Text>
              </View>
              <View>
                <Text style={[styles.itemText, styles.itemTextFirst]}>
                  予定: {formatMinutes(item.plannedDurationMinutes)} / 実績:
                  {' '}
                  {formatDuration(item.actualDurationSeconds)}
                </Text>
                <Text style={styles.itemText}>中断回数: {item.interruptions}回</Text>
                {item.feedback && (
                  <Text style={styles.itemText}>
                    集中できた: {item.feedback === 'yes' ? 'はい' : 'いいえ'}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={history.length === 0 ? styles.emptyContent : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 12,
  },
  itemContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  itemStatus: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  itemText: {
    color: '#cbd5f5',
    fontSize: 14,
    marginTop: 4,
  },
  itemTextFirst: {
    marginTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#cbd5f5',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
});

export default SessionHistoryList;
