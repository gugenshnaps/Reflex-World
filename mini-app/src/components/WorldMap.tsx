import { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { countryColorFromAvg } from '../lib/anticheat'
import type { CountryRanking } from '../lib/types'

const GEO_URL = `${import.meta.env.BASE_URL}world-countries.json`

const MAP_BG = '#EEF2FF'
const LAND_DEFAULT = '#FFFFFF'
const LAND_STROKE = '#94A3B8'
const LAND_HOVER = '#E0E7FF'

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
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([10, 20])

  const rankingMap = useMemo(
    () => new Map(rankings.map((r) => [r.country_code.trim(), r])),
    [rankings],
  )

  const avgs = rankings.map((r) => r.avg_reaction)
  const minAvg = avgs.length > 0 ? Math.min(...avgs) : 200
  const maxAvg = avgs.length > 0 ? Math.max(...avgs) : 400

  return (
    <div className="overflow-hidden rounded-card border border-white/10 shadow-inner">
      <div className="relative bg-[#F8FAFC]" style={{ touchAction: 'none' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [10, 20] }}
          width={380}
          height={260}
          style={{ width: '100%', height: 'auto', background: MAP_BG }}
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            minZoom={0.8}
            maxZoom={6}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates)
              setZoom(z)
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = resolveCode(geo)
                  const ranking = code ? rankingMap.get(code) : undefined
                  const fill = ranking
                    ? countryColorFromAvg(ranking.avg_reaction, minAvg, maxAvg)
                    : LAND_DEFAULT
                  const isSelected = code === selectedCode

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => code && onSelect(code)}
                      style={{
                        default: {
                          fill,
                          stroke: isSelected ? '#7C3AED' : LAND_STROKE,
                          strokeWidth: isSelected ? 1.4 : 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: ranking ? '#7C3AED' : LAND_HOVER,
                          stroke: '#7C3AED',
                          strokeWidth: 0.9,
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
          </ZoomableGroup>
        </ComposableMap>
        <p className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-400">
          Pinch / двигай пальцем
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="inline-block h-2 w-6 rounded-full bg-fast" />
          Быстро
        </div>
        <span className="text-[10px] text-slate-400">
          {rankings.length > 0 ? `${rankings.length} стран` : 'Белая карта · жди рейтинг'}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="inline-block h-2 w-6 rounded-full bg-slow" />
          Медленно
        </div>
      </div>
    </div>
  )
}
