import { useCallback, useEffect, useState } from 'react'
import { getCountryName, getCurrentMonth } from '../lib/countries'
import { supabase } from '../lib/supabase'
import type { PastWinner, PlayerLeaderboardEntry } from '../lib/types'

export function usePlayerLeaderboard(myPlayerId?: string) {
  const [entries, setEntries] = useState<PlayerLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const month = getCurrentMonth()

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      setError('Supabase не настроен')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: dbError } = await supabase
      .from('monthly_leaderboard')
      .select('player_id, country_code, best_day_result, rank, players(name)')
      .eq('month', month)
      .not('rank', 'is', null)
      .order('rank', { ascending: true })
      .limit(100)

    if (dbError) {
      setError(dbError.message)
    } else if (data) {
      setEntries(
        data.map((row) => {
          const playersRaw = row.players as { name: string } | { name: string }[] | null
          const playerName = Array.isArray(playersRaw) ? playersRaw[0]?.name : playersRaw?.name
          return {
            player_id: row.player_id,
            name: playerName ?? 'Игрок',
            country_code: row.country_code.trim(),
            best_day_result: row.best_day_result,
            rank: row.rank as number,
            is_me: row.player_id === myPlayerId,
          }
        }),
      )
    }
    setLoading(false)
  }, [month, myPlayerId])

  useEffect(() => {
    load()
  }, [load])

  return { entries, loading, error, refresh: load, month }
}

export function usePastWinners() {
  const [winners, setWinners] = useState<PastWinner[]>([])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('prize_pool')
      .select('month, total_usd, winning_country')
      .eq('status', 'distributed')
      .order('month', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) {
          setWinners(
            data
              .filter((w) => w.winning_country)
              .map((w) => ({
                month: w.month,
                country_code: w.winning_country!.trim(),
                country_name: getCountryName(w.winning_country!.trim()),
                total_usd: Number(w.total_usd),
              })),
          )
        }
      })
  }, [])

  return winners
}
