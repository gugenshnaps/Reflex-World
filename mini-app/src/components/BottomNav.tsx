import { NavLink } from 'react-router-dom'
import { Globe, Trophy, User, Zap, Gift } from 'lucide-react'
import { cn } from '../lib/utils'

const links = [
  { to: '/', icon: Globe, label: 'Карта' },
  { to: '/game', icon: Zap, label: 'Игра' },
  { to: '/leaderboard', icon: Trophy, label: 'Рейтинг' },
  { to: '/pool', icon: Gift, label: 'Приз' },
  { to: '/profile', icon: User, label: 'Профиль' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-app -translate-x-1/2 border-t border-border bg-bg/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-btn px-3 py-1.5 text-[10px] transition',
                isActive ? 'text-accent' : 'text-white/40 hover:text-white/70',
              )
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
