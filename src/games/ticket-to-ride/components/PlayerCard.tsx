import { useState } from 'react'
import type { Player, TicketKind, TrainLength } from '../types'
import { TRAIN_LENGTHS } from '../types'
import { COLOR_THEMES } from '../utils/colors'
import {
  formatBreakdown,
  formatTicketsNetSummary,
  totalScore,
  TRAIN_POINTS,
} from '../utils/scoring'
import { LongestRouteToggle } from './LongestRouteToggle'
import { StepperInput } from './StepperInput'
import { TicketModal } from './TicketModal'

interface PlayerCardProps {
  player: Player
  onAdjustTrain: (length: TrainLength, delta: number) => void
  onSetTrain: (length: TrainLength, value: number) => void
  onAddTicket: (kind: TicketKind, value: number) => void
  onRemoveTicket: (kind: TicketKind, index: number) => void
  onLongestRoute: (enabled: boolean) => void
}

export function PlayerCard({
  player,
  onAdjustTrain,
  onSetTrain,
  onAddTicket,
  onRemoveTicket,
  onLongestRoute,
}: PlayerCardProps) {
  const theme = COLOR_THEMES[player.color]
  const [ticketsOpen, setTicketsOpen] = useState(false)

  return (
    <article
      className="player-card"
      style={{
        borderColor: theme.accent,
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

      <section className="player-card-section" aria-label="Train routes">
        <h3 className="section-heading">Train routes</h3>
        {TRAIN_LENGTHS.map((len) => (
          <StepperInput
            key={len}
            label={`${len} × 🚂 (${TRAIN_POINTS[len]})`}
            value={player.trains[len]}
            onAdjust={(d) => onAdjustTrain(len, d)}
            onChange={(v) => onSetTrain(len, v)}
          />
        ))}
      </section>

      <section className="player-card-section" aria-label="Destination tickets">
        <h3 className="section-heading">Destination tickets</h3>
        <button
          type="button"
          className="ticket-summary-row"
          onClick={() => setTicketsOpen(true)}
        >
          <div className="ticket-summary-text">
            <span className="ticket-summary-label">Tickets</span>
            <span className="ticket-summary-meta">
              {formatTicketsNetSummary(player)}
            </span>
          </div>
          <span className="ticket-summary-chevron" aria-hidden>
            ›
          </span>
        </button>
      </section>

      <section className="player-card-section">
        <LongestRouteToggle
          checked={player.hasLongestRoute}
          onChange={onLongestRoute}
          playerName={player.name}
        />
      </section>

      {ticketsOpen ? (
        <TicketModal
          playerName={player.name}
          completed={player.completedTickets}
          incomplete={player.incompleteTickets}
          onAdd={onAddTicket}
          onRemove={onRemoveTicket}
          onClose={() => setTicketsOpen(false)}
        />
      ) : null}
    </article>
  )
}
