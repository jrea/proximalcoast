-- A higher-resolution review of the public screenshot confirmed the last digit is 0.
-- https://x.com/RyDawg42/status/2123873927130919281/photo/2
-- Only replace the exact originally seeded observation; preserve unrelated or edited rows.
UPDATE x_rewards.impression_observations
SET impression_count = 189490
WHERE creator_key = 'rydawg42' AND payout_cycle = DATE '2026-11-20'
  AND metric = 'verified' AND observation_kind = 'exact'
  AND analytics_start = DATE '2026-11-04' AND analytics_end = DATE '2026-11-17'
  AND source_url = 'https://x.com/RyDawg42/status/2123873927130919281'
  AND impression_count = 189498;
