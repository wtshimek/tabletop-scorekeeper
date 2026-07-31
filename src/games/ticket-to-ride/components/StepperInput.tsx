import { useEffect, useState } from 'react'

interface StepperInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  onAdjust: (delta: number) => void
  hint?: string
  min?: number
}

export function StepperInput({
  label,
  value,
  onChange,
  onAdjust,
  hint,
  min = 0,
}: StepperInputProps) {
  const [focused, setFocused] = useState(false)
  /** String draft while typing so "04" can be normalized without fighting the cursor. */
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    if (!focused) {
      setDraft(String(value))
    }
  }, [value, focused])

  const commit = (raw: string) => {
    if (raw.trim() === '') {
      onChange(min)
      setDraft(String(min))
      return
    }
    const n = parseInt(raw, 10)
    if (Number.isNaN(n)) {
      setDraft(String(value))
      return
    }
    const next = Math.max(min, n)
    onChange(next)
    setDraft(String(next))
  }

  return (
    <div className="stepper-row">
      <div className="stepper-label">
        <span className="stepper-label-text">{label}</span>
        {hint ? <span className="stepper-hint">{hint}</span> : null}
      </div>
      <div className="stepper-controls">
        <button
          type="button"
          className="stepper-btn"
          aria-label={`Decrease ${label}`}
          onClick={() => onAdjust(-1)}
          disabled={value <= min}
        >
          −
        </button>
        <input
          type="text"
          className="stepper-input"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={focused ? draft : String(value)}
          onFocus={(e) => {
            setFocused(true)
            setDraft(String(value))
            // Next frame so select works after focus on mobile
            requestAnimationFrame(() => e.target.select())
          }}
          onBlur={() => {
            commit(draft)
            setFocused(false)
          }}
          onChange={(e) => {
            const raw = e.target.value
            // Allow empty while editing; digits only
            if (raw === '') {
              setDraft('')
              return
            }
            if (!/^\d+$/.test(raw)) return
            // Strip leading zeros: "04" → "4", keep single "0"
            const normalized =
              raw.replace(/^0+(?=\d)/, '') === '' ? '0' : raw.replace(/^0+(?=\d)/, '')
            setDraft(normalized)
            const n = parseInt(normalized, 10)
            if (!Number.isNaN(n)) onChange(Math.max(min, n))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          aria-label={label}
        />
        <button
          type="button"
          className="stepper-btn"
          aria-label={`Increase ${label}`}
          onClick={() => onAdjust(1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
