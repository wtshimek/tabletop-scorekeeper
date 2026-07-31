interface BonusToggleProps {
  title: string
  hint: string
  checked: boolean
  onChange: (enabled: boolean) => void
  playerName: string
}

export function BonusToggle({
  title,
  hint,
  checked,
  onChange,
  playerName,
}: BonusToggleProps) {
  return (
    <label className="longest-toggle">
      <div className="longest-toggle-text">
        <span className="longest-toggle-title">{title}</span>
        <span className="longest-toggle-hint">{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${title} for ${playerName}`}
        className={`switch${checked ? ' on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-knob" />
      </button>
    </label>
  )
}
