import { Crown, Medal } from 'lucide-react'
import { getFlagEmoji } from '../lib/countries'
import type { CountryRanking } from '../lib/types'
import { reactionColor } from '../lib/anticheat'

interface PodiumProps {
  top3: CountryRanking[]
}

export function Podium({ top3 }: PodiumProps) {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="flex items-end justify-center gap-3 px-2">
      {order.map((country, i) => {
        const place = country.rank
        const heights = ['h-20', 'h-28', 'h-16']
        const colors = ['bg-white/10', 'bg-accent/30', 'bg-accent2/20']
        return (
          <div key={country.country_code} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-2xl">{getFlagEmoji(country.country_code)}</span>
            <span className="text-xs font-medium truncate max-w-full">{country.country_name}</span>
            <span className="text-sm font-bold" style={{ color: reactionColor(country.avg_reaction) }}>
              {country.avg_reaction} ms
            </span>
            <div className={`w-full ${heights[i]} ${colors[i]} rounded-t-card flex items-start justify-center pt-2`}>
              {place === 1 ? (
                <Crown size={18} className="text-orange" />
              ) : (
                <Medal size={16} className="text-white/50" />
              )}
            </div>
            <span className="text-lg font-bold text-white/60">#{place}</span>
          </div>
        )
      })}
    </div>
  )
}
