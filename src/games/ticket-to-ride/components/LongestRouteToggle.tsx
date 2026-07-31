interface LongestRouteToggleProps {
  checked: boolean
  onChange: (enabled: boolean) => void
  playerName: string
}

export function LongestRouteToggle({
  checked,
  onChange,
  playerName,
}: LongestRouteToggleProps) {
  return (
    <label className="longest-toggle">
      <div className="longest-toggle-text">
        <span className="longest-toggle-title">Longest Route</span>
        <span className="longest-toggle-hint">+10 points (only one player)</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Longest route for ${playerName}`}
        className={`switch${checked ? ' on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-knob" />
      </button>
    </label>
  )
}
