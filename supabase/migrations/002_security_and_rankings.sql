-- Security: remove open INSERT on players (only service role via Edge Functions)
DROP POLICY IF EXISTS "players_insert" ON players;

-- Rankings refresh function (called after competitor saves a result)
CREATE OR REPLACE FUNCTION refresh_country_rankings(p_month TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM countries_ranking WHERE month = p_month;

  INSERT INTO countries_ranking (country_code, month, avg_reaction, player_count, rank, updated_at)
  WITH stats AS (
    SELECT p.country_code,
           ROUND(AVG(ml.best_day_result))::int AS avg_reaction,
           COUNT(*)::int AS player_count
    FROM monthly_leaderboard ml
    JOIN players p ON p.id = ml.player_id
    WHERE ml.month = p_month
      AND p.tier = 'competitor'
      AND p.is_active = true
      AND COALESCE(p.flagged_sessions, 0) <= 3
    GROUP BY p.country_code
  ),
  ranked AS (
    SELECT country_code, avg_reaction, player_count,
           ROW_NUMBER() OVER (ORDER BY avg_reaction ASC)::int AS rank
    FROM stats
  )
  SELECT country_code, p_month, avg_reaction, player_count, rank, now() FROM ranked;

  WITH ranked_players AS (
    SELECT ml.id,
           ROW_NUMBER() OVER (ORDER BY ml.best_day_result ASC)::int AS new_rank
    FROM monthly_leaderboard ml
    JOIN players p ON p.id = ml.player_id
    WHERE ml.month = p_month
      AND p.tier = 'competitor'
      AND p.is_active = true
      AND COALESCE(p.flagged_sessions, 0) <= 3
  )
  UPDATE monthly_leaderboard ml
  SET rank = rp.new_rank
  FROM ranked_players rp
  WHERE ml.id = rp.id;
END;
$$;
