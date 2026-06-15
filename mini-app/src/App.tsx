import { PlayerProvider, usePlayer } from './context/PlayerContext'
import { RegistrationModal } from './components/RegistrationModal'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'
import { ProfilePage } from './pages/ProfilePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { PrizePoolPage } from './pages/PrizePoolPage'

function AppRoutes() {
  const { loading, needsRegistration } = usePlayer()

  if (loading) {
    return (
      <div className="app-shell items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="muted">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {needsRegistration && <RegistrationModal />}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/pool" element={<PrizePoolPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default function App() {
  return (
    <PlayerProvider>
      <AppRoutes />
    </PlayerProvider>
  )
}
