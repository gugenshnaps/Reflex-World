import { useState } from 'react'
import { WorldMap } from '../components/WorldMap'
import { CountryPanel } from '../components/CountryPanel'
import { Podium } from '../components/Podium'
import { getFlagEmoji } from '../lib/countries'
import { reactionColor } from '../lib/anticheat'
import { useCountryRankings } from '../hooks/useCountryRankings'
import { Link } from 'react-router-dom'

export function HomePage() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const { rankings, loading, month } = useCountryRankings()
  const top3 = rankings.slice(0, 3)
  const selected = selectedCode ? rankings.find((c) => c.country_code === selectedCode) : null

  return (
    <div className="space-y-4 p-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-accent2">Reflex World</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Карта мира</h1>
        <p className="muted mt-1">Нажми на страну — узнай её рейтинг</p>
      </header>

      <WorldMap
        rankings={rankings}
        selectedCode={selectedCode}
        onSelect={setSelectedCode}
      />

      {selectedCode && (
        <CountryPanel
          countryCode={selectedCode}
          ranking={selected ?? undefined}
          onClose={() => setSelectedCode(null)}
        />
      )}

      {loading && (
        <p className="text-center text-sm text-white/40">Обновление рейтинга...</p>
      )}

      {!loading && rankings.length === 0 && (
        <div className="card text-center">
          <p className="text-white/70">Рейтинг за {month} пока пуст</p>
          <p className="muted mt-1">Сыграй и участвуй в соревновании за свою страну</p>
          <Link to="/game" className="btn-primary mt-4 inline-block">
            Играть
          </Link>
        </div>
      )}

      {!loading && top3.length >= 3 && (
        <div className="card">
          <h2 className="section-title mb-4 text-center">Топ-3 страны</h2>
          <Podium top3={top3} />
        </div>
      )}

      {!loading && rankings.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-3">Все страны</h2>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {rankings.map((c) => (
              <button
                key={c.country_code}
                type="button"
                onClick={() => setSelectedCode(c.country_code)}
                className="flex w-full items-center justify-between rounded-btn px-2 py-2 text-left transition hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs text-white/40">#{c.rank}</span>
                  <span>{getFlagEmoji(c.country_code)}</span>
                  <span className="text-sm">{c.country_name}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: reactionColor(c.avg_reaction) }}>
                  {c.avg_reaction} ms
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
