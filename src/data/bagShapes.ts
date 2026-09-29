import type { BagSize, BagTemplateId } from '../types/bag'

/** GLB モデル寸法（scripts/generate-bag-glb.mjs と一致） */
export const MODEL = {
  W: 2.1,
  H: 1.55,
  D: 0.72,
  TOP: 1.55 / 2,
  ATTACH_X: 2.1 / 2 - 0.08,
  /** 二本持ち手の前後オフセット（奥行き半分に対する係数を掛ける前の値） */
  HANDLE_Z: 0.12,
  ARCH_H: 0.48,
  BOTTOM_T: 0.1,
  STUD_H: 0.05,
  FLAP_H: 0.7,
  FLAP_T: 0.05,
  POCKET_W: 1.3,
  POCKET_H: 0.6,
  POCKET_T: 0.05,
} as const

/** 前後面のふくらみ量（scripts/generate-bag-glb.mjs の BULGE と一致させる） */
const BULGE = 0.035

/** 本体前面の中央がふくらむ量（モデル座標 xm, ym）。前面パーツの取付面計算に使う */
export function frontBulge(xm: number, ym: number): number {
  const xn = xm / (MODEL.W / 2)
  const yn = ym / (MODEL.H / 2)
  const fx = Math.max(0, 1 - xn * xn)
  const fy = Math.max(0, 1 - yn * yn)
  return BULGE * Math.pow(fx, 0.7) * Math.pow(fy, 0.7)
}

export type HandleMode = 'dual' | 'single'

export interface BagShape {
  /** 標準寸法に対する本体スケール */
  sx: number
  sy: number
  sz: number
  handle: {
    mode: HandleMode
    /** 取付幅（本体幅に対する比率） */
    spread: number
    /** 標準の持ち手の高さ倍率 */
    base: number
    /** 前後への傾き（rad） */
    tilt: number
    /** 断面（前後）の太さ倍率 */
    thick: number
  }
}

/** 提案書の6型ごとの標準プロポーション */
export const BAG_SHAPES: Record<BagTemplateId, BagShape> = {
  business: {
    sx: 0.95,
    sy: 0.85,
    sz: 0.75,
    handle: { mode: 'dual', spread: 0.6, base: 0.75, tilt: 0, thick: 1 },
  },
  boston: {
    sx: 1,
    sy: 0.72,
    sz: 1.35,
    handle: { mode: 'dual', spread: 0.5, base: 0.75, tilt: 0, thick: 1 },
  },
  'shoulder-pouch': {
    sx: 0.5,
    sy: 0.75,
    sz: 0.55,
    handle: { mode: 'single', spread: 0.85, base: 1.5, tilt: 0.35, thick: 1.4 },
  },
  'mini-boston': {
    sx: 0.75,
    sy: 0.55,
    sz: 1.1,
    handle: { mode: 'dual', spread: 0.55, base: 0.6, tilt: 0, thick: 1 },
  },
  shoulder: {
    sx: 0.9,
    sy: 0.7,
    sz: 0.7,
    handle: { mode: 'single', spread: 0.85, base: 1.5, tilt: 0.4, thick: 1.6 },
  },
  tote: {
    sx: 0.95,
    sy: 1,
    sz: 0.9,
    handle: { mode: 'dual', spread: 0.75, base: 1, tilt: 0, thick: 1 },
  },
}

/** 実寸比（モデル単位）での本体寸法 */
export function getBodyDimensions(templateId: BagTemplateId, size: BagSize) {
  const shape = BAG_SHAPES[templateId]
  return {
    sx: shape.sx * (size.width / 100),
    sy: shape.sy * (size.height / 100),
    sz: shape.sz * (size.gusset / 100),
    w: MODEL.W * shape.sx * (size.width / 100),
    h: MODEL.H * shape.sy * (size.height / 100),
    d: MODEL.D * shape.sz * (size.gusset / 100),
  }
}
