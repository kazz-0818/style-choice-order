import {
  CanvasTexture,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  type Texture,
} from 'three'

/**
 * ファー・ボアの毛足を「シェル法」で表現する。
 * 本体メッシュと同じ形を法線方向へ少しずつ膨らませて何層も重ね、
 * 各層は毛の長さに応じたアルファマスクで毛先だけを残す。
 */

/** 毛の層の数（多いほどふさふさだが描画は重くなる） */
const SHELLS = 16
/** 毛足の長さ（モデル座標） */
const FUR_LENGTH = 0.11
/** 毛の密度テクスチャ1枚が実寸で何ユニットか */
export const FUR_TILE = 0.6

const SIZE = 256
let strandTexture: Texture | null = null

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 毛の長さ分布（緑チャンネル）。1本ごとに円錐形（根元が太く毛先が細い）の毛を並べ、
 * 低周波の毛束ムラで長さに偏りを付ける。
 */
function getStrandTexture(): Texture {
  if (strandTexture) return strandTexture
  const rand = mulberry32(77)
  const G = 16
  const clump = new Float32Array(G * G)
  for (let i = 0; i < clump.length; i++) clump[i] = rand()
  const smooth = (t: number) => t * t * (3 - 2 * t)
  const bundleAt = (px: number, py: number) => {
    const u = (px / SIZE) * G
    const v = (py / SIZE) * G
    const x0 = Math.floor(u)
    const y0 = Math.floor(v)
    const tx = smooth(u - x0)
    const ty = smooth(v - y0)
    const g = (ix: number, iy: number) => clump[(iy % G) * G + (ix % G)]
    const a = g(x0, y0) * (1 - tx) + g(x0 + 1, y0) * tx
    const b = g(x0, y0 + 1) * (1 - tx) + g(x0 + 1, y0 + 1) * tx
    return a * (1 - ty) + b * ty
  }
  // 1タイルに STRANDS × STRANDS 本の毛
  const STRANDS = 48
  const cell = SIZE / STRANDS
  const cx: number[] = []
  const cy: number[] = []
  const len: number[] = []
  for (let j = 0; j < STRANDS; j++) {
    for (let i = 0; i < STRANDS; i++) {
      cx.push((i + 0.2 + rand() * 0.6) * cell)
      cy.push((j + 0.2 + rand() * 0.6) * cell)
      const bundle = bundleAt((i + 0.5) * cell, (j + 0.5) * cell)
      len.push(Math.min(1, (0.55 + rand() * 0.45) * (0.8 + bundle * 0.45)))
    }
  }
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const gi = Math.floor(x / cell)
      const gj = Math.floor(y / cell)
      let best = 0
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const wi = (gi + di + STRANDS) % STRANDS
          const wj = (gj + dj + STRANDS) % STRANDS
          const k = wj * STRANDS + wi
          const px = cx[k] + (gi + di - wi) * cell
          const py = cy[k] + (gj + dj - wj) * cell
          const r = Math.hypot(x + 0.5 - px, y + 0.5 - py) / (cell * 1.45)
          const v = len[k] * (1 - Math.min(1, r) ** 0.7)
          if (v > best) best = v
        }
      }
      const i = (y * SIZE + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = best * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.colorSpace = NoColorSpace
  tex.magFilter = LinearFilter
  tex.minFilter = LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.anisotropy = 4
  strandTexture = tex
  return tex
}

interface ShellData {
  shells: Mesh[]
}

function makeShellMaterial(h: number, offset: number): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    alphaMap: getStrandTexture().clone(),
    alphaTest: 0.04 + h * 0.92,
  })
  mat.alphaMap!.needsUpdate = true
  mat.userData.offset = offset
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFurOffset = { value: offset }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uFurOffset;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed += normal * uFurOffset;
        // 毛先はわずかに垂れ下がる
        transformed.y -= uFurOffset * uFurOffset * 2.2;`,
      )
  }
  mat.customProgramCacheKey = () => 'fur-shell'
  return mat
}

/**
 * メッシュにファーの毛層を付ける／外す。
 * enabled のとき、本体の色 hex から根元（暗）→毛先（明）のグラデーションで毛層を塗る。
 */
export function syncFurShells(
  mesh: Mesh,
  enabled: boolean,
  hex: string,
  extent: [number, number] | null,
) {
  let data = mesh.userData.fur as ShellData | undefined

  if (!enabled || !extent) {
    if (data) {
      for (const s of data.shells) {
        mesh.remove(s)
        ;(s.material as MeshStandardMaterial).alphaMap?.dispose()
        ;(s.material as MeshStandardMaterial).dispose()
      }
      mesh.userData.fur = undefined
    }
    return
  }

  if (!data) {
    const shells: Mesh[] = []
    for (let i = 0; i < SHELLS; i++) {
      const h = (i + 1) / SHELLS
      const shell = new Mesh(mesh.geometry, makeShellMaterial(h, h * FUR_LENGTH))
      shell.userData.furShell = true
      shell.renderOrder = 1
      shell.frustumCulled = false
      mesh.add(shell)
      shells.push(shell)
    }
    data = { shells }
    mesh.userData.fur = data
  }

  const base = new Color(hex)
  const rx = Math.max(0.05, extent[0] / FUR_TILE)
  const ry = Math.max(0.05, extent[1] / FUR_TILE)
  data.shells.forEach((shell, i) => {
    const h = (i + 1) / SHELLS
    shell.geometry = mesh.geometry
    const mat = shell.material as MeshStandardMaterial
    // 根元は暗く、毛先は明るく（奥行き感）
    mat.color.copy(base).multiplyScalar(0.55 + 0.6 * h)
    mat.alphaMap!.repeat.set(rx, ry)
  })
}
