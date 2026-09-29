import { useState, type ReactNode } from 'react'
import { ColorSelector } from './ColorSelector'
import { HardwareSelector } from './HardwareSelector'
import { MaterialSelector } from './MaterialSelector'
import { OptionSummary } from './OptionSummary'
import { SilhouetteStep } from './SilhouetteStep'
import { SpecStepView } from './SpecStepView'
import { StepCard } from './StepCard'
import { TemplateSelector } from './TemplateSelector'
import { ThreeDBagPreview, type ViewRequest } from './ThreeDBagPreview'
import { ViewSwitcher } from './ViewSwitcher'
import { GoldDivider } from './illustrations/Decor'
import { hardwareMap } from '../data/parts'
import { getLogoStep, getStepsForTemplate, resolveSpecsForTemplate } from '../data/specs'
import type {
  BagCustomization,
  BagLayer,
  BagSize,
  BagTemplateId,
  SpecKey,
} from '../types/bag'

interface BagCustomizerProps {
  customization: BagCustomization
  activeLayer: BagLayer
  onCustomizationChange: (next: BagCustomization) => void
  onActiveLayerChange: (layer: BagLayer) => void
}

const STEP_WRAP =
  'box-border min-w-[calc(100%-0.75rem)] max-w-[calc(100%-0.75rem)] shrink-0 grow-0 snap-center sm:min-w-0 sm:max-w-none sm:w-full'

function StepSlot({ children }: { children: ReactNode }) {
  return (
    <div className={STEP_WRAP}>
      <StepCard>{children}</StepCard>
    </div>
  )
}

export function BagCustomizer({
  customization,
  activeLayer,
  onCustomizationChange,
  onActiveLayerChange,
}: BagCustomizerProps) {
  const [viewRequest, setViewRequest] = useState<ViewRequest>({ view: 'front', nonce: 0 })

  const update = (partial: Partial<BagCustomization>) => {
    onCustomizationChange({ ...customization, ...partial })
  }

  const updateSpec = (key: SpecKey, optionId: string) => {
    onCustomizationChange({
      ...customization,
      specs: { ...customization.specs, [key]: optionId },
    })
  }

  const updateSize = (size: BagSize) => update({ size })

  const updateLayerColor = (layer: BagLayer, colorId: string) => {
    onCustomizationChange({
      ...customization,
      layerColors: { ...customization.layerColors, [layer]: colorId },
    })
  }

  const handleTemplateChange = (id: BagTemplateId) => {
    onCustomizationChange({
      ...customization,
      templateId: id,
      specs: resolveSpecsForTemplate(id, customization.specs),
    })
    setViewRequest((prev) => ({ view: 'front', nonce: prev.nonce + 1 }))
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

  const templateSteps = getStepsForTemplate(customization.templateId)
  const logoStep = getLogoStep()

  // ステップ番号は表示順に採番
  let stepNo = 0
  const next = () => ++stepNo

  const customizerIntro = (
    <>
      <h2 className="font-serif text-2xl font-light text-navy sm:text-3xl">
        バッグをカスタマイズ
      </h2>
      <p className="mt-2 text-sm text-warm-gray sm:mt-3">
        型・サイズ・素材・パーツを選び、プレビューで完成イメージをご確認ください。
      </p>
    </>
  )

  return (
    <section
      id="customizer"
      className="border-b border-stone bg-cream py-10 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 max-w-2xl sm:mb-10 lg:hidden">{customizerIntro}</div>

        <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="sticky top-[60px] z-30 order-1 -mx-4 min-w-0 border-b border-stone/60 bg-cream/95 px-4 pt-2 pb-2 shadow-sm backdrop-blur-sm sm:top-[64px] sm:-mx-6 sm:px-6 lg:top-24 lg:z-10 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <div className="mb-5 hidden max-w-2xl lg:block">{customizerIntro}</div>
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-none">
              <ThreeDBagPreview customization={customization} viewRequest={viewRequest} />
              <ViewSwitcher
                customization={customization}
                active={viewRequest.view}
                onSelect={(view) =>
                  setViewRequest((prev) => ({ view, nonce: prev.nonce + 1 }))
                }
              />
            </div>
          </div>

          <div className="order-2 min-w-0 w-full overflow-hidden">
            <div className="mb-5 hidden max-w-2xl lg:invisible lg:block" aria-hidden="true">
              {customizerIntro}
            </div>
            <p className="mb-2 flex items-center justify-center gap-2 text-[10px] tracking-wide text-warm-gray sm:hidden">
              <span className="text-gold" aria-hidden>
                ←
              </span>
              <span>左右にスワイプして選択</span>
              <span className="text-gold" aria-hidden>
                →
              </span>
            </p>
            <div className="customizer-steps flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:flex-col sm:gap-8 sm:overflow-visible sm:pb-0">
              <StepSlot>
                <TemplateSelector
                  step={next()}
                  value={customization.templateId}
                  onChange={handleTemplateChange}
                />
              </StepSlot>

              <StepSlot>
                <MaterialSelector
                  step={next()}
                  value={customization.materialId}
                  onChange={(id) => update({ materialId: id })}
                />
              </StepSlot>

              <StepSlot>
                <ColorSelector
                  step={next()}
                  activeLayer={activeLayer}
                  layerColors={customization.layerColors}
                  onLayerChange={onActiveLayerChange}
                  onColorSelect={updateLayerColor}
                />
              </StepSlot>

              {templateSteps.map((spec) =>
                spec.id === 'silhouette' ? (
                  <StepSlot key={`${customization.templateId}-${spec.id}`}>
                    <SilhouetteStep
                      step={next()}
                      spec={spec}
                      templateId={customization.templateId}
                      size={customization.size}
                      onChange={updateSize}
                    />
                  </StepSlot>
                ) : (
                  <StepSlot key={`${customization.templateId}-${spec.id}`}>
                    <SpecStepView
                      step={next()}
                      spec={spec}
                      specs={customization.specs}
                      onSelect={updateSpec}
                    />
                  </StepSlot>
                ),
              )}

              <StepSlot>
                <HardwareSelector
                  step={next()}
                  value={customization.hardwareColorId}
                  onChange={handleHardwareChange}
                />
              </StepSlot>

              <StepSlot>
                <SpecStepView
                  step={next()}
                  spec={logoStep}
                  specs={customization.specs}
                  onSelect={updateSpec}
                />
              </StepSlot>

              <StepSlot>
                <OptionSummary step={next()} customization={customization} bare />
              </StepSlot>
            </div>
            <GoldDivider className="mt-8 hidden sm:flex" />
          </div>
        </div>
      </div>
    </section>
  )
}
