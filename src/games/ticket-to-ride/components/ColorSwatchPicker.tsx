import type { PlayerColor } from '../types'
import { PLAYER_COLORS } from '../types'
import { COLOR_THEMES } from '../utils/colors'

interface ColorSwatchPickerProps {
  value: PlayerColor | null
  taken: Set<PlayerColor>
  onChange: (color: PlayerColor) => void
  id?: string
}

export function ColorSwatchPicker({
  value,
  taken,
  onChange,
  id,
}: ColorSwatchPickerProps) {
  return (
    <div className="color-swatches" role="radiogroup" aria-label="Player color">
      {PLAYER_COLORS.map((color) => {
        const theme = COLOR_THEMES[color]
        const isTaken = taken.has(color) && value !== color
        const selected = value === color
        return (
          <button
            key={color}
            type="button"
            id={id ? `${id}-${color}` : undefined}
            role="radio"
            aria-checked={selected}
            aria-label={theme.label}
            disabled={isTaken}
            className={`color-swatch${selected ? ' selected' : ''}${isTaken ? ' taken' : ''}`}
            style={{
              backgroundColor: theme.accent,
              color: theme.onAccent,
              outlineColor: theme.accentDark,
            }}
            onClick={() => onChange(color)}
          >
            {selected ? '✓' : ''}
          </button>
        )
      })}
    </div>
  )
}
