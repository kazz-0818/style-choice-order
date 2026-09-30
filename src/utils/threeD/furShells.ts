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
 * 毛は細かく・数多く・色ムラと緩いカールを付けて、硬いプラスチックの毛に見えないようにする。
 */

/** 毛の層の数（多いほどふんわりするが描画は重くなる） */
const SHELLS = 28
/** 毛足の長さ（モデル座標） */
const FUR_LENGTH = 0.1
/** 毛の密度テクスチャ1枚が実寸で何ユニットか */
export const FUR_TILE = 0.6

const SIZE = 512
/** 1タイルあたりの毛の本数（片側） */
const STRANDS = 150

interface StrandTextures {
  /** 緑チャンネル＝毛の長さ */
  alpha: Texture
  /** 毛1本ごとの明るさのムラ */
  tone: Texture
}
let strandTextures: StrandTextures | null = null

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

function makeTexture(canvas: HTMLCanvasElement): Texture {
  const tex = new CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.colorSpace = NoColorSpace
  tex.magFilter = LinearFilter
  tex.minFilter = LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.anisotropy = 4
  return tex
}

/**
 * 毛の長さ分布と毛ごとの色ムラ。1本ごとに円錐形（根元が太く毛先が細い）の毛を並べ、
 * 低周波の毛束ムラで長さに偏りを付ける。
 */
function getStrandTextures(): StrandTextures {
  if (strandTextures) return strandTextures
  const rand = mulberry32(77)
  const G = 20
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

  const cell = SIZE / STRANDS
  const cx: number[] = []
  const cy: number[] = []
  const len: number[] = []
  const tone: number[] = []
  for (let j = 0; j < STRANDS; j++) {
    for (let i = 0; i < STRANDS; i++) {
      cx.push((i + 0.15 + rand() * 0.7) * cell)
      cy.push((j + 0.15 + rand() * 0.7) * cell)
      const bundle = bundleAt((i + 0.5) * cell, (j + 0.5) * cell)
      len.push(Math.min(1, (0.5 + rand() * 0.5) * (0.78 + bundle * 0.5)))
      tone.push(0.72 + rand() * 0.34 + (bundle - 0.5) * 0.12)
    }
  }

  const alphaCanvas = document.createElement('canvas')
  alphaCanvas.width = alphaCanvas.height = SIZE
  const toneCanvas = document.createElement('canvas')
  toneCanvas.width = toneCanvas.height = SIZE
  const actx = alphaCanvas.getContext('2d')!
  const tctx = toneCanvas.getContext('2d')!
  const aImg = actx.createImageData(SIZE, SIZE)
  const tImg = tctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const gi = Math.floor(x / cell)
      const gj = Math.floor(y / cell)
      let best = 0
      let bestTone = 0.85
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const wi = (gi + di + STRANDS) % STRANDS
          const wj = (gj + dj + STRANDS) % STRANDS
          const k = wj * STRANDS + wi
          const px = cx[k] + (gi + di - wi) * cell
          const py = cy[k] + (gj + dj - wj) * cell
          const r = Math.hypot(x + 0.5 - px, y + 0.5 - py) / (cell * 1.9)
          const v = len[k] * (1 - Math.min(1, r) ** 0.7)
          if (v > best) {
            best = v
            bestTone = tone[k]
          }
        }
      }
      const i = (y * SIZE + x) * 4
      aImg.data[i] = aImg.data[i + 1] = aImg.data[i + 2] = best * 255
      aImg.data[i + 3] = 255
      const t = Math.max(0, Math.min(1, bestTone)) * 255
      tImg.data[i] = tImg.data[i + 1] = tImg.data[i + 2] = t
      tImg.data[i + 3] = 255
    }
  }
  actx.putImageData(aImg, 0, 0)
  tctx.putImageData(tImg, 0, 0)
  strandTextures = { alpha: makeTexture(alphaCanvas), tone: makeTexture(toneCanvas) }
  return strandTextures
}

interface ShellData {
  shells: Mesh[]
}

function makeShellMaterial(h: number, offset: number): MeshStandardMaterial {
  const tex = getStrandTextures()
  const mat = new MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    map: tex.tone.clone(),
    alphaMap: tex.alpha.clone(),
    alphaTest: 0.03 + h * 0.82,
    // 毛先の縁をやわらかく（ギザギザ・プラスチックの毛に見えないように）
    alphaToCoverage: true,
    envMapIntensity: 0.4,
  })
  mat.map!.needsUpdate = true
  mat.alphaMap!.needsUpdate = true
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFurOffset = { value: offset }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uFurOffset;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed += normal * uFurOffset;
        // 毛先はやわらかく垂れ下がり、ゆるくカールする
        transformed.y -= uFurOffset * uFurOffset * 2.6;
        transformed.x += sin(position.y * 23.0 + position.z * 17.0) * uFurOffset * 0.22;
        transformed.z += cos(position.x * 19.0 + position.y * 13.0) * uFurOffset * 0.22;`,
      )
  }
  mat.customProgramCacheKey = () => 'fur-shell-soft'
  return mat
}

function disposeShellMaterial(mat: MeshStandardMaterial) {
  mat.map?.dispose()
  mat.alphaMap?.dispose()
  mat.dispose()
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
        disposeShellMaterial(s.material as MeshStandardMaterial)
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
    mat.color.copy(base).multiplyScalar(0.74 + 0.46 * h)
    mat.alphaMap!.repeat.set(rx, ry)
    mat.map!.repeat.set(rx, ry)
  })
}
