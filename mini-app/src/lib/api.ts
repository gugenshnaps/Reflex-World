import { getTelegramUser } from './telegram'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function assertConfigured() {
  if (!url || !anonKey) {
    throw new Error('Supabase not configured — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }
}

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

function authHeaders(): Record<string, string> {
  assertConfigured()
  const initData = getInitData()
  const devKey = import.meta.env.VITE_DEV_API_KEY
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: anonKey!,
    Authorization: `Bearer ${anonKey}`,
  }
  if (initData) {
    headers['x-telegram-init-data'] = initData
  } else if (devKey) {
    headers['x-dev-key'] = devKey
  }
  return headers
}

function telegramBody(extra: Record<string, unknown> = {}): Record<string, unknown> {
  const initData = getInitData()
  if (initData) return extra
  return { telegram_id: getTelegramUser().id, ...extra }
}

async function callFunction<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  assertConfigured()
  const res = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(telegramBody(body)),
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error ?? `Function ${name} failed`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return data as T
}

export type MeResponse = {
  player: {
    id: string
    telegram_id: number
    name: string
    country_code: string
    subscribed_at: string | null
    is_active: boolean
    tier: 'free' | 'competitor'
    flagged_sessions: number
  }
  daily_history: Array<{
    id: string
    date: string
    attempts: number[]
    best_median: number
    is_flagged: boolean
  }>
  today_result: {
    id: string
    date: string
    attempts: number[]
    best_median: number
  } | null
  monthly_entry: { best_day_result: number; rank: number | null } | null
  prize_pool: { total_usd: number; status: string } | null
  telegram_username: string | null
}

export type SaveResultResponse = {
  daily_result: { best_median: number }
  best_median: number
  monthly_best: number
  flagged: boolean
  counts_for_ranking: boolean
}

export async function apiGetMe(): Promise<MeResponse> {
  return callFunction<MeResponse>('get_me')
}

export async function apiRegisterPlayer(name: string, country_code: string) {
  return callFunction<{ player: MeResponse['player']; created: boolean }>('register_player', {
    name,
    country_code,
  })
}

export async function apiSaveDailyResult(attempts: number[]): Promise<SaveResultResponse> {
  return callFunction<SaveResultResponse>('save_daily_result', { attempts })
}
