export type BagTemplateId = 'tote' | 'mini-hand' | 'shoulder'

export type BagLayer = 'body' | 'handle' | 'side' | 'bottom' | 'metal' | 'accent'

export type ColorCategory = 'basic' | 'accent' | 'neutral'

export interface ColorOption {
  id: string
  name: string
  hex: string
  category: ColorCategory
}

export interface BagTemplate {
  id: BagTemplateId
  name: string
  description: string
  basePrice: number
  availableParts: string[]
}

export interface PartOption {
  id: string
  name: string
  description?: string
  priceModifier: number
  /** 金具カラー選択時に metal レイヤーへ反映する色ID */
  metalColorId?: string
}

export interface LayerColors {
  body: string
  handle: string
  side: string
  bottom: string
  metal: string
  accent: string
}

export interface BagCustomization {
  templateId: BagTemplateId
  materialId: string
  handleTypeId: string
  hardwareColorId: string
  decorationId: string
  layerColors: LayerColors
}

export interface LayerMeta {
  id: BagLayer
  label: string
}

export const BAG_LAYERS: LayerMeta[] = [
  { id: 'body', label: '本体' },
  { id: 'handle', label: '取手' },
  { id: 'side', label: 'サイド' },
  { id: 'bottom', label: '底' },
  { id: 'metal', label: '金具' },
  { id: 'accent', label: '装飾' },
]

export const DEFAULT_LAYER_COLORS: LayerColors = {
  body: 'black',
  handle: 'brown',
  side: 'black',
  bottom: 'dark-brown',
  metal: 'gold',
  accent: 'beige',
}

export const DEFAULT_CUSTOMIZATION: BagCustomization = {
  templateId: 'tote',
  materialId: 'smooth-leather',
  handleTypeId: 'short-handle',
  hardwareColorId: 'gold',
  decorationId: 'none',
  layerColors: { ...DEFAULT_LAYER_COLORS },
}
