import type { BufferGeometry, Mesh } from 'three'
import { MODEL as M } from '../../data/bagShapes'

/** 上すぼまり（台形・A字）を実行時に適用する本体系メッシュ */
export const TAPER_MESHES = new Set<string>([
  'body',
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

function deform(orig: BufferGeometry, tx: number, tz: number): BufferGeometry {
  const g = orig.clone()
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
export function applyTaper(mesh: Mesh, tx: number, tz: number) {
  const key = `${tx}|${tz}`
  if (mesh.userData.taperKey === key) return
  if (!mesh.userData.origGeometry) mesh.userData.origGeometry = mesh.geometry
  const orig = mesh.userData.origGeometry as BufferGeometry
  if (mesh.geometry !== orig) mesh.geometry.dispose()
  mesh.geometry = tx === 1 && tz === 1 ? orig : deform(orig, tx, tz)
  mesh.userData.taperKey = key
}
