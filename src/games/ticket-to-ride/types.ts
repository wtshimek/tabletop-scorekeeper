export type PlayerColor = 'red' | 'green' | 'blue' | 'yellow' | 'black'
export type AppPhase = 'setup' | 'scoring' | 'editPlayers'
export type TrainLength = 1 | 2 | 3 | 4 | 5 | 6

export interface TrainCounts {
  1: number
  2: number
  3: number
  4: number
  5: number
  6: number
}

export type TicketKind = 'completed' | 'incomplete'

export interface Player {
  id: string
  name: string
  color: PlayerColor
  trains: TrainCounts
  /** Individual destination ticket point values (sum adds to score). */
  completedTickets: number[]
  /** Individual unfinished ticket point values (sum subtracts from score). */
  incompleteTickets: number[]
  hasLongestRoute: boolean
}

export interface GameState {
  phase: AppPhase
  players: Player[]
  activePlayerId: string | null
}

export const PLAYER_COLORS: PlayerColor[] = [
  'red',
  'green',
  'blue',
  'yellow',
  'black',
]

export const TRAIN_LENGTHS: TrainLength[] = [1, 2, 3, 4, 5, 6]

export const MAX_PLAYERS = 5
export const MIN_PLAYERS = 2
