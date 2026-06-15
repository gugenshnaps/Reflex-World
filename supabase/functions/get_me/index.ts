import {
  createServiceClient,
  currentMonth,
  handleCors,
  jsonResponse,
  resolveTelegramUser,
  todayUtc,
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await req.json()
    const tgUser = await resolveTelegramUser(req, body)
    if (!tgUser) return jsonResponse({ error: 'Unauthorized' }, 401)

    const supabase = createServiceClient()
    const month = currentMonth()

    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .maybeSingle()

    if (playerError) return jsonResponse({ error: playerError.message }, 500)
    if (!player) return jsonResponse({ error: 'Player not found' }, 404)

    const { data: dailyHistory } = await supabase
      .from('daily_results')
      .select('*')
      .eq('player_id', player.id)
      .gte('date', `${month}-01`)
      .order('date', { ascending: false })
      .limit(30)

    const { data: todayResult } = await supabase
      .from('daily_results')
      .select('*')
      .eq('player_id', player.id)
      .eq('date', todayUtc())
      .maybeSingle()

    const { data: monthlyEntry } = await supabase
      .from('monthly_leaderboard')
      .select('*')
      .eq('player_id', player.id)
      .eq('month', month)
      .maybeSingle()

    const { data: prizePool } = await supabase
      .from('prize_pool')
      .select('*')
      .eq('month', month)
      .maybeSingle()

    return jsonResponse({
      player,
      daily_history: dailyHistory ?? [],
      today_result: todayResult,
      monthly_entry: monthlyEntry,
      prize_pool: prizePool,
      telegram_username: tgUser.username ?? null,
    })
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500)
  }
})
