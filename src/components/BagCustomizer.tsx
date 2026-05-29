import { BagPreview } from './BagPreview'
import { ColorSelector } from './ColorSelector'
import { OptionSummary } from './OptionSummary'
import { PartOptionGroup, DECORATIONS, HANDLE_TYPES, HARDWARE_COLORS, MATERIALS } from './PartSelector'
import { TemplateSelector } from './TemplateSelector'
import { hardwareMap } from '../data/parts'
import type { BagCustomization, BagLayer, BagTemplateId } from '../types/bag'

interface BagCustomizerProps {
  customization: BagCustomization
  activeLayer: BagLayer
  onCustomizationChange: (next: BagCustomization) => void
  onActiveLayerChange: (layer: BagLayer) => void
}

export function BagCustomizer({
  customization,
  activeLayer,
  onCustomizationChange,
  onActiveLayerChange,
}: BagCustomizerProps) {
  const update = (partial: Partial<BagCustomization>) => {
    onCustomizationChange({ ...customization, ...partial })
  }

  const updateLayerColor = (layer: BagLayer, colorId: string) => {
    onCustomizationChange({
      ...customization,
      layerColors: { ...customization.layerColors, [layer]: colorId },
    })
  }

  const handleTemplateChange = (id: BagTemplateId) => {
    update({ templateId: id })
  }

  const handleHardwareChange = (id: string) => {
    const metalColorId = hardwareMap[id]?.metalColorId
    onCustomizationChange({
      ...customization,
      hardwareColorId: id,
      layerColors: metalColorId
        ? { ...customization.layerColors, metal: metalColorId }
        : customization.layerColors,
    })
  }

  return (
    <section id="customizer" className="border-b border-stone bg-cream py-10 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 max-w-2xl sm:mb-10">
          <h2 className="font-serif text-2xl font-light text-charcoal sm:text-3xl">
            バッグをカスタマイズ
          </h2>
          <p className="mt-2 text-sm text-warm-gray sm:mt-3">
            型・パーツ・カラーを選び、右（または下）のプレビューで完成イメージをご確認ください。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="order-1 lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 text-xs tracking-widest text-warm-gray uppercase sm:mb-3">プレビュー</p>
            <BagPreview
              templateId={customization.templateId}
              layerColors={customization.layerColors}
              handleTypeId={customization.handleTypeId}
              decorationId={customization.decorationId}
            />
          </div>

          <div className="order-2 flex flex-col gap-6 sm:gap-10">
            <div className="rounded-2xl border border-stone bg-white p-6">
              <TemplateSelector
                value={customization.templateId}
                onChange={handleTemplateChange}
              />
            </div>

            <div className="rounded-2xl border border-stone bg-white p-6">
              <PartOptionGroup
                label="本体素材"
                options={MATERIALS}
                value={customization.materialId}
                onChange={(id) => update({ materialId: id })}
              />
            </div>

            <div className="rounded-2xl border border-stone bg-white p-6">
              <PartOptionGroup
                label="取手タイプ"
                options={HANDLE_TYPES}
                value={customization.handleTypeId}
                onChange={(id) => update({ handleTypeId: id })}
              />
            </div>

            <div className="rounded-2xl border border-stone bg-white p-6">
              <PartOptionGroup
                label="金具カラー"
                options={HARDWARE_COLORS}
                value={customization.hardwareColorId}
                onChange={handleHardwareChange}
              />
            </div>

            <div className="rounded-2xl border border-stone bg-white p-6">
              <PartOptionGroup
                label="装飾オプション"
                options={DECORATIONS}
                value={customization.decorationId}
                onChange={(id) => update({ decorationId: id })}
              />
            </div>

            <div className="rounded-2xl border border-stone bg-white p-6">
              <ColorSelector
                activeLayer={activeLayer}
                layerColors={customization.layerColors}
                onLayerChange={onActiveLayerChange}
                onColorSelect={updateLayerColor}
              />
            </div>

            <OptionSummary customization={customization} />
          </div>
        </div>
      </div>
    </section>
  )
}
