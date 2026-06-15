import 'dotenv/config'
import { Bot, InlineKeyboard } from 'grammy'
import { createClient } from '@supabase/supabase-js'

const token = process.env.TELEGRAM_BOT_TOKEN
const miniAppUrl =
  process.env.MINI_APP_URL ?? 'https://gugenshnaps.github.io/Reflex-World/'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not set — bot will not start')
  process.exit(1)
}

const supabase =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

const bot = new Bot(token)
const appKeyboard = new InlineKeyboard().webApp('⚡ Играть', miniAppUrl)

function currentMonth(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

async function getPlayer(telegramId: number) {
  if (!supabase) return null
  const { data } = await supabase.from('players').select('*').eq('telegram_id', telegramId).maybeSingle()
  return data
}

bot.command('start', async (ctx) => {
  await ctx.reply(
    '⚡ *Reflex World* — ежедневная игра на скорость реакции.\n\n' +
      'Страны соревнуются за ежемесячный призовой банк. ' +
      '5 попыток каждый день — проверь свою реакцию!',
    { parse_mode: 'Markdown', reply_markup: appKeyboard },
  )
})

bot.command('stats', async (ctx) => {
  if (!supabase) {
    await ctx.reply('📊 Открой Mini App для статистики.', { reply_markup: appKeyboard })
    return
  }
  const player = await getPlayer(ctx.from.id)
  if (!player) {
    await ctx.reply('Ты ещё не зарегистрирован. Открой Mini App!', { reply_markup: appKeyboard })
    return
  }

  const month = currentMonth()
  const { data: history } = await supabase
    .from('daily_results')
    .select('best_median')
    .eq('player_id', player.id)
    .eq('is_flagged', false)
    .gte('date', `${month}-01`)

  const medians = (history ?? []).map((h) => h.best_median).filter((v) => v > 0)
  const best = medians.length ? Math.min(...medians) : '—'
  const avg = medians.length ? Math.round(medians.reduce((s, v) => s + v, 0) / medians.length) : '—'

  await ctx.reply(
    `📊 *${player.name}*\n` +
      `Рекорд: ${best} ms\n` +
      `Среднее: ${avg} ms\n` +
      `Сессий: ${medians.length}`,
    { parse_mode: 'Markdown', reply_markup: appKeyboard },
  )
})

bot.command('country', async (ctx) => {
  if (!supabase) {
    await ctx.reply('🏳️ Открой Mini App.', { reply_markup: appKeyboard })
    return
  }
  const player = await getPlayer(ctx.from.id)
  if (!player) {
    await ctx.reply('Открой Mini App для регистрации.', { reply_markup: appKeyboard })
    return
  }

  const month = currentMonth()
  const { data: ranking } = await supabase
    .from('countries_ranking')
    .select('*')
    .eq('country_code', player.country_code.trim())
    .eq('month', month)
    .maybeSingle()

  if (!ranking) {
    await ctx.reply(`🏳️ Страна ${player.country_code.trim()} пока не в рейтинге.`, {
      reply_markup: appKeyboard,
    })
    return
  }

  await ctx.reply(
    `🏳️ *${player.country_code.trim()}*\n` +
      `#${ranking.rank} · ${ranking.avg_reaction} ms\n` +
      `${ranking.player_count} участников`,
    { parse_mode: 'Markdown', reply_markup: appKeyboard },
  )
})

bot.command('pool', async (ctx) => {
  if (!supabase) {
    await ctx.reply('💰 Открой Mini App.', { reply_markup: appKeyboard })
    return
  }

  const { data: pool } = await supabase
    .from('prize_pool')
    .select('total_usd')
    .eq('month', currentMonth())
    .maybeSingle()

  const total = Number(pool?.total_usd ?? 0).toFixed(2)
  await ctx.reply(`💰 Призовой банк: $${total}`, { reply_markup: appKeyboard })
})

bot.catch((err) => console.error('Bot error:', err))

bot.start({
  onStart: () => console.log(`Reflex World bot · Mini App: ${miniAppUrl}`),
})
