import type { Player } from '../types'
import { COLOR_THEMES } from '../utils/colors'
import { rankPlayers, totalScore } from '../utils/scoring'

interface LeaderboardProps {
  players: Player[]
  activePlayerId: string | null
  onSelect: (playerId: string) => void
}

export function Leaderboard({
  players,
  activePlayerId,
  onSelect,
}: LeaderboardProps) {
  const ranked = rankPlayers(players)

  return (
    <section className="leaderboard" aria-label="Leaderboard">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <ol className="leaderboard-list">
        {ranked.map((p, i) => {
          const theme = COLOR_THEMES[p.color]
          const active = p.id === activePlayerId
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`leaderboard-item${active ? ' active' : ''}`}
                onClick={() => onSelect(p.id)}
                style={
                  active
                    ? {
                        borderColor: theme.accent,
                        backgroundColor: theme.soft,
                      }
                    : undefined
                }
              >
                <span className="leaderboard-rank">{i + 1}</span>
                <span
                  className="leaderboard-pip"
                  style={{ backgroundColor: theme.accent }}
                  aria-hidden
                />
                <span className="leaderboard-name">{p.name}</span>
                <span className="leaderboard-score">{totalScore(p)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
