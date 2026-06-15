import { useMemo, useRef, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { countryColorFromAvg } from '../lib/anticheat'
import { resolveCountryCode } from '../lib/iso3166-numeric'
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

export function WorldMap({ rankings, selectedCode, onSelect }: WorldMapProps) {
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([10, 20])
  const dragRef = useRef(false)

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
            onMoveStart={() => {
              dragRef.current = true
            }}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates)
              setZoom(z)
              window.setTimeout(() => {
                dragRef.current = false
              }, 0)
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = resolveCountryCode(geo)
                  const ranking = code ? rankingMap.get(code) : undefined
                  const fill = ranking
                    ? countryColorFromAvg(ranking.avg_reaction, minAvg, maxAvg)
                    : LAND_DEFAULT
                  const isSelected = code === selectedCode

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (!code || dragRef.current) return
                        onSelect(code)
                      }}
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
