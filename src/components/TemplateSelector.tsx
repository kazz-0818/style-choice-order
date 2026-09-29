import { StepTitle } from './StepTitle'
import { BagArt } from './illustrations/BagArt'
import { BAG_TEMPLATES } from '../data/bagTemplates'
import type { BagTemplateId } from '../types/bag'

interface TemplateSelectorProps {
  value: BagTemplateId
  onChange: (id: BagTemplateId) => void
  step?: number
}

export function TemplateSelector({ value, onChange, step = 1 }: TemplateSelectorProps) {
  return (
    <div>
      <StepTitle
        step={step}
        icon="bag"
        lead="7つのバッグ型からお選びください。型によって選べるパーツ項目が変わります。"
      >
        バッグ型
      </StepTitle>
      <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:grid-cols-3 sm:gap-3">
        {BAG_TEMPLATES.map((template) => {
          const selected = value === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              aria-pressed={selected}
              className={`group flex flex-col overflow-hidden rounded-xl border text-left transition ${
                selected
                  ? 'border-navy ring-2 ring-gold'
                  : 'border-stone bg-white hover:border-gold'
              }`}
            >
              <span className="art-grid block p-0.5 sm:p-1.5">
                <BagArt type={template.id} className="mx-auto aspect-square w-full max-w-[64px] sm:max-w-[112px]" />
              </span>
              <span
                className={`flex-1 px-1 py-1.5 text-center sm:block sm:px-3 sm:py-2 sm:text-left ${
                  selected ? 'bg-navy text-cream' : 'bg-white text-charcoal'
                }`}
              >
                <span className="block text-[10px] leading-tight font-medium sm:text-sm sm:leading-normal">
                  {template.name}
                </span>
                <span
                  className={`hidden text-[9px] tracking-widest uppercase sm:block ${
                    selected ? 'text-gold-light' : 'text-gold'
                  }`}
                >
                  {template.nameEn}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
