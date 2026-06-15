import { X } from 'lucide-react'
import { getCountryName, getFlagEmoji } from '../lib/countries'
import { reactionColor } from '../lib/anticheat'
import type { CountryRanking } from '../lib/types'
import { Link } from 'react-router-dom'

interface CountryPanelProps {
  countryCode: string
  ranking?: CountryRanking
  onClose: () => void
}

export function CountryPanel({ countryCode, ranking, onClose }: CountryPanelProps) {
  const name = ranking?.country_name ?? getCountryName(countryCode)

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getFlagEmoji(countryCode)}</span>
          <div>
            <h3 className="font-semibold">{name}</h3>
            {ranking ? (
              <p className="muted">#{ranking.rank} · {ranking.player_count} игроков</p>
            ) : (
              <p className="muted">Пока нет участников в рейтинге</p>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-white/40 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {ranking && (
        <div className="flex items-center justify-between rounded-card bg-bg px-4 py-3">
          <span className="muted">Средняя реакция</span>
          <span className="text-xl font-bold" style={{ color: reactionColor(ranking.avg_reaction) }}>
            {ranking.avg_reaction} ms
          </span>
        </div>
      )}

      <p className="text-center text-sm text-white/70">Проверь свою реакцию</p>
      <Link to="/game" className="btn-primary block w-full text-center">
        Играть
      </Link>
    </div>
  )
}
