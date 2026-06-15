import { useCallback, useEffect, useState } from 'react'
import { enrichCountryRanking, getCurrentMonth } from '../lib/countries'
import { supabase } from '../lib/supabase'
import type { CountryRanking } from '../lib/types'

export function useCountryRankings() {
  const [rankings, setRankings] = useState<CountryRanking[]>([])
  const [loading, setLoading] = useState(true)
  const month = getCurrentMonth()

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('countries_ranking')
      .select('country_code, month, avg_reaction, player_count, rank')
      .eq('month', month)
      .order('rank', { ascending: true })
    if (!error && data) {
      setRankings(data.map((r) => enrichCountryRanking({ ...r, rank: r.rank ?? 0 })))
    }
    setLoading(false)
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  return { rankings, loading, refresh: load, month }
}
