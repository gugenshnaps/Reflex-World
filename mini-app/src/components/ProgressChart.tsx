import { reactionColor } from '../lib/anticheat'

type DayPoint = { id: string; date: string; best_median: number }

export function ProgressChart({ data }: { data: DayPoint[] }) {
  const sorted = [...data].reverse()
  const max = Math.max(...sorted.map((d) => d.best_median))
  const min = Math.min(...sorted.map((d) => d.best_median))
  const range = max - min || 1

  return (
    <div className="card">
      <h3 className="section-title mb-4">Прогресс за месяц</h3>
      <div className="flex h-32 items-end justify-between gap-1">
        {sorted.map((d) => {
          const height = 20 + ((max - d.best_median) / range) * 80
          return (
            <div key={d.id} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[14px] rounded-t-md transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: reactionColor(d.best_median),
                  opacity: 0.85,
                }}
                title={`${d.date}: ${d.best_median} ms`}
              />
              <span className="text-[8px] text-white/30">{d.date.slice(-2)}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex justify-between text-xs text-white/40">
        <span>Лучше ↑</span>
        <span>{sorted.length} дней</span>
      </div>
    </div>
  )
}
