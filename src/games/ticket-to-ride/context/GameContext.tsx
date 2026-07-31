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
  TicketKind,
  TrainLength,
} from '../types'
import { MAX_PLAYERS, MIN_PLAYERS } from '../types'
import { emptyTrains } from '../utils/scoring'
import { clearGame, loadGame, saveGame } from '../utils/storage'

export interface SetupDraftPlayer {
  id: string
  name: string
  color: PlayerColor | null
}

function ticketField(kind: TicketKind): 'completedTickets' | 'incompleteTickets' {
  return kind === 'completed' ? 'completedTickets' : 'incompleteTickets'
}

type Action =
  | { type: 'START_GAME'; players: SetupDraftPlayer[] }
  | { type: 'SET_ACTIVE_PLAYER'; playerId: string }
  | { type: 'ADJUST_TRAIN'; playerId: string; length: TrainLength; delta: number }
  | {
      type: 'SET_TRAIN'
      playerId: string
      length: TrainLength
      value: number
    }
  | {
      type: 'ADD_TICKET'
      playerId: string
      kind: TicketKind
      value: number
    }
  | {
      type: 'REMOVE_TICKET'
      playerId: string
      kind: TicketKind
      index: number
    }
  | { type: 'SET_LONGEST_ROUTE'; playerId: string; enabled: boolean }
  | { type: 'RESET_SCORES' }
  | { type: 'NEW_GAME' }
  | { type: 'BEGIN_EDIT_PLAYERS' }
  | { type: 'SAVE_PLAYERS'; players: SetupDraftPlayer[] }
  | { type: 'CANCEL_EDIT_PLAYERS' }

function createPlayer(
  draft: SetupDraftPlayer,
  existing?: Player,
): Player {
  return {
    id: draft.id,
    name: draft.name.trim(),
    color: draft.color as PlayerColor,
    trains: existing?.trains ?? emptyTrains(),
    completedTickets: existing?.completedTickets ?? [],
    incompleteTickets: existing?.incompleteTickets ?? [],
    hasLongestRoute: existing?.hasLongestRoute ?? false,
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

function clampNonNeg(n: number): number {
  return Math.max(0, Math.floor(n) || 0)
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const err = validateDrafts(action.players)
      if (err) return state
      const players = action.players.map((d) => createPlayer(d))
      return {
        phase: 'scoring',
        players,
        activePlayerId: players[0]?.id ?? null,
      }
    }
    case 'SET_ACTIVE_PLAYER':
      return { ...state, activePlayerId: action.playerId }
    case 'ADJUST_TRAIN': {
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.playerId) return p
          const next = clampNonNeg(p.trains[action.length] + action.delta)
          return {
            ...p,
            trains: { ...p.trains, [action.length]: next },
          }
        }),
      }
    }
    case 'SET_TRAIN': {
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.playerId) return p
          return {
            ...p,
            trains: {
              ...p.trains,
              [action.length]: clampNonNeg(action.value),
            },
          }
        }),
      }
    }
    case 'ADD_TICKET': {
      const value = clampNonNeg(action.value)
      if (value < 1) return state
      const field = ticketField(action.kind)
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.playerId) return p
          return {
            ...p,
            [field]: [...p[field], value],
          }
        }),
      }
    }
    case 'REMOVE_TICKET': {
      const field = ticketField(action.kind)
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.playerId) return p
          if (action.index < 0 || action.index >= p[field].length) return p
          return {
            ...p,
            [field]: p[field].filter((_, i) => i !== action.index),
          }
        }),
      }
    }
    case 'SET_LONGEST_ROUTE': {
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id === action.playerId) {
            return { ...p, hasLongestRoute: action.enabled }
          }
          if (action.enabled) {
            return { ...p, hasLongestRoute: false }
          }
          return p
        }),
      }
    }
    case 'RESET_SCORES': {
      return {
        ...state,
        players: state.players.map((p) => ({
          ...p,
          trains: emptyTrains(),
          completedTickets: [],
          incompleteTickets: [],
          hasLongestRoute: false,
        })),
      }
    }
    case 'NEW_GAME': {
      clearGame()
      return {
        phase: 'setup',
        players: [],
        activePlayerId: null,
      }
    }
    case 'BEGIN_EDIT_PLAYERS':
      return { ...state, phase: 'editPlayers' }
    case 'CANCEL_EDIT_PLAYERS':
      return { ...state, phase: 'scoring' }
    case 'SAVE_PLAYERS': {
      const err = validateDrafts(action.players)
      if (err) return state
      const byId = new Map(state.players.map((p) => [p.id, p]))
      const players = action.players.map((d) =>
        createPlayer(d, byId.get(d.id)),
      )
      let found = false
      const fixed = players.map((p) => {
        if (p.hasLongestRoute) {
          if (found) return { ...p, hasLongestRoute: false }
          found = true
        }
        return p
      })
      let activePlayerId = state.activePlayerId
      if (!fixed.some((p) => p.id === activePlayerId)) {
        activePlayerId = fixed[0]?.id ?? null
      }
      return {
        phase: 'scoring',
        players: fixed,
        activePlayerId,
      }
    }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  startGame: (players: SetupDraftPlayer[]) => string | null
  setActivePlayer: (playerId: string) => void
  adjustTrain: (playerId: string, length: TrainLength, delta: number) => void
  setTrain: (playerId: string, length: TrainLength, value: number) => void
  addTicket: (playerId: string, kind: TicketKind, value: number) => void
  removeTicket: (playerId: string, kind: TicketKind, index: number) => void
  setLongestRoute: (playerId: string, enabled: boolean) => void
  resetScores: () => void
  newGame: () => void
  beginEditPlayers: () => void
  savePlayers: (players: SetupDraftPlayer[]) => string | null
  cancelEditPlayers: () => void
  phase: AppPhase
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
      adjustTrain: (playerId, length, delta) =>
        dispatch({ type: 'ADJUST_TRAIN', playerId, length, delta }),
      setTrain: (playerId, length, value) =>
        dispatch({ type: 'SET_TRAIN', playerId, length, value }),
      addTicket: (playerId, kind, value) =>
        dispatch({ type: 'ADD_TICKET', playerId, kind, value }),
      removeTicket: (playerId, kind, index) =>
        dispatch({ type: 'REMOVE_TICKET', playerId, kind, index }),
      setLongestRoute: (playerId, enabled) =>
        dispatch({ type: 'SET_LONGEST_ROUTE', playerId, enabled }),
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
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
