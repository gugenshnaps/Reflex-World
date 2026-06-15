import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTelegramWebApp } from './lib/telegram'
import App from './App'
import './index.css'

initTelegramWebApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
