# 最適な有酸素運動

最適な有酸素運動を発見し、記録し、計画するためのウェブアプリケーションです。

## 概要

「最適な有酸素運動」は、ユーザーが効果的な有酸素運動を見つけ、進捗を追跡し、フィットネスの旅をプランニングするための総合的なプラットフォームです。アプリケーションはパーソナライズされたワークアウトプラン、進捗管理、そしてフィットネスの成果を視覚化するダッシュボードを提供します。

## 機能

- **ユーザー認証**: 安全な登録とログイン
- **ワークアウトライブラリ**: さまざまな有酸素運動の閲覧と検索
- **パーソナライズプラン**: カスタムワークアウトプランの作成とフォロー
- **進捗管理**: フィットネスの旅を記録
- **ダッシュボード**: ワークアウトデータと成果の視覚化

## 技術スタック

- **フロントエンド**: React with TypeScript
- **フレームワーク**: Remix
- **スタイリング**: Tailwind CSS
- **データベースORM**: Prisma
- **ビルドツール**: Vite
- **テスト**: Vitest

## 始め方

### 前提条件

- Node.js (v16以降)
- pnpm

### インストール

1. リポジトリをクローンする
2. 依存関係をインストール:

   ```bash
   pnpm install
   ```

3. 環境変数の設定:

   ```bash
   cp .env.example .env
   ```

4. データベースの初期化:

   ```bash
   pnpm prisma db push
   ```

5. 開発サーバーの起動:

   ```bash
   pnpm dev
   ```

6. turso

   ```bash

   brew install tursodatabase/tap/turso

   turso auth login

   turso db create best-aerobic-exercise

   turso db show best-aerobic-exercise

   turso db tokens create best-aerobic-exercise

   ```

7. 環境変数の更新

   ```bash
   # example
   TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
   TURSO_DATABASE_URL="libsql://best-aerobic-exercise.turso.io"
   ```

## 開発

### コマンド

- `pnpm dev`: 開発サーバーの起動
- `pnpm build`: プロダクションビルド
- `pnpm start`: プロダクションサーバーの起動
- `pnpm test`: テストの実行
- `pnpm lint`: コードのリント
- `pnpm format`: コードのフォーマット

