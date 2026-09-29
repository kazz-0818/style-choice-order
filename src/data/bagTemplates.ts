import type { BagTemplate } from '../types/bag'

/** パンフレット（2026/08/06版）記載の7型（掲載順） */
export const BAG_TEMPLATES: BagTemplate[] = [
  {
    id: 'top-handle',
    name: 'トップハンドルバッグ型',
    nameEn: 'Top Handle Bag',
    description: '台形の端正なフォルムに、ベルトとターンロック。持ち手の長さやベルト仕様まで設計。',
  },
  {
    id: 'business',
    name: 'ビジネスバッグ型',
    nameEn: 'Business Bag',
    description: '整ったスクエアフォルム。外ポケットや内仕切りまで仕様を細かく設計。',
  },
  {
    id: 'boston',
    name: 'ボストンバッグ型',
    nameEn: 'Boston Bag',
    description: '口金フレームとツイストロックが印象的な、横長でエレガントな一型。',
  },
  {
    id: 'shoulder-pouch',
    name: 'ショルダーポーチ型',
    nameEn: 'Shoulder Pouch',
    description: 'フラップ付きの縦型ポーチ。チャーム・チェーンでアレンジ自在。',
  },
  {
    id: 'mini-boston',
    name: 'ミニボストンバッグ型',
    nameEn: 'Mini Boston Bag',
    description: 'ころんと丸みのある円筒形のミニボストン。引き手やチェーンで表情が変わります。',
  },
  {
    id: 'shoulder',
    name: 'ショルダーバッグ型',
    nameEn: 'Shoulder Bag',
    description: '丸みのある横型フォルム。ストラップ幅や金具まで選べます。',
  },
  {
    id: 'tote',
    name: 'トートバッグ型',
    nameEn: 'Tote Bag',
    description: 'シャープな横長トート。マチ・外ポケット・底鋲を自由に設計。',
  },
]

export const templateMap = Object.fromEntries(
  BAG_TEMPLATES.map((t) => [t.id, t]),
) as Record<string, (typeof BAG_TEMPLATES)[number]>
