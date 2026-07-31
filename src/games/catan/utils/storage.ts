import type { GameState, Player } from '../types'
import { createId } from '../../../shared/lib/id'
import {
  clearGameStorage,
  loadRaw,
  saveRaw,
} from '../../../shared/lib/storage'
import { MAX_CITIES, MAX_SETTLEMENTS } from '../types'

export const CATAN_GAME_ID = 'catan'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(n) || 0))
}

function normalizePlayer(p: Partial<Player> & Record<string, unknown>): Player {
  return {
    id: String(p.id ?? createId()),
    name: String(p.name ?? ''),
    color: (p.color as Player['color']) ?? 'red',
    settlements: clamp(Number(p.settlements), 0, MAX_SETTLEMENTS),
    cities: clamp(Number(p.cities), 0, MAX_CITIES),
    victoryPointCards: Math.max(0, Math.floor(Number(p.victoryPointCards)) || 0),
    hasLargestArmy: Boolean(p.hasLargestArmy),
    hasLongestRoad: Boolean(p.hasLongestRoad),
  }
}

function normalizeGame(parsed: Partial<GameState>): GameState {
  const players = Array.isArray(parsed.players)
    ? parsed.players.map((p) =>
        normalizePlayer(p as Partial<Player> & Record<string, unknown>),
      )
    : []

  let foundArmy = false
  let foundRoad = false
  const fixedPlayers = players.map((p) => {
    let next = p
    if (p.hasLargestArmy) {
      if (foundArmy) next = { ...next, hasLargestArmy: false }
      else foundArmy = true
    }
    if (p.hasLongestRoad) {
      if (foundRoad) next = { ...next, hasLongestRoad: false }
      else foundRoad = true
    }
    return next
  })

  let phase: GameState['phase'] = 'setup'
  if (parsed.phase === 'scoring' || parsed.phase === 'editPlayers') {
    phase = fixedPlayers.length >= 2 ? parsed.phase : 'setup'
  } else if (parsed.phase === 'setup') {
    phase = 'setup'
  }

  let activePlayerId = parsed.activePlayerId ?? null
  if (activePlayerId && !fixedPlayers.some((p) => p.id === activePlayerId)) {
    activePlayerId = fixedPlayers[0]?.id ?? null
  }

  return {
    phase,
    players: fixedPlayers,
    activePlayerId,
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = loadRaw(CATAN_GAME_ID)
    if (!raw) return null
    return normalizeGame(JSON.parse(raw) as Partial<GameState>)
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  saveRaw(CATAN_GAME_ID, JSON.stringify(state))
}

export function clearGame(): void {
  clearGameStorage(CATAN_GAME_ID)
}

export function hasInProgressSession(): boolean {
  const state = loadGame()
  if (!state) return false
  return (
    state.players.length >= 2 &&
    (state.phase === 'scoring' || state.phase === 'editPlayers')
  )
}
