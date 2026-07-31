import { useEffect } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { SetupScreen } from './components/SetupScreen'
import { ScoringScreen } from './components/ScoringScreen'
import { applyPlayerTheme } from './utils/colors'

function TicketToRideShell() {
  const { state, phase, startGame, savePlayers, cancelEditPlayers } = useGame()

  const activePlayer =
    state.players.find((p) => p.id === state.activePlayerId) ??
    state.players[0] ??
    null

  useEffect(() => {
    if (phase === 'scoring' || phase === 'editPlayers') {
      applyPlayerTheme(activePlayer?.color ?? null)
    } else {
      applyPlayerTheme(null)
    }
  }, [phase, activePlayer?.color])

  if (phase === 'setup') {
    return (
      <main className="app-shell">
        <SetupScreen mode="setup" onStart={startGame} />
      </main>
    )
  }

  if (phase === 'editPlayers') {
    return (
      <main className="app-shell">
        <SetupScreen
          mode="edit"
          existingPlayers={state.players}
          onStart={startGame}
          onSave={savePlayers}
          onCancel={cancelEditPlayers}
        />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <ScoringScreen />
    </main>
  )
}

export function TicketToRideApp() {
  return (
    <GameProvider>
      <TicketToRideShell />
    </GameProvider>
  )
}
