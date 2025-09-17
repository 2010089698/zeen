import { memo, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { formatDateTime, formatDuration } from '../utils/time';

export type Session = {
  id: string;
  startedAt: string; // ISO
  plannedSec: number;
  actualSec: number;
  interruptions: number;
  focusedAnswer?: 'yes' | 'no' | 'unknown';
};

type Props = { sessions: Session[] };

const DEFAULT_VISIBLE = 3;

function HistorySectionComponent({ sessions }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleCount = expanded
    ? Math.min(10, sessions.length)
    : Math.min(DEFAULT_VISIBLE, sessions.length);

  const data = useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        )
        .slice(0, visibleCount),
    [sessions, visibleCount],
  );

  const toggle = () => {
    if (Platform.OS === 'android') {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const showToggle = sessions.length > DEFAULT_VISIBLE;
  const buttonLabel = expanded ? '閉じる' : 'もっと見る';
  const a11yLabel = expanded ? '履歴を閉じる' : '履歴を展開';

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>直近のセッション履歴</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>まだ履歴がありません</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>直近のセッション履歴</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item} testID="history-item">
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{formatDateTime(item.startedAt)}</Text>
              {item.focusedAnswer !== undefined && (
                <Text
                  style={[
                    styles.syncBadge,
                    item.focusedAnswer === 'unknown'
                      ? styles.pending
                      : styles.synced,
                  ]}
                >
                  {item.focusedAnswer === 'yes'
                    ? '集中: はい'
                    : item.focusedAnswer === 'no'
                    ? '集中: いいえ'
                    : '集中: 未回答'}
                </Text>
              )}
            </View>
            <Text style={styles.itemDetail}>予定: {formatDuration(item.plannedSec)}</Text>
            <Text style={styles.itemDetail}>実績: {formatDuration(item.actualSec)}</Text>
            <Text style={styles.itemDetail}>中断回数: {item.interruptions}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      {showToggle && (
        <Pressable
          testID="history-toggle"
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          onPress={toggle}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>{buttonLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export const HistorySection = memo(HistorySectionComponent);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  item: {
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 13,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  syncBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  synced: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
  },
  pending: {
    backgroundColor: '#fff7ed',
    color: '#9a3412',
  },
  toggleButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6e8b77',
  },
  toggleButtonText: {
    color: '#6e8b77',
    fontSize: 14,
    fontWeight: '500',
  },
});


