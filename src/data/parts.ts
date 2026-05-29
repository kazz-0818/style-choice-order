import type { PartOption } from '../types/bag'

export const MATERIALS: PartOption[] = [
  {
    id: 'smooth-leather',
    name: 'Smooth Leather',
    description: '上質なスムースレザー。店舗別注でも人気の定番素材。',
    priceModifier: 0,
  },
  {
    id: 'textured-leather',
    name: 'Textured Leather',
    description: '革の風合いを活かしたテクスチャードレザー。',
    priceModifier: 3000,
  },
  {
    id: 'canvas',
    name: 'Canvas',
    description: 'カジュアルからイベント販売まで使いやすいキャンバス。',
    priceModifier: -2000,
  },
  {
    id: 'nylon-like',
    name: 'Nylon Like',
    description: '軽量で耐久性のあるナイロン風素材。',
    priceModifier: -1500,
  },
]

export const HANDLE_TYPES: PartOption[] = [
  {
    id: 'short-handle',
    name: 'Short Handle',
    description: 'ハンドバッグ向けの短い取手。',
    priceModifier: 0,
  },
  {
    id: 'long-handle',
    name: 'Long Handle',
    description: 'トート向けの長めの取手。',
    priceModifier: 500,
  },
  {
    id: 'shoulder-strap',
    name: 'Shoulder Strap',
    description: 'ショルダーストラップ。斜め掛け仕様に対応。',
    priceModifier: 800,
  },
  {
    id: 'chain-handle',
    name: 'Chain Handle',
    description: 'チェーン取手。ミニバッグで華やかな印象に。',
    priceModifier: 1200,
  },
]

export const HARDWARE_COLORS: PartOption[] = [
  {
    id: 'gold',
    name: 'Gold',
    priceModifier: 0,
    metalColorId: 'gold',
  },
  {
    id: 'silver',
    name: 'Silver',
    priceModifier: 0,
    metalColorId: 'gray',
  },
  {
    id: 'black-nickel',
    name: 'Black Nickel',
    priceModifier: 200,
    metalColorId: 'black',
  },
  {
    id: 'antique-brass',
    name: 'Antique Brass',
    priceModifier: 300,
    metalColorId: 'brown',
  },
]

export const DECORATIONS: PartOption[] = [
  { id: 'none', name: 'None', description: '装飾なしのシンプル仕様。', priceModifier: 0 },
  {
    id: 'stitch-accent',
    name: 'Stitch Accent',
    description: 'ステッチのアクセントを入れた仕様。',
    priceModifier: 1500,
  },
  {
    id: 'front-pocket',
    name: 'Front Pocket',
    description: 'フロントポケット付き。',
    priceModifier: 2000,
  },
  {
    id: 'metal-plate',
    name: 'Metal Plate',
    description: 'メタルプレートのブランド表示向けオプション。',
    priceModifier: 2500,
  },
  {
    id: 'charm',
    name: 'Charm',
    description: 'チャーム付き。ギフト・限定向けにも。',
    priceModifier: 1800,
  },
]

export const materialMap = Object.fromEntries(MATERIALS.map((p) => [p.id, p]))
export const handleMap = Object.fromEntries(HANDLE_TYPES.map((p) => [p.id, p]))
export const hardwareMap = Object.fromEntries(HARDWARE_COLORS.map((p) => [p.id, p]))
export const decorationMap = Object.fromEntries(DECORATIONS.map((p) => [p.id, p]))
