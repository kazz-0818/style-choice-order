import { StepTitle } from './StepTitle'
import { COLORS } from '../data/colors'
import { BAG_LAYERS, type BagLayer } from '../types/bag'

interface ColorSelectorProps {
  activeLayer: BagLayer
  layerColors: Record<BagLayer, string>
  onLayerChange: (layer: BagLayer) => void
  onColorSelect: (layer: BagLayer, colorId: string) => void
  colorRequest: string
  onColorRequestChange: (value: string) => void
  step?: number
}

export function ColorSelector({
  activeLayer,
  layerColors,
  onLayerChange,
  onColorSelect,
  colorRequest,
  onColorRequestChange,
  step,
}: ColorSelectorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {step && (
        <StepTitle
          step={step}
          icon="palette"
          lead="パーツごとにカラーを変えて、配色を確かめられます。"
        >
          カラー
        </StepTitle>
      )}
      <div>
        <h4 className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs">
          編集するパーツ
        </h4>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
          {BAG_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayerChange(layer.id)}
              className={`flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1.5 text-[11px] transition sm:text-xs ${
                activeLayer === layer.id
                  ? 'bg-navy text-cream'
                  : 'border border-stone bg-white text-warm-gray hover:border-gold'
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-charcoal/20"
                style={{ backgroundColor: COLORS.find((c) => c.id === layerColors[layer.id])?.hex }}
              />
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs">
          カラー — {BAG_LAYERS.find((l) => l.id === activeLayer)?.label}
        </h4>
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:mt-3 sm:grid-cols-6 sm:gap-2">
          {COLORS.map((color) => {
            const selected = layerColors[activeLayer] === color.id
            return (
              <button
                key={color.id}
                type="button"
                title={color.name}
                onClick={() => onColorSelect(activeLayer, color.id)}
                className={`group flex flex-col items-center gap-0.5 rounded-lg p-1 transition sm:gap-1 sm:rounded-xl sm:p-1.5 ${
                  selected ? 'ring-2 ring-gold ring-offset-1 sm:ring-offset-2' : 'hover:bg-stone/50'
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full border border-charcoal/10 shadow-sm transition group-hover:scale-105 sm:h-8 sm:w-8"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="max-w-full truncate text-[10px] text-warm-gray">{color.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="color-request"
          className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs"
        >
          備考（色調のご希望）
        </label>
        <p className="mt-1 text-[11px] leading-relaxed text-warm-gray sm:text-xs">
          色調をリクエストされたい方はパントーンカラーでご指定ください
        </p>
        <textarea
          id="color-request"
          value={colorRequest}
          onChange={(e) => onColorRequestChange(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="例：本体 PANTONE 19-4052（Classic Blue）／持ち手 PANTONE 18-1663"
          className="mt-2 w-full resize-y rounded-lg border border-stone bg-white px-3 py-2 text-xs text-charcoal placeholder:text-warm-gray/60 focus:border-gold focus:outline-none sm:text-sm"
        />
      </div>
    </div>
  )
}
