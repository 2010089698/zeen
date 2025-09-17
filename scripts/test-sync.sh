#!/bin/bash

# セッション同期APIのテストスクリプト
# 使用方法: ./scripts/test-sync.sh [API_BASE_URL]

set -e

# デフォルトのAPIベースURL（Supabase Edge Function）
API_BASE_URL=${1:-"https://your-project-ref.supabase.co/functions/v1"}
ENDPOINT="${API_BASE_URL}/sessions-batch"

# テスト用のセッションデータ
TEST_DATA='{
  "sessions": [
    {
      "id": "test-session-1",
      "startedAt": "2025-01-15T10:00:00Z",
      "endedAt": "2025-01-15T10:25:00Z",
      "metrics": {
        "focusScore": 85,
        "distractionCount": 2
      },
      "notes": "集中できたセッション"
    },
    {
      "id": "test-session-2", 
      "startedAt": "2025-01-15T11:00:00Z",
      "endedAt": "2025-01-15T11:30:00Z",
      "metrics": {
        "focusScore": 70,
        "distractionCount": 5
      },
      "notes": "少し集中が途切れた"
    }
  ]
}'

echo "🧪 セッション同期APIテスト開始"
echo "📍 エンドポイント: ${ENDPOINT}"
echo ""

# テスト1: 正常なリクエスト
echo "📤 テスト1: 正常なリクエスト"
echo "リクエストデータ:"
echo "${TEST_DATA}" | jq .
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Anon-Id: test-anon-id-123" \
  -d "${TEST_DATA}" \
  "${ENDPOINT}")

http_status=$(echo "${response}" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "${response}" | sed '/HTTP_STATUS:/d')

echo "レスポンス (HTTP ${http_status}):"
echo "${response_body}" | jq . 2>/dev/null || echo "${response_body}"
echo ""

# テスト2: X-Anon-Idヘッダーなし
echo "📤 テスト2: X-Anon-Idヘッダーなし"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "${TEST_DATA}" \
  "${ENDPOINT}")

http_status=$(echo "${response}" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "${response}" | sed '/HTTP_STATUS:/d')

echo "レスポンス (HTTP ${http_status}):"
echo "${response_body}" | jq . 2>/dev/null || echo "${response_body}"
echo ""

# テスト3: 無効なJSON
echo "📤 テスト3: 無効なJSON"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Anon-Id: test-anon-id-123" \
  -d '{"sessions": [{"id": "test", "startedAt": "invalid-date"}]}' \
  "${ENDPOINT}")

http_status=$(echo "${response}" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "${response}" | sed '/HTTP_STATUS:/d')

echo "レスポンス (HTTP ${http_status}):"
echo "${response_body}" | jq . 2>/dev/null || echo "${response_body}"
echo ""

# テスト4: 空のセッション配列
echo "📤 テスト4: 空のセッション配列"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Anon-Id: test-anon-id-123" \
  -d '{"sessions": []}' \
  "${ENDPOINT}")

http_status=$(echo "${response}" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "${response}" | sed '/HTTP_STATUS:/d')

echo "レスポンス (HTTP ${http_status}):"
echo "${response_body}" | jq . 2>/dev/null || echo "${response_body}"
echo ""

# テスト5: 冪等性テスト（同じIDで再送信）
echo "📤 テスト5: 冪等性テスト（同じIDで再送信）"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Anon-Id: test-anon-id-123" \
  -d "${TEST_DATA}" \
  "${ENDPOINT}")

http_status=$(echo "${response}" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "${response}" | sed '/HTTP_STATUS:/d')

echo "レスポンス (HTTP ${http_status}):"
echo "${response_body}" | jq . 2>/dev/null || echo "${response_body}"
echo ""

echo "✅ テスト完了"
