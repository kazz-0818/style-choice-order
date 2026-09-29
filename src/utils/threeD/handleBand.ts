import { BufferGeometry, Float32BufferAttribute } from 'three'

/**
 * 表裏に付く持ち手（ドーム形のバンド）。断面の幅・厚みを全長で一定にして作る。
 * 原点 = 左右の根元を結ぶ線の中央（y=0 が根元）、アーチは +y 方向、面は XY 平面。
 */
export interface HandleBandSpec {
  /** 左右の根元の中心間の半分 */
  halfSpan: number
  /** 根元からアーチ頂点までの高さ */
  height: number
  /** バンドの幅（正面から見た帯の太さ） */
  width: number
  /** バンドの厚み（前後方向） */
  thickness: number
}

/** パンフレットの正面図に合わせた、脚が立ち上がる半楕円寄りのドーム */
const DOME_EXP = 2.3
const PATH_STEPS = 56
const SECTION_STEPS = 20
/** 断面の角の丸さ（2 = 楕円、大きいほど角ばる） */
const SECTION_EXP = 3.2

const sgnPow = (v: number, e: number) => Math.sign(v) * Math.abs(v) ** e

export function buildHandleBandGeometry(spec: HandleBandSpec): BufferGeometry {
  const { halfSpan, height, width, thickness } = spec

  // 経路（左根元 → 頂点 → 右根元）
  const path: [number, number][] = []
  for (let i = 0; i <= PATH_STEPS; i++) {
    const s = (i / PATH_STEPS) * Math.PI
    const c = Math.cos(s)
    const sn = Math.sin(s)
    path.push([-halfSpan * sgnPow(c, 2 / DOME_EXP), height * Math.abs(sn) ** (2 / DOME_EXP)])
  }

  // 接線（差分）と、経路に沿った累積長さ
  const tangents: [number, number][] = []
  const arc: number[] = [0]
  for (let i = 0; i <= PATH_STEPS; i++) {
    const p0 = path[Math.max(0, i - 1)]
    const p1 = path[Math.min(PATH_STEPS, i + 1)]
    const dx = p1[0] - p0[0]
    const dy = p1[1] - p0[1]
    const len = Math.hypot(dx, dy) || 1
    tangents.push([dx / len, dy / len])
    if (i > 0) {
      const q = path[i - 1]
      arc.push(arc[i - 1] + Math.hypot(path[i][0] - q[0], path[i][1] - q[1]))
    }
  }

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const perimeter = 2 * (width + thickness)

  for (let i = 0; i <= PATH_STEPS; i++) {
    const [px, py] = path[i]
    const [tx, ty] = tangents[i]
    // 面内の法線（バンド幅方向）
    const nx = -ty
    const ny = tx
    for (let j = 0; j <= SECTION_STEPS; j++) {
      const a = (j / SECTION_STEPS) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const u = (width / 2) * sgnPow(ca, 2 / SECTION_EXP)
      const v = (thickness / 2) * sgnPow(sa, 2 / SECTION_EXP)
      positions.push(px + nx * u, py + ny * u, v)
      // 断面の外向き法線（超楕円の勾配）
      const gu = sgnPow(ca, 2 - 2 / SECTION_EXP) / (width / 2)
      const gv = sgnPow(sa, 2 - 2 / SECTION_EXP) / (thickness / 2)
      const gl = Math.hypot(gu, gv) || 1
      normals.push((nx * gu) / gl, (ny * gu) / gl, gv / gl)
      uvs.push(arc[i], (j / SECTION_STEPS) * perimeter)
    }
  }

  const row = SECTION_STEPS + 1
  for (let i = 0; i < PATH_STEPS; i++) {
    for (let j = 0; j < SECTION_STEPS; j++) {
      const a = i * row + j
      const b = a + row
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }

  // 両端のフタ
  const cap = (i: number, flip: boolean) => {
    const base = positions.length / 3
    const [px, py] = path[i]
    const [tx, ty] = tangents[i]
    positions.push(px, py, 0)
    normals.push(-tx * (flip ? -1 : 1), -ty * (flip ? -1 : 1), 0)
    uvs.push(arc[i], 0)
    for (let j = 0; j <= SECTION_STEPS; j++) {
      const k = i * row + j
      positions.push(positions[k * 3], positions[k * 3 + 1], positions[k * 3 + 2])
      normals.push(-tx * (flip ? -1 : 1), -ty * (flip ? -1 : 1), 0)
      uvs.push(arc[i], (j / SECTION_STEPS) * perimeter)
    }
    for (let j = 0; j < SECTION_STEPS; j++) {
      if (flip) indices.push(base, base + 1 + j, base + 2 + j)
      else indices.push(base, base + 2 + j, base + 1 + j)
    }
  }
  cap(0, false)
  cap(PATH_STEPS, true)

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  geo.computeBoundingBox()
  return geo
}
