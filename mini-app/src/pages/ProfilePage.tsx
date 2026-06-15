import { ProgressChart } from '../components/ProgressChart'
import { getFlagEmoji } from '../lib/countries'
import { reactionColor } from '../lib/anticheat'
import { usePlayer } from '../context/PlayerContext'

export function ProfilePage() {
  const { player, dailyHistory, telegramUsername, monthlyEntry } = usePlayer()

  if (!player) return null

  const medians = dailyHistory.map((d) => d.best_median).filter((v) => v > 0)
  const personalBest = medians.length > 0 ? Math.min(...medians) : null
  const avgThisMonth =
    medians.length > 0 ? Math.round(medians.reduce((s, v) => s + v, 0) / medians.length) : null
  const isSubscribed = player.tier === 'competitor'

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-card bg-accent/20 text-3xl">
          {getFlagEmoji(player.country_code)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <p className="muted">@{telegramUsername ?? 'player'}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isSubscribed ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/50'
            }`}
          >
            {isSubscribed ? 'Участник соревнования' : 'Бесплатный режим'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: personalBest ? reactionColor(personalBest) : undefined }}
          >
            {personalBest ?? '—'}
          </p>
          <p className="muted mt-1">Рекорд</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{avgThisMonth ?? '—'}</p>
          <p className="muted mt-1">Среднее</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{monthlyEntry?.rank ? `#${monthlyEntry.rank}` : '—'}</p>
          <p className="muted mt-1">Место</p>
        </div>
      </div>

      {dailyHistory.length > 0 && <ProgressChart data={dailyHistory} />}

      <div className="card">
        <h3 className="section-title mb-3">Последние сессии</h3>
        {dailyHistory.length === 0 ? (
          <p className="muted">Ещё нет сыгранных сессий</p>
        ) : (
          <div className="space-y-2">
            {dailyHistory.slice(0, 7).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-btn bg-bg px-3 py-2">
                <span className="text-sm text-white/60">{d.date}</span>
                <span className="font-semibold" style={{ color: reactionColor(d.best_median) }}>
                  {d.best_median} ms
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
