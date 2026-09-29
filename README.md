# Desfy Original フルオーダーメイドバッグ カスタマイザー

パンフレット（`docs/brochure/brochure-20260806.pdf`）の仕様に沿って作成した、バッグのカスタマイズ＆問い合わせサイトです。

## 仕様の対応

- **6つのバッグ型**：ビジネス／ボストン／ショルダーポーチ／ミニボストン／ショルダー／トート
- **素材**：本革・合皮・布・化学繊維
- **ステップ**：型 → 素材 → シルエット（高さ・幅・マチ）→ 型ごとの仕様（開口部・持ち手・ポケット・留め具・チャーム・ストラップ等）→ 金具 → ロゴ／プレート／タグ → カラー → 確認
- **OTHER VIEWS**：正面・背面・側面・上面・底面のカメラ切替
- **製作の流れ**：ヒアリング → 素材・デザインの決定 → お見積もり → 製作開始 → 納品
- 価格は表示せず、サイズ・価格は個別提案（スライダーは標準比の%）

## 開発

```bash
npm install
npm run dev
npm run build
npm run generate:bag-glb   # public/models/custom-bag.glb を再生成
```

## 構成

- `src/data/` … 型・素材・仕様ステップ・形状パラメータ
- `src/utils/threeD/bagLayout.ts` … カスタマイズ内容からパーツ配置を計算
- `src/components/illustrations/` … SVGイラスト（アイコン・バッグ図・オプション図）
- `scripts/generate-bag-glb.mjs` … 3Dモデル（GLB）生成

## 要確認

- `src/config/contact.ts` の `CONTACT_EMAIL` は仮アドレスです。本番前に差し替えてください。
