import type { GameState, Player, TrainCounts } from '../types'
import { createId } from '../../../shared/lib/id'
import {
  clearGameStorage,
  loadRaw,
  migrateLegacyKey,
  saveRaw,
} from '../../../shared/lib/storage'
import { emptyTrains } from './scoring'

export const TTR_GAME_ID = 'ticket-to-ride'
const LEGACY_KEY = 'ttr-scorekeeper-v1'

function normalizeTrains(raw: Partial<TrainCounts> | undefined): TrainCounts {
  const base = emptyTrains()
  if (!raw) return base
  return {
    1: Math.max(0, Number(raw[1]) || 0),
    2: Math.max(0, Number(raw[2]) || 0),
    3: Math.max(0, Number(raw[3]) || 0),
    4: Math.max(0, Number(raw[4]) || 0),
    5: Math.max(0, Number(raw[5]) || 0),
    6: Math.max(0, Number(raw[6]) || 0),
  }
}

/** Accept legacy single totals or new number[] lists. */
function normalizeTicketList(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw
      .map((v) => Math.max(0, Math.floor(Number(v)) || 0))
      .filter((v) => v > 0)
  }
  const n = Math.max(0, Math.floor(Number(raw)) || 0)
  return n > 0 ? [n] : []
}

function normalizePlayer(p: Partial<Player> & Record<string, unknown>): Player {
  return {
    id: String(p.id ?? createId()),
    name: String(p.name ?? ''),
    color: (p.color as Player['color']) ?? 'red',
    trains: normalizeTrains(p.trains),
    completedTickets: normalizeTicketList(p.completedTickets),
    incompleteTickets: normalizeTicketList(p.incompleteTickets),
    hasLongestRoute: Boolean(p.hasLongestRoute),
  }
}

function normalizeGame(parsed: Partial<GameState>): GameState {
  const players = Array.isArray(parsed.players)
    ? parsed.players.map((p) =>
        normalizePlayer(p as Partial<Player> & Record<string, unknown>),
      )
    : []

  let foundLongest = false
  const fixedPlayers = players.map((p) => {
    if (p.hasLongestRoute) {
      if (foundLongest) return { ...p, hasLongestRoute: false }
      foundLongest = true
    }
    return p
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
  migrateLegacyKey(TTR_GAME_ID, LEGACY_KEY)
  try {
    const raw = loadRaw(TTR_GAME_ID)
    if (!raw) return null
    return normalizeGame(JSON.parse(raw) as Partial<GameState>)
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  saveRaw(TTR_GAME_ID, JSON.stringify(state))
}

export function clearGame(): void {
  clearGameStorage(TTR_GAME_ID)
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }
}

/** True when a scoring session is in progress (for library badge). */
export function hasInProgressSession(): boolean {
  const state = loadGame()
  if (!state) return false
  return (
    state.players.length >= 2 &&
    (state.phase === 'scoring' || state.phase === 'editPlayers')
  )
}
