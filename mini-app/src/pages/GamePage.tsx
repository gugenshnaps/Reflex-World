import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Loader2, X } from 'lucide-react'
import {
  checkSuspiciousVariance,
  formatMs,
  median,
  randomDelay,
  reactionColor,
  validateAttempt,
} from '../lib/anticheat'
import { getFlagEmoji } from '../lib/countries'
import type { AttemptResult, GamePhase } from '../lib/types'
import { cn } from '../lib/utils'
import { usePlayer } from '../context/PlayerContext'
import { useCountryRankings } from '../hooks/useCountryRankings'

const TOTAL_ATTEMPTS = 5

export function GamePage() {
  const { player, todayResult, saveSession, refresh } = usePlayer()
  const { rankings } = useCountryRankings()
  const country = rankings.find((c) => c.country_code === player?.country_code)

  const [phase, setPhase] = useState<GamePhase>('idle')
  const [attemptIndex, setAttemptIndex] = useState(0)
  const [attempts, setAttempts] = useState<AttemptResult[]>([])
  const [currentMs, setCurrentMs] = useState<number | null>(null)
  const [showSubscribe, setShowSubscribe] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const readyAtRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const alreadyPlayed = Boolean(todayResult)
  const validAttempts = attempts.filter((a) => a.valid && a.ms !== null).map((a) => a.ms!)
  const sessionBest = validAttempts.length > 0 ? Math.min(...validAttempts) : null
  const isSubscribed = player?.tier === 'competitor'

  const startAttempt = useCallback(() => {
    if (alreadyPlayed) return
    setPhase('waiting')
    setCurrentMs(null)
    const delay = randomDelay()
    timerRef.current = setTimeout(() => {
      readyAtRef.current = performance.now()
      setPhase('ready')
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    }, delay)
  }, [alreadyPlayed])

  const handleTap = useCallback(() => {
    if (phase === 'idle' || phase === 'done' || alreadyPlayed) return

    if (phase === 'waiting') {
      clearTimeout(timerRef.current)
      setPhase('too_early')
      setTimeout(() => setPhase('idle'), 1200)
      return
    }

    if (phase === 'ready') {
      const ms = Math.round(performance.now() - readyAtRef.current)
      const result = validateAttempt(ms, false)
      setCurrentMs(result.ms)
      setAttempts((prev) => [...prev, result])
      setPhase('result')

      setTimeout(() => {
        if (attemptIndex + 1 >= TOTAL_ATTEMPTS) {
          setPhase('done')
        } else {
          setAttemptIndex((i) => i + 1)
          setPhase('idle')
        }
      }, 1500)
    }
  }, [phase, attemptIndex, alreadyPlayed])

  const submitSession = async () => {
    const raw = attempts.map((a) => (a.valid && a.ms ? a.ms : 0))
    setSaving(true)
    setSaveError(null)
    try {
      await saveSession(raw)
      await refresh()
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const suspicious = checkSuspiciousVariance(validAttempts)
  const sessionMedian = validAttempts.length > 0 ? median(validAttempts) : null

  if (alreadyPlayed && todayResult) {
    return (
      <div className="space-y-4 p-4">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-accent2">Ежедневная сессия</p>
          <h1 className="mt-1 text-2xl font-bold">Сегодня сыграно ✓</h1>
        </header>
        <div className="card text-center">
          <p className="muted">Лучший результат сегодня</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: reactionColor(todayResult.best_median) }}>
            {todayResult.best_median} ms
          </p>
          <p className="muted mt-3">Новая сессия завтра в 00:00 UTC</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-4">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-accent2">Ежедневная сессия</p>
        <h1 className="mt-1 text-2xl font-bold">5 попыток</h1>
        {country && (
          <p className="muted mt-1 flex items-center gap-1">
            {getFlagEmoji(country.country_code)} {country.country_name} · #{country.rank}
          </p>
        )}
      </header>

      <div className="mb-4 flex justify-center gap-2">
        {Array.from({ length: TOTAL_ATTEMPTS }).map((_, i) => {
          const a = attempts[i]
          return (
            <div
              key={i}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold',
                i === attemptIndex && phase !== 'done'
                  ? 'border-accent bg-accent/20 text-accent'
                  : a?.valid
                    ? 'border-fast/50 bg-fast/10 text-fast'
                    : a && !a.valid
                      ? 'border-slow/50 bg-slow/10 text-slow'
                      : 'border-border text-white/30',
              )}
            >
              {a?.valid && a.ms ? a.ms : a && !a.valid ? '—' : i + 1}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onPointerDown={handleTap}
        disabled={phase === 'done' || phase === 'result' || phase === 'too_early'}
        className={cn(
          'relative flex flex-1 flex-col items-center justify-center rounded-card border-2 transition-all active:scale-[0.99]',
          phase === 'waiting' && 'border-orange bg-orange/10',
          phase === 'ready' && 'border-fast bg-fast/20 animate-pulse',
          phase === 'too_early' && 'border-slow bg-slow/10',
          phase === 'result' && 'border-accent bg-accent/10',
          phase === 'idle' && 'border-border bg-surface hover:border-accent/50',
          phase === 'done' && 'border-border bg-surface opacity-80',
        )}
      >
        {phase === 'idle' && attemptIndex === 0 && attempts.length === 0 && (
          <span className="text-lg font-semibold text-white/70">Нажми, чтобы начать</span>
        )}
        {phase === 'idle' && (attemptIndex > 0 || attempts.length > 0) && (
          <span className="text-lg font-semibold text-white/70">Попытка {attemptIndex + 1}</span>
        )}
        {phase === 'waiting' && <span className="text-xl font-bold text-orange">Жди зелёный...</span>}
        {phase === 'ready' && <span className="text-3xl font-bold text-fast">ЖМИ!</span>}
        {phase === 'too_early' && <span className="text-xl font-bold text-slow">Слишком рано!</span>}
        {phase === 'result' && currentMs !== null && (
          <span className="text-4xl font-bold" style={{ color: reactionColor(currentMs) }}>
            {formatMs(currentMs)}
          </span>
        )}
        {phase === 'done' && sessionBest !== null && (
          <div className="text-center">
            <p className="text-sm text-white/50">Лучший результат</p>
            <p className="text-4xl font-bold" style={{ color: reactionColor(sessionBest) }}>
              {formatMs(sessionBest)}
            </p>
            {sessionMedian !== null && (
              <p className="mt-2 text-sm text-white/40">Медиана: {sessionMedian} ms</p>
            )}
          </div>
        )}
      </button>

      {phase === 'idle' && attempts.length < TOTAL_ATTEMPTS && (
        <button type="button" onClick={startAttempt} className="btn-primary mt-4 w-full">
          {attempts.length === 0 ? 'Начать' : 'Следующая попытка'}
        </button>
      )}

      {phase === 'done' && (
        <div className="mt-4 space-y-3">
          {suspicious && (
            <div className="flex items-center gap-2 rounded-btn border border-orange/30 bg-orange/10 px-3 py-2 text-sm text-orange">
              <AlertTriangle size={16} />
              Подозрительно низкая дисперсия — сессия может быть помечена
            </div>
          )}
          {saveError && <p className="text-sm text-slow">{saveError}</p>}
          <button
            type="button"
            onClick={submitSession}
            disabled={saving || validAttempts.length === 0}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            {saving ? 'Сохранение...' : 'Сохранить результат'}
          </button>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="mt-4 card">
          <p className="muted mb-2">Результаты попыток</p>
          <div className="flex flex-wrap gap-2">
            {attempts.map((a, i) => (
              <span
                key={i}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                  a.valid ? 'bg-fast/15 text-fast' : 'bg-slow/15 text-slow',
                )}
              >
                {a.valid ? <Check size={12} /> : <X size={12} />}
                {a.valid && a.ms ? `${a.ms} ms` : a.reason === 'too_early' ? 'рано' : a.reason === 'too_fast' ? '<100' : 'timeout'}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isSubscribed && (
        <div className="mt-4 card border-accent/30 bg-accent/5">
          <p className="text-sm font-medium">Участвовать в соревновании за свою страну</p>
          <p className="muted mt-1">Подписка $2.50 · результаты идут в общий рейтинг</p>
          <button type="button" onClick={() => setShowSubscribe(true)} className="btn-primary mt-3 w-full">
            Участвовать
          </button>
        </div>
      )}

      {showSubscribe && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4">
          <div className="w-full max-w-app card space-y-4">
            <h3 className="section-title">Правила соревнования</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• 5 попыток каждый день, в рейтинг идёт лучшая</li>
              <li>• Если сегодня хуже — сохраняется лучший результат за месяц</li>
              <li>• 50% подписок → призовой банк победившей стране</li>
              <li>• Результаты &lt;100 ms и &gt;800 ms не засчитываются</li>
            </ul>
            <button type="button" className="btn-accent2 w-full">
              Оформить подписку — $2.50
            </button>
            <button type="button" onClick={() => setShowSubscribe(false)} className="btn-secondary w-full">
              Позже
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
