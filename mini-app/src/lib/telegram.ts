import type { TelegramUser } from './types'

const MOCK_USER: TelegramUser = {
  id: 742891034,
  first_name: 'Yura',
  username: 'yura_demo',
  language_code: 'ru',
}

export function initTelegramWebApp(): void {
  const tg = window.Telegram?.WebApp
  if (tg) {
    tg.ready()
    tg.expand()
    tg.setHeaderColor('#07070E')
    tg.setBackgroundColor('#07070E')
  }
}

export function getTelegramUser(): TelegramUser {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (user?.id) {
    return {
      id: user.id,
      first_name: user.first_name,
      username: user.username,
      language_code: user.language_code,
    }
  }
  return MOCK_USER
}

export function isTelegramEnv(): boolean {
  return Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user?.id)
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            username?: string
            language_code?: string
          }
        }
        initData?: string
        openInvoice?: (url: string, callback?: (status: string) => void) => void
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
        }
      }
    }
  }
}
