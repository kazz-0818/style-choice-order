/**
 * オーダーメイドバッグ用 GLB をプログラム生成する。
 * 各パーツは原点中心のジオメトリで出力し、位置・スケールは
 * src/utils/threeD/bagLayout.ts がカスタマイズ内容から計算して反映する。
 *
 * 実行: node scripts/generate-bag-glb.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    result = null
    onloadend = null
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer
        this.onloadend?.()
      })
    }
  }
}

const THREE = await import('three')
const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js')
const { mergeGeometries, toCreasedNormals } = await import('three/addons/utils/BufferGeometryUtils.js')
const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js')

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '../public/models/custom-bag.glb')

// src/data/bagShapes.ts の MODEL と一致させること
const W = 2.1
const H = 1.55
const D = 0.72
const TOP = H / 2
const ATTACH_X = W / 2 - 0.08
const HANDLE_Z = 0.12
const ARCH_H = 0.48
const BOTTOM_T = 0.1
const STUD_H = 0.05
const FLAP_H = 0.7
const FLAP_T = 0.05
const POCKET_W = 1.3
const POCKET_H = 0.6
const POCKET_T = 0.05

function mat(hex, roughness = 0.6, metalness = 0.05, name = '') {
  const material = new THREE.MeshStandardMaterial({ color: hex, roughness, metalness })
  if (name) material.name = name
  return material
}

function mesh(name, geometry, material) {
  const m = new THREE.Mesh(geometry, material ?? mat(0xcccccc, 0.6, 0.05, name))
  m.name = name
  return m
}


function box(w, h, d, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return g
}

function rbox(w, h, d, r = 0.02) {
  return new RoundedBoxGeometry(w, h, d, 1, r)
}

/** 前後面のふくらみ量（src/data/bagShapes.ts の BULGE と一致させる） */
const BULGE = 0.035

/** 本体前面の中央がふくらむ量（モデル座標） */
function bulgeAt(x, y) {
  const xn = x / (W / 2)
  const yn = y / (H / 2)
  const fx = Math.max(0, 1 - xn * xn)
  const fy = Math.max(0, 1 - yn * yn)
  return BULGE * Math.pow(fx, 0.7) * Math.pow(fy, 0.7)
}

// 角の丸み半径（楕円）：横・上・下・前後
const RX = 0.26
const RY_TOP = 0.16
const RY_BOT = 0.3
const RZ = 0.22

/** 端側を細かく、中央を粗く分割した座標列 */
function axisCoords(half, rLo, rHi, edgeSteps, midSteps) {
  const c = []
  for (let i = 0; i <= edgeSteps; i++) c.push(-half + rLo * (i / edgeSteps))
  for (let i = 1; i < midSteps; i++) {
    c.push(-half + rLo + (2 * half - rLo - rHi) * (i / midSteps))
  }
  for (let i = 0; i <= edgeSteps; i++) c.push(half - rHi + rHi * (i / edgeSteps))
  return c
}

/** 箱の表面点を「角丸ボックス（楕円半径）」へ写像し、前後面をふくらませる */
function mapToRounded(px, py, pz) {
  const half = [W / 2, H / 2, D / 2]
  const r = [RX, py >= 0 ? RY_TOP : RY_BOT, RZ]
  const p = [px, py, pz]
  const c = p.map((v, i) => Math.max(-(half[i] - r[i]), Math.min(half[i] - r[i], v)))
  const dn = p.map((v, i) => (v - c[i]) / r[i])
  const len = Math.hypot(...dn)
  const n = len > 0 ? dn.map((v) => v / len) : [0, 0, 0]
  const out = c.map((v, i) => v + n[i] * r[i])
  // 前後の面（縁の丸みを除いた部分）を少しふくらませる
  const zInner = half[2] - RZ
  const t = Math.max(0, Math.min(1, (Math.abs(out[2]) - zInner) / RZ))
  out[2] += Math.sign(out[2] || 1) * bulgeAt(out[0], out[1]) * t
  return out
}

/** 丸みのある本体（W×H×D に収まる。縁は丸く、前後面はわずかにふくらむ） */
function bodyGeometry() {
  const xs = axisCoords(W / 2, RX, RX, 5, 8)
  const ys = axisCoords(H / 2, RY_BOT, RY_TOP, 5, 8)
  const zs = axisCoords(D / 2, RZ, RZ, 5, 2)
  const lists = [xs, ys, zs]
  const positions = []
  const uvs = []

  const push = (v) => {
    const o = mapToRounded(v[0], v[1], v[2])
    positions.push(o[0], o[1], o[2])
    // テクスチャ座標：向きの近い面ごとに実寸ベース（モデル単位）
    const ax = Math.abs(v[0]) / (W / 2)
    const ay = Math.abs(v[1]) / (H / 2)
    const az = Math.abs(v[2]) / (D / 2)
    if (az >= ax && az >= ay) uvs.push(o[0], o[1])
    else if (ay >= ax) uvs.push(o[0], o[2])
    else uvs.push(o[2], o[1])
  }

  for (let axis = 0; axis < 3; axis++) {
    const u = (axis + 1) % 3
    const w = (axis + 2) % 3
    for (const sign of [1, -1]) {
      const halfA = [W / 2, H / 2, D / 2][axis]
      const lu = lists[u]
      const lw = lists[w]
      for (let i = 0; i < lu.length - 1; i++) {
        for (let j = 0; j < lw.length - 1; j++) {
          const v = (a, b) => {
            const out = [0, 0, 0]
            out[axis] = sign * halfA
            out[u] = lu[a]
            out[w] = lw[b]
            return out
          }
          const v00 = v(i, j)
          const v10 = v(i + 1, j)
          const v11 = v(i + 1, j + 1)
          const v01 = v(i, j + 1)
          const tris = sign > 0 ? [[v00, v10, v11], [v00, v11, v01]] : [[v00, v11, v10], [v00, v01, v11]]
          for (const tri of tris) for (const vert of tri) push(vert)
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return toCreasedNormals(geometry, 0.7)
}

/** 本体の一部（条件に合う三角形）だけを抜き出した、色分け用のパネル */
function extractPanel(bodyGeo, keep, scale) {
  const src = bodyGeo.index ? bodyGeo.toNonIndexed() : bodyGeo
  const pos = src.getAttribute('position')
  const nor = src.getAttribute('normal')
  const uv = src.getAttribute('uv')
  const outPos = []
  const outNor = []
  const outUv = []
  for (let i = 0; i < pos.count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3
    if (!keep(cx, cy)) continue
    for (let k = 0; k < 3; k++) {
      outPos.push(pos.getX(i + k) * scale, pos.getY(i + k) * scale, pos.getZ(i + k) * scale)
      outNor.push(nor.getX(i + k), nor.getY(i + k), nor.getZ(i + k))
      outUv.push(uv.getX(i + k), uv.getY(i + k))
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(outPos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(outNor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2))
  return g
}

/**
 * 本体を高さ [yLo, yHi] の帯で切り抜いたパネル。
 * 三角形ごとの取捨ではなく、境界の三角形を水平面できれいに切る（ふちがギザギザにならない）。
 */
function clipBandPanel(bodyGeo, yLo, yHi, scale) {
  const src = bodyGeo.index ? bodyGeo.toNonIndexed() : bodyGeo
  const pos = src.getAttribute('position')
  const nor = src.getAttribute('normal')
  const uv = src.getAttribute('uv')
  const outPos = []
  const outNor = []
  const outUv = []
  const vert = (i) => [
    pos.getX(i), pos.getY(i), pos.getZ(i),
    nor.getX(i), nor.getY(i), nor.getZ(i),
    uv.getX(i), uv.getY(i),
  ]
  const lerp = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t)
  /** 平面 y = level で多角形を切る（keepAbove: y >= level 側を残す） */
  const clip = (poly, level, keepAbove) => {
    const out = []
    for (let i = 0; i < poly.length; i++) {
      const cur = poly[i]
      const nxt = poly[(i + 1) % poly.length]
      const cIn = keepAbove ? cur[1] >= level : cur[1] <= level
      const nIn = keepAbove ? nxt[1] >= level : nxt[1] <= level
      if (cIn) out.push(cur)
      if (cIn !== nIn) out.push(lerp(cur, nxt, (level - cur[1]) / (nxt[1] - cur[1])))
    }
    return out
  }
  for (let i = 0; i < pos.count; i += 3) {
    let poly = [vert(i), vert(i + 1), vert(i + 2)]
    poly = clip(poly, yLo, true)
    if (poly.length < 3) continue
    poly = clip(poly, yHi, false)
    if (poly.length < 3) continue
    for (let k = 1; k < poly.length - 1; k++) {
      for (const v of [poly[0], poly[k], poly[k + 1]]) {
        outPos.push(v[0] * scale, v[1] * scale, v[2] * scale)
        const l = Math.hypot(v[3], v[4], v[5]) || 1
        outNor.push(v[3] / l, v[4] / l, v[5] / l)
        outUv.push(v[6], v[7])
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(outPos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(outNor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2))
  return g
}

/** 左右端（マチ） */
const sideGeometry = (bodyGeo) =>
  extractPanel(bodyGeo, (cx) => Math.abs(cx) > W / 2 - RX - 0.03, 1.006)

/** 底まわり（底面〜下端の丸み。前後面の下端にも回り込む） */
const bottomGeometry = (bodyGeo) => clipBandPanel(bodyGeo, -TOP - 1, -TOP + 0.2, 1.012)

// ── 開口部まわり（ファスナー・口金・マグネット） ────────
const ZIP_L = W - 0.5
const ZIP_Y = TOP - 0.24

function zipTapeGeometry() {
  return mergeGeometries([
    box(ZIP_L, 0.06, 0.022, 0, ZIP_Y, D / 2 + bulgeAt(0, ZIP_Y) - 0.004),
    box(ZIP_L, 0.06, 0.022, 0, ZIP_Y, -D / 2 - bulgeAt(0, ZIP_Y) + 0.004),
    box(W - 0.35, 0.024, 0.095, 0, TOP, 0),
  ])
}

/** 天面だけのファスナー（ビジネス／ショルダー／トート用） */
function zipTapeTopGeometry() {
  return box(W - 0.35, 0.024, 0.095, 0, TOP, 0)
}

function zipTeethTopGeometry() {
  const parts = []
  const pitch = 0.03
  const len = W - 0.35
  const count = Math.floor(len / pitch)
  for (let i = 0; i < count; i++) {
    const x = -len / 2 + pitch / 2 + i * pitch
    const sgn = i % 2 === 0 ? 1 : -1
    parts.push(box(0.014, 0.012, 0.016, x, TOP + 0.009, sgn * 0.008))
  }
  return mergeGeometries(parts)
}

function zipTeethGeometry() {
  const parts = []
  const pitch = 0.03
  const count = Math.floor(ZIP_L / pitch)
  for (let i = 0; i < count; i++) {
    const x = -ZIP_L / 2 + pitch / 2 + i * pitch
    const sgn = i % 2 === 0 ? 1 : -1
    const bz = bulgeAt(x, ZIP_Y)
    parts.push(box(0.014, 0.016, 0.012, x, ZIP_Y + sgn * 0.008, D / 2 + bz + 0.008))
    parts.push(box(0.014, 0.016, 0.012, x, ZIP_Y + sgn * 0.008, -D / 2 - bz - 0.008))
    if (Math.abs(x) < (W - 0.35) / 2 - 0.02) parts.push(box(0.014, 0.012, 0.016, x, TOP + 0.009, sgn * 0.008))
  }
  return mergeGeometries(parts)
}

function frameGeometry() {
  return mergeGeometries([
    rbox(1.5, 0.09, 0.16, 0.015).translate(0, TOP - 0.075, D / 2 - 0.06),
    rbox(1.5, 0.09, 0.16, 0.015).translate(0, TOP - 0.075, -D / 2 + 0.06),
    rbox(0.055, 0.055, 0.28, 0.02).translate(-0.75, TOP - 0.005, 0),
    rbox(0.055, 0.055, 0.28, 0.02).translate(0.75, TOP - 0.005, 0),
  ])
}

/** 引き手のスライダー部（原点 = スライダー中心、+z が手前） */
function pullerSliderGeometry() {
  return mergeGeometries([box(0.11, 0.07, 0.03, 0, 0, 0.015), box(0.03, 0.04, 0.03, 0, -0.05, 0.02)])
}

function pullerPendantGeometry(kind) {
  if (kind === 'ring') {
    const ring = new THREE.TorusGeometry(0.06, 0.013, 10, 28)
    ring.translate(0, -0.13, 0.024)
    return ring
  }
  if (kind === 'tab') return rbox(0.075, 0.27, 0.014, 0.006).translate(0, -0.17, 0.028)
  if (kind === 'tassel') {
    const cord = new THREE.CylinderGeometry(0.006, 0.006, 0.09, 8).translate(0, -0.095, 0.024)
    const knot = new THREE.SphereGeometry(0.022, 12, 10).translate(0, -0.15, 0.024)
    const body = new THREE.CylinderGeometry(0.014, 0.034, 0.2, 14).translate(0, -0.26, 0.024)
    return mergeGeometries([cord, knot, body])
  }
  return rbox(0.034, 0.22, 0.02, 0.008).translate(0, -0.15, 0.026)
}

/** 持ち手カーブ（両端が本体上面 y=TOP に接する） */
function handleGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-ATTACH_X, TOP, 0),
    new THREE.Vector3(-ATTACH_X + 0.12, TOP + ARCH_H * 0.8, 0),
    new THREE.Vector3(0, TOP + ARCH_H, 0),
    new THREE.Vector3(ATTACH_X - 0.12, TOP + ARCH_H * 0.8, 0),
    new THREE.Vector3(ATTACH_X, TOP, 0),
  ])
  return new THREE.TubeGeometry(curve, 40, 0.038, 12, false)
}

/** 取付リング（半円）。原点 y=0 が本体上面に来るよう配置する */
function ringGeometry(zs) {
  const parts = []
  for (const x of [-ATTACH_X, ATTACH_X]) {
    for (const z of zs) {
      const ring = new THREE.TorusGeometry(0.09, 0.018, 12, 24, Math.PI)
      ring.translate(x, 0, z)
      parts.push(ring)
    }
  }
  return mergeGeometries(parts)
}


// ── 金具・チャームの形 ──────────────────────────
/** シールド型ロック（前面フラップ中央用）。原点 = 中心、+z が手前 */
function shieldGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.13, 0.15)
  shape.lineTo(0.13, 0.15)
  shape.lineTo(0.13, -0.02)
  shape.bezierCurveTo(0.13, -0.11, 0.05, -0.17, 0, -0.2)
  shape.bezierCurveTo(-0.05, -0.17, -0.13, -0.11, -0.13, -0.02)
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
    curveSegments: 12,
  })
  g.translate(0, 0.02, -0.015)
  return g
}

function extrudeCharm(shape, depth = 0.035) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 14,
  })
  g.translate(0, 0, -depth / 2)
  return g
}

function starGeometry() {
  const shape = new THREE.Shape()
  const outer = 0.12
  const inner = 0.055
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = Math.PI / 2 + (i * Math.PI) / 5
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return extrudeCharm(shape)
}

function heartGeometry() {
  const s = 0.0065
  const shape = new THREE.Shape()
  shape.moveTo(0, -14 * s)
  shape.bezierCurveTo(-8 * s, -8 * s, -18 * s, -2 * s, -18 * s, 6 * s)
  shape.bezierCurveTo(-18 * s, 13 * s, -12 * s, 17 * s, -7 * s, 17 * s)
  shape.bezierCurveTo(-3 * s, 17 * s, -1 * s, 14 * s, 0, 11 * s)
  shape.bezierCurveTo(1 * s, 14 * s, 3 * s, 17 * s, 7 * s, 17 * s)
  shape.bezierCurveTo(12 * s, 17 * s, 18 * s, 13 * s, 18 * s, 6 * s)
  shape.bezierCurveTo(18 * s, -2 * s, 8 * s, -8 * s, 0, -14 * s)
  return extrudeCharm(shape)
}

function tassleCharmGeometry() {
  const cap = new THREE.SphereGeometry(0.03, 14, 10).translate(0, 0.09, 0)
  const neck = new THREE.CylinderGeometry(0.02, 0.03, 0.05, 12).translate(0, 0.045, 0)
  const body = new THREE.CylinderGeometry(0.035, 0.075, 0.24, 18, 1, true).translate(0, -0.1, 0)
  const bottom = new THREE.CircleGeometry(0.075, 18).rotateX(Math.PI / 2).translate(0, -0.22, 0)
  return mergeGeometries([cap, neck, body, bottom])
}

function tagGeometry() {
  return new RoundedBoxGeometry(0.17, 0.27, 0.022, 2, 0.01)
}

// ── ドラム型（円筒ボストン）本体 ───────────────────
/**
 * X軸まわりに回転させた楕円柱。断面の半径は Y: H/2、Z: D/2（各型のスケールで円にも楕円にもなる）。
 * 両端は丸く面取りする。
 */
const DRUM_EDGE_X = 0.2
const DRUM_EDGE_R = 0.3
const DRUM_RADIAL_SEGS = 44
const DRUM_R0 = (H / 2 + D / 2) / 2

function drumProfile() {
  // (x, r) — r は 0〜1 の半径比。上端から下端へ
  const pts = []
  const steps = 8
  const xe = W / 2
  pts.push([xe, 0])
  pts.push([xe, 1 - DRUM_EDGE_R])
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2)
    pts.push([xe - DRUM_EDGE_X + Math.cos(a) * DRUM_EDGE_X, 1 - DRUM_EDGE_R + Math.sin(a) * DRUM_EDGE_R])
  }
  const midSteps = 3
  for (let i = 1; i < midSteps; i++) {
    pts.push([xe - DRUM_EDGE_X - (2 * (xe - DRUM_EDGE_X) * i) / midSteps, 1])
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2)
    pts.push([-xe + DRUM_EDGE_X - Math.sin(a) * DRUM_EDGE_X, 1 - DRUM_EDGE_R + Math.cos(a) * DRUM_EDGE_R])
  }
  pts.push([-xe, 0])
  return pts
}

function drumBodyGeometry() {
  const prof = drumProfile()
  const N = DRUM_RADIAL_SEGS
  const positions = []
  const uvs = []
  const at = (pi, ti) => {
    const [x, r] = prof[pi]
    const th = (ti / N) * Math.PI * 2
    // th=0 は真上（+Y）、th が増えると手前（+Z）へ回る
    const y = r * Math.cos(th) * (H / 2)
    const z = r * Math.sin(th) * (D / 2)
    return { p: [x, y, z], uv: [x, (ti / N) * Math.PI * 2 * DRUM_R0] }
  }
  const capUv = (o) => [o.p[2], o.p[1]]
  for (let pi = 0; pi < prof.length - 1; pi++) {
    const isCap = pi === 0 || pi === prof.length - 2
    for (let ti = 0; ti < N; ti++) {
      const a = at(pi, ti)
      const b = at(pi + 1, ti)
      const c = at(pi + 1, ti + 1)
      const d = at(pi, ti + 1)
      const tris = [
        [a, b, c],
        [a, c, d],
      ]
      for (const tri of tris) {
        // 円周方向 th の向き・プロファイル方向から外向きに揃える
        const [p0, p1, p2] = tri.map((o) => new THREE.Vector3(...o.p))
        const n = new THREE.Vector3().crossVectors(p1.clone().sub(p0), p2.clone().sub(p0))
        if (n.lengthSq() < 1e-12) continue // キャップ中心の縮退三角形を除く
        const centroid = p0.clone().add(p1).add(p2).divideScalar(3)
        // 面の中心から見た外向き（X軸の中心線からの半径方向、キャップはX方向）
        const outward = isCap
          ? new THREE.Vector3(Math.sign(centroid.x), 0, 0)
          : new THREE.Vector3(0, centroid.y, centroid.z).normalize()
        const order = n.dot(outward) >= 0 ? tri : [tri[0], tri[2], tri[1]]
        for (const o of order) {
          positions.push(...o.p)
          uvs.push(...(isCap ? capUv(o) : o.uv))
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return toCreasedNormals(geometry, 0.9)
}

const drumSideGeometry = (geo) =>
  extractPanel(geo, (cx) => Math.abs(cx) > W / 2 - DRUM_EDGE_X - 0.02, 1.006)

/** ドラム型の天面ファスナー（頂点の中心線に沿う） */
const DRUM_ZIP_L = W - 0.55

function drumZipTapeGeometry() {
  return box(DRUM_ZIP_L, 0.016, 0.11, 0, TOP + 0.004, 0)
}

function drumZipTeethGeometry() {
  const parts = []
  const pitch = 0.04
  const count = Math.floor(DRUM_ZIP_L / pitch)
  for (let i = 0; i < count; i++) {
    const x = -DRUM_ZIP_L / 2 + pitch / 2 + i * pitch
    const sgn = i % 2 === 0 ? 1 : -1
    parts.push(box(0.02, 0.015, 0.024, x, TOP + 0.016, sgn * 0.011))
  }
  return mergeGeometries(parts)
}

// ── トップハンドル型のベルト ────────────────────────
const BELT_Y = TOP - 0.27
const BELT_HALF = 0.08

/** 本体をぐるっと一周するベルト（本体表面の帯を少し浮かせて抜き出す） */
const beltGeometry = (bodyGeo) =>
  clipBandPanel(bodyGeo, BELT_Y - BELT_HALF, BELT_Y + BELT_HALF, 1.012)

/** ベルトのステッチ（前面・背面の上下ふち） */
function beltStitchGeometry() {
  const parts = []
  const pitch = 0.07
  const x0 = -W / 2 + 0.4
  const n = Math.floor((W - 0.8) / pitch)
  for (const dy of [BELT_HALF - 0.016, -(BELT_HALF - 0.016)]) {
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * pitch
      const y = BELT_Y + dy
      const z = (D / 2 + bulgeAt(x, y)) * 1.012 + 0.004
      parts.push(box(0.04, 0.008, 0.005, x, y, z))
      parts.push(box(0.04, 0.008, 0.005, x, y, -z))
    }
  }
  return mergeGeometries(parts)
}

// ── ハンドルの革タブ・サイドリング ──────────────────
const TAB_L = 0.5

/**
 * 持ち手を留める革タブ（基準寸法：ストラップ半幅 0.05・全長 0.5）。
 * 上端に金具リングを通す「頭」があり、首を絞ってストラップ状に伸び、先は丸い。
 * 原点 = 頭の上端中央、+z が手前。実行時に横幅・縦長さだけを拡縮して使う。
 */
const TAB_HALF_W = 0.05
function tabGeometry() {
  const w = TAB_HALF_W
  const hw = 0.062 // 頭の半幅
  const hh = 0.1 // 頭の高さ
  const r = 0.02
  const shape = new THREE.Shape()
  shape.moveTo(-hw + r, 0)
  shape.lineTo(hw - r, 0)
  shape.quadraticCurveTo(hw, 0, hw, -r)
  shape.lineTo(hw, -(hh - 0.02))
  shape.bezierCurveTo(hw, -(hh + 0.01), w, -(hh + 0.005), w, -(hh + 0.04))
  shape.lineTo(w, -(TAB_L - w))
  shape.absarc(0, -(TAB_L - w), w, 0, Math.PI, true)
  shape.lineTo(-w, -(hh + 0.04))
  shape.bezierCurveTo(-w, -(hh + 0.005), -hw, -(hh + 0.01), -hw, -(hh - 0.02))
  shape.lineTo(-hw, -r)
  shape.quadraticCurveTo(-hw, 0, -hw + r, 0)
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
    curveSegments: 10,
  })
  g.translate(0, 0, 0.004)
  return g
}

/** 持ち手を通す長方形の金具リング（正面から見た枠）。原点 = 中心、+z が手前 */
function tabRingGeometry() {
  const ow = 0.056
  const oh = 0.038
  const wall = 0.011
  const rr = 0.012
  const rounded = (hw, hh, rad, path) => {
    path.moveTo(-hw + rad, -hh)
    path.lineTo(hw - rad, -hh)
    path.quadraticCurveTo(hw, -hh, hw, -hh + rad)
    path.lineTo(hw, hh - rad)
    path.quadraticCurveTo(hw, hh, hw - rad, hh)
    path.lineTo(-hw + rad, hh)
    path.quadraticCurveTo(-hw, hh, -hw, hh - rad)
    path.lineTo(-hw, -hh + rad)
    path.quadraticCurveTo(-hw, -hh, -hw + rad, -hh)
  }
  const shape = new THREE.Shape()
  rounded(ow, oh, rr, shape)
  const hole = new THREE.Path()
  rounded(ow - wall, oh - wall, rr * 0.5, hole)
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
    curveSegments: 6,
  })
  g.translate(0, 0, 0.014)
  return g
}

/** 側面上部の小さなリング（ショルダー取付用）。左右セット */
function sideRingsGeometry() {
  const parts = []
  for (const sx of [-1, 1]) {
    const ring = new THREE.TorusGeometry(0.055, 0.013, 8, 18)
    ring.rotateY(Math.PI / 2)
    ring.translate(sx * (W / 2 + 0.035), 0, 0)
    const plate = new THREE.BoxGeometry(0.02, 0.06, 0.05)
    plate.translate(sx * (W / 2 + 0.005), 0.035, 0)
    parts.push(ring, plate)
  }
  return mergeGeometries(parts)
}

// ── フラップの形（ショルダーポーチ型） ──────────────
const FLAP_W = W - 0.44

/** 前端（下側）の輪郭：天面から見た深さ（下方向）を x ごとに返す */
function flapDepthAt(kind, x) {
  const hw = FLAP_W / 2
  const ax = Math.abs(x)
  if (kind === 'round') {
    const r = 0.28
    const d = hw - ax
    if (d >= r) return FLAP_H
    const t = Math.sqrt(Math.max(0, d) / r)
    return FLAP_H - r * (1 - t) * (1 - t)
  }
  if (kind === 'curve') {
    const t = (1 - x / hw) / 2
    return FLAP_H - 0.02 + 0.56 * t * (1 - t)
  }
  if (kind === 'point') return FLAP_H + 0.2 - 0.3 * (ax / hw)
  return FLAP_H
}

/**
 * 天面とつながったフラップ：背面の上部 → 天面 → 前面へ、本体の表面に沿って一枚の革でかぶせる。
 * 本体と同じ写像（mapToRounded）で表面点を求めるので、丸みやふくらみにも沿う。
 */
function flapShapeGeometry(kind) {
  const hw = FLAP_W / 2
  const E = 0.04 // 革の厚み（本体表面から外側）
  const GAP = 0.003
  const BACK_LEN = 0.42 // 背面へ回り込む長さ
  const NX = 72
  const NB = 10
  const NT = 30
  const NF = 26

  const surf = (x, y, z) => mapToRounded(x, y, z)
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
  const norm = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1
    return [v[0] / l, v[1] / l, v[2] / l]
  }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]

  // 各列：箱表面上のパス（背面 → 天面 → 前面）
  const cols = []
  for (let i = 0; i <= NX; i++) {
    const x = -hw + (FLAP_W * i) / NX
    const depth = flapDepthAt(kind, x)
    const path = []
    for (let k = 0; k < NB; k++) {
      const t = k / NB
      path.push([TOP - BACK_LEN * (1 - Math.sin((Math.PI / 2) * t)), -D / 2])
    }
    for (let k = 0; k <= NT; k++) {
      path.push([TOP, -D / 2 + (D * (1 - Math.cos((Math.PI * k) / NT))) / 2])
    }
    for (let k = 1; k <= NF; k++) {
      const u = k / NF
      const f = 0.35 * u + 0.65 * (1 - Math.cos((Math.PI * u) / 2))
      path.push([TOP - depth * f, D / 2])
    }
    const P = path.map(([y, z]) => surf(x, y, z))
    const dx = 0.004
    const outer = []
    const inner = []
    const normals = []
    const sArr = []
    let acc = 0
    for (let j = 0; j < path.length; j++) {
      const a = P[Math.max(0, j - 1)]
      const b = P[Math.min(path.length - 1, j + 1)]
      const ds = sub(b, a)
      const [y, z] = path[j]
      const dPdx = sub(surf(x + dx, y, z), surf(x - dx, y, z))
      const n = norm(cross(ds, dPdx))
      normals.push(n)
      outer.push(add(P[j], n, E))
      inner.push(add(P[j], n, GAP))
      if (j > 0) acc += Math.hypot(...sub(P[j], P[j - 1]))
      sArr.push(acc)
    }
    cols.push({ x, outer, inner, normals, sArr })
  }

  const pos = []
  const nor = []
  const uv = []
  const push = (p, n, u, v) => {
    pos.push(p[0], p[1], p[2])
    nor.push(n[0], n[1], n[2])
    uv.push(u, v)
  }
  /** 向きを hint に合わせて三角形を追加（法線が指定されていれば頂点法線として使う） */
  const tri = (a, b, c, hint, ns) => {
    const fn = cross(sub(b.p, a.p), sub(c.p, a.p))
    let v = [a, b, c]
    if (dot(fn, hint) < 0) v = [a, c, b]
    const flat = norm(fn)
    const face = dot(fn, hint) < 0 ? [-flat[0], -flat[1], -flat[2]] : flat
    for (const q of v) push(q.p, ns ? q.n : face, q.u, q.v)
  }
  const V = (p, n, u, v) => ({ p, n, u, v })

  const J = cols[0].outer.length
  // 外面（滑らかな法線）と内面
  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < J - 1; j++) {
      const c0 = cols[i]
      const c1 = cols[i + 1]
      const o = [
        V(c0.outer[j], c0.normals[j], c0.x, c0.sArr[j]),
        V(c1.outer[j], c1.normals[j], c1.x, c1.sArr[j]),
        V(c1.outer[j + 1], c1.normals[j + 1], c1.x, c1.sArr[j + 1]),
        V(c0.outer[j + 1], c0.normals[j + 1], c0.x, c0.sArr[j + 1]),
      ]
      const hintO = add(add(c0.normals[j], c1.normals[j]), add(c0.normals[j + 1], c1.normals[j + 1]))
      tri(o[0], o[1], o[2], hintO, true)
      tri(o[0], o[2], o[3], hintO, true)
      const q = [
        V(c0.inner[j], c0.normals[j].map((t) => -t), c0.x, c0.sArr[j]),
        V(c1.inner[j], c1.normals[j].map((t) => -t), c1.x, c1.sArr[j]),
        V(c1.inner[j + 1], c1.normals[j + 1].map((t) => -t), c1.x, c1.sArr[j + 1]),
        V(c0.inner[j + 1], c0.normals[j + 1].map((t) => -t), c0.x, c0.sArr[j + 1]),
      ]
      const hintI = hintO.map((t) => -t)
      tri(q[0], q[1], q[2], hintI, true)
      tri(q[0], q[2], q[3], hintI, true)
    }
  }
  const wallV = (c, j, useOuter) =>
    V(useOuter ? c.outer[j] : c.inner[j], [0, 0, 0], c.x, c.sArr[j])
  // 左右の縁
  for (const [c, dir] of [
    [cols[0], [-1, 0, 0]],
    [cols[NX], [1, 0, 0]],
  ]) {
    for (let j = 0; j < J - 1; j++) {
      const a = wallV(c, j, true)
      const b = wallV(c, j + 1, true)
      const d = wallV(c, j, false)
      const e = wallV(c, j + 1, false)
      tri(a, b, e, dir, false)
      tri(a, e, d, dir, false)
    }
  }
  // 前端（下）と背面側の端
  for (let i = 0; i < NX; i++) {
    const c0 = cols[i]
    const c1 = cols[i + 1]
    for (const [j, sgn] of [
      [J - 1, 1],
      [0, -1],
    ]) {
      const jj = sgn > 0 ? J - 2 : 1
      const tangent = sub(c0.outer[j], c0.outer[jj])
      const a = wallV(c0, j, true)
      const b = wallV(c1, j, true)
      const d = wallV(c0, j, false)
      const e = wallV(c1, j, false)
      tri(a, b, e, tangent, false)
      tri(a, e, d, tangent, false)
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  return g
}

function createBagScene() {
  const scene = new THREE.Scene()
  scene.name = 'CustomBag'

  const bodyGeo = bodyGeometry()
  const body = mesh('body', bodyGeo, mat(0x1e2a3a, 0.6, 0.05, 'body'))
  const side = mesh('side', sideGeometry(bodyGeo), mat(0x1e2a3a, 0.6, 0.05, 'side'))

  const bottom = mesh('bottom', bottomGeometry(bodyGeo), mat(0x4a3428, 0.6, 0.05, 'bottom'))

  const handle = mesh('handle', handleGeometry(), mat(0x8b6f4e, 0.55, 0.05, 'handle'))
  const handle2 = mesh('handle2', handleGeometry(), mat(0x8b6f4e, 0.55, 0.05, 'handle2'))

  const metalMat = (name) => mat(0xb8956a, 0.28, 0.75, name)
  const ringSingle = mesh('ring-single', ringGeometry([0]), metalMat('ring-single'))
  const ringDual = mesh('ring-dual', ringGeometry([-HANDLE_Z, HANDLE_Z]), metalMat('ring-dual'))
  const clasp = mesh('clasp', new THREE.BoxGeometry(0.24, 0.16, 0.05), metalMat('clasp'))

  const flap = mesh(
    'flap',
    flapShapeGeometry('square'),
    mat(0x1e2a3a, 0.6, 0.05, 'flap'),
  )
  const pocket = mesh(
    'pocket',
    rbox(POCKET_W, POCKET_H, POCKET_T, 0.02),
    mat(0xd4c4a8, 0.7, 0.04, 'pocket'),
  )
  const pocketBack = mesh(
    'pocket-back',
    rbox(POCKET_W, POCKET_H, POCKET_T, 0.02),
    mat(0xd4c4a8, 0.7, 0.04, 'pocket-back'),
  )
  const claspShield = mesh('clasp-shield', shieldGeometry(), metalMat('clasp-shield'))
  const pocketL = mesh('pocket-l', rbox(0.64, POCKET_H, POCKET_T, 0.02), mat(0xd4c4a8, 0.7, 0.04, 'pocket-l'))
  const pocketR = mesh('pocket-r', rbox(0.64, POCKET_H, POCKET_T, 0.02), mat(0xd4c4a8, 0.7, 0.04, 'pocket-r'))
  const plate = mesh('plate', new THREE.BoxGeometry(0.5, 0.28, 0.03), metalMat('plate'))

  const chain = mesh('chain', new THREE.CylinderGeometry(0.014, 0.014, 1, 8), metalMat('chain'))
  const charm = mesh('charm', new THREE.SphereGeometry(0.11, 20, 14), mat(0xd4c4a8, 0.5, 0.1, 'charm'))
  const charmStar = mesh('charm-star', starGeometry(), mat(0xd4c4a8, 0.5, 0.1, 'charm-star'))
  const charmHeart = mesh('charm-heart', heartGeometry(), mat(0xd4c4a8, 0.5, 0.1, 'charm-heart'))
  const charmTassel = mesh('charm-tassel', tassleCharmGeometry(), mat(0xd4c4a8, 0.7, 0.02, 'charm-tassel'))
  const charmTag = mesh('charm-tag', tagGeometry(), metalMat('charm-tag'))
  // ショルダーのチェーンストラップ（形状は実行時に持ち手のカーブに合わせて作り直す）
  const strapChain = mesh('strap-chain', new THREE.BoxGeometry(0.02, 0.02, 0.02), metalMat('strap-chain'))

  const zipTape = mesh('zip-tape', zipTapeGeometry(), mat(0x222222, 0.8, 0, 'zip-tape'))
  const zipTeeth = mesh('zip-teeth', zipTeethGeometry(), metalMat('zip-teeth'))
  const zipTapeTop = mesh('zip-tape-top', zipTapeTopGeometry(), mat(0x222222, 0.8, 0, 'zip-tape-top'))
  const zipTeethTop = mesh('zip-teeth-top', zipTeethTopGeometry(), metalMat('zip-teeth-top'))
  const openingMouth = mesh(
    'opening-mouth',
    box(ZIP_L - 0.2, 0.012, 0.28, 0, TOP, 0),
    mat(0x2b2622, 0.95, 0, 'opening-mouth'),
  )
  const frame = mesh('frame', frameGeometry(), metalMat('frame'))
  const magnetTab = mesh(
    'magnet-tab',
    rbox(0.3, 0.24, 0.02, 0.008).translate(0, TOP - 0.3, D / 2 + bulgeAt(0, TOP - 0.3) + 0.003),
    mat(0x1e2a3a, 0.6, 0.05, 'magnet-tab'),
  )
  const magnetSnap = mesh(
    'magnet-snap',
    new THREE.CylinderGeometry(0.055, 0.055, 0.03, 20).rotateX(Math.PI / 2).translate(0, TOP - 0.38, D / 2 + bulgeAt(0, TOP - 0.38) + 0.028),
    metalMat('magnet-snap'),
  )
  const pullers = []
  for (const prefix of ['puller', 'puller2']) {
    pullers.push(mesh(`${prefix}-slider`, pullerSliderGeometry(), metalMat(`${prefix}-slider`)))
    for (const kind of ['ring', 'tab', 'tassel', 'bar']) {
      const m = kind === 'tab' || kind === 'tassel' ? mat(0x8b6f4e, 0.55, 0.05) : metalMat(`${prefix}-${kind}`)
      pullers.push(mesh(`${prefix}-${kind}`, pullerPendantGeometry(kind), m))
    }
  }

  const belt = mesh('belt', beltGeometry(bodyGeo), mat(0x8b6f4e, 0.55, 0.05, 'belt'))
  const beltStitch = mesh('belt-stitch', beltStitchGeometry(), mat(0xe8dcc0, 0.8, 0, 'belt-stitch'))
  const tabGeo = tabGeometry()
  const tabs = [0, 1, 2, 3].map((i) => mesh(`tab-${i}`, tabGeo, mat(0x8b6f4e, 0.55, 0.05, `tab-${i}`)))
  const tabRingGeo = tabRingGeometry()
  const tabRings = [0, 1, 2, 3].map((i) => mesh(`tab-ring-${i}`, tabRingGeo, metalMat(`tab-ring-${i}`)))
  const sideRings = mesh('side-rings', sideRingsGeometry(), metalMat('side-rings'))
  const flapRound = mesh('flap-round', flapShapeGeometry('round'), mat(0x1e2a3a, 0.6, 0.05, 'flap-round'))
  const flapCurve = mesh('flap-curve', flapShapeGeometry('curve'), mat(0x1e2a3a, 0.6, 0.05, 'flap-curve'))
  const flapPoint = mesh('flap-point', flapShapeGeometry('point'), mat(0x1e2a3a, 0.6, 0.05, 'flap-point'))

  const drumGeo = drumBodyGeometry()
  const drumBody = mesh('drum-body', drumGeo, mat(0x1e2a3a, 0.6, 0.05, 'drum-body'))
  const drumSide = mesh('drum-side', drumSideGeometry(drumGeo), mat(0x1e2a3a, 0.6, 0.05, 'drum-side'))
  const drumZipTape = mesh('drum-zip-tape', drumZipTapeGeometry(), mat(0x222222, 0.8, 0, 'drum-zip-tape'))
  const drumZipTeeth = mesh('drum-zip-teeth', drumZipTeethGeometry(), metalMat('drum-zip-teeth'))

  const studs = [0, 1, 2, 3].map((i) =>
    mesh(
      `stud-${i}`,
      new THREE.CylinderGeometry(0.055, 0.055, STUD_H, 16),
      mat(0xc9a24a, 0.3, 0.8, `stud-${i}`),
    ),
  )

  scene.add(
    body,
    side,
    bottom,
    handle,
    handle2,
    ringSingle,
    ringDual,
    clasp,
    claspShield,
    flap,
    pocket,
    pocketBack,
    pocketL,
    pocketR,
    plate,
    chain,
    charm,
    charmStar,
    charmHeart,
    charmTassel,
    charmTag,
    strapChain,
    belt,
    beltStitch,
    ...tabs,
    ...tabRings,
    sideRings,
    flapRound,
    flapCurve,
    flapPoint,
    drumBody,
    drumSide,
    drumZipTape,
    drumZipTeeth,
    zipTape,
    zipTeeth,
    zipTapeTop,
    zipTeethTop,
    openingMouth,
    frame,
    magnetTab,
    magnetSnap,
    ...pullers,
    ...studs,
  )
  return scene
}

function exportGlb(scene) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter()
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(Buffer.from(result))
          return
        }
        reject(new Error('Expected binary GLB output'))
      },
      (error) => reject(error),
      { binary: true },
    )
  })
}

const scene = createBagScene()
const buffer = await exportGlb(scene)
writeFileSync(outputPath, buffer)
console.log(`Generated ${outputPath} (${buffer.length} bytes)`)

// 生成結果の簡易チェック（本体の法線が外向きか・寸法）
{
  for (const n of ['body', 'drum-body']) {
  const body = scene.getObjectByName(n).geometry
  const pos = body.getAttribute('position')
  const nor = body.getAttribute('normal')
  let outward = 0
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) * nor.getX(i) + pos.getY(i) * nor.getY(i) + pos.getZ(i) * nor.getZ(i) > 0) outward++
  }
  body.computeBoundingBox()
  const { min, max } = body.boundingBox
  console.log(
    `${n}: ${pos.count} verts, outward normals ${((outward / pos.count) * 100).toFixed(1)}%, bbox`,
    [min.x, min.y, min.z].map((v) => v.toFixed(3)).join(','),
    [max.x, max.y, max.z].map((v) => v.toFixed(3)).join(','),
  )
  }
}
