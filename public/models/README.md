# 3D Bag Models

Style Choice Order の 3D Preview β 用 GLB 配置ディレクトリです。

## 配置ファイル

| ファイル | 説明 |
|---------|------|
| `custom-bag.glb` | オーダーメイドバッグの3Dモデル（本番用） |

配置パス（WEBからのURL）:

```
/models/custom-bag.glb
```

リポジトリ内の物理パス:

```
public/models/custom-bag.glb
```

## 想定メッシュ名

Blender 等でエクスポートする際、以下の **オブジェクト名 / メッシュ名** に統一してください。
WEB側では選択カラーが各メッシュのマテリアルカラーに反映されます。

| メッシュ名 | 反映されるカラー |
|-----------|----------------|
| `body` | 本体カラー |
| `handle` | 取手カラー |
| `side` | サイドカラー |
| `bottom` | 底カラー |
| `metal` | 金具カラー |
| `accent` | 装飾カラー |

存在しないメッシュ名は無視されます（エラーにはなりません）。

## 制作の目安

### 方法A: スクリプトでβ用モデルを生成（同梱済み）

```bash
npm run generate:bag-glb
```

`public/models/custom-bag.glb` が再生成されます。トート型の簡易3Dモデル（メッシュ名は要件どおり）です。

### 方法B: Blender 等で本番用モデルを制作

1. バッグ本体・取手・金具・底・サイド・装飾をメッシュ分割
2. メッシュ名を上表に合わせる
3. GLB形式でエクスポート
4. このフォルダに `custom-bag.glb` として配置（上書き可）
5. `npm run dev` で 3D Preview β を確認

## 技術メモ

- 読み込み: React Three Fiber + `@react-three/drei`（`useGLTF`）
- コンポーネント: `src/components/ThreeDBagPreview.tsx` / `src/components/three/BagModel.tsx`
- 色反映ロジック: `src/utils/threeD/applyLayerColors.ts`
