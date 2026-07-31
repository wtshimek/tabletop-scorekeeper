import type { PlayerColor } from '../types'

export interface ColorTheme {
  label: string
  /** Primary accent (headers, buttons, active states) */
  accent: string
  /** Darker shade for pressed/hover */
  accentDark: string
  /** Soft background tint */
  soft: string
  /** Text on accent (white or near-black) */
  onAccent: string
  /** Border / ring */
  border: string
}

export const COLOR_THEMES: Record<PlayerColor, ColorTheme> = {
  red: {
    label: 'Red',
    accent: '#c62828',
    accentDark: '#8e0000',
    soft: '#ffebee',
    onAccent: '#ffffff',
    border: '#ef9a9a',
  },
  green: {
    label: 'Green',
    accent: '#2e7d32',
    accentDark: '#1b5e20',
    soft: '#e8f5e9',
    onAccent: '#ffffff',
    border: '#a5d6a7',
  },
  blue: {
    label: 'Blue',
    accent: '#1565c0',
    accentDark: '#0d47a1',
    soft: '#e3f2fd',
    onAccent: '#ffffff',
    border: '#90caf9',
  },
  yellow: {
    label: 'Yellow',
    accent: '#f9a825',
    accentDark: '#c17900',
    soft: '#fffde7',
    onAccent: '#1a1a1a',
    border: '#fff59d',
  },
  black: {
    label: 'Black',
    accent: '#212121',
    accentDark: '#000000',
    soft: '#f5f5f5',
    onAccent: '#ffffff',
    border: '#9e9e9e',
  },
}

export function applyPlayerTheme(color: PlayerColor | null): void {
  const root = document.documentElement
  if (!color) {
    root.style.setProperty('--player-accent', '#8b4513')
    root.style.setProperty('--player-accent-dark', '#5d2e0c')
    root.style.setProperty('--player-soft', '#f5efe6')
    root.style.setProperty('--player-on-accent', '#ffffff')
    root.style.setProperty('--player-border', '#d4a574')
    return
  }
  const t = COLOR_THEMES[color]
  root.style.setProperty('--player-accent', t.accent)
  root.style.setProperty('--player-accent-dark', t.accentDark)
  root.style.setProperty('--player-soft', t.soft)
  root.style.setProperty('--player-on-accent', t.onAccent)
  root.style.setProperty('--player-border', t.border)
}
