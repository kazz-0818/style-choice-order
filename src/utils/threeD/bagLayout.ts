import { BAG_SHAPES, MODEL as M, frontBulge, getBodyDimensions } from '../../data/bagShapes'
import type { BagCustomization } from '../../types/bag'
import type { MeshName } from './modelConfig'

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
}

const HAND_LENGTH: Record<string, number> = { short: 0.7, standard: 1, long: 1.35, shoulder: 1.9 }
const STRAP_LENGTH: Record<string, number> = { short: 0.75, standard: 1, long: 1.3 }
const STRAP_WIDTH: Record<string, number> = { narrow: 0.7, standard: 1, wide: 1.7 }
const CHAIN_LENGTH: Record<string, number> = { short: 0.35, medium: 0.65, long: 1 }

const CLASP_SCALE: Record<string, [number, number, number]> = {
  turn: [1, 1, 1],
  padlock: [1, 1.25, 1],
  twist: [0.8, 0.95, 1],
  belt: [1.25, 1.35, 1],
  snap: [0.6, 0.8, 1],
  bar: [1.7, 0.7, 1],
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
  /** 前面の取付面 z（ふくらみを含む） */
  const surfaceZ = (xm: number, ym: number) => (M.D / 2 + frontBulge(xm, ym)) * sz
  /** 縦に長い板を、ふくらんだ面に沿わせる（中心 z と X軸回転） */
  const fitPlate = (yTopM: number, yBotM: number, xm = 0) => {
    const zTop = surfaceZ(xm, yTopM)
    const zBot = surfaceZ(xm, yBotM)
    const h = Math.abs(yTopM - yBotM) * sy
    return { z: (zTop + zBot) / 2, rot: -Math.atan((zBot - zTop) / h) }
  }
  const u = Math.max(0.55, Math.min(sx, sy, 1))

  const isStrap = shape.handle.mode === 'single'
  const dual = !isStrap

  // ── 持ち手 ─────────────────────────
  const lengthTable = isStrap ? STRAP_LENGTH : HAND_LENGTH
  const lengthMult = lengthTable[specs.handle ?? 'standard'] ?? 1
  const hl = shape.handle.base * lengthMult
  const hx = sx * shape.handle.spread
  const widthMult = specs.strapWidth ? (STRAP_WIDTH[specs.strapWidth] ?? 1) : 1
  const tz = shape.handle.thick * (templateId === 'shoulder' ? widthMult : 1)
  const theta = -shape.handle.tilt
  const zc = dual ? M.HANDLE_Z * sz : 0
  const handleY = top - M.TOP * hl * Math.cos(theta)
  const handleZ = (sign: number) => sign * zc - M.TOP * hl * Math.sin(theta)

  // ── 前面パーツの表示判定 ─────────────
  const hasFlap =
    templateId === 'shoulder-pouch' ||
    specs.opening === 'flap' ||
    specs.opening === 'frame-flap'
  const pocketFront = specs.pocket === 'front' || specs.pocket === 'both'
  const pocketBack = specs.pocket === 'back' || specs.pocket === 'both'

  const claspId =
    templateId === 'shoulder-pouch'
      ? specs.clasp
      : templateId === 'business' || templateId === 'boston'
        ? specs.lock
        : undefined
  const claspVisible = !!claspId && claspId in CLASP_SCALE
  const claspScale = CLASP_SCALE[claspId ?? 'turn'] ?? CLASP_SCALE.turn

  const plateVisible = !!specs.logo && specs.logo !== 'none'

  // ── チャーム・チェーン ─────────────────
  const charmSpec = specs.charm ?? 'none'
  const chainVisible = charmSpec === 'chain' || charmSpec === 'both' || charmSpec === 'charm'
  const charmVisible = charmSpec === 'charm' || charmSpec === 'both'
  const chainLen =
    charmSpec === 'charm' ? 0.28 : (CHAIN_LENGTH[specs.chainLength ?? 'medium'] ?? 0.65)
  const charmX = (M.W / 2) * sx + 0.02
  const charmTopY = top - 0.4 * sy

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
  const pullerY = (M.TOP - 0.24) * sy
  const pullerZ = (xm: number) => surfaceZ(xm, M.TOP - 0.24) + 0.014
  const pu = Math.max(0.6, Math.min(1.1, u))
  const puller = (idx: 0 | 1) => {
    const visible = zipVisible && (idx === 0 || opening === 'zip-double')
    const px = pullerXs[idx] ?? 0
    const pos: [number, number, number] = [px * sx, pullerY, pullerZ(px)]
    const scale: [number, number, number] = [pu, pu, pu]
    return {
      slider: layout(pos, scale, visible),
      ring: layout(pos, scale, visible && pullerKind === 'ring'),
      tab: layout(pos, scale, visible && pullerKind === 'tab'),
      tassel: layout(pos, scale, visible && pullerKind === 'tassel'),
      bar: layout(pos, scale, visible && pullerKind === 'bar'),
    }
  }
  const p0 = puller(0)
  const p1 = puller(1)
  const bodyScale: [number, number, number] = [sx, sy, sz]

  const flapFit = fitPlate(M.TOP, M.TOP - M.FLAP_H)
  const pocketFit = fitPlate(-0.2 + M.POCKET_H / 2, -0.2 - M.POCKET_H / 2)

  const meshes = {
    body: layout([0, 0, 0], [sx, sy, sz]),
    side: layout([0, 0, 0], [sx, sy, sz]),
    bottom: layout([0, 0, 0], [sx, sy, sz]),
    handle: layout(
      [0, handleY, handleZ(1)],
      [hx, hl, tz],
      true,
      [theta, 0, 0],
    ),
    handle2: layout(
      [0, handleY, handleZ(-1)],
      [hx, hl, tz],
      dual,
      [theta, 0, 0],
    ),
    'ring-single': layout([0, top, 0], [hx, 1, 1], isStrap),
    'ring-dual': layout([0, top, 0], [hx, 1, sz], dual),
    clasp: layout(
      hasFlap
        ? [0, top - M.FLAP_H * sy + 0.03, flapFit.z + M.FLAP_T / 2 + 0.03]
        : [0, top - 0.26 * sy, surfaceZ(0, M.TOP - 0.26) + 0.03],
      [claspScale[0] * u, claspScale[1] * u, claspScale[2]],
      claspVisible,
    ),
    flap: layout(
      [0, top - (M.FLAP_H * sy) / 2, flapFit.z + M.FLAP_T / 2 - 0.006],
      [sx, sy, 1],
      hasFlap,
      [flapFit.rot, 0, 0],
    ),
    pocket: layout(
      [0, -0.2 * sy, pocketFit.z + M.POCKET_T / 2 - 0.008],
      [sx, sy, 1],
      pocketFront,
      [pocketFit.rot, 0, 0],
    ),
    'pocket-back': layout(
      [0, -0.2 * sy, -(pocketFit.z + M.POCKET_T / 2 - 0.008)],
      [sx, sy, 1],
      pocketBack,
      [-pocketFit.rot, 0, 0],
    ),
    plate: layout(
      [
        0,
        (hasFlap ? -0.1 : 0.25) * sy,
        surfaceZ(0, hasFlap ? -0.1 : 0.25) + 0.02 + (pocketFront && hasFlap ? M.POCKET_T : 0),
      ],
      [u, u, 1],
      plateVisible,
    ),
    chain: layout(
      [charmX, charmTopY - chainLen / 2, 0],
      [1, chainLen, 1],
      chainVisible,
    ),
    charm: layout([charmX, charmTopY - chainLen - 0.1, 0], [1, 1, 1], charmVisible),
    'stud-0': layout([studPositions[0][0], studY, studPositions[0][1]], [1, 1, 1], studsVisible),
    'stud-1': layout([studPositions[1][0], studY, studPositions[1][1]], [1, 1, 1], studsVisible),
    'stud-2': layout([studPositions[2][0], studY, studPositions[2][1]], [1, 1, 1], studsVisible),
    'stud-3': layout([studPositions[3][0], studY, studPositions[3][1]], [1, 1, 1], studsVisible),
    'zip-tape': layout([0, 0, 0], bodyScale, zipVisible),
    'zip-teeth': layout([0, 0, 0], bodyScale, zipVisible),
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
  const archTop = top + M.ARCH_H * hl * Math.cos(theta) + 0.06
  let bottomY = -top - (studsVisible ? M.STUD_H : 0)
  if (chainVisible) bottomY = Math.min(bottomY, charmTopY - chainLen - (charmVisible ? 0.22 : 0.05))
  const height = archTop - bottomY
  const width = M.W * sx + (chainVisible ? 0.3 : 0)
  const rootScale = Math.min(3.2 / height, 3.9 / width, 1.15)
  const rootY = (-(archTop + bottomY) / 2) * rootScale

  return { meshes, rootScale, rootY }
}
