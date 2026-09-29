import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping,
  type Texture,
} from 'three'

/**
 * 素材ごとの質感テクスチャ（法線マップ＋陰影マップ）をキャンバスで生成する。
 * 画像ファイルは使わず、タイル状の凹凸をプログラムで描く。
 */

const SIZE = 256

export interface MaterialTextureSet {
  map: Texture
  normalMap: Texture
  /** 1タイルが実寸で何ユニットに相当するか */
  tile: number
  normalScale: number
}

type HeightFn = (x: number, y: number) => number

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

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** タイル可能なボロノイ（革のシボ）。境界が溝、内側が盛り上がり */
function voronoiHeight(cells: number, seed: number, groove: number): HeightFn {
  const rand = mulberry32(seed)
  const fineNoise = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < fineNoise.length; i++) fineNoise[i] = rand()
  const pts: [number, number][] = []
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      pts.push([(i + 0.15 + rand() * 0.7) / cells, (j + 0.15 + rand() * 0.7) / cells])
    }
  }
  return (x, y) => {
    const u = x / SIZE
    const v = y / SIZE
    const gx = Math.floor(u * cells)
    const gy = Math.floor(v * cells)
    let f1 = 9
    let f2 = 9
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = gx + dx
        const cy = gy + dy
        const wx = ((cx % cells) + cells) % cells
        const wy = ((cy % cells) + cells) % cells
        const p = pts[wy * cells + wx]
        const px = p[0] + (cx - wx) / cells
        const py = p[1] + (cy - wy) / cells
        const d = Math.hypot(u - px, v - py) * cells
        if (d < f1) {
          f2 = f1
          f1 = d
        } else if (d < f2) f2 = d
      }
    }
    const cell = Math.pow(clamp01((f2 - f1) / groove), 0.7)
    // 細かなムラ（革の繊維感）
    const fine = fineNoise[(y % SIZE) * SIZE + (x % SIZE)]
    return cell * 0.82 + fine * 0.18
  }
}

/** 平織り（布・化学繊維）。period ピクセルごとに縦糸・横糸が交差 */
function weaveHeight(period: number, seed: number, ripstop: boolean): HeightFn {
  const rand = mulberry32(seed)
  const noise = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < noise.length; i++) noise[i] = rand()
  return (x, y) => {
    const i = Math.floor(x / period)
    const j = Math.floor(y / period)
    const u = (x % period) / period
    const v = (y % period) / period
    const over = (i + j) % 2 === 0
    let h = over ? Math.sin(Math.PI * u) : Math.sin(Math.PI * v)
    h = 0.35 + 0.55 * h
    h += (noise[y * SIZE + x] - 0.5) * (ripstop ? 0.06 : 0.16)
    if (ripstop) {
      const line = 32
      const onLine = x % line < 2 || y % line < 2
      if (onLine) h = Math.min(1, h + 0.35)
    }
    return clamp01(h)
  }
}

/**
 * ファー・ボア：毛足の方向（縦）に細長くなじむノイズを重ねた、ふわふわの凹凸。
 * 格子を折り返して、タイルとして継ぎ目なく繰り返せるようにする。
 */
function furHeight(seed: number): HeightFn {
  const rand = mulberry32(seed)
  const layers = [
    { fx: 40, fy: 12, w: 0.42 },
    { fx: 96, fy: 30, w: 0.3 },
    { fx: 192, fy: 70, w: 0.2 },
  ].map((l) => {
    const grid = new Float32Array(l.fx * l.fy)
    for (let i = 0; i < grid.length; i++) grid[i] = rand()
    return { ...l, grid }
  })
  const fine = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < fine.length; i++) fine[i] = rand()
  const smooth = (t: number) => t * t * (3 - 2 * t)
  return (x, y) => {
    let h = 0
    for (const l of layers) {
      const u = (x / SIZE) * l.fx
      const v = (y / SIZE) * l.fy
      const x0 = Math.floor(u)
      const y0 = Math.floor(v)
      const tx = smooth(u - x0)
      const ty = smooth(v - y0)
      const g = (ix: number, iy: number) => l.grid[(iy % l.fy) * l.fx + (ix % l.fx)]
      const a = g(x0, y0) * (1 - tx) + g(x0 + 1, y0) * tx
      const b = g(x0, y0 + 1) * (1 - tx) + g(x0 + 1, y0 + 1) * tx
      h += (a * (1 - ty) + b * ty) * l.w
    }
    h += fine[(y % SIZE) * SIZE + (x % SIZE)] * 0.08
    return clamp01(h)
  }
}

function buildTextures(heightFn: HeightFn, strength: number, toneMin: number): {
  map: CanvasTexture
  normalMap: CanvasTexture
} {
  const heights = new Float32Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) heights[y * SIZE + x] = heightFn(x, y)
  }
  const at = (x: number, y: number) =>
    heights[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)]

  const normalCanvas = document.createElement('canvas')
  normalCanvas.width = normalCanvas.height = SIZE
  const mapCanvas = document.createElement('canvas')
  mapCanvas.width = mapCanvas.height = SIZE
  const nctx = normalCanvas.getContext('2d')!
  const mctx = mapCanvas.getContext('2d')!
  const nImg = nctx.createImageData(SIZE, SIZE)
  const mImg = mctx.createImageData(SIZE, SIZE)

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const idx = (y * SIZE + x) * 4
      nImg.data[idx] = ((-dx / len) * 0.5 + 0.5) * 255
      nImg.data[idx + 1] = ((dy / len) * 0.5 + 0.5) * 255
      nImg.data[idx + 2] = ((1 / len) * 0.5 + 0.5) * 255
      nImg.data[idx + 3] = 255
      const tone = (toneMin + (1 - toneMin) * heights[y * SIZE + x]) * 255
      mImg.data[idx] = mImg.data[idx + 1] = mImg.data[idx + 2] = tone
      mImg.data[idx + 3] = 255
    }
  }
  nctx.putImageData(nImg, 0, 0)
  mctx.putImageData(mImg, 0, 0)

  const setup = (canvas: HTMLCanvasElement) => {
    const tex = new CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = RepeatWrapping
    tex.colorSpace = NoColorSpace
    tex.anisotropy = 8
    tex.minFilter = LinearMipmapLinearFilter
    tex.generateMipmaps = true
    return tex
  }
  return { map: setup(mapCanvas), normalMap: setup(normalCanvas) }
}

const cache = new Map<string, MaterialTextureSet>()

const RECIPES: Record<
  string,
  { height: () => HeightFn; strength: number; toneMin: number; tile: number; normalScale: number }
> = {
  // 本革：大きめのシボ（凹凸くっきり）
  'genuine-leather': {
    height: () => voronoiHeight(12, 11, 0.32),
    strength: 2.8,
    toneMin: 0.88,
    tile: 0.42,
    normalScale: 0.75,
  },
  // 合皮：細かく均一なエンボス
  'synthetic-leather': {
    height: () => voronoiHeight(26, 23, 0.4),
    strength: 3,
    toneMin: 0.9,
    tile: 0.42,
    normalScale: 0.7,
  },
  // 布：粗い平織りのキャンバス
  fabric: {
    height: () => weaveHeight(16, 5, false),
    strength: 3.5,
    toneMin: 0.62,
    tile: 0.6,
    normalScale: 1.1,
  },
  // ファー・ボア：毛足のふさふさ感（陰影を強めに）
  fur: {
    height: () => furHeight(31),
    strength: 5.5,
    toneMin: 0.5,
    tile: 0.55,
    normalScale: 1.5,
  },
  // 化学繊維：細かな織りとリップストップ格子
  'tech-fiber': {
    height: () => weaveHeight(8, 9, true),
    strength: 2.6,
    toneMin: 0.8,
    tile: 0.6,
    normalScale: 0.9,
  },
}

export function getMaterialTextures(materialId: string): MaterialTextureSet {
  const id = RECIPES[materialId] ? materialId : 'genuine-leather'
  const cached = cache.get(id)
  if (cached) return cached
  const recipe = RECIPES[id]
  const { map, normalMap } = buildTextures(recipe.height(), recipe.strength, recipe.toneMin)
  const set: MaterialTextureSet = {
    map,
    normalMap,
    tile: recipe.tile,
    normalScale: recipe.normalScale,
  }
  cache.set(id, set)
  return set
}
