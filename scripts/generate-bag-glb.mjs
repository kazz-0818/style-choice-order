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

/** 左右端（マチ） */
const sideGeometry = (bodyGeo) =>
  extractPanel(bodyGeo, (cx) => Math.abs(cx) > W / 2 - RX - 0.03, 1.006)

/** 底まわり（底面〜下端の丸み。前後面の下端にも回り込む） */
const bottomGeometry = (bodyGeo) => extractPanel(bodyGeo, (_cx, cy) => cy < -TOP + 0.2, 1.012)

// ── 開口部まわり（ファスナー・口金・マグネット） ────────
const ZIP_L = W - 0.7
const ZIP_Y = TOP - 0.24

function zipTapeGeometry() {
  return mergeGeometries([
    box(ZIP_L, 0.1, 0.03, 0, ZIP_Y, D / 2 + bulgeAt(0, ZIP_Y) - 0.004),
    box(ZIP_L, 0.1, 0.03, 0, ZIP_Y, -D / 2 - bulgeAt(0, ZIP_Y) + 0.004),
    box(ZIP_L, 0.03, 0.1, 0, TOP, 0),
  ])
}

function zipTeethGeometry() {
  const parts = []
  const pitch = 0.04
  const count = Math.floor(ZIP_L / pitch)
  for (let i = 0; i < count; i++) {
    const x = -ZIP_L / 2 + pitch / 2 + i * pitch
    const sgn = i % 2 === 0 ? 1 : -1
    const bz = bulgeAt(x, ZIP_Y)
    parts.push(box(0.028, 0.032, 0.022, x, ZIP_Y + sgn * 0.016, D / 2 + bz + 0.012))
    parts.push(box(0.028, 0.032, 0.022, x, ZIP_Y + sgn * 0.016, -D / 2 - bz - 0.012))
    parts.push(box(0.028, 0.022, 0.032, x, TOP + 0.012, sgn * 0.016))
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
  return new THREE.TubeGeometry(curve, 40, 0.055, 12, false)
}

/** 取付リング（半円）。原点 y=0 が本体上面に来るよう配置する */
function ringGeometry(zs) {
  const parts = []
  for (const x of [-ATTACH_X, ATTACH_X]) {
    for (const z of zs) {
      const ring = new THREE.TorusGeometry(0.09, 0.018, 12, 24, Math.PI)
      ring.rotateY(Math.PI / 2)
      ring.translate(x, 0, z)
      parts.push(ring)
    }
  }
  return mergeGeometries(parts)
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
    rbox(W - 0.44, FLAP_H, FLAP_T, 0.02),
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
  const plate = mesh('plate', new THREE.BoxGeometry(0.5, 0.28, 0.03), metalMat('plate'))

  const chain = mesh('chain', new THREE.CylinderGeometry(0.014, 0.014, 1, 8), metalMat('chain'))
  const charm = mesh('charm', new THREE.SphereGeometry(0.11, 20, 14), mat(0xd4c4a8, 0.5, 0.1, 'charm'))

  const zipTape = mesh('zip-tape', zipTapeGeometry(), mat(0x222222, 0.8, 0, 'zip-tape'))
  const zipTeeth = mesh('zip-teeth', zipTeethGeometry(), metalMat('zip-teeth'))
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
    flap,
    pocket,
    pocketBack,
    plate,
    chain,
    charm,
    zipTape,
    zipTeeth,
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
  const body = scene.getObjectByName('body').geometry
  const pos = body.getAttribute('position')
  const nor = body.getAttribute('normal')
  let outward = 0
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) * nor.getX(i) + pos.getY(i) * nor.getY(i) + pos.getZ(i) * nor.getZ(i) > 0) outward++
  }
  body.computeBoundingBox()
  const { min, max } = body.boundingBox
  console.log(
    `body: ${pos.count} verts, outward normals ${((outward / pos.count) * 100).toFixed(1)}%, bbox`,
    [min.x, min.y, min.z].map((v) => v.toFixed(3)).join(','),
    [max.x, max.y, max.z].map((v) => v.toFixed(3)).join(','),
  )
}
