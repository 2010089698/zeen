# Zeen MVP Starter

Expo管理型ワークフローで動作する集中セッションアプリの初期セットアップです。`expo start` で Expo Go から動作確認ができます。

## セットアップ
1. 依存パッケージをインストールします。
   ```bash
   npm install
   ```
2. 開発サーバーを起動します。
   ```bash
   npm start
   ```
3. 表示される QR コードを Expo Go で読み取ると、MVP 仕様に沿った最小画面フローを確認できます。

## 構成概要
- `App.tsx`: エントリーポイント。
- `src/App.tsx`: 画面レンダリングと状態遷移を制御。
- `src/hooks/useSessionManager.ts`: セッション状態管理、履歴保存、疑似同期処理を担当。
- `src/storage/sessionStorage.ts`: AsyncStorage を利用したセッション履歴の永続化。
- `src/services/syncService.ts`: オフライン同期を模したスタブ。
- `src/components/*`: UI コンポーネント群。

## 主な仕様カバレッジ
- セッション開始/一時停止/再開/終了の状態遷移
- 残り時間と経過時間のカウントダウン表示
- 中断回数および「集中できたか」のフィードバック取得
- 直近 10 件までのローカル履歴保存と疑似同期状態の表示
- Expo Go で動作確認できる設定（EAS なし）

## 型チェック
TypeScript の型チェックは以下で実行できます。
```bash
npm run typecheck
```
