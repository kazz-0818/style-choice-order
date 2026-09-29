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

/** dual: 2本持ち手 / single: ショルダーストラップ / top: 中央1本の小さなトップハンドル */
export type HandleMode = 'dual' | 'single' | 'top'

export interface BagShape {
  /** 標準寸法に対する本体スケール */
  sx: number
  sy: number
  sz: number
  /** 本体の作り：箱型（角丸）または円筒 */
  body: 'box' | 'cylinder'
  /** 上端の幅・奥行きが底に対して何倍か（1 = 直方体、小さいほど台形・A字） */
  taper: { x: number; z: number }
  handle: {
    mode: HandleMode
    /** 取付幅（上端の本体幅に対する比率） */
    spread: number
    /** 標準の持ち手の高さ倍率 */
    base: number
    /** 前後への傾き（rad） */
    tilt: number
    /** 断面（前後）の太さ倍率 */
    thick: number
    /** 前後の取付位置（上面の半奥行きに対する比率。既定 0.55） */
    edge?: number
    /** 表裏の持ち手を頂点で寄せる比率（頂点の間隔 / 根元の間隔。未指定＝垂直） */
    converge?: number
    /** 表裏の持ち手（dual）のバンド幅・厚み（モデル単位。パンフレットの帯の太さ） */
    bandW?: number
    bandT?: number
  }
}

/** 高さ ym（モデル座標）での上すぼまり係数（0=底で1、上端でtaper値） */
export function taperFactor(shape: BagShape, ym: number): { fx: number; fz: number } {
  const t = Math.max(0, Math.min(1, (ym + MODEL.TOP) / (2 * MODEL.TOP)))
  return {
    fx: 1 + (shape.taper.x - 1) * t,
    fz: 1 + (shape.taper.z - 1) * t,
  }
}

/** パンフレット（2026/08/06版）7型の標準プロポーション（線画の縦横比・側面の傾きに合わせる） */
export const BAG_SHAPES: Record<BagTemplateId, BagShape> = {
  // 台形のトップハンドル。側面は上に向かって細くなるA字
  'top-handle': {
    sx: 0.8,
    sy: 0.78,
    sz: 0.62,
    body: 'box',
    taper: { x: 0.85, z: 0.6 },
    handle: { mode: 'dual', spread: 0.49, base: 1.27, tilt: 0, thick: 1, converge: 0.42, bandW: 0.066, bandT: 0.05 },
  },
  // 横長の角型。側面は底が広い台形
  business: {
    sx: 0.82,
    sy: 0.9,
    sz: 0.75,
    body: 'box',
    taper: { x: 0.96, z: 0.7 },
    handle: { mode: 'dual', spread: 0.39, base: 1.22, tilt: 0, thick: 1, converge: 0.5, bandW: 0.085, bandT: 0.05 },
  },
  // 口金付きの台形。側面は三角に近い
  boston: {
    sx: 0.92,
    sy: 0.75,
    sz: 1.25,
    body: 'box',
    taper: { x: 0.8, z: 0.45 },
    handle: { mode: 'dual', spread: 0.49, base: 1.02, tilt: 0, thick: 1, bandW: 0.085, bandT: 0.05 },
  },
  // 縦型ポーチ。小さなトップハンドル＋チェーンストラップ
  'shoulder-pouch': {
    sx: 0.52,
    sy: 0.8,
    sz: 0.5,
    body: 'box',
    taper: { x: 0.92, z: 0.8 },
    handle: { mode: 'top', spread: 0.32, base: 0.3, tilt: 0, thick: 1 },
  },
  // 円筒（ドラム）形の横長ミニボストン
  'mini-boston': {
    sx: 0.78,
    sy: 0.62,
    sz: 1.33,
    body: 'cylinder',
    taper: { x: 1, z: 1 },
    handle: { mode: 'dual', spread: 0.54, base: 1.2, tilt: 0, thick: 1, bandW: 0.08, bandT: 0.05 },
  },
  // 丸みのある横型。細いストラップ
  shoulder: {
    sx: 0.9,
    sy: 0.7,
    sz: 0.7,
    body: 'box',
    taper: { x: 1, z: 1 },
    handle: { mode: 'single', spread: 0.95, base: 2.4, tilt: 0.3, thick: 1, bandW: 0.05, bandT: 0.022 },
  },
  // 横長トート。側面はA字
  tote: {
    sx: 0.95,
    sy: 0.85,
    sz: 0.9,
    body: 'box',
    taper: { x: 0.95, z: 0.6 },
    handle: { mode: 'dual', spread: 0.44, base: 1.65, tilt: 0, thick: 1, converge: 0.5, bandW: 0.084, bandT: 0.05 },
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
