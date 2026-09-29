import { BufferGeometry, TorusGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/**
 * 持ち手の取付リング（半円）。リングの面は本体の「表・裏」と平行（XY 平面）で、
 * 表側と裏側それぞれに付く。原点 y=0 が取付高さ。
 */
export interface RingSpec {
  /** 左右のリングの x 位置（±） */
  x: number
  /** リングを付ける z 位置（表 = +、裏 = −） */
  zs: number[]
}

const RADIUS = 0.09
const TUBE = 0.018

export function ringSpecKey(spec: RingSpec): string {
  return [spec.x, ...spec.zs].map((v) => v.toFixed(4)).join('|')
}

export function buildRingGeometry(spec: RingSpec): BufferGeometry {
  const parts: BufferGeometry[] = []
  for (const x of [-spec.x, spec.x]) {
    for (const z of spec.zs) {
      const ring = new TorusGeometry(RADIUS, TUBE, 12, 24, Math.PI)
      ring.translate(x, 0, z)
      parts.push(ring)
    }
  }
  return mergeGeometries(parts)
}
