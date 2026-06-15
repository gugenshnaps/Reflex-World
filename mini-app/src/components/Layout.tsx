import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { isTelegramEnv } from '../lib/telegram'
import { supabaseConfigured } from '../lib/supabase'

export function Layout() {
  return (
    <div className="app-shell">
      {!isTelegramEnv() && (
        <div className="shrink-0 border-b border-border bg-surface/80 px-4 py-1.5 text-center text-[10px] text-white/40">
          Local dev · mock Telegram user
          {supabaseConfigured && ' · Supabase ✓'}
        </div>
      )}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
