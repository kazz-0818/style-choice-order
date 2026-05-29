import { BAG_TEMPLATES } from '../data/bagTemplates'
import type { BagTemplateId } from '../types/bag'

interface TemplateSelectorProps {
  value: BagTemplateId
  onChange: (id: BagTemplateId) => void
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div>
      <h3 className="text-xs font-medium tracking-widest text-warm-gray uppercase">
        バッグ型
      </h3>
      <div className="mt-3 grid gap-2">
        {BAG_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              value === template.id
                ? 'border-charcoal bg-charcoal text-cream'
                : 'border-stone bg-white hover:border-gold'
            }`}
          >
            <span className="block text-sm font-medium">{template.name}</span>
            <span
              className={`mt-1 block text-xs ${
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
