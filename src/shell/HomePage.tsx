import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gamesAlphabetical } from '../games/registry'

/** Clear any in-game player accent when returning to the library. */
function resetShellTheme() {
  const root = document.documentElement
  root.style.setProperty('--player-accent', '#8b4513')
  root.style.setProperty('--player-accent-dark', '#5d2e0c')
  root.style.setProperty('--player-soft', '#f5efe6')
  root.style.setProperty('--player-on-accent', '#ffffff')
  root.style.setProperty('--player-border', '#d4a574')
}

export function HomePage() {
  useEffect(() => {
    resetShellTheme()
  }, [])

  return (
    <main className="app-shell home-page">
      <header className="home-hero">
        <div className="rail-icon" aria-hidden>
          🎲
        </div>
        <h1 className="home-title">Tabletop Scorekeeper</h1>
        <p className="home-subtitle">
          Pick a game to score. Sessions save on this device.
        </p>
      </header>

      <section className="game-library" aria-label="Games">
        <h2 className="library-heading">Games</h2>
        <ul className="game-grid">
          {gamesAlphabetical().map((game) => {
            const { manifest } = game
            const inProgress = game.hasSession?.() ?? false
            return (
              <li key={manifest.id}>
                <Link
                  to={`/games/${manifest.id}`}
                  className="game-card"
                  style={
                    manifest.themeHint
                      ? { ['--game-hint' as string]: manifest.themeHint }
                      : undefined
                  }
                >
                  <span className="game-card-accent" aria-hidden />
                  <span className="game-card-icon" aria-hidden>
                    {manifest.icon}
                  </span>
                  <span className="game-card-body">
                    <span className="game-card-title">{manifest.title}</span>
                    <span className="game-card-desc">
                      {manifest.shortDescription}
                    </span>
                    <span className="game-card-meta">
                      {manifest.minPlayers}–{manifest.maxPlayers} players
                      {inProgress ? (
                        <span className="game-card-badge">In progress</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="game-card-chevron" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
