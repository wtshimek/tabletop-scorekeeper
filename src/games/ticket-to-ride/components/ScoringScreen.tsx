import { useGame } from '../context/GameContext'
import { COLOR_THEMES } from '../utils/colors'
import { AppMenu } from './AppMenu'
import { Leaderboard } from './Leaderboard'
import { PlayerCard } from './PlayerCard'

export function ScoringScreen() {
  const {
    state,
    setActivePlayer,
    adjustTrain,
    setTrain,
    addTicket,
    removeTicket,
    setLongestRoute,
    resetScores,
    newGame,
    beginEditPlayers,
  } = useGame()

  const { players, activePlayerId } = state
  const active =
    players.find((p) => p.id === activePlayerId) ?? players[0] ?? null

  if (!active) return null

  return (
    <div className="scoring-screen">
      <header className="scoring-header">
        <div className="scoring-header-text">
          <h1 className="scoring-title">Ticket to Ride</h1>
          <p className="scoring-tagline">Scorekeeper</p>
        </div>
        <AppMenu
          onNewGame={newGame}
          onResetScores={resetScores}
          onEditPlayers={beginEditPlayers}
        />
      </header>

      <Leaderboard
        players={players}
        activePlayerId={active.id}
        onSelect={setActivePlayer}
      />

      <nav className="player-tabs" aria-label="Players">
        {players.map((p) => {
          const theme = COLOR_THEMES[p.color]
          const selected = p.id === active.id
          return (
            <button
              key={p.id}
              type="button"
              className={`player-tab${selected ? ' selected' : ''}`}
              style={{
                borderColor: theme.accent,
                backgroundColor: selected ? theme.accent : theme.soft,
                color: selected ? theme.onAccent : theme.accentDark,
              }}
              onClick={() => setActivePlayer(p.id)}
            >
              {p.name}
            </button>
          )
        })}
      </nav>

      <PlayerCard
        key={active.id}
        player={active}
        onAdjustTrain={(length, delta) =>
          adjustTrain(active.id, length, delta)
        }
        onSetTrain={(length, value) => setTrain(active.id, length, value)}
        onAddTicket={(kind, value) => addTicket(active.id, kind, value)}
        onRemoveTicket={(kind, index) => removeTicket(active.id, kind, index)}
        onLongestRoute={(enabled) => setLongestRoute(active.id, enabled)}
      />
    </div>
  )
}
