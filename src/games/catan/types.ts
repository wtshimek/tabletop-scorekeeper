export type PlayerColor = 'red' | 'white' | 'blue' | 'orange'
export type AppPhase = 'setup' | 'scoring' | 'editPlayers'

export interface Player {
  id: string
  name: string
  color: PlayerColor
  settlements: number
  cities: number
  victoryPointCards: number
  hasLargestArmy: boolean
  hasLongestRoad: boolean
}

export interface GameState {
  phase: AppPhase
  players: Player[]
  activePlayerId: string | null
}

export const PLAYER_COLORS: PlayerColor[] = ['red', 'white', 'blue', 'orange']

export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 2

/** Physical base-set piece limits */
export const MAX_SETTLEMENTS = 5
export const MAX_CITIES = 4

export const VICTORY_TARGET = 10
export const BONUS_POINTS = 2
