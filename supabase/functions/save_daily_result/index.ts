import {
  createServiceClient,
  currentMonth,
  handleCors,
  jsonResponse,
  resolveTelegramUser,
  sanitizeAttempts,
  todayUtc,
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await req.json()
    const tgUser = await resolveTelegramUser(req, body)
    if (!tgUser) return jsonResponse({ error: 'Unauthorized' }, 401)

    const { attempts: rawAttempts } = body
    if (!Array.isArray(rawAttempts) || rawAttempts.length !== 5) {
      return jsonResponse({ error: 'Exactly 5 attempts required' }, 400)
    }

    const supabase = createServiceClient()
    const month = currentMonth()
    const today = todayUtc()

    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .maybeSingle()

    if (playerError) return jsonResponse({ error: playerError.message }, 500)
    if (!player) return jsonResponse({ error: 'Player not found' }, 404)

    const { attempts, bestMedian, flagged } = sanitizeAttempts(
      rawAttempts.map((n: unknown) => Number(n)),
    )

    if (bestMedian === 0) {
      return jsonResponse({ error: 'No valid attempts' }, 400)
    }

    const { data: saved, error: saveError } = await supabase
      .from('daily_results')
      .upsert(
        {
          player_id: player.id,
          date: today,
          attempts,
          best_median: bestMedian,
          is_flagged: flagged,
        },
        { onConflict: 'player_id,date' },
      )
      .select('*')
      .single()

    if (saveError) return jsonResponse({ error: saveError.message }, 500)

    if (flagged) {
      await supabase
        .from('players')
        .update({ flagged_sessions: (player.flagged_sessions ?? 0) + 1 })
        .eq('id', player.id)
    }

    let monthlyBest = bestMedian

    if (player.tier === 'competitor' && (player.flagged_sessions ?? 0) <= 3) {
      const { data: monthDays } = await supabase
        .from('daily_results')
        .select('best_median')
        .eq('player_id', player.id)
        .gte('date', `${month}-01`)
        .lte('date', today)

      const allBest = (monthDays ?? []).map((d) => d.best_median).filter((v) => v > 0)
      monthlyBest = allBest.length > 0 ? Math.min(...allBest) : bestMedian

      await supabase.from('monthly_leaderboard').upsert(
        {
          player_id: player.id,
          country_code: player.country_code,
          month,
          best_day_result: monthlyBest,
        },
        { onConflict: 'player_id,month' },
      )

      await supabase.rpc('refresh_country_rankings', { p_month: month })
    }

    return jsonResponse({
      daily_result: saved,
      best_median: bestMedian,
      monthly_best: monthlyBest,
      flagged,
      counts_for_ranking: player.tier === 'competitor',
    })
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500)
  }
})
