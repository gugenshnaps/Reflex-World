import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiGetMe, apiRegisterPlayer, apiSaveDailyResult, type MeResponse } from '../lib/api'
import { getTelegramUser } from '../lib/telegram'

type PlayerState = {
  loading: boolean
  needsRegistration: boolean
  player: MeResponse['player'] | null
  dailyHistory: MeResponse['daily_history']
  todayResult: MeResponse['today_result']
  monthlyEntry: MeResponse['monthly_entry']
  prizePool: MeResponse['prize_pool']
  telegramUsername: string | null
  error: string | null
  register: (name: string, countryCode: string) => Promise<void>
  refresh: () => Promise<void>
  saveSession: (attempts: number[]) => Promise<void>
}

const PlayerContext = createContext<PlayerState | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [player, setPlayer] = useState<MeResponse['player'] | null>(null)
  const [dailyHistory, setDailyHistory] = useState<MeResponse['daily_history']>([])
  const [todayResult, setTodayResult] = useState<MeResponse['today_result']>(null)
  const [monthlyEntry, setMonthlyEntry] = useState<MeResponse['monthly_entry']>(null)
  const [prizePool, setPrizePool] = useState<MeResponse['prize_pool']>(null)
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const applyMe = (data: MeResponse) => {
    setPlayer(data.player)
    setDailyHistory(data.daily_history)
    setTodayResult(data.today_result)
    setMonthlyEntry(data.monthly_entry)
    setPrizePool(data.prize_pool)
    setTelegramUsername(data.telegram_username)
    setNeedsRegistration(false)
  }

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const data = await apiGetMe()
      applyMe(data)
    } catch (e) {
      const err = e as Error & { status?: number }
      if (err.status === 404) {
        setNeedsRegistration(true)
        setPlayer(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const register = useCallback(async (name: string, countryCode: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiRegisterPlayer(name, countryCode)
      await refresh()
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }, [refresh])

  const saveSession = useCallback(async (attempts: number[]) => {
    await apiSaveDailyResult(attempts)
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      loading,
      needsRegistration,
      player,
      dailyHistory,
      todayResult,
      monthlyEntry,
      prizePool,
      telegramUsername,
      error,
      register,
      refresh,
      saveSession,
    }),
    [
      loading,
      needsRegistration,
      player,
      dailyHistory,
      todayResult,
      monthlyEntry,
      prizePool,
      telegramUsername,
      error,
      register,
      refresh,
      saveSession,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

export function useDefaultPlayerName(): string {
  const tg = getTelegramUser()
  return tg.first_name
}
