import { COLORS } from '../data/colors'
import { BAG_LAYERS, type BagLayer } from '../types/bag'

interface ColorSelectorProps {
  activeLayer: BagLayer
  layerColors: Record<BagLayer, string>
  onLayerChange: (layer: BagLayer) => void
  onColorSelect: (layer: BagLayer, colorId: string) => void
}

export function ColorSelector({
  activeLayer,
  layerColors,
  onLayerChange,
  onColorSelect,
}: ColorSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-medium tracking-widest text-warm-gray uppercase">
          編集するパーツ
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {BAG_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayerChange(layer.id)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                activeLayer === layer.id
                  ? 'bg-charcoal text-cream'
                  : 'border border-stone bg-white text-warm-gray hover:border-gold'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium tracking-widest text-warm-gray uppercase">
          カラー — {BAG_LAYERS.find((l) => l.id === activeLayer)?.label}
        </h3>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {COLORS.map((color) => {
            const selected = layerColors[activeLayer] === color.id
            return (
              <button
                key={color.id}
                type="button"
                title={color.name}
                onClick={() => onColorSelect(activeLayer, color.id)}
                className={`group flex flex-col items-center gap-1 rounded-xl p-1.5 transition ${
                  selected ? 'ring-2 ring-gold ring-offset-2' : 'hover:bg-stone/50'
                }`}
              >
                <span
                  className="h-8 w-8 rounded-full border border-charcoal/10 shadow-sm transition group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="max-w-full truncate text-[10px] text-warm-gray">
                  {color.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
