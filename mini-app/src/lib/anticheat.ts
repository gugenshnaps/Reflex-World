import type { AttemptResult } from './types'

export const MIN_VALID_MS = 100
export const MAX_VALID_MS = 800
export const SUSPICIOUS_VARIANCE_MS = 10
export const MAX_FLAGGED_SESSIONS = 3

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export function validateAttempt(ms: number, tooEarly: boolean): AttemptResult {
  if (tooEarly) {
    return { ms: null, valid: false, reason: 'too_early' }
  }
  if (ms < MIN_VALID_MS) {
    return { ms: null, valid: false, reason: 'too_fast' }
  }
  if (ms > MAX_VALID_MS) {
    return { ms: null, valid: false, reason: 'timeout' }
  }
  return { ms, valid: true }
}

export function checkSuspiciousVariance(attempts: number[]): boolean {
  const valid = attempts.filter((a) => a >= MIN_VALID_MS && a <= MAX_VALID_MS)
  if (valid.length < 5) return false
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  return max - min <= SUSPICIOUS_VARIANCE_MS
}

export function randomDelay(): number {
  return 1500 + Math.random() * 4000
}

export function formatMs(ms: number): string {
  return `${ms} ms`
}

export function reactionColor(ms: number): string {
  if (ms <= 200) return '#10B981'
  if (ms <= 300) return '#06B6D4'
  if (ms <= 400) return '#F97316'
  return '#EF4444'
}

export function countryColorFromAvg(avgMs: number, minAvg: number, maxAvg: number): string {
  const t = Math.min(1, Math.max(0, (avgMs - minAvg) / (maxAvg - minAvg || 1)))
  const r = Math.round(16 + t * (239 - 16))
  const g = Math.round(185 - t * (185 - 68))
  const b = Math.round(129 - t * (129 - 68))
  return `rgb(${r}, ${g}, ${b})`
}
