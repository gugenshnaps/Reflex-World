-- Reflex World — initial schema + RLS

-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  subscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'competitor')),
  flagged_sessions INT DEFAULT 0,
  push_hour INT DEFAULT 10 CHECK (push_hour >= 0 AND push_hour <= 23),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_players_telegram ON players(telegram_id);
CREATE INDEX idx_players_country ON players(country_code);

-- Daily results
CREATE TABLE daily_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  attempts INT[] NOT NULL CHECK (array_length(attempts, 1) = 5),
  best_median INT NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (player_id, date)
);

CREATE INDEX idx_daily_results_date ON daily_results(date);
CREATE INDEX idx_daily_results_player ON daily_results(player_id);

-- Monthly leaderboard (per player best for the month)
CREATE TABLE monthly_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL,
  month TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  best_day_result INT NOT NULL,
  rank INT,
  UNIQUE (player_id, month)
);

CREATE INDEX idx_monthly_lb_month ON monthly_leaderboard(month, rank);

-- Prize pool
CREATE TABLE prize_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT UNIQUE NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  total_usd NUMERIC(12, 2) DEFAULT 0,
  winning_country CHAR(2),
  distributed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'distributed'))
);

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  month TEXT NOT NULL,
  amount_usd NUMERIC(12, 2) NOT NULL,
  stars_amount INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Country rankings (materialized hourly)
CREATE TABLE countries_ranking (
  country_code CHAR(2) NOT NULL,
  month TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  avg_reaction INT NOT NULL,
  player_count INT NOT NULL DEFAULT 0,
  rank INT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (country_code, month)
);

-- RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries_ranking ENABLE ROW LEVEL SECURITY;

-- Public read for rankings and prize pool
CREATE POLICY "countries_ranking_read" ON countries_ranking FOR SELECT USING (true);
CREATE POLICY "prize_pool_read" ON prize_pool FOR SELECT USING (true);
CREATE POLICY "monthly_leaderboard_read" ON monthly_leaderboard FOR SELECT USING (true);

-- Players: read own row via telegram_id header (set by Edge Function)
CREATE POLICY "players_read_own" ON players FOR SELECT
  USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (true);

-- Daily results: read own
CREATE POLICY "daily_results_read_own" ON daily_results FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint));

-- Payouts: read own
CREATE POLICY "payouts_read_own" ON payouts FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint));
