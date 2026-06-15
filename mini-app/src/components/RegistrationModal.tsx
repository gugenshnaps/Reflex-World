import { useState } from 'react'
import { COUNTRY_CODES, COUNTRY_NAMES, getFlagEmoji } from '../lib/countries'
import { useDefaultPlayerName, usePlayer } from '../context/PlayerContext'

export function RegistrationModal() {
  const { register, loading, error } = usePlayer()
  const [name, setName] = useState(useDefaultPlayerName())
  const [country, setCountry] = useState('RU')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4">
      <div className="w-full max-w-app card space-y-4">
        <div>
          <h2 className="text-xl font-bold">Добро пожаловать в Reflex World</h2>
          <p className="muted mt-1">Выбери страну — будешь соревноваться за неё</p>
        </div>

        <div>
          <label className="muted mb-1 block text-xs">Имя</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-btn border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
            placeholder="Твоё имя"
          />
        </div>

        <div>
          <label className="muted mb-1 block text-xs">Страна</label>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">
            {COUNTRY_CODES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCountry(code)}
                className={`flex items-center gap-2 rounded-btn border px-3 py-2 text-sm transition ${
                  country === code
                    ? 'border-accent bg-accent/15 text-white'
                    : 'border-border bg-bg text-white/70'
                }`}
              >
                <span>{getFlagEmoji(code)}</span>
                <span className="truncate">{COUNTRY_NAMES[code]}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-slow">{error}</p>}

        <button
          type="button"
          disabled={loading || !name.trim()}
          onClick={() => register(name.trim(), country)}
          className="btn-primary w-full"
        >
          {loading ? 'Сохранение...' : 'Начать играть'}
        </button>
      </div>
    </div>
  )
}
