export type BagTemplateId =
  | 'business'
  | 'boston'
  | 'shoulder-pouch'
  | 'mini-boston'
  | 'shoulder'
  | 'tote'
  | 'top-handle'

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
  nameEn: string
  description: string
}

export interface PartOption {
  id: string
  name: string
  description?: string
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

/** 本体サイズ（標準を100とした％。高さ・幅・マチ） */
export interface BagSize {
  height: number
  width: number
  gusset: number
}

/** 提案書に記載されたカスタマイズ項目のキー */
export type SpecKey =
  | 'opening'
  | 'puller'
  | 'handle'
  | 'pocket'
  | 'inner'
  | 'lock'
  | 'studs'
  | 'studColor'
  | 'flap'
  | 'piping'
  | 'clasp'
  | 'charm'
  | 'charmDesign'
  | 'chainLength'
  | 'beltWidth'
  | 'beltStitch'
  | 'strapWidth'
  | 'strapHook'
  | 'strapAdjust'
  | 'bottomPanel'
  | 'reinforce'
  | 'logo'

export type BagSpecs = Partial<Record<SpecKey, string>>

export interface BagCustomization {
  templateId: BagTemplateId
  materialId: string
  hardwareColorId: string
  size: BagSize
  specs: BagSpecs
  layerColors: LayerColors
  /** 色調のご希望（パントーンカラーなど・自由記入） */
  colorRequest?: string
}

export interface LayerMeta {
  id: BagLayer
  label: string
}

export const BAG_LAYERS: LayerMeta[] = [
  { id: 'body', label: '本体' },
  { id: 'handle', label: '持ち手' },
  { id: 'side', label: 'サイド' },
  { id: 'bottom', label: '底' },
  { id: 'metal', label: '金具' },
  { id: 'accent', label: '装飾' },
]

export const DEFAULT_LAYER_COLORS: LayerColors = {
  body: 'navy',
  handle: 'brown',
  side: 'navy',
  bottom: 'dark-brown',
  metal: 'gold',
  accent: 'beige',
}

export const SIZE_MIN = 80
export const SIZE_MAX = 130
export const SIZE_STEP = 5
export const DEFAULT_SIZE: BagSize = { height: 100, width: 100, gusset: 100 }
