import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './shell/HomePage'
import { GamePage } from './shell/GamePage'
import { NotFoundPage } from './shell/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:gameId" element={<GamePage />} />
        <Route path="/games" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
