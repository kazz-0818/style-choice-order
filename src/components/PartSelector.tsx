import {
  DECORATIONS,
  HANDLE_TYPES,
  HARDWARE_COLORS,
  MATERIALS,
} from '../data/parts'
import type { BagCustomization } from '../types/bag'

interface PartSelectorProps {
  customization: BagCustomization
  onMaterialChange: (id: string) => void
  onHandleChange: (id: string) => void
  onHardwareChange: (id: string) => void
  onDecorationChange: (id: string) => void
}

function OptionGroup<T extends { id: string; name: string; description?: string }>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: T[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div>
      <h3 className="text-xs font-medium tracking-widest text-warm-gray uppercase">{label}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              value === option.id
                ? 'border-kogicha bg-kogicha text-cream'
                : 'border-stone bg-white text-charcoal hover:border-gold'
            }`}
          >
            <span className="block text-sm font-medium">{option.name}</span>
            {option.description && (
              <span
                className={`mt-1 block text-xs leading-relaxed ${
                  value === option.id ? 'text-cream/70' : 'text-warm-gray'
                }`}
              >
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PartSelector({
  customization,
  onMaterialChange,
  onHandleChange,
  onHardwareChange,
  onDecorationChange,
}: PartSelectorProps) {
  return (
    <div className="space-y-8">
      <OptionGroup
        label="本体素材"
        options={MATERIALS}
        value={customization.materialId}
        onChange={onMaterialChange}
      />
      <OptionGroup
        label="取手タイプ"
        options={HANDLE_TYPES}
        value={customization.handleTypeId}
        onChange={onHandleChange}
      />
      <OptionGroup
        label="金具カラー"
        options={HARDWARE_COLORS}
        value={customization.hardwareColorId}
        onChange={onHardwareChange}
      />
      <OptionGroup
        label="装飾オプション"
        options={DECORATIONS}
        value={customization.decorationId}
        onChange={onDecorationChange}
      />
    </div>
  )
}
