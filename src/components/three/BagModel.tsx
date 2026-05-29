import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import type { BagCustomization } from '../../types/bag'
import { applyCustomizationToScene } from '../../utils/threeD/applyCustomizationToScene'
import { CUSTOM_BAG_MODEL_URL } from '../../utils/threeD/modelConfig'

interface BagModelProps {
  customization: BagCustomization
}

export function BagModel({ customization }: BagModelProps) {
  const { scene } = useGLTF(CUSTOM_BAG_MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    applyCustomizationToScene(model, customization)
  }, [model, customization])

  return <primitive object={model} />
}

useGLTF.preload(CUSTOM_BAG_MODEL_URL)
