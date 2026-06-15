import {
  createServiceClient,
  handleCors,
  isValidCountry,
  jsonResponse,
  resolveTelegramUser,
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await req.json()
    const tgUser = await resolveTelegramUser(req, body)
    if (!tgUser) return jsonResponse({ error: 'Unauthorized' }, 401)

    const { name, country_code } = body
    const trimmedName = String(name ?? '').trim()
    if (!trimmedName || trimmedName.length > 32) {
      return jsonResponse({ error: 'Invalid name (max 32 chars)' }, 400)
    }
    if (!isValidCountry(country_code)) {
      return jsonResponse({ error: 'Invalid country_code' }, 400)
    }

    const supabase = createServiceClient()
    const code = country_code.toUpperCase()

    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .maybeSingle()

    if (existing) {
      return jsonResponse({ player: existing, created: false })
    }

    const { data: player, error } = await supabase
      .from('players')
      .insert({
        telegram_id: tgUser.id,
        name: trimmedName,
        country_code: code,
        tier: 'free',
        is_active: true,
      })
      .select('*')
      .single()

    if (error) return jsonResponse({ error: error.message }, 500)
    return jsonResponse({ player, created: true })
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500)
  }
})
