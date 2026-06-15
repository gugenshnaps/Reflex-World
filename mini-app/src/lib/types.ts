export type CountryCode = string

export interface TelegramUser {
  id: number
  first_name: string
  username?: string
  language_code?: string
}

export interface Player {
  id: string
  telegram_id: number
  name: string
  country_code: CountryCode
  subscribed_at: string | null
  is_active: boolean
  tier: 'free' | 'competitor'
}

export interface DailyResult {
  id: string
  player_id: string
  date: string
  attempts: number[]
  best_median: number
  created_at: string
}

export interface CountryRanking {
  country_code: CountryCode
  country_name: string
  month: string
  avg_reaction: number
  player_count: number
  rank: number
}

export interface PlayerLeaderboardEntry {
  player_id: string
  name: string
  country_code: CountryCode
  best_day_result: number
  rank: number
  is_me?: boolean
}

export interface PrizePool {
  month: string
  total_usd: number
  winning_country: CountryCode | null
  status: 'active' | 'distributed'
  days_remaining: number
}

export interface PastWinner {
  month: string
  country_code: CountryCode
  country_name: string
  total_usd: number
}

export type GamePhase = 'idle' | 'waiting' | 'ready' | 'too_early' | 'result' | 'done'

export interface AttemptResult {
  ms: number | null
  valid: boolean
  reason?: 'too_fast' | 'timeout' | 'too_early'
}
