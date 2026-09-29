import {
  BAG_SHAPES,
  MODEL as M,
  frontBulge,
  getBodyDimensions,
  taperFactor,
} from '../../data/bagShapes'
import type { BagCustomization } from '../../types/bag'
import type { MeshName } from './modelConfig'
import type { ChainPoints } from './strapChain'

export interface MeshLayout {
  visible: boolean
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export interface BagLayout {
  meshes: Record<MeshName, MeshLayout>
  /** シーン全体の拡縮・縦位置（バッグを画面中央に収める） */
  rootScale: number
  rootY: number
  /** 実行時に生成するチェーン（ストラップ／前面のドレープ）の経路 */
  chain: { points: ChainPoints; linkScale: number } | null
  /** 本体の上すぼまり（上端の幅・奥行き倍率） */
  taper: { x: number; z: number }
}

const HAND_LENGTH: Record<string, number> = { short: 0.7, standard: 1, long: 1.35, shoulder: 1.9 }
const STRAP_LENGTH: Record<string, number> = { short: 0.75, standard: 1, long: 1.3 }
const STRAP_WIDTH: Record<string, number> = { narrow: 0.7, standard: 1, wide: 1.7 }
const CHAIN_LINK: Record<string, number> = { narrow: 0.8, standard: 1, wide: 1.3 }
const BELT_WIDTH: Record<string, number> = { thin: 0.6, standard: 1, thick: 1.45 }
/** フラップ下端の張り出し（モデル単位）と、ロック位置の補正 */
const FLAP_EXTRA: Record<string, number> = { square: 0, round: 0, curve: 0.12, point: 0.2 }
/** ベルト（トップハンドル）の中心高さ・革タブの長さ */
const BELT_Y = M.TOP - 0.27
const TAB_TOP_Y = M.TOP - 0.05
const CHAIN_LENGTH: Record<string, number> = { short: 0.35, medium: 0.65, long: 1 }

const CLASP_SCALE: Record<string, [number, number, number]> = {
  turn: [1, 1, 1],
  padlock: [1, 1.25, 1],
  twist: [0.8, 0.95, 1],
  belt: [1.25, 1.35, 1],
  snap: [0.6, 0.8, 1],
  bar: [1.7, 0.7, 1],
  shield: [1, 1, 1],
}

const ZIPPER_OPENINGS = ['zipper', 'zip-single', 'zip-double', 'frame-zip']

export const STUD_COLORS: Record<string, string> = {
  gold: '#c9a24a',
  silver: '#c8ccd2',
  black: '#2a2f3a',
}

function layout(
  position: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  visible = true,
  rotation: [number, number, number] = [0, 0, 0],
): MeshLayout {
  return { visible, position, rotation, scale }
}

/** カスタマイズ内容から各パーツの位置・スケールを計算する（純粋関数） */
export function computeBagLayout(customization: BagCustomization): BagLayout {
  const { templateId, size, specs } = customization
  const shape = BAG_SHAPES[templateId]
  const { sx, sy, sz } = getBodyDimensions(templateId, size)

  const top = M.TOP * sy
  const isCyl = shape.body === 'cylinder'
  const fxAt = (ym: number) => taperFactor(shape, ym).fx
  const fzAt = (ym: number) => taperFactor(shape, ym).fz
  const topF = taperFactor(shape, M.TOP)
  /** 前面の取付面 z（ふくらみ・上すぼまりを含む） */
  const surfaceZ = (xm: number, ym: number) => (M.D / 2 + frontBulge(xm, ym)) * sz * fzAt(ym)
  /** 縦に長い板を、ふくらんだ面に沿わせる（中心 z と X軸回転） */
  const fitPlate = (yTopM: number, yBotM: number, xm = 0) => {
    const zTop = surfaceZ(xm, yTopM)
    const zBot = surfaceZ(xm, yBotM)
    const h = Math.abs(yTopM - yBotM) * sy
    return { z: (zTop + zBot) / 2, rot: -Math.atan((zBot - zTop) / h), zTop, zBot }
  }
  const u = Math.max(0.55, Math.min(sx, sy, 1))

  const isStrap = shape.handle.mode === 'single'
  const isTop = shape.handle.mode === 'top'
  const dual = shape.handle.mode === 'dual'
  const isPouch = templateId === 'shoulder-pouch'
  const isMini = templateId === 'mini-boston'
  const isTopHandle = templateId === 'top-handle'
  const hasTabs = templateId === 'business' || templateId === 'tote' || templateId === 'top-handle'

  /** 円筒（ミニボストン）の前面：正面中心から角度 phi（上向き正）の位置と、面に沿う傾き */
  const cylPoint = (phi: number) => {
    const ry = top
    const rz = (M.D / 2) * sz
    return {
      y: ry * Math.sin(phi),
      z: rz * Math.cos(phi),
      rot: -Math.atan2(Math.sin(phi) / ry, Math.cos(phi) / rz),
    }
  }

  // ── 持ち手 ─────────────────────────
  const lengthTable = isStrap ? STRAP_LENGTH : HAND_LENGTH
  const lengthMult = isPouch ? 1 : (lengthTable[specs.handle ?? 'standard'] ?? 1)
  const hl = shape.handle.base * lengthMult
  const hx = sx * topF.fx * shape.handle.spread
  const widthMult = specs.strapWidth ? (STRAP_WIDTH[specs.strapWidth] ?? 1) : 1
  const tz = shape.handle.thick * (isStrap ? widthMult : 1)
  const zc = !dual
    ? 0
    : isCyl
      ? M.HANDLE_Z * sz
      : (shape.handle.edge ?? 0.55) * (M.D / 2) * sz * topF.fz
  // 天面の角丸で前後の縁は下がるため、持ち手の取付位置もわずかに下げる
  let topDrop = 0
  if (dual && isCyl) {
    topDrop = top * (1 - Math.sqrt(1 - (zc / ((M.D / 2) * sz)) ** 2)) * 0.9
  } else if (dual) {
    const rz = 0.22 * sz * topF.fz
    const flat = (M.D / 2) * sz * topF.fz - rz
    const dz = Math.max(0, zc - flat)
    topDrop = 0.16 * sy * (1 - Math.sqrt(Math.max(0, 1 - (dz / rz) ** 2))) * 0.9
  }
  const handleTop = top - topDrop
  // 表裏それぞれの持ち手を頂点に向けて内側へ傾ける（根元は表裏のパネル側、頂点で寄る）
  const converge = dual ? shape.handle.converge : undefined
  const leanSin =
    converge !== undefined
      ? Math.min(0.5, ((1 - converge) * zc) / (M.ARCH_H * hl))
      : Math.sin(shape.handle.tilt)
  const theta = -Math.asin(leanSin)
  const handleY = handleTop - M.TOP * hl * Math.cos(theta)
  const handleZ = (sign: number, th: number = theta) => sign * zc - M.TOP * hl * Math.sin(th)
  const ringX = M.ATTACH_X * hx

  // ── 前面パーツの表示判定 ─────────────
  const hasFlap =
    isPouch || specs.opening === 'flap' || specs.opening === 'frame-flap'
  const flapKind = isPouch ? (specs.flap ?? 'square') : 'square'
  const flapExtra = FLAP_EXTRA[flapKind] ?? 0
  const pocketFront = specs.pocket === 'front' || specs.pocket === 'both'
  const pocketBack = specs.pocket === 'back' || specs.pocket === 'both'
  const splitPockets = templateId === 'business'

  const claspId = isPouch
    ? specs.clasp
    : templateId === 'business' || templateId === 'boston' || isMini || isTopHandle
      ? specs.lock
      : undefined
  const claspKnown = !!claspId && claspId in CLASP_SCALE
  const claspVisible = claspKnown && claspId !== 'shield'
  const shieldVisible = claspKnown && claspId === 'shield'
  const claspScale = CLASP_SCALE[claspId ?? 'turn'] ?? CLASP_SCALE.turn
  const cylClasp = cylPoint(0.3)
  const cylPlate = cylPoint(-0.25)

  const plateVisible = !!specs.logo && specs.logo !== 'none'

  // ── ベルト（トップハンドル） ─────────────
  const beltK = BELT_WIDTH[specs.beltWidth ?? 'standard'] ?? 1
  const beltVisible = isTopHandle
  const beltStitchVisible = beltVisible && specs.beltStitch !== 'none'
  const beltLayout = {
    pos: [0, BELT_Y * sy * (1 - beltK), 0] as [number, number, number],
    scale: [sx, sy * beltK, sz] as [number, number, number],
  }

  // ── チャーム・チェーン ─────────────────
  const charmSpec = specs.charm ?? 'none'
  const drapeVisible = isMini && (charmSpec === 'chain' || charmSpec === 'both')
  const chainVisible =
    !isMini && (charmSpec === 'chain' || charmSpec === 'both' || charmSpec === 'charm')
  const charmVisible = charmSpec === 'charm' || charmSpec === 'both'
  const chainLen =
    charmSpec === 'charm' ? 0.28 : (CHAIN_LENGTH[specs.chainLength ?? 'medium'] ?? 0.65)
  const charmDesign = specs.charmDesign ?? 'ball'
  const charmAt = (design: string) => charmVisible && charmDesign === design
  const charmX = (M.W / 2) * sx * fxAt(M.TOP - 0.4) + 0.02
  const charmTopY = top - 0.4 * sy
  let charmPos: [number, number, number] = [charmX, charmTopY - chainLen - 0.1, 0]

  // ── チェーン経路（ポーチのストラップ／ミニボストンのドレープ） ──
  let chain: BagLayout['chain'] = null
  let chainTopY = top
  if (isPouch) {
    const lenMult = STRAP_LENGTH[specs.handle ?? 'standard'] ?? 1
    const arch = M.ARCH_H * 1.8 * lenMult
    const cx = M.ATTACH_X * sx * topF.fx * 0.97
    const tilt = 0.28
    const pts: ChainPoints = []
    const n = 40
    for (let i = 0; i <= n; i++) {
      const t = (2 * i) / n - 1
      const h = arch * Math.pow(Math.max(0, 1 - Math.abs(t) ** 2.4), 0.8)
      pts.push([cx * t, top - 0.02 + h * Math.cos(tilt), -h * Math.sin(tilt)])
    }
    chain = { points: pts, linkScale: CHAIN_LINK[specs.strapWidth ?? 'standard'] ?? 1 }
    chainTopY = top + arch * Math.cos(tilt)
  }
  if (isMini) {
    const rz = (M.D / 2) * sz
    const phi0 = Math.acos(Math.min(0.99, zc / rz))
    const sag = 1.2
    const pts: ChainPoints = []
    const n = 14
    for (let i = 0; i <= n; i++) {
      const s01 = i / n
      const phi = phi0 - sag * 4 * s01 * (1 - s01)
      pts.push([ringX * (2 * s01 - 1), top * Math.sin(phi) * 1.02 + 0.005, rz * Math.cos(phi) * 1.02 + 0.012])
    }
    if (drapeVisible) chain = { points: pts, linkScale: 1 }
    // チャームはドレープの最下点から垂らす
    const mid = cylPoint(phi0 - sag)
    const cy = mid.y - 0.12
    const cz = rz * Math.sqrt(Math.max(0.05, 1 - (cy / top) ** 2)) + 0.045
    charmPos = [0, cy, cz]
  }

  // ── 底鋲 ──────────────────────────
  const studsVisible = specs.studs === 'four'
  const studX = Math.max((M.W / 2 - 0.5) * sx, 0.12)
  const studZ = Math.max((M.D / 2 - 0.26) * sz, 0.05)
  const studY = -top - M.STUD_H / 2

  const studPositions: [number, number][] = [
    [-studX, -studZ],
    [studX, -studZ],
    [-studX, studZ],
    [studX, studZ],
  ]

  // ── 開口部（ファスナー・口金・マグネット・オープン） ──
  const opening = specs.opening ?? ''
  const zipVisible = ZIPPER_OPENINGS.includes(opening)
  const mouthVisible = opening === 'open' || opening === 'frame'
  const frameVisible = opening === 'frame' || opening === 'frame-flap' || opening === 'frame-zip'
  const magnetVisible = opening === 'magnet'
  const pullerKind = specs.puller ?? 'ring'
  const pullerXs: number[] =
    opening === 'zip-double' ? [-0.3, 0.3] : opening === 'zip-single' ? [0] : [0.5]
  const pullerY = isCyl ? top + 0.012 : (M.TOP - 0.24) * sy
  const pullerZ = (xm: number) => (isCyl ? 0 : surfaceZ(xm, M.TOP - 0.24) + 0.014)
  // 円筒型は天面に寝かせ、カーブに沿って手前へ垂らす
  const pullerRot: [number, number, number] = isCyl ? [-1.15, 0, 0] : [0, 0, 0]
  const pu = Math.max(0.6, Math.min(1.1, u))
  const puller = (idx: 0 | 1) => {
    const visible = zipVisible && (idx === 0 || opening === 'zip-double')
    const px = pullerXs[idx] ?? 0
    const pos: [number, number, number] = [px * sx * fxAt(M.TOP - 0.24), pullerY, pullerZ(px)]
    const scale: [number, number, number] = [pu, pu, pu]
    return {
      slider: layout(pos, scale, visible, pullerRot),
      ring: layout(pos, scale, visible && pullerKind === 'ring', pullerRot),
      tab: layout(pos, scale, visible && pullerKind === 'tab', pullerRot),
      tassel: layout(pos, scale, visible && pullerKind === 'tassel', pullerRot),
      bar: layout(pos, scale, visible && pullerKind === 'bar', pullerRot),
    }
  }
  const p0 = puller(0)
  const p1 = puller(1)
  const bodyScale: [number, number, number] = [sx, sy, sz]

  // ── 前面の板パーツ（フラップ・ポケット） ──
  const flapFit = fitPlate(M.TOP, M.TOP - M.FLAP_H)
  const flapScale: [number, number, number] = [sx * fxAt(M.TOP - M.FLAP_H / 2), sy, 1]
  const flapPos: [number, number, number] = [
    0,
    top - (M.FLAP_H * sy) / 2,
    flapFit.z + M.FLAP_T / 2 - 0.006,
  ]
  const flapRot: [number, number, number] = [flapFit.rot, 0, 0]
  const flapOf = (kind: string) => hasFlap && flapKind === kind

  const pocketH = splitPockets ? 1.4 : 1
  const pocketFit = fitPlate(-0.2 + (M.POCKET_H * pocketH) / 2, -0.2 - (M.POCKET_H * pocketH) / 2)
  const pocketFx = fxAt(-0.2)
  const pocketZ = pocketFit.z + M.POCKET_T / 2 - 0.008

  // ── 革タブ・サイドリング（ビジネス／トート） ──
  const tabLen = templateId === 'business' ? 1.46 : templateId === 'top-handle' ? 1.33 : 1.4
  const tabFit = fitPlate(TAB_TOP_Y, TAB_TOP_Y - 0.5 * tabLen, 0)
  const tabX = ringX
  const tabLayout = (idx: number) => {
    const front = idx < 2
    const sign = idx % 2 === 0 ? -1 : 1
    return layout(
      [sign * tabX, TAB_TOP_Y * sy, (front ? 1 : -1) * (tabFit.zTop - 0.002)],
      [1, sy * tabLen, 1],
      hasTabs,
      front ? [tabFit.rot, 0, 0] : [-tabFit.rot, Math.PI, 0],
    )
  }
  const ringsY = (M.TOP - 0.16) * sy

  // ── 金具（ロック）・ロゴプレートの位置 ──
  const beltFit = fitPlate(BELT_Y + 0.08, BELT_Y - 0.08)
  let claspPos: [number, number, number]
  let claspRot: [number, number, number] = [0, 0, 0]
  if (isCyl) {
    claspPos = [0, cylClasp.y, cylClasp.z + 0.03]
    claspRot = [cylClasp.rot, 0, 0]
  } else if (isTopHandle) {
    claspPos = [
      0,
      BELT_Y * sy,
      hasFlap ? flapFit.z + M.FLAP_T / 2 + 0.03 : beltFit.z * 1.012 + 0.032,
    ]
    claspRot = hasFlap ? [0, 0, 0] : [beltFit.rot, 0, 0]
  } else if (hasFlap) {
    claspPos = [0, top - (M.FLAP_H + flapExtra) * sy + 0.03, flapFit.z + M.FLAP_T / 2 + 0.03]
  } else {
    claspPos = [0, top - 0.26 * sy, surfaceZ(0, M.TOP - 0.26) + 0.03]
  }
  const platePos: [number, number, number] = isCyl
    ? [0, cylPlate.y, cylPlate.z + 0.02]
    : [
        0,
        (hasFlap ? -0.1 : 0.25) * sy,
        surfaceZ(0, hasFlap ? -0.1 : 0.25) + 0.02 + (pocketFront && hasFlap ? M.POCKET_T : 0),
      ]

  const meshes = {
    body: layout([0, 0, 0], [sx, sy, sz], !isCyl),
    side: layout([0, 0, 0], [sx, sy, sz], !isCyl),
    bottom: layout([0, 0, 0], [sx, sy, sz], !isCyl),
    'drum-body': layout([0, 0, 0], [sx, sy, sz], isCyl),
    'drum-side': layout([0, 0, 0], [sx, sy, sz], isCyl),
    'drum-zip-tape': layout([0, 0, 0], bodyScale, zipVisible && isCyl),
    'drum-zip-teeth': layout([0, 0, 0], bodyScale, zipVisible && isCyl),
    belt: layout(beltLayout.pos, beltLayout.scale, beltVisible),
    'belt-stitch': layout(beltLayout.pos, beltLayout.scale, beltStitchVisible),
    handle: layout([0, handleY, handleZ(1)], [hx, hl, tz], true, [theta, 0, 0]),
    'strap-chain': layout([0, 0, 0], [1, 1, 1], !!chain),
    handle2: layout(
      [0, handleY, handleZ(-1, converge !== undefined ? -theta : theta)],
      [hx, hl, tz],
      dual,
      [converge !== undefined ? -theta : theta, 0, 0],
    ),
    'ring-single': layout([0, top, 0], [hx, 1, 1], isStrap || isTop),
    'ring-dual': layout([0, handleTop, 0], [hx, 1, Math.max(0.01, zc / M.HANDLE_Z)], dual),
    'tab-0': tabLayout(0),
    'tab-1': tabLayout(1),
    'tab-2': tabLayout(2),
    'tab-3': tabLayout(3),
    'side-rings': layout(
      [0, ringsY, 0],
      [sx * fxAt(M.TOP - 0.16), 1, 1],
      hasTabs && !isTopHandle,
    ),
    clasp: layout(
      claspPos,
      [claspScale[0] * u, claspScale[1] * u, claspScale[2]],
      claspVisible,
      claspRot,
    ),
    'clasp-shield': layout(claspPos, [u, u, 1], shieldVisible, claspRot),
    flap: layout(flapPos, flapScale, hasFlap && flapKind === 'square', flapRot),
    'flap-round': layout(flapPos, flapScale, flapOf('round'), flapRot),
    'flap-curve': layout(flapPos, flapScale, flapOf('curve'), flapRot),
    'flap-point': layout(flapPos, flapScale, flapOf('point'), flapRot),
    pocket: layout(
      [0, -0.2 * sy, pocketZ],
      [sx * pocketFx, sy, 1],
      pocketFront && !splitPockets,
      [pocketFit.rot, 0, 0],
    ),
    'pocket-l': layout(
      [-0.335 * sx * pocketFx, -0.2 * sy, pocketZ],
      [sx * pocketFx, sy * pocketH, 1],
      pocketFront && splitPockets,
      [pocketFit.rot, 0, 0],
    ),
    'pocket-r': layout(
      [0.335 * sx * pocketFx, -0.2 * sy, pocketZ],
      [sx * pocketFx, sy * pocketH, 1],
      pocketFront && splitPockets,
      [pocketFit.rot, 0, 0],
    ),
    'pocket-back': layout(
      [0, -0.2 * sy, -pocketZ],
      [sx * pocketFx, sy, 1],
      pocketBack,
      [-pocketFit.rot, 0, 0],
    ),
    plate: layout(platePos, [u, u, 1], plateVisible, isCyl ? [cylPlate.rot, 0, 0] : [0, 0, 0]),
    chain: layout(
      [charmX, charmTopY - chainLen / 2, 0],
      [1, chainLen, 1],
      chainVisible,
    ),
    charm: layout(charmPos, [1, 1, 1], charmAt('ball')),
    'charm-star': layout(charmPos, [1, 1, 1], charmAt('star')),
    'charm-heart': layout(charmPos, [1, 1, 1], charmAt('heart')),
    'charm-tassel': layout(charmPos, [1, 1, 1], charmAt('tassel')),
    'charm-tag': layout(charmPos, [1, 1, 1], charmAt('tag')),
    'stud-0': layout([studPositions[0][0], studY, studPositions[0][1]], [1, 1, 1], studsVisible),
    'stud-1': layout([studPositions[1][0], studY, studPositions[1][1]], [1, 1, 1], studsVisible),
    'stud-2': layout([studPositions[2][0], studY, studPositions[2][1]], [1, 1, 1], studsVisible),
    'stud-3': layout([studPositions[3][0], studY, studPositions[3][1]], [1, 1, 1], studsVisible),
    'zip-tape': layout([0, 0, 0], bodyScale, zipVisible && !isCyl),
    'zip-teeth': layout([0, 0, 0], bodyScale, zipVisible && !isCyl),
    'opening-mouth': layout([0, 0, 0], bodyScale, mouthVisible),
    frame: layout([0, 0, 0], bodyScale, frameVisible),
    'magnet-tab': layout([0, 0, 0], bodyScale, magnetVisible),
    'magnet-snap': layout([0, 0, 0], bodyScale, magnetVisible),
    'puller-slider': p0.slider,
    'puller-ring': p0.ring,
    'puller-tab': p0.tab,
    'puller-tassel': p0.tassel,
    'puller-bar': p0.bar,
    'puller2-slider': p1.slider,
    'puller2-ring': p1.ring,
    'puller2-tab': p1.tab,
    'puller2-tassel': p1.tassel,
    'puller2-bar': p1.bar,
  } satisfies Record<MeshName, MeshLayout>

  // ── 画面中央への収まり ─────────────────
  const handleArch = top + M.ARCH_H * hl * Math.cos(theta) + 0.06
  const archTop = Math.max(handleArch, isPouch ? chainTopY + 0.06 : 0)
  let bottomY = -top - (studsVisible ? M.STUD_H : 0)
  if (chainVisible) bottomY = Math.min(bottomY, charmTopY - chainLen - (charmVisible ? 0.22 : 0.05))
  const height = archTop - bottomY
  const width = M.W * sx + (chainVisible ? 0.3 : 0)
  const rootScale = Math.min(3.2 / height, 3.9 / width, 1.15)
  const rootY = (-(archTop + bottomY) / 2) * rootScale

  return { meshes, rootScale, rootY, chain, taper: shape.taper }
}
