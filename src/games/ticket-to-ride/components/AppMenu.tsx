import { useEffect, useRef, useState } from 'react'

interface AppMenuProps {
  onNewGame: () => void
  onResetScores: () => void
  onEditPlayers: () => void
}

export function AppMenu({
  onNewGame,
  onResetScores,
  onEditPlayers,
}: AppMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <div className="app-menu" ref={ref}>
      <button
        type="button"
        className="menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Menu
      </button>
      {open ? (
        <ul className="menu-dropdown" role="menu">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                if (
                  window.confirm(
                    'Start a new game? Current scores and players will be cleared.',
                  )
                ) {
                  run(onNewGame)
                }
              }}
            >
              New Game
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all scores to zero? Player names and colors are kept.',
                  )
                ) {
                  run(onResetScores)
                }
              }}
            >
              Reset Scores
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onEditPlayers)}
            >
              Edit Players
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
