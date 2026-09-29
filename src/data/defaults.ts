import {
  DEFAULT_LAYER_COLORS,
  DEFAULT_SIZE,
  type BagCustomization,
  type BagTemplateId,
} from '../types/bag'
import { getDefaultSpecs } from './specs'

export function createDefaultCustomization(
  templateId: BagTemplateId = 'tote',
): BagCustomization {
  return {
    templateId,
    materialId: 'genuine-leather',
    hardwareColorId: 'gold',
    size: { ...DEFAULT_SIZE },
    specs: getDefaultSpecs(templateId),
    layerColors: { ...DEFAULT_LAYER_COLORS },
  }
}
