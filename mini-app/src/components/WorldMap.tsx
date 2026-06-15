import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { countryColorFromAvg } from '../lib/anticheat'
import type { CountryRanking } from '../lib/types'

const GEO_URL = `${import.meta.env.BASE_URL}world-countries.json`

interface WorldMapProps {
  rankings: CountryRanking[]
  selectedCode: string | null
  onSelect: (code: string) => void
}

const ISO_NUM_TO_ALPHA2: Record<string, string> = {
  '840': 'US', '643': 'RU', '276': 'DE', '392': 'JP', '076': 'BR',
  '826': 'GB', '250': 'FR', '410': 'KR', '356': 'IN', '036': 'AU',
  '124': 'CA', '380': 'IT', '724': 'ES', '528': 'NL', '752': 'SE',
  '616': 'PL', '804': 'UA', '792': 'TR', '484': 'MX', '032': 'AR',
}

function resolveCode(geo: { id?: string; properties?: { iso_a2?: string } }): string | null {
  if (geo.properties?.iso_a2 && geo.properties.iso_a2 !== '-99') {
    return geo.properties.iso_a2
  }
  if (geo.id && ISO_NUM_TO_ALPHA2[geo.id]) {
    return ISO_NUM_TO_ALPHA2[geo.id]
  }
  return null
}

export function WorldMap({ rankings, selectedCode, onSelect }: WorldMapProps) {
  const [geoError, setGeoError] = useState(false)
  const rankingMap = new Map(rankings.map((r) => [r.country_code.trim(), r]))

  const avgs = rankings.map((r) => r.avg_reaction)
  const minAvg = avgs.length > 0 ? Math.min(...avgs) : 200
  const maxAvg = avgs.length > 0 ? Math.max(...avgs) : 400

  useEffect(() => {
    fetch(GEO_URL, { method: 'HEAD' })
      .then((r) => { if (!r.ok) setGeoError(true) })
      .catch(() => setGeoError(true))
  }, [])

  if (geoError) {
    return (
      <div className="card p-6 text-center">
        <p className="text-white/70">Карта временно недоступна</p>
        <p className="muted mt-1 text-xs">Попробуй обновить страницу</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden p-0">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [10, 20] }}
        width={380}
        height={200}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = resolveCode(geo)
              const ranking = code ? rankingMap.get(code) : undefined
              const fill = ranking
                ? countryColorFromAvg(ranking.avg_reaction, minAvg, maxAvg)
                : '#1C1C30'
              const isSelected = code === selectedCode

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => code && onSelect(code)}
                  style={{
                    default: {
                      fill,
                      stroke: isSelected ? '#7C3AED' : '#07070E',
                      strokeWidth: isSelected ? 1.2 : 0.4,
                      outline: 'none',
                      cursor: 'pointer',
                      opacity: ranking ? 1 : 0.5,
                    },
                    hover: {
                      fill: ranking ? '#7C3AED' : '#2a2a40',
                      stroke: '#7C3AED',
                      strokeWidth: 0.8,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: { fill, outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-1.5 text-[10px] text-white/50">
          <span className="inline-block h-2 w-6 rounded-full bg-fast" />
          Быстро
        </div>
        <span className="text-[10px] text-white/30">
          {rankings.length > 0 ? `${rankings.length} стран в рейтинге` : 'Нет данных — карта серая'}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-white/50">
          <span className="inline-block h-2 w-6 rounded-full bg-slow" />
          Медленно
        </div>
      </div>
    </div>
  )
}
