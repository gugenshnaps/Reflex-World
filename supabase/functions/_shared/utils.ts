import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-telegram-init-data, x-dev-key',
}

export const MIN_VALID_MS = 100
export const MAX_VALID_MS = 800
export const SUSPICIOUS_VARIANCE_MS = 10
export const MAX_FLAGGED_SESSIONS = 3

export const ALLOWED_COUNTRIES = new Set([
  'US', 'RU', 'DE', 'JP', 'BR', 'GB', 'FR', 'KR', 'IN', 'AU',
  'CA', 'IT', 'ES', 'NL', 'SE', 'PL', 'UA', 'TR', 'MX', 'AR',
])

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}

async function hmacSha256(key: Uint8Array, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
  return new Uint8Array(sig)
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<{ id: number; first_name?: string; username?: string } | null> {
  if (!initData || !botToken) return null

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const secretKey = await hmacSha256(new TextEncoder().encode(botToken), 'WebAppData')
  const calculated = await hmacSha256(secretKey, dataCheckString)

  if (toHex(calculated) !== hash) return null

  const authDate = Number(params.get('auth_date') ?? 0)
  if (Date.now() / 1000 - authDate > 86400) return null

  const userRaw = params.get('user')
  if (!userRaw) return null

  try {
    return JSON.parse(userRaw)
  } catch {
    return null
  }
}

export async function resolveTelegramUser(
  req: Request,
  body: { telegram_id?: number },
): Promise<{ id: number; first_name?: string; username?: string } | null> {
  const initData = req.headers.get('x-telegram-init-data') ?? ''
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''

  const fromInit = await validateTelegramInitData(initData, botToken)
  if (fromInit) return fromInit

  // Dev bypass ONLY when explicitly enabled (never in production)
  if (Deno.env.get('ALLOW_DEV') !== 'true') return null

  const devKey = req.headers.get('x-dev-key')
  const expectedDevKey = Deno.env.get('DEV_API_KEY')
  if (expectedDevKey && devKey === expectedDevKey && body.telegram_id) {
    return { id: body.telegram_id, first_name: 'Dev', username: 'dev_user' }
  }

  return null
}

export function createServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(url, key)
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export function sanitizeAttempts(raw: number[]): {
  attempts: number[]
  bestMedian: number
  flagged: boolean
} {
  const attempts = raw.map((ms) => {
    if (ms < MIN_VALID_MS || ms > MAX_VALID_MS) return 0
    return Math.round(ms)
  })

  const valid = attempts.filter((ms) => ms >= MIN_VALID_MS && ms <= MAX_VALID_MS)
  const bestMedian = valid.length > 0 ? median(valid) : 0

  let flagged = false
  if (valid.length === 5) {
    const min = Math.min(...valid)
    const max = Math.max(...valid)
    if (max - min <= SUSPICIOUS_VARIANCE_MS) flagged = true
  }

  return { attempts, bestMedian, flagged }
}

export function currentMonth(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isValidCountry(code: string): boolean {
  return code.length === 2 && ALLOWED_COUNTRIES.has(code.toUpperCase())
}

export function isEligibleForRanking(
  tier: string,
  isActive: boolean,
  flaggedSessions: number,
  sessionFlagged: boolean,
): boolean {
  return (
    tier === 'competitor' &&
    isActive !== false &&
    flaggedSessions <= MAX_FLAGGED_SESSIONS &&
    !sessionFlagged
  )
}
