import type { PartOption } from '../types/bag'

/** 素材（パンフレット P2：本革・合皮・布・化学繊維 ＋ ファー・ボア） */
export const MATERIALS: PartOption[] = [
  {
    id: 'genuine-leather',
    name: '本革',
    description: '上質な天然皮革。経年変化まで楽しめる本格仕様。',
  },
  {
    id: 'synthetic-leather',
    name: '合皮',
    description: 'カラーが豊富で扱いやすい。軽さとお手入れのしやすさが魅力。',
  },
  {
    id: 'fabric',
    name: '布',
    description: 'キャンバスなどの生地。カジュアルで軽やかな仕上がりに。',
  },
  {
    id: 'fur',
    name: 'ファー・ボア',
    description: 'ふわふわのフェイクファー。縁や持ち手を革でまとめるのがおすすめ。',
  },
  {
    id: 'tech-fiber',
    name: '化学繊維',
    description: 'ナイロン等の機能素材。撥水性・耐久性に優れます。',
  },
]

/** 金具のカラー・素材 */
export const HARDWARE_COLORS: PartOption[] = [
  { id: 'gold', name: 'ゴールド', metalColorId: 'gold' },
  { id: 'silver', name: 'シルバー', metalColorId: 'gray' },
  { id: 'black-nickel', name: 'ブラックニッケル', metalColorId: 'black' },
  { id: 'antique-brass', name: 'アンティークブラス', metalColorId: 'brown' },
]

export const materialMap = Object.fromEntries(MATERIALS.map((p) => [p.id, p]))
export const hardwareMap = Object.fromEntries(HARDWARE_COLORS.map((p) => [p.id, p]))
