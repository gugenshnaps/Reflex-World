import { X } from 'lucide-react'
import { getFlagEmoji } from '../lib/countries'
import { reactionColor } from '../lib/anticheat'
import type { CountryRanking } from '../lib/types'
import { Link } from 'react-router-dom'

interface CountryPanelProps {
  ranking: CountryRanking
  onClose: () => void
}

export function CountryPanel({ ranking, onClose }: CountryPanelProps) {
  return (
    <div className="card animate-in fade-in slide-in-from-bottom-2 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getFlagEmoji(ranking.country_code)}</span>
          <div>
            <h3 className="font-semibold">{ranking.country_name}</h3>
            <p className="muted">#{ranking.rank} · {ranking.player_count} игроков</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-white/40 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between rounded-card bg-bg px-4 py-3">
        <span className="muted">Средняя реакция</span>
        <span className="text-xl font-bold" style={{ color: reactionColor(ranking.avg_reaction) }}>
          {ranking.avg_reaction} ms
        </span>
      </div>

      <p className="text-center text-sm text-white/70">Проверь свою реакцию</p>
      <Link to="/game" className="btn-primary block w-full text-center">
        Играть
      </Link>
    </div>
  )
}
