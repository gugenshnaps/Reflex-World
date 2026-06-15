import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null

export type DbPlayer = {
  id: string
  telegram_id: number
  name: string
  country_code: string
  subscribed_at: string | null
  is_active: boolean
  tier: 'free' | 'competitor'
}

export type DbCountryRanking = {
  country_code: string
  month: string
  avg_reaction: number
  player_count: number
  rank: number | null
}

export type DbPrizePool = {
  month: string
  total_usd: number
  winning_country: string | null
  status: 'active' | 'distributed'
}

export async function fetchCountryRankings(month: string): Promise<DbCountryRanking[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('countries_ranking')
    .select('country_code, month, avg_reaction, player_count, rank')
    .eq('month', month)
    .order('rank', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchPrizePool(month: string): Promise<DbPrizePool | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('prize_pool')
    .select('month, total_usd, winning_country, status')
    .eq('month', month)
    .maybeSingle()
  if (error) throw error
  return data
}
