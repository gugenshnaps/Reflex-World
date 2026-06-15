import { useMemo, useRef, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { countryColorFromAvg } from '../lib/anticheat'
import { resolveCountryCode } from '../lib/iso3166-numeric'
import type { CountryRanking } from '../lib/types'

const GEO_URL = `${import.meta.env.BASE_URL}world-countries.json`
const TAP_MAX_PX = 12

const MAP_BG = '#EEF2FF'
const LAND_DEFAULT = '#FFFFFF'
const LAND_STROKE = '#94A3B8'
const LAND_HOVER = '#E0E7FF'
const LAND_SELECTED = '#DDD6FE'

interface WorldMapProps {
  rankings: CountryRanking[]
  selectedCode: string | null
  onSelect: (code: string) => void
}

export function WorldMap({ rankings, selectedCode, onSelect }: WorldMapProps) {
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([10, 20])
  const tapRef = useRef<{ x: number; y: number } | null>(null)

  const rankingMap = useMemo(
    () => new Map(rankings.map((r) => [r.country_code.trim(), r])),
    [rankings],
  )

  const avgs = rankings.map((r) => r.avg_reaction)
  const minAvg = avgs.length > 0 ? Math.min(...avgs) : 200
  const maxAvg = avgs.length > 0 ? Math.max(...avgs) : 400

  function handleCountryTap(code: string, clientX: number, clientY: number) {
    const start = tapRef.current
    tapRef.current = null
    if (!start) {
      onSelect(code)
      return
    }
    const dx = clientX - start.x
    const dy = clientY - start.y
    if (Math.hypot(dx, dy) <= TAP_MAX_PX) {
      onSelect(code)
    }
  }

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
                      onMouseDown={(event) => {
                        tapRef.current = { x: event.clientX, y: event.clientY }
                      }}
                      onTouchStart={(event) => {
                        const touch = event.touches[0]
                        if (touch) {
                          tapRef.current = { x: touch.clientX, y: touch.clientY }
                        }
                      }}
                      onClick={(event) => {
                        if (!code) return
                        handleCountryTap(code, event.clientX, event.clientY)
                      }}
                      onTouchEnd={(event) => {
                        if (!code) return
                        const touch = event.changedTouches[0]
                        if (!touch) return
                        event.preventDefault()
                        handleCountryTap(code, touch.clientX, touch.clientY)
                      }}
                      style={{
                        default: {
                          fill: isSelected ? LAND_SELECTED : fill,
                          stroke: isSelected ? '#7C3AED' : LAND_STROKE,
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: isSelected ? LAND_SELECTED : ranking ? '#7C3AED' : LAND_HOVER,
                          stroke: '#7C3AED',
                          strokeWidth: isSelected ? 2 : 0.9,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: isSelected ? LAND_SELECTED : fill,
                          outline: 'none',
                        },
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
