import AsyncStorage from '@react-native-async-storage/async-storage';

const ANON_ID_KEY = 'anonId';

export function getAnonId(): Promise<string> {
  return AsyncStorage.getItem(ANON_ID_KEY).then((id) => {
    if (!id) {
      // React Nativeではcrypto.randomUUID()が利用できない場合があるため、
      // 代替実装を使用
      const newId = generateUUID();
      AsyncStorage.setItem(ANON_ID_KEY, newId);
      return newId;
    }
    return id;
  });
}

// React Native用のUUID生成関数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
