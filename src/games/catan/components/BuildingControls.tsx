import type { Player } from '../types'
import { MAX_CITIES, MAX_SETTLEMENTS } from '../types'
import { StepperInput } from './StepperInput'

interface BuildingControlsProps {
  player: Player
  onAdjustSettlement: (delta: number) => void
  onSetSettlement: (value: number) => void
  onUpgradeCity: () => void
  onDowngradeCity: () => void
}

export function BuildingControls({
  player,
  onAdjustSettlement,
  onSetSettlement,
  onUpgradeCity,
  onDowngradeCity,
}: BuildingControlsProps) {
  const canUpgrade =
    player.settlements >= 1 && player.cities < MAX_CITIES
  const canDowngrade =
    player.cities >= 1 && player.settlements < MAX_SETTLEMENTS

  return (
    <section className="player-card-section" aria-label="Buildings">
      <h3 className="section-heading">Buildings</h3>
      <StepperInput
        label="Settlements"
        hint="1 VP each · max 5"
        value={player.settlements}
        min={0}
        max={MAX_SETTLEMENTS}
        onAdjust={onAdjustSettlement}
        onChange={onSetSettlement}
      />

      <div className="stepper-row">
        <div className="stepper-label">
          <span className="stepper-label-text">Cities</span>
          <span className="stepper-hint">
            2 VP each · upgrade uses 1 settlement · max 4
          </span>
        </div>
        <div className="stepper-controls">
          <button
            type="button"
            className="stepper-btn"
            aria-label="Downgrade city to settlement"
            onClick={onDowngradeCity}
            disabled={!canDowngrade}
          >
            −
          </button>
          <span className="stepper-input stepper-input-display" aria-live="polite">
            {player.cities}
          </span>
          <button
            type="button"
            className="stepper-btn"
            aria-label="Upgrade settlement to city"
            onClick={onUpgradeCity}
            disabled={!canUpgrade}
          >
            +
          </button>
        </div>
      </div>
    </section>
  )
}
