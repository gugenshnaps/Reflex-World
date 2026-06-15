import { useState } from 'react'
import { getFlagEmoji } from '../lib/countries'
import { reactionColor } from '../lib/anticheat'
import { cn, formatMonthLabel } from '../lib/utils'
import { useCountryRankings } from '../hooks/useCountryRankings'
import { usePlayerLeaderboard } from '../hooks/useLeaderboard'
import { usePlayer } from '../context/PlayerContext'

type Tab = 'countries' | 'players'

export function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('countries')
  const { player } = usePlayer()
  const { rankings, loading: countriesLoading, month } = useCountryRankings()
  const { entries, loading: playersLoading } = usePlayerLeaderboard(player?.id)

  return (
    <div className="space-y-4 p-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-accent2">{formatMonthLabel(month)}</p>
        <h1 className="mt-1 text-2xl font-bold">Рейтинг</h1>
      </header>

      <div className="flex rounded-card bg-surface p-1">
        {(['countries', 'players'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-btn py-2 text-sm font-medium transition',
              tab === t ? 'bg-accent text-white' : 'text-white/50',
            )}
          >
            {t === 'countries' ? 'Страны' : 'Игроки'}
          </button>
        ))}
      </div>

      {tab === 'countries' && (
        <div className="card divide-y divide-border p-0">
          {countriesLoading ? (
            <p className="p-4 muted">Загрузка...</p>
          ) : rankings.length === 0 ? (
            <p className="p-4 muted">Нет данных — подключись к соревнованию</p>
          ) : (
            rankings.map((c) => {
              const isMe = c.country_code === player?.country_code
              return (
                <div
                  key={c.country_code}
                  className={cn('flex items-center justify-between px-4 py-3', isMe && 'bg-accent/10')}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-white/40">#{c.rank}</span>
                    <span className="text-xl">{getFlagEmoji(c.country_code)}</span>
                    <div>
                      <p className="font-medium">{c.country_name}</p>
                      <p className="text-xs text-white/40">{c.player_count} игроков</p>
                    </div>
                  </div>
                  <span className="font-bold" style={{ color: reactionColor(c.avg_reaction) }}>
                    {c.avg_reaction} ms
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}

      {tab === 'players' && (
        <div className="card divide-y divide-border p-0">
          {playersLoading ? (
            <p className="p-4 muted">Загрузка...</p>
          ) : entries.length === 0 ? (
            <p className="p-4 muted">Пока нет участников соревнования</p>
          ) : (
            entries.map((p) => (
              <div
                key={p.player_id}
                className={cn(
                  'flex items-center justify-between px-4 py-3',
                  p.is_me && 'bg-accent/10 ring-1 ring-inset ring-accent/30',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-white/40">#{p.rank}</span>
                  <span>{getFlagEmoji(p.country_code)}</span>
                  <span className="font-medium">
                    {p.name}
                    {p.is_me && <span className="ml-1 text-xs text-accent">(ты)</span>}
                  </span>
                </div>
                <span className="font-bold" style={{ color: reactionColor(p.best_day_result) }}>
                  {p.best_day_result} ms
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
