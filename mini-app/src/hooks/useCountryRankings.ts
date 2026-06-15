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
      setLoading(false)
      setError('Supabase не настроен')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: dbError } = await supabase
      .from('countries_ranking')
      .select('country_code, month, avg_reaction, player_count, rank')
      .eq('month', month)
      .order('rank', { ascending: true, nullsFirst: false })

    if (dbError) {
      setError(dbError.message)
    } else if (data) {
      setRankings(
        data
          .filter((r) => r.rank != null)
          .map((r) => enrichCountryRanking({ ...r, rank: r.rank as number })),
      )
    }
    setLoading(false)
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  return { rankings, loading, error, refresh: load, month }
}
