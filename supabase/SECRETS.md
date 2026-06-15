# Supabase Edge Function secrets

Set in **Supabase Dashboard → Edge Functions → Secrets**:

| Secret | Required | Description |
|--------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | **Yes (production)** | Same token as in `bot/.env`. Validates Telegram initData. |
| `DEV_API_KEY` | No | Local browser dev only. Never set in production. |
| `ALLOW_DEV` | No | Set to `true` only for local Supabase testing. **Never in production.** |

**Never commit tokens to git.** Use `bot/.env` locally (gitignored).
