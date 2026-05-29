import { BAG_TEMPLATES } from '../data/bagTemplates'
import type { BagTemplateId } from '../types/bag'

interface TemplateSelectorProps {
  value: BagTemplateId
  onChange: (id: BagTemplateId) => void
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div>
      <h3 className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs">
        バッグ型
      </h3>
      <div className="mt-2 grid gap-1.5 sm:mt-3 sm:gap-2">
        {BAG_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={`rounded-lg border px-3 py-2 text-left transition sm:rounded-xl sm:px-4 sm:py-3 ${
              value === template.id
                ? 'border-kogicha bg-kogicha text-cream'
                : 'border-stone bg-white hover:border-gold'
            }`}
          >
            <span className="block text-xs font-medium sm:text-sm">{template.name}</span>
            <span
              className={`mt-0.5 block text-[10px] leading-snug sm:mt-1 sm:text-xs sm:leading-normal ${
                value === template.id ? 'text-cream/70' : 'text-warm-gray'
              }`}
            >
              {template.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
