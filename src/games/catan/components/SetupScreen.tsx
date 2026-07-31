import { useMemo, useState } from 'react'
import type { Player, PlayerColor } from '../types'
import { MAX_PLAYERS, MIN_PLAYERS } from '../types'
import type { SetupDraftPlayer } from '../context/GameContext'
import { createId } from '../../../shared/lib/id'
import { ColorSwatchPicker } from './ColorSwatchPicker'

function newDraft(
  color: PlayerColor | null = null,
  name = '',
): SetupDraftPlayer {
  return { id: createId(), name, color }
}

function fromPlayers(players: Player[]): SetupDraftPlayer[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
  }))
}

interface SetupScreenProps {
  mode: 'setup' | 'edit'
  existingPlayers?: Player[]
  onStart: (players: SetupDraftPlayer[]) => string | null
  onSave?: (players: SetupDraftPlayer[]) => string | null
  onCancel?: () => void
}

export function SetupScreen({
  mode,
  existingPlayers = [],
  onStart,
  onSave,
  onCancel,
}: SetupScreenProps) {
  const [players, setPlayers] = useState<SetupDraftPlayer[]>(() => {
    if (mode === 'edit' && existingPlayers.length >= MIN_PLAYERS) {
      return fromPlayers(existingPlayers)
    }
    return [newDraft(), newDraft()]
  })
  const [error, setError] = useState<string | null>(null)

  const takenByIndex = useMemo(() => {
    return players.map((_, i) => {
      const set = new Set<PlayerColor>()
      players.forEach((other, j) => {
        if (j !== i && other.color) set.add(other.color)
      })
      return set
    })
  }, [players])

  const update = (id: string, patch: Partial<SetupDraftPlayer>) => {
    setError(null)
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  }

  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    setPlayers((prev) => [...prev, newDraft()])
  }

  const removePlayer = (id: string) => {
    if (players.length <= MIN_PLAYERS) return
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  const submit = () => {
    const result =
      mode === 'edit' && onSave ? onSave(players) : onStart(players)
    if (result) setError(result)
  }

  return (
    <div className="setup-screen">
      <header className="setup-hero">
        <div className="rail-icon" aria-hidden>
          🏝️
        </div>
        <h1 className="setup-title">
          {mode === 'edit' ? 'Edit Players' : 'Catan'}
        </h1>
        <p className="setup-subtitle">
          {mode === 'edit'
            ? 'Update names and colors. Scores are kept for existing players.'
            : 'Add 2–4 players, pick unique colors, then start scoring.'}
        </p>
      </header>

      <div className="setup-form">
        {players.map((p, i) => (
          <div key={p.id} className="setup-row">
            <div className="setup-row-top">
              <label className="setup-name-label" htmlFor={`name-${p.id}`}>
                Player {i + 1}
              </label>
              {players.length > MIN_PLAYERS ? (
                <button
                  type="button"
                  className="btn-text danger"
                  onClick={() => removePlayer(p.id)}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input
              id={`name-${p.id}`}
              className="setup-name-input"
              type="text"
              placeholder="Name"
              maxLength={24}
              value={p.name}
              autoComplete="off"
              onChange={(e) => update(p.id, { name: e.target.value })}
            />
            <ColorSwatchPicker
              value={p.color}
              taken={takenByIndex[i]}
              onChange={(color) => update(p.id, { color })}
              id={`color-${p.id}`}
            />
          </div>
        ))}

        {players.length < MAX_PLAYERS ? (
          <button type="button" className="btn-secondary" onClick={addPlayer}>
            + Add player
          </button>
        ) : null}

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="setup-actions">
          {mode === 'edit' && onCancel ? (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button type="button" className="btn-primary" onClick={submit}>
            {mode === 'edit' ? 'Save players' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  )
}
