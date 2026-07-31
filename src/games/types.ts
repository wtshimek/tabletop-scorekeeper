import type { ComponentType } from 'react'

export interface GameManifest {
  id: string
  title: string
  shortDescription: string
  minPlayers: number
  maxPlayers: number
  /** Emoji or short label for library card */
  icon: string
  /** Accent color for library card bar */
  themeHint?: string
  version: number
}

export interface GameModule {
  manifest: GameManifest
  App: ComponentType
  clearSession?: () => void
  hasSession?: () => boolean
}
