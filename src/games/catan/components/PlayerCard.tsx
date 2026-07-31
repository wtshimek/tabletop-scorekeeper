import type { Player } from '../types'
import { COLOR_THEMES } from '../utils/colors'
import { formatBreakdown, totalScore } from '../utils/scoring'
import { BonusToggle } from './BonusToggle'
import { BuildingControls } from './BuildingControls'
import { StepperInput } from './StepperInput'

interface PlayerCardProps {
  player: Player
  onAdjustSettlement: (delta: number) => void
  onSetSettlement: (value: number) => void
  onUpgradeCity: () => void
  onDowngradeCity: () => void
  onAdjustVpCards: (delta: number) => void
  onSetVpCards: (value: number) => void
  onLargestArmy: (enabled: boolean) => void
  onLongestRoad: (enabled: boolean) => void
}

export function PlayerCard({
  player,
  onAdjustSettlement,
  onSetSettlement,
  onUpgradeCity,
  onDowngradeCity,
  onAdjustVpCards,
  onSetVpCards,
  onLargestArmy,
  onLongestRoad,
}: PlayerCardProps) {
  const theme = COLOR_THEMES[player.color]

  return (
    <article
      className="player-card"
      style={{
        borderColor: theme.border,
        ['--card-accent' as string]: theme.accent,
        ['--card-soft' as string]: theme.soft,
        ['--card-on' as string]: theme.onAccent,
      }}
    >
      <header
        className="player-card-header"
        style={{ backgroundColor: theme.accent, color: theme.onAccent }}
      >
        <h2 className="player-card-name">{player.name}</h2>
        <div className="player-card-total" aria-live="polite">
          {totalScore(player)}
        </div>
      </header>

      <p className="player-card-breakdown">{formatBreakdown(player)}</p>

      <BuildingControls
        player={player}
        onAdjustSettlement={onAdjustSettlement}
        onSetSettlement={onSetSettlement}
        onUpgradeCity={onUpgradeCity}
        onDowngradeCity={onDowngradeCity}
      />

      <section className="player-card-section" aria-label="Development cards">
        <h3 className="section-heading">Development cards</h3>
        <StepperInput
          label="Victory point cards"
          hint="1 VP each"
          value={player.victoryPointCards}
          min={0}
          onAdjust={onAdjustVpCards}
          onChange={onSetVpCards}
        />
      </section>

      <section className="player-card-section">
        <BonusToggle
          title="Largest Army"
          hint="+2 VP · only one player"
          checked={player.hasLargestArmy}
          onChange={onLargestArmy}
          playerName={player.name}
        />
      </section>
      <section className="player-card-section">
        <BonusToggle
          title="Longest Road"
          hint="+2 VP · only one player"
          checked={player.hasLongestRoad}
          onChange={onLongestRoad}
          playerName={player.name}
        />
      </section>
    </article>
  )
}
