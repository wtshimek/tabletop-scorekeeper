import { Link, useParams } from 'react-router-dom'
import { getGame } from '../games/registry'
import { NotFoundPage } from './NotFoundPage'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const game = gameId ? getGame(gameId) : undefined

  if (!game) {
    return <NotFoundPage />
  }

  const GameApp = game.App

  return (
    <div className="game-route">
      <nav className="game-back-bar" aria-label="Library">
        <Link to="/" className="game-back-link">
          ← All games
        </Link>
        <span className="game-back-title">{game.manifest.title}</span>
      </nav>
      <GameApp />
    </div>
  )
}
