import {
  BufferGeometry,
  CatmullRomCurve3,
  Matrix4,
  Quaternion,
  TorusGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type ChainPoints = [number, number, number][]

/**
 * 任意の経路（バッグ座標）に沿ってチェーンを生成する。
 * 楕円のリンクを交互に90°ひねりながら並べる（実行時生成）。
 * 頂点はバッグ座標のまま出力するので、メッシュは原点・スケール1で使う。
 */
export function buildChainGeometry(points: ChainPoints, linkScale: number): BufferGeometry {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)))

  const pitch = 0.045 * linkScale
  const length = curve.getLength()
  const count = Math.max(6, Math.round(length / pitch))

  const base = new TorusGeometry(0.022 * linkScale, 0.0078 * linkScale, 8, 14)
  // リンクの長手方向を X 軸に揃える
  base.scale(1.45, 1, 1)

  const xAxis = new Vector3(1, 0, 0)
  const parts: BufferGeometry[] = []
  for (let i = 0; i <= count; i++) {
    const t = i / count
    const p = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()
    const q = new Quaternion().setFromUnitVectors(xAxis, tangent)
    // 交互にリンクを90°ひねる（接線まわり）
    if (i % 2 === 1) q.multiply(new Quaternion().setFromAxisAngle(xAxis, Math.PI / 2))
    const m = new Matrix4().compose(p, q, new Vector3(1, 1, 1))
    parts.push(base.clone().applyMatrix4(m))
  }
  base.dispose()
  const merged = mergeGeometries(parts)
  parts.forEach((g) => g.dispose())
  return merged
}
