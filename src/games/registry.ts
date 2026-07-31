import type { GameModule } from './types'
import { catan } from './catan'
import { ticketToRide } from './ticket-to-ride'

/** Register new scorekeepers here. Library displays A–Z by title. */
export const GAMES: GameModule[] = [catan, ticketToRide]

export function getGame(id: string): GameModule | undefined {
  return GAMES.find((g) => g.manifest.id === id)
}

export function gamesAlphabetical(): GameModule[] {
  return [...GAMES].sort((a, b) =>
    a.manifest.title.localeCompare(b.manifest.title, undefined, {
      sensitivity: 'base',
    }),
  )
}
