CREATE SCHEMA IF NOT EXISTS x_rewards;
CREATE TABLE IF NOT EXISTS x_rewards.payouts (
  creator_key text NOT NULL CHECK (creator_key ~ '^[a-z0-9_]{1,15}$'),
  creator_handle text NOT NULL CHECK (lower(creator_handle)=creator_key),
  payout_cycle date NOT NULL,
  payout_usd numeric(12,2) NOT NULL CHECK (payout_usd>0),
  source_post_url text NOT NULL CHECK (source_post_url ~ '^https://x[.]com/[A-Za-z0-9_]+/status/[0-9]+(/photo/[0-9]+)?$'),
  source_post_utc text NOT NULL,
  source_post_views bigint CHECK (source_post_views >= 0),
  creator_follower_snapshot bigint CHECK (creator_follower_snapshot >= 0),
  followers_observed_date date,
  receipt_media_url text NOT NULL,
  supporting_source_url text NOT NULL,
  evidence_type text NOT NULL,
  PRIMARY KEY (creator_key,payout_cycle)
);
CREATE TABLE IF NOT EXISTS x_rewards.impression_observations (
  creator_key text NOT NULL,
  payout_cycle date NOT NULL,
  metric text NOT NULL CHECK (metric IN ('verified','total','premium')),
  impression_count bigint NOT NULL CHECK (impression_count BETWEEN 1 AND 9007199254740991),
  analytics_start date,
  analytics_end date,
  observation_kind text NOT NULL CHECK (observation_kind IN ('exact','rolling14','reported_cycle','approximate')),
  source_url text NOT NULL CHECK (source_url ~ '^https://(x[.]com|note[.]com)/'),
  CHECK (
    (observation_kind='exact' AND metric IN ('verified','total') AND analytics_start IS NOT NULL AND analytics_end IS NOT NULL AND analytics_end-analytics_start=13 AND payout_cycle-analytics_end=3)
    OR (observation_kind<>'exact' AND analytics_start IS NULL AND analytics_end IS NULL)
  ),
  PRIMARY KEY (creator_key,payout_cycle,metric),
  FOREIGN KEY (creator_key,payout_cycle) REFERENCES x_rewards.payouts(creator_key,payout_cycle)
);
CREATE TABLE IF NOT EXISTS x_rewards.historical_context (
  creator_handle text NOT NULL CHECK (creator_handle ~ '^[A-Za-z0-9_]{1,15}$'),
  label text NOT NULL,
  payout_usd numeric(12,2) NOT NULL CHECK (payout_usd>0),
  metric text NOT NULL CHECK (metric IN ('verified','total','premium')),
  impression_count bigint NOT NULL CHECK (impression_count BETWEEN 1 AND 9007199254740991),
  source_url text NOT NULL CHECK (source_url ~ '^https://(x[.]com|note[.]com)/'),
  PRIMARY KEY (creator_handle,source_url,metric)
);
