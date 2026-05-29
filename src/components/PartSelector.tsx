import {
  DECORATIONS,
  HANDLE_TYPES,
  HARDWARE_COLORS,
  MATERIALS,
} from '../data/parts'

export function PartOptionGroup<
  T extends { id: string; name: string; description?: string },
>({
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

export { MATERIALS, HANDLE_TYPES, HARDWARE_COLORS, DECORATIONS }
