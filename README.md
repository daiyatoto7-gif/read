# 📚 BookLog

シンプルで続けやすい読書記録アプリ。タイトルと日付だけで記録完了。
データはクラウド（Supabase）に保存されるため、端末を変えても消えません。

## Features

- ✅ タイトル＋日付だけで即記録
- ☁️ Supabaseクラウド保存（データが消えない）
- 📊 読書量の自動統計・可視化（バーチャート・ヒートマップ・ジャンル分布）
- 🔥 週単位の連続読了ストリーク
- 🏆 実績バッジシステム（8種類）
- 📤 JSON/CSVエクスポート
- 🌐 Open Library API連携（表紙・著者自動取得）
- 📱 スマホ対応（Safari / ホーム画面追加で使える）
- 🌙 ダークモード対応
- 🔔 Web Pushリマインダー通知

## Getting Started

### 1. リポジトリをクローン

```bash
git clone https://github.com/daiyatoto7-gif/read
cd read
pnpm install
```

### 2. Supabaseのセットアップ

1. [supabase.com](https://supabase.com) でプロジェクトを作成（リージョン: Northeast Asia Tokyo 推奨）
2. Supabaseダッシュボードの「SQL Editor」を開く
3. `supabase/schema.sql` の内容をコピーして貼り付け、「Run」をクリック
4. `.env.local` を作成して環境変数を設定

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 環境変数の値は Supabaseダッシュボード → Settings → API から取得できます

### 3. 開発サーバー起動

```bash
pnpm dev
```

http://localhost:3000 にアクセスしてください。

### 4. メール確認を無効にする場合（開発時）

Supabaseダッシュボード → Authentication → Settings → 「Confirm email」をオフにすると、確認メールなしで登録が完了します。

### 5. Vercelへのデプロイ

1. GitHubにpush
2. [vercel.com](https://vercel.com) でリポジトリを連携してデプロイ
3. Vercelの「Environment Variables」に `.env.local` と同じ値を設定

## Tech Stack

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16（App Router） |
| スタイリング | Tailwind CSS + shadcn/ui |
| データベース | Supabase（PostgreSQL） |
| 認証 | Supabase Auth（メール＋パスワード） |
| 言語 | TypeScript |
| パッケージ管理 | pnpm |
| デプロイ | Vercel |
| グラフ | Recharts |
| 紙吹雪 | canvas-confetti |

## Database Schema

`supabase/schema.sql` を参照してください。以下のテーブルが含まれます:

- `books` - 書籍記録（タイトル、読了日、著者、ジャンル、評価、メモなど）
- `user_settings` - ユーザー設定（月間目標、通知設定）
- `badges` - 実績バッジ

すべてのテーブルはRow Level Security（RLS）が有効で、ユーザーは自分のデータのみアクセスできます。

## License

MIT
