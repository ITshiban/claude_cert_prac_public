---
name: ja-en-translation
description: 問題文・選択肢・解説・UI文言を英語⇔日本語に翻訳するときに使う。用語集と訳し方のルールで訳語を統一する。
---

# 翻訳ルール

## 基本方針
- 取り込んだ問題の英語原文は変更しない。日本語訳を追加するだけ
- 直訳より、日本の受験者が意味を取り違えない自然な日本語を優先する
- ただし、正解・誤答の判断に関わる限定語（first, most, always, only, never など）は訳から落とさない
- 文体は「です・ます」調。選択肢は体言止めまたは「〜する」で統一する
- 問題文中の選択肢記号（A〜D）は訳さない

## 用語集
### 英語のまま使う（Claudeの機能名・モデル名）
Claude, Anthropic, Projects, Artifacts, Research, Memory, Skills, Connectors,
Haiku, Sonnet, Opus, Claude Code, API, temperature

### 訳語を固定する
| 英語 | 日本語 |
|---|---|
| prompt | プロンプト |
| system prompt | システムプロンプト |
| context window | コンテキストウィンドウ |
| Project（機能名、単数でも） | Project |
| knowledge (Project knowledge) | ナレッジ（Project のナレッジ） |
| instructions (Project instructions) | 指示（Project の指示） |
| hallucination | ハルシネーション |
| fabricate / fabrication | 捏造する / 捏造 |
| verify / verification | 検証する / 検証 |
| human review | 人によるレビュー |
| escalate / escalation | エスカレーションする / エスカレーション |
| stakeholder | ステークホルダー |
| workflow | ワークフロー |
| anonymize | 匿名化する |
| pseudonymize | 仮名化する |
| personal data | 個人データ |
| policy (organizational) | （組織の）ポリシー |
| accountability | 説明責任 |
| decompose / decomposition | 分解する / タスク分解 |
| output | 出力 |
| domain（試験の） | ドメイン |

## 新しい用語が出たとき
- 上の表にない専門用語は、訳語案を提示してから使う
- 採用した訳語はこの用語集に追記する

## UI文言
- UI文言は i18n 辞書に ja / en の両方を必ず登録する
- ボタンは短く（例：「次へ」「回答する」「復習する」）
