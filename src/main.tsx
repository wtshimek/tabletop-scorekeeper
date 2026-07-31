import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register SW after paint so a PWA failure never blanks the app
void import('virtual:pwa-register')
  .then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
  .catch(() => {
    // SW optional in some environments
  })
