import type { GameModule } from '../types'
import { TicketToRideApp } from './TicketToRideApp'
import { ticketToRideManifest } from './manifest'
import {
  clearGame,
  hasInProgressSession,
} from './utils/storage'

export const ticketToRide: GameModule = {
  manifest: ticketToRideManifest,
  App: TicketToRideApp,
  clearSession: clearGame,
  hasSession: hasInProgressSession,
}

export { ticketToRideManifest }
