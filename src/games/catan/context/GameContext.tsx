import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  AppPhase,
  GameState,
  Player,
  PlayerColor,
} from '../types'
import {
  MAX_CITIES,
  MAX_PLAYERS,
  MAX_SETTLEMENTS,
  MIN_PLAYERS,
} from '../types'
import { clearGame, loadGame, saveGame } from '../utils/storage'

export interface SetupDraftPlayer {
  id: string
  name: string
  color: PlayerColor | null
}

type Action =
  | { type: 'START_GAME'; players: SetupDraftPlayer[] }
  | { type: 'SET_ACTIVE_PLAYER'; playerId: string }
  | { type: 'ADJUST_SETTLEMENT'; playerId: string; delta: number }
  | { type: 'SET_SETTLEMENT'; playerId: string; value: number }
  | { type: 'UPGRADE_CITY'; playerId: string }
  | { type: 'DOWNGRADE_CITY'; playerId: string }
  | { type: 'ADJUST_VP_CARDS'; playerId: string; delta: number }
  | { type: 'SET_VP_CARDS'; playerId: string; value: number }
  | { type: 'SET_LARGEST_ARMY'; playerId: string; enabled: boolean }
  | { type: 'SET_LONGEST_ROAD'; playerId: string; enabled: boolean }
  | { type: 'RESET_SCORES' }
  | { type: 'NEW_GAME' }
  | { type: 'BEGIN_EDIT_PLAYERS' }
  | { type: 'SAVE_PLAYERS'; players: SetupDraftPlayer[] }
  | { type: 'CANCEL_EDIT_PLAYERS' }

/** Base game starts with two free settlements each. */
const INITIAL_SETTLEMENTS = 2

function createPlayer(draft: SetupDraftPlayer, existing?: Player): Player {
  return {
    id: draft.id,
    name: draft.name.trim(),
    color: draft.color as PlayerColor,
    settlements: existing?.settlements ?? INITIAL_SETTLEMENTS,
    cities: existing?.cities ?? 0,
    victoryPointCards: existing?.victoryPointCards ?? 0,
    hasLargestArmy: existing?.hasLargestArmy ?? false,
    hasLongestRoad: existing?.hasLongestRoad ?? false,
  }
}

function validateDrafts(drafts: SetupDraftPlayer[]): string | null {
  if (drafts.length < MIN_PLAYERS) {
    return `Add at least ${MIN_PLAYERS} players.`
  }
  if (drafts.length > MAX_PLAYERS) {
    return `Maximum ${MAX_PLAYERS} players.`
  }
  for (const d of drafts) {
    if (!d.name.trim()) return 'Every player needs a name.'
    if (!d.color) return 'Every player needs a color.'
  }
  const colors = drafts.map((d) => d.color)
  if (new Set(colors).size !== colors.length) {
    return 'Each player must have a unique color.'
  }
  return null
}

function initialState(): GameState {
  const saved = loadGame()
  if (saved && saved.players.length >= MIN_PLAYERS && saved.phase !== 'setup') {
    return saved
  }
  if (saved && saved.phase === 'setup') {
    return saved
  }
  return {
    phase: 'setup',
    players: [],
    activePlayerId: null,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(n) || 0))
}

function mapPlayer(
  state: GameState,
  playerId: string,
  fn: (p: Player) => Player,
): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? fn(p) : p)),
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (validateDrafts(action.players)) return state
      const players = action.players.map((d) => createPlayer(d))
      return {
        phase: 'scoring',
        players,
        activePlayerId: players[0]?.id ?? null,
      }
    }
    case 'SET_ACTIVE_PLAYER':
      return { ...state, activePlayerId: action.playerId }
    case 'ADJUST_SETTLEMENT':
      return mapPlayer(state, action.playerId, (p) => ({
        ...p,
        settlements: clamp(
          p.settlements + action.delta,
          0,
          MAX_SETTLEMENTS,
        ),
      }))
    case 'SET_SETTLEMENT':
      return mapPlayer(state, action.playerId, (p) => ({
        ...p,
        settlements: clamp(action.value, 0, MAX_SETTLEMENTS),
      }))
    case 'UPGRADE_CITY':
      return mapPlayer(state, action.playerId, (p) => {
        if (p.settlements < 1 || p.cities >= MAX_CITIES) return p
        return {
          ...p,
          settlements: p.settlements - 1,
          cities: p.cities + 1,
        }
      })
    case 'DOWNGRADE_CITY':
      return mapPlayer(state, action.playerId, (p) => {
        if (p.cities < 1 || p.settlements >= MAX_SETTLEMENTS) return p
        return {
          ...p,
          cities: p.cities - 1,
          settlements: p.settlements + 1,
        }
      })
    case 'ADJUST_VP_CARDS':
      return mapPlayer(state, action.playerId, (p) => ({
        ...p,
        victoryPointCards: Math.max(0, p.victoryPointCards + action.delta),
      }))
    case 'SET_VP_CARDS':
      return mapPlayer(state, action.playerId, (p) => ({
        ...p,
        victoryPointCards: Math.max(0, Math.floor(action.value) || 0),
      }))
    case 'SET_LARGEST_ARMY':
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id === action.playerId) {
            return { ...p, hasLargestArmy: action.enabled }
          }
          if (action.enabled) return { ...p, hasLargestArmy: false }
          return p
        }),
      }
    case 'SET_LONGEST_ROAD':
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id === action.playerId) {
            return { ...p, hasLongestRoad: action.enabled }
          }
          if (action.enabled) return { ...p, hasLongestRoad: false }
          return p
        }),
      }
    case 'RESET_SCORES':
      return {
        ...state,
        players: state.players.map((p) => ({
          ...p,
          settlements: INITIAL_SETTLEMENTS,
          cities: 0,
          victoryPointCards: 0,
          hasLargestArmy: false,
          hasLongestRoad: false,
        })),
      }
    case 'NEW_GAME': {
      clearGame()
      return { phase: 'setup', players: [], activePlayerId: null }
    }
    case 'BEGIN_EDIT_PLAYERS':
      return { ...state, phase: 'editPlayers' }
    case 'CANCEL_EDIT_PLAYERS':
      return { ...state, phase: 'scoring' }
    case 'SAVE_PLAYERS': {
      if (validateDrafts(action.players)) return state
      const byId = new Map(state.players.map((p) => [p.id, p]))
      let players = action.players.map((d) => createPlayer(d, byId.get(d.id)))
      let foundArmy = false
      let foundRoad = false
      players = players.map((p) => {
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
      let activePlayerId = state.activePlayerId
      if (!players.some((p) => p.id === activePlayerId)) {
        activePlayerId = players[0]?.id ?? null
      }
      return { phase: 'scoring', players, activePlayerId }
    }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  phase: AppPhase
  startGame: (players: SetupDraftPlayer[]) => string | null
  setActivePlayer: (playerId: string) => void
  adjustSettlement: (playerId: string, delta: number) => void
  setSettlement: (playerId: string, value: number) => void
  upgradeCity: (playerId: string) => void
  downgradeCity: (playerId: string) => void
  adjustVpCards: (playerId: string, delta: number) => void
  setVpCards: (playerId: string, value: number) => void
  setLargestArmy: (playerId: string, enabled: boolean) => void
  setLongestRoad: (playerId: string, enabled: boolean) => void
  resetScores: () => void
  newGame: () => void
  beginEditPlayers: () => void
  savePlayers: (players: SetupDraftPlayer[]) => string | null
  cancelEditPlayers: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    saveGame(state)
  }, [state])

  const startGame = useCallback((players: SetupDraftPlayer[]) => {
    const err = validateDrafts(players)
    if (err) return err
    dispatch({ type: 'START_GAME', players })
    return null
  }, [])

  const savePlayers = useCallback((players: SetupDraftPlayer[]) => {
    const err = validateDrafts(players)
    if (err) return err
    dispatch({ type: 'SAVE_PLAYERS', players })
    return null
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      phase: state.phase,
      startGame,
      setActivePlayer: (playerId) =>
        dispatch({ type: 'SET_ACTIVE_PLAYER', playerId }),
      adjustSettlement: (playerId, delta) =>
        dispatch({ type: 'ADJUST_SETTLEMENT', playerId, delta }),
      setSettlement: (playerId, value) =>
        dispatch({ type: 'SET_SETTLEMENT', playerId, value }),
      upgradeCity: (playerId) =>
        dispatch({ type: 'UPGRADE_CITY', playerId }),
      downgradeCity: (playerId) =>
        dispatch({ type: 'DOWNGRADE_CITY', playerId }),
      adjustVpCards: (playerId, delta) =>
        dispatch({ type: 'ADJUST_VP_CARDS', playerId, delta }),
      setVpCards: (playerId, value) =>
        dispatch({ type: 'SET_VP_CARDS', playerId, value }),
      setLargestArmy: (playerId, enabled) =>
        dispatch({ type: 'SET_LARGEST_ARMY', playerId, enabled }),
      setLongestRoad: (playerId, enabled) =>
        dispatch({ type: 'SET_LONGEST_ROAD', playerId, enabled }),
      resetScores: () => dispatch({ type: 'RESET_SCORES' }),
      newGame: () => dispatch({ type: 'NEW_GAME' }),
      beginEditPlayers: () => dispatch({ type: 'BEGIN_EDIT_PLAYERS' }),
      savePlayers,
      cancelEditPlayers: () => dispatch({ type: 'CANCEL_EDIT_PLAYERS' }),
    }),
    [state, startGame, savePlayers],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within Catan GameProvider')
  return ctx
}
