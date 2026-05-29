# Style Choice Order — オーダーメイドバッグ受注ページ

Style Choice LLC合同会社向けの、オーダーメイドバッグ受注・カスタマイズ体験用 Web サイトです。  
バッグの型・パーツ・カラーを選びながら SVG プレビューで完成イメージを確認し、問い合わせ用テキストをコピーして製作相談につなげます。

## プロジェクト概要

- **目的**: オーダーメイドバッグの受注を受けやすくする（単なる LP ではなく、カスタマイズ体験付きの受注導線）
- **対象**: 個人のお客様、セレクトショップ・百貨店・ブランドの別注相談
- **データ**: 現時点はフロントエンドのみ（DB なし）。受注内容は問い合わせテキストとして出力

## 使用技術

| 項目 | 技術 |
|------|------|
| UI | React 19 + TypeScript |
| ビルド | Vite 8 |
| スタイル | Tailwind CSS v4 |
| プレビュー | SVG レイヤー着色（将来 PNG マスク等へ差し替え可能） |
| デプロイ想定 | Vercel（推奨） / Firebase Hosting |

## ローカル起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

本番ビルド:

```bash
npm run build
npm run preview
```

## GitHub への push 方法

```bash
git init
git add .
git commit -m "initial build: custom bag order page"
git branch -M main
git remote add origin https://github.com/kazz-0818/style-choice-order.git
git push -u origin main
```

**リポジトリ（作成済み）:** https://github.com/kazz-0818/style-choice-order

## Vercel デプロイ方法

### ダッシュボードから（推奨・初回）

1. [Vercel Dashboard](https://vercel.com/new) を開く
2. **Import Git Repository** → `kazz-0818/style-choice-order` を選択
3. Framework Preset: **Vite**（自動検出）
4. Build Command: `npm run build` / Output Directory: `dist`（デフォルトのまま）
5. **Deploy** をクリック

**本番 URL:** https://style-choice-order.vercel.app

以降、`main` への push で自動デプロイされます（GitHub 連携が Vercel ダッシュボードで有効な場合）。

### CLI から

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

デプロイ後、プレビュー URL でクライアント確認 → 問題なければカスタムドメインを接続します。

**推奨本番 URL（例）**

- `https://order.stylechoice.co.jp/`
- `https://custom.stylechoice.co.jp/`

Vercel ダッシュボード → Project → Settings → Domains で CNAME を設定してください。

## Firebase Hosting に移行する場合のメモ

本リポジトリには `firebase.json` を同梱しています。

```bash
npm run build
npx firebase-tools login
npx firebase init hosting   # 既存 firebase.json がある場合は public=dist を確認
npx firebase deploy --only hosting
```

- `public` は `dist`（Vite の出力先）
- SPA のため `rewrites` で全ルートを `index.html` へ転送済み
- 環境変数は現状不要（静的サイト）

## ディレクトリ構成（主要）

```
src/
  App.tsx                 # ページ構成・状態の受け渡し
  components/
    BagCustomizer.tsx     # カスタマイズ UI 統合
    BagPreview.tsx        # SVG プレビュー（差し替え可能）
    PartSelector.tsx / ColorSelector.tsx / OptionSummary.tsx
  data/                   # テンプレート・パーツ・カラー定義
  types/bag.ts            # 型定義
  utils/                  # 価格計算・問い合わせ文生成
  config/contact.ts       # 問い合わせ先（要差し替え）
```

## 問い合わせ先の設定

`src/config/contact.ts` のメールアドレス・電話番号を本番用に更新してください。

## 今後追加したい機能

- 実際の商品写真 / PNG マスクを使ったリアルなプレビュー
- 管理画面からバッグ型・パーツ・カラーを追加
- Supabase / Firebase への問い合わせ保存
- 画像としてダウンロード
- PDF 見積書の自動生成
- LINE 公式アカウントへの送信
- 法人向け数量別見積もり
- 管理者用の受注一覧

## ライセンス

Style Choice LLC — 社内・クライアント確認用
