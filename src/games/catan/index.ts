import type { GameModule } from '../types'
import { CatanApp } from './CatanApp'
import { catanManifest } from './manifest'
import { clearGame, hasInProgressSession } from './utils/storage'

export const catan: GameModule = {
  manifest: catanManifest,
  App: CatanApp,
  clearSession: clearGame,
  hasSession: hasInProgressSession,
}

export { catanManifest }
