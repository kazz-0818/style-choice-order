import type { BufferGeometry, Mesh } from 'three'
import { MODEL as M } from '../../data/bagShapes'

/** 上すぼまり（台形・A字）を実行時に適用する本体系メッシュ */
export const TAPER_MESHES = new Set<string>([
  'body',
  'front',
  'back',
  'top-panel',
  'side',
  'bottom',
  'belt',
  'belt-stitch',
  'zip-tape',
  'zip-teeth',
  'zip-tape-top',
  'zip-teeth-top',
  'flap',
  'flap-round',
  'flap-curve',
  'flap-point',
  'opening-mouth',
  'frame',
  'magnet-tab',
  'magnet-snap',
])

/** サイドのへこみ（マチの折り込み）を適用する本体系メッシュ */
export const DENT_MESHES = new Set<string>(['body', 'front', 'back', 'top-panel', 'side', 'bottom'])

const smooth = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** サイドのへこみの高さ方向の強さ（上端で最大、下へ向かって 0 になる三角形の折り込み） */
export function sideDentLevel(y: number): number {
  const lo = -M.TOP + 0.3
  const hi = M.TOP - 0.05
  const t = Math.max(0, Math.min(1, (y - lo) / (hi - lo)))
  return Math.pow(t, 1.3)
}

/** サイド面を内側へへこませる量（x 方向・符号付き）。上端の中央が最も深く、下に向かって浅くなる */
function dentDelta(x: number, y: number, z: number, depth: number): number {
  const wall = M.W / 2 - 0.26
  const wx = smooth(0, 0.26, Math.abs(x) - wall)
  if (wx <= 0) return 0
  const gz = Math.pow(Math.max(0, 1 - Math.abs(z) / 0.22), 1.2)
  return -Math.sign(x) * depth * wx * gz * sideDentLevel(y)
}

/** へこみを頂点と法線へ反映（法線は逆転置ヤコビアンで補正） */
function applyDent(g: BufferGeometry, depth: number) {
  const pos = g.getAttribute('position')
  const nor = g.getAttribute('normal')
  const e = 1e-3
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const d = dentDelta(x, y, z, depth)
    if (d === 0 && dentDelta(x, y + e, z, depth) === 0 && dentDelta(x, y, z + e, depth) === 0) continue
    if (nor) {
      const dx = (dentDelta(x + e, y, z, depth) - dentDelta(x - e, y, z, depth)) / (2 * e)
      const dy = (dentDelta(x, y + e, z, depth) - dentDelta(x, y - e, z, depth)) / (2 * e)
      const dz = (dentDelta(x, y, z + e, depth) - dentDelta(x, y, z - e, depth)) / (2 * e)
      const n0 = nor.getX(i)
      const n1 = nor.getY(i)
      const n2 = nor.getZ(i)
      const k = n0 / (1 + dx)
      const m0 = n0 - dx * k
      const m1 = n1 - dy * k
      const m2 = n2 - dz * k
      const len = Math.hypot(m0, m1, m2) || 1
      nor.setXYZ(i, m0 / len, m1 / len, m2 / len)
    }
    pos.setX(i, x + d)
  }
  pos.needsUpdate = true
  if (nor) nor.needsUpdate = true
}

function deform(orig: BufferGeometry, tx: number, tz: number, dent: number): BufferGeometry {
  const g = orig.clone()
  if (dent > 0) applyDent(g, dent)
  const pos = g.getAttribute('position')
  const nor = g.getAttribute('normal')
  const H = 2 * M.TOP
  const dfx = (tx - 1) / H
  const dfz = (tz - 1) / H
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const t = Math.max(0, Math.min(1, (y + M.TOP) / H))
    const fx = 1 + (tx - 1) * t
    const fz = 1 + (tz - 1) * t
    pos.setXYZ(i, x * fx, y, z * fz)
    if (nor) {
      // 法線は逆転置ヤコビアンで変換
      const n0 = nor.getX(i)
      const n1 = nor.getY(i)
      const n2 = nor.getZ(i)
      const m0 = n0 / fx
      const m2 = n2 / fz
      const m1 = n1 - x * dfx * m0 - z * dfz * m2
      const len = Math.hypot(m0, m1, m2) || 1
      nor.setXYZ(i, m0 / len, m1 / len, m2 / len)
    }
  }
  pos.needsUpdate = true
  if (nor) nor.needsUpdate = true
  g.computeBoundingSphere()
  g.computeBoundingBox()
  return g
}

/** メッシュに上すぼまりを適用（元ジオメトリは userData に保持して再計算に備える） */
export function applyTaper(mesh: Mesh, tx: number, tz: number, dent = 0) {
  const key = `${tx}|${tz}|${dent}`
  if (mesh.userData.taperKey === key) return
  if (!mesh.userData.origGeometry) mesh.userData.origGeometry = mesh.geometry
  const orig = mesh.userData.origGeometry as BufferGeometry
  if (mesh.geometry !== orig) mesh.geometry.dispose()
  mesh.geometry = tx === 1 && tz === 1 && dent === 0 ? orig : deform(orig, tx, tz, dent)
  mesh.userData.taperKey = key
}
