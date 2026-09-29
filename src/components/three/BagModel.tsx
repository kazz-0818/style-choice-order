import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import { MeshPhysicalMaterial, type Material, type Mesh, type MeshStandardMaterial } from 'three'
import type { BagCustomization } from '../../types/bag'
import { applyCustomizationToScene } from '../../utils/threeD/applyCustomizationToScene'
import { CUSTOM_BAG_MODEL_URL } from '../../utils/threeD/modelConfig'

interface BagModelProps {
  customization: BagCustomization
}

export function BagModel({ customization }: BagModelProps) {
  const { scene } = useGLTF(CUSTOM_BAG_MODEL_URL)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    // マテリアルはメッシュごとに独立して色を変えるため複製する
    clone.traverse((node) => {
      const mesh = node as Mesh
      if (mesh.isMesh && !Array.isArray(mesh.material)) {
        const source = mesh.material as Material & Partial<MeshStandardMaterial>
        mesh.material = new MeshPhysicalMaterial({
          name: source.name,
          color: source.color,
          roughness: source.roughness ?? 0.6,
          metalness: source.metalness ?? 0,
        })
      }
    })
    return clone
  }, [scene])

  useLayoutEffect(() => {
    applyCustomizationToScene(model, customization)
  }, [model, customization])

  return <primitive object={model} />
}

useGLTF.preload(CUSTOM_BAG_MODEL_URL)
