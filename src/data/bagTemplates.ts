import type { BagTemplate } from '../types/bag'

export const BAG_TEMPLATES: BagTemplate[] = [
  {
    id: 'tote',
    name: 'Tote Bag',
    description: '日常使いから店舗別注まで対応しやすい定番トート型。',
    basePrice: 12000,
    availableParts: [
      'material',
      'handle',
      'hardware',
      'decoration',
      'body',
      'handle-layer',
      'side',
      'bottom',
      'metal',
      'accent',
    ],
  },
  {
    id: 'mini-hand',
    name: 'Mini Hand Bag',
    description: '小ぶりなハンドバッグ。取手と金具の組み合わせが印象を左右します。',
    basePrice: 15000,
    availableParts: [
      'material',
      'handle',
      'hardware',
      'decoration',
      'body',
      'handle-layer',
      'side',
      'bottom',
      'metal',
      'accent',
    ],
  },
  {
    id: 'shoulder',
    name: 'Shoulder Bag',
    description: 'ショルダーストラップ付き。サイドやストラップのカラー変更に最適。',
    basePrice: 14000,
    availableParts: [
      'material',
      'handle',
      'hardware',
      'decoration',
      'body',
      'handle-layer',
      'side',
      'bottom',
      'metal',
      'accent',
    ],
  },
]

export const templateMap = Object.fromEntries(
  BAG_TEMPLATES.map((t) => [t.id, t]),
)
