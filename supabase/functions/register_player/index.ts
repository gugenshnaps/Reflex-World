import {
  createServiceClient,
  handleCors,
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
    if (!name?.trim() || !country_code || country_code.length !== 2) {
      return jsonResponse({ error: 'Invalid name or country_code' }, 400)
    }

    const supabase = createServiceClient()

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
        name: name.trim(),
        country_code: country_code.toUpperCase(),
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
