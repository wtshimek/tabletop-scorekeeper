import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="app-shell home-page">
      <header className="home-hero">
        <h1 className="home-title">Not found</h1>
        <p className="home-subtitle">
          That game isn&apos;t in the library yet.
        </p>
        <Link to="/" className="btn-primary" style={{ marginTop: 16 }}>
          Back to games
        </Link>
      </header>
    </main>
  )
}
