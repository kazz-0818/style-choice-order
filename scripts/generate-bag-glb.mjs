/**
 * オーダーメイドバッグ用 GLB をプログラム生成する。
 * メッシュ名: body / handle / metal / side / bottom / accent
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
const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js')

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '../public/models/custom-bag.glb')

function createMaterial(hex, roughness = 0.62, metalness = 0.04, name = '') {
  const material = new THREE.MeshStandardMaterial({
    color: hex,
    roughness,
    metalness,
  })
  if (name) material.name = name
  return material
}

function createBagScene() {
  const scene = new THREE.Scene()
  scene.name = 'CustomBag'

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.55, 0.72),
    createMaterial(0x111111, 0.62, 0.04, 'body'),
  )
  body.name = 'body'
  body.position.y = 0.05

  const bottom = new THREE.Mesh(
    new THREE.BoxGeometry(2.16, 0.1, 0.76),
    createMaterial(0x4a3428, 0.62, 0.04, 'bottom'),
  )
  bottom.name = 'bottom'
  bottom.position.y = -0.78

  const leftSide = new THREE.BoxGeometry(0.09, 1.48, 0.68)
  leftSide.translate(-1.06, 0.05, 0)
  const rightSide = new THREE.BoxGeometry(0.09, 1.48, 0.68)
  rightSide.translate(1.06, 0.05, 0)
  const side = new THREE.Mesh(
    mergeGeometries([leftSide, rightSide]),
    createMaterial(0x111111, 0.62, 0.04, 'side'),
  )
  side.name = 'side'

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.72, 0.88, 0),
    new THREE.Vector3(-0.55, 1.28, 0),
    new THREE.Vector3(0, 1.38, 0),
    new THREE.Vector3(0.55, 1.28, 0),
    new THREE.Vector3(0.72, 0.88, 0),
  ])
  const handle = new THREE.Mesh(
    new THREE.TubeGeometry(handleCurve, 32, 0.055, 12, false),
    createMaterial(0x8b6f4e, 0.58, 0.04, 'handle'),
  )
  handle.name = 'handle'

  const ringLeft = new THREE.TorusGeometry(0.09, 0.018, 12, 24, Math.PI)
  ringLeft.rotateY(Math.PI / 2)
  ringLeft.translate(-0.72, 0.82, 0)
  const ringRight = new THREE.TorusGeometry(0.09, 0.018, 12, 24, Math.PI)
  ringRight.rotateY(Math.PI / 2)
  ringRight.translate(0.72, 0.82, 0)
  const clasp = new THREE.BoxGeometry(0.22, 0.05, 0.04)
  clasp.translate(0, 0.72, 0.38)
  const metal = new THREE.Mesh(
    mergeGeometries([ringLeft, ringRight, clasp]),
    createMaterial(0xb8956a, 0.28, 0.72, 'metal'),
  )
  metal.name = 'metal'

  const accent = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.82, 0.04),
    createMaterial(0xd4c4a8, 0.7, 0.04, 'accent'),
  )
  accent.name = 'accent'
  accent.position.set(0, -0.05, 0.39)

  scene.add(body, bottom, side, handle, metal, accent)
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
