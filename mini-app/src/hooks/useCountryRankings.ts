import { useCallback, useEffect, useState } from 'react'
import { enrichCountryRanking, getCurrentMonth } from '../lib/countries'
import { supabase } from '../lib/supabase'
import type { CountryRanking } from '../lib/types'

export function useCountryRankings() {
  const [rankings, setRankings] = useState<CountryRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const month = getCurrentMonth()

  const load = useCallback(async () => {
    if (!supabase) {
      setRankings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabase
        .from('countries_ranking')
        .select('country_code, month, avg_reaction, player_count, rank')
        .eq('month', month)

      if (dbError) {
        console.warn('countries_ranking:', dbError.message)
        setRankings([])
      } else {
        const sorted = (data ?? [])
          .filter((r) => r.rank != null)
          .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
          .map((r) => enrichCountryRanking({ ...r, rank: r.rank as number }))
        setRankings(sorted)
      }
    } catch (e) {
      // Telegram WebView sometimes throws opaque TypeError on fetch — map still works
      console.warn('countries_ranking fetch failed', e)
      setRankings([])
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  return { rankings, loading, error, refresh: load, month }
}
