import type { BagTemplateId, PartOption } from '../types/bag'

/** トートバッグ専用取手 */
export const TOTE_HANDLES: PartOption[] = [
  {
    id: 'tote-long',
    name: 'Long Handle',
    description: 'トート定番の長めハンドル。肩掛けにも対応しやすいバランス。',
    priceModifier: 0,
  },
  {
    id: 'tote-rope',
    name: 'Rope Handle',
    description: 'カジュアルなロープ取手。リゾート・イベント向けにも。',
    priceModifier: 400,
  },
  {
    id: 'tote-short',
    name: 'Short Handle',
    description: 'コンパクトな短め取手。ハンドバッグ感のあるトート仕様。',
    priceModifier: -200,
  },
]

/** ミニハンドバッグ専用取手 */
export const MINI_HANDLES: PartOption[] = [
  {
    id: 'mini-short',
    name: 'Short Handle',
    description: 'ミニバッグ向けの短い取手。エレガントな持ち方に。',
    priceModifier: 0,
  },
  {
    id: 'mini-chain',
    name: 'Chain Handle',
    description: 'チェーン取手。華やかでフォーマルな印象に。',
    priceModifier: 1200,
  },
  {
    id: 'mini-bow',
    name: 'Bow Handle',
    description: 'ボウ型取手。ギフト・限定ライン向けのデザイン。',
    priceModifier: 800,
  },
]

/** ショルダーバッグ専用取手 */
export const SHOULDER_HANDLES: PartOption[] = [
  {
    id: 'shoulder-standard',
    name: 'Standard Strap',
    description: '定番のショルダーストラップ。日常使いに最適。',
    priceModifier: 0,
  },
  {
    id: 'shoulder-wide',
    name: 'Wide Strap',
    description: '太めストラップ。荷物が多い日や長時間の使用向け。',
    priceModifier: 500,
  },
  {
    id: 'shoulder-chain',
    name: 'Chain Strap',
    description: 'チェーンストラップ。きれいめ・ドレスアップ向け。',
    priceModifier: 1500,
  },
]

export const HANDLES_BY_TEMPLATE: Record<BagTemplateId, PartOption[]> = {
  tote: TOTE_HANDLES,
  'mini-hand': MINI_HANDLES,
  shoulder: SHOULDER_HANDLES,
}

export const ALL_HANDLES: PartOption[] = [
  ...TOTE_HANDLES,
  ...MINI_HANDLES,
  ...SHOULDER_HANDLES,
]

export const handleMap = Object.fromEntries(ALL_HANDLES.map((h) => [h.id, h]))

export function getHandlesForTemplate(templateId: BagTemplateId): PartOption[] {
  return HANDLES_BY_TEMPLATE[templateId]
}

export function getDefaultHandleForTemplate(templateId: BagTemplateId): string {
  return HANDLES_BY_TEMPLATE[templateId][0].id
}

export function isHandleValidForTemplate(
  templateId: BagTemplateId,
  handleTypeId: string,
): boolean {
  return HANDLES_BY_TEMPLATE[templateId].some((h) => h.id === handleTypeId)
}

export function resolveHandleForTemplate(
  templateId: BagTemplateId,
  currentHandleTypeId: string,
): string {
  if (isHandleValidForTemplate(templateId, currentHandleTypeId)) {
    return currentHandleTypeId
  }
  return getDefaultHandleForTemplate(templateId)
}

/** チェーン系取手（3Dプレビューの金属質感用） */
export function isChainHandleId(handleTypeId: string): boolean {
  return handleTypeId.includes('chain')
}

export function getHandleStepLabel(templateId: BagTemplateId): string {
  const labels: Record<BagTemplateId, string> = {
    tote: '取手タイプ（Tote Bag）',
    'mini-hand': '取手タイプ（Mini Hand Bag）',
    shoulder: '取手タイプ（Shoulder Bag）',
  }
  return labels[templateId]
}
