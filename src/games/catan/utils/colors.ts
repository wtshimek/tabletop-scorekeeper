import type { PlayerColor } from '../types'

export interface ColorTheme {
  label: string
  accent: string
  accentDark: string
  soft: string
  onAccent: string
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
  white: {
    label: 'White',
    accent: '#f5f5f5',
    accentDark: '#616161',
    soft: '#fafafa',
    onAccent: '#212121',
    border: '#bdbdbd',
  },
  blue: {
    label: 'Blue',
    accent: '#1565c0',
    accentDark: '#0d47a1',
    soft: '#e3f2fd',
    onAccent: '#ffffff',
    border: '#90caf9',
  },
  orange: {
    label: 'Orange',
    accent: '#ef6c00',
    accentDark: '#e65100',
    soft: '#fff3e0',
    onAccent: '#ffffff',
    border: '#ffcc80',
  },
}

export function applyPlayerTheme(color: PlayerColor | null): void {
  const root = document.documentElement
  if (!color) {
    root.style.setProperty('--player-accent', '#c45c26')
    root.style.setProperty('--player-accent-dark', '#8d3e14')
    root.style.setProperty('--player-soft', '#fdf0e6')
    root.style.setProperty('--player-on-accent', '#ffffff')
    root.style.setProperty('--player-border', '#e0a882')
    return
  }
  const t = COLOR_THEMES[color]
  root.style.setProperty('--player-accent', t.accent)
  root.style.setProperty('--player-accent-dark', t.accentDark)
  root.style.setProperty('--player-soft', t.soft)
  root.style.setProperty('--player-on-accent', t.onAccent)
  root.style.setProperty('--player-border', t.border)
}
