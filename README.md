# Reflex World

Telegram Mini App — ежедневная игра на скорость реакции.

## Mini App URL (GitHub Pages)

После деплоя:

**https://gugenshnaps.github.io/Reflex-World/**

Эту ссылку вставь в BotFather → Menu Button → Web App.

## GitHub Secrets (обязательно для деплоя)

Repository → Settings → Secrets and variables → Actions → New secret:

| Secret | Значение |
|--------|----------|
| `VITE_SUPABASE_URL` | `https://wixxuipvhswxepqifkih.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon key из Supabase Dashboard → Settings → API |

## Включить GitHub Pages

Repository → Settings → Pages → Source: **GitHub Actions**

## Локальная разработка

```bash
cd mini-app && npm install && npm run dev
# http://localhost:3236
```

## Бот

```bash
cd bot && npm install && npm run dev
```

Токен бота — только в `bot/.env` (не коммитится).

## Supabase Edge Function secret

Dashboard → Edge Functions → Secrets → `TELEGRAM_BOT_TOKEN` (тот же, что в `bot/.env`)
