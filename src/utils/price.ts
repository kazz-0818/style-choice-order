import { templateMap } from '../data/bagTemplates'
import {
  decorationMap,
  handleMap,
  hardwareMap,
  materialMap,
} from '../data/parts'
import type { BagCustomization } from '../types/bag'

export interface PriceBreakdown {
  base: number
  material: number
  handle: number
  hardware: number
  decoration: number
  total: number
}

export function calculatePrice(customization: BagCustomization): PriceBreakdown {
  const template = templateMap[customization.templateId]
  const base = template?.basePrice ?? 0
  const material = materialMap[customization.materialId]?.priceModifier ?? 0
  const handle = handleMap[customization.handleTypeId]?.priceModifier ?? 0
  const hardware = hardwareMap[customization.hardwareColorId]?.priceModifier ?? 0
  const decoration = decorationMap[customization.decorationId]?.priceModifier ?? 0
  const total = base + material + handle + hardware + decoration

  return { base, material, handle, hardware, decoration, total }
}

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}
