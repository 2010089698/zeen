import { SessionRecord } from '../types/session';

/**
 * 疑似的な同期処理。実際にはここをAPI呼び出しに置き換える。
 * 成功したレコードIDを返す。
 */
export const syncPendingRecords = async (
  records: SessionRecord[],
): Promise<string[]> => {
  if (records.length === 0) {
    return [];
  }
  await new Promise((resolve) => setTimeout(resolve, 400));
  return records.map((record) => record.id);
};
