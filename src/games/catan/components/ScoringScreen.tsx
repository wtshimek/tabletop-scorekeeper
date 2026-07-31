import { useGame } from '../context/GameContext'
import { COLOR_THEMES } from '../utils/colors'
import { AppMenu } from './AppMenu'
import { Leaderboard } from './Leaderboard'
import { PlayerCard } from './PlayerCard'

export function ScoringScreen() {
  const {
    state,
    setActivePlayer,
    adjustSettlement,
    setSettlement,
    upgradeCity,
    downgradeCity,
    adjustVpCards,
    setVpCards,
    setLargestArmy,
    setLongestRoad,
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
          <h1 className="scoring-title">Catan</h1>
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
                borderColor: theme.border,
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
        onAdjustSettlement={(delta) => adjustSettlement(active.id, delta)}
        onSetSettlement={(value) => setSettlement(active.id, value)}
        onUpgradeCity={() => upgradeCity(active.id)}
        onDowngradeCity={() => downgradeCity(active.id)}
        onAdjustVpCards={(delta) => adjustVpCards(active.id, delta)}
        onSetVpCards={(value) => setVpCards(active.id, value)}
        onLargestArmy={(enabled) => setLargestArmy(active.id, enabled)}
        onLongestRoad={(enabled) => setLongestRoad(active.id, enabled)}
      />
    </div>
  )
}
