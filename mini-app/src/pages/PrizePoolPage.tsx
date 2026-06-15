import { Calendar, Trophy } from 'lucide-react'
import { getFlagEmoji, daysUntilMonthEnd } from '../lib/countries'
import { formatUsd, formatMonthLabel } from '../lib/utils'
import { useCountryRankings } from '../hooks/useCountryRankings'
import { usePastWinners } from '../hooks/useLeaderboard'
import { usePlayer } from '../context/PlayerContext'
import { getCurrentMonth } from '../lib/countries'

export function PrizePoolPage() {
  const { player, prizePool } = usePlayer()
  const { rankings, month } = useCountryRankings()
  const pastWinners = usePastWinners()
  const myCountry = rankings.find((c) => c.country_code === player?.country_code)
  const totalUsd = Number(prizePool?.total_usd ?? 0)
  const playersInCountry = myCountry?.player_count ?? 1
  const estimatedPrize = totalUsd / Math.max(playersInCountry, 1)

  return (
    <div className="space-y-4 p-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-accent2">{formatMonthLabel(month)}</p>
        <h1 className="mt-1 text-2xl font-bold">Призовой банк</h1>
      </header>

      <div className="card relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/20 to-surface">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        <p className="muted">Текущий банк</p>
        <p className="mt-1 text-4xl font-bold text-accent2">{formatUsd(totalUsd)}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
          <Calendar size={14} />
          <span>{daysUntilMonthEnd()} дней до распределения</span>
        </div>
        <p className="muted mt-2">50% от всех подписок ($2.50)</p>
      </div>

      {myCountry && (
        <div className="card">
          <h3 className="section-title mb-2">Если {myCountry.country_name} победит сейчас</h3>
          <div className="flex items-center justify-between rounded-card bg-bg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getFlagEmoji(myCountry.country_code)}</span>
              <div>
                <p className="font-medium">Твой расчётный приз</p>
                <p className="text-xs text-white/40">Банк ÷ {playersInCountry} игроков</p>
              </div>
            </div>
            <span className="text-xl font-bold text-fast">{formatUsd(estimatedPrize)}</span>
          </div>
          <p className="muted mt-2">
            Сейчас #{myCountry.rank} · средняя {myCountry.avg_reaction} ms
          </p>
        </div>
      )}

      <div className="card">
        <h3 className="section-title mb-3 flex items-center gap-2">
          <Trophy size={18} className="text-orange" />
          Победители прошлых месяцев
        </h3>
        {pastWinners.length === 0 ? (
          <p className="muted">Первый розыгрыш — {formatMonthLabel(getCurrentMonth())}</p>
        ) : (
          <div className="space-y-2">
            {pastWinners.map((w) => (
              <div key={w.month} className="flex items-center justify-between rounded-btn bg-bg px-3 py-3">
                <div className="flex items-center gap-2">
                  <span>{getFlagEmoji(w.country_code)}</span>
                  <div>
                    <p className="font-medium">{w.country_name}</p>
                    <p className="text-xs text-white/40">{formatMonthLabel(w.month)}</p>
                  </div>
                </div>
                <span className="font-bold text-accent2">{formatUsd(w.total_usd)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
