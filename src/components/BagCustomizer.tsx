import { StepCard } from './StepCard'
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
            型・パーツ・カラーを選び、プレビューで完成イメージをご確認ください。
          </p>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="order-1 min-w-0 overflow-visible lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 hidden text-xs tracking-widest text-warm-gray uppercase sm:mb-3 sm:block">
              プレビュー
            </p>
            <div className="relative mx-auto w-fit overflow-visible sm:mx-0 sm:w-full">
              <BagPreview
                templateId={customization.templateId}
                layerColors={customization.layerColors}
                handleTypeId={customization.handleTypeId}
                decorationId={customization.decorationId}
              />
              <p className="absolute bottom-0 left-full ml-2 whitespace-nowrap text-[10px] tracking-widest text-warm-gray uppercase sm:hidden">
                プレビュー
              </p>
            </div>
          </div>

          <div className="order-2 min-w-0 w-full overflow-hidden">
            <p className="mb-2 flex items-center justify-center gap-2 text-[10px] tracking-wide text-warm-gray sm:hidden">
              <span className="text-gold" aria-hidden>
                ←
              </span>
              <span>左右にスワイプして選択</span>
              <span className="text-gold" aria-hidden>
                →
              </span>
            </p>
            <div className="customizer-steps flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:flex-col sm:gap-10 sm:overflow-visible sm:pb-0">
              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <TemplateSelector
                    step={1}
                    value={customization.templateId}
                    onChange={handleTemplateChange}
                  />
                </StepCard>
              </div>

              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <PartOptionGroup
                    step={2}
                    label="本体素材"
                    options={MATERIALS}
                    value={customization.materialId}
                    onChange={(id) => update({ materialId: id })}
                  />
                </StepCard>
              </div>

              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <PartOptionGroup
                    step={3}
                    label="取手タイプ"
                    options={HANDLE_TYPES}
                    value={customization.handleTypeId}
                    onChange={(id) => update({ handleTypeId: id })}
                  />
                </StepCard>
              </div>

              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <PartOptionGroup
                    step={4}
                    label="金具カラー"
                    options={HARDWARE_COLORS}
                    value={customization.hardwareColorId}
                    onChange={handleHardwareChange}
                  />
                </StepCard>
              </div>

              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <PartOptionGroup
                    step={5}
                    label="装飾オプション"
                    options={DECORATIONS}
                    value={customization.decorationId}
                    onChange={(id) => update({ decorationId: id })}
                  />
                </StepCard>
              </div>

              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <ColorSelector
                    step={6}
                    activeLayer={activeLayer}
                    layerColors={customization.layerColors}
                    onLayerChange={onActiveLayerChange}
                    onColorSelect={updateLayerColor}
                  />
                </StepCard>
              </div>

              <div className="box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full">
                <StepCard>
                  <OptionSummary step={7} customization={customization} bare />
                </StepCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
