# Reflex World

Telegram Mini App — ежедневная игра на скорость реакции.

## Mini App (live)

**https://gugenshnaps.github.io/Reflex-World/**

→ Вставь в BotFather → Menu Button → Web App

---

## Как вносить изменения (алгоритм)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Меняем код локально (mini-app / bot / supabase)         │
│  2. git push → main                                         │
│  3. GitHub Actions автоматически деплоит mini-app на Pages    │
│  4. Supabase Edge Functions + SQL — отдельно (см. ниже)     │
└─────────────────────────────────────────────────────────────┘
```

### Что обновляется автоматически при `git push`

| Часть | Авто? | Как |
|-------|-------|-----|
| **Mini App** (UI, игра, экраны) | ✅ Да | GitHub Actions → GitHub Pages (~1 мин) |
| **Supabase Edge Functions** | ❌ Нет | Деплой через Supabase Dashboard или MCP/CLI |
| **SQL-миграции** (таблицы, RLS) | ❌ Нет | Supabase Dashboard → SQL или MCP |
| **Telegram-бот** | ❌ Нет | Запускается отдельно (`cd bot && npm run dev`) |

**Supabase не хостит фронтенд** — он только хранит данные и выполняет серверную логику.  
**GitHub Pages** — хостит Mini App. Это два разных сервиса.

### Типичный цикл разработки

```bash
# 1. Локально проверить UI
cd mini-app && npm run dev    # http://localhost:3236

# 2. Закоммитить и запушить
git add -A && git commit -m "описание" && git push

# 3. Через ~1 мин сайт обновится на GitHub Pages
```

### Если меняли Edge Functions или SQL

Файлы в `supabase/functions/` и `supabase/migrations/` — деплоятся **вручную** в Supabase (попроси меня или через Dashboard).

---

## GitHub Secrets (для CI)

Repository → Settings → Secrets → Actions:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase Edge Function secret (обязательно для Telegram)

Dashboard → Edge Functions → Secrets → `TELEGRAM_BOT_TOKEN`

## Локальная разработка

```bash
cd mini-app && npm install && npm run dev
cd bot && npm install && npm run dev   # нужен bot/.env
```

## Структура

```
mini-app/     → React UI (GitHub Pages)
bot/          → Telegram bot (Grammy.js)
supabase/     → SQL migrations + Edge Functions
```
