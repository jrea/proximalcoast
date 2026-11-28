CREATE SCHEMA IF NOT EXISTS x_rewards;
CREATE TABLE IF NOT EXISTS x_rewards.ingestion_runs (
  id text PRIMARY KEY, started_at timestamptz NOT NULL, finished_at timestamptz NOT NULL CHECK (finished_at >= started_at),
  reviewer text NOT NULL, digest text NOT NULL CHECK (digest ~ '^[a-f0-9]{64}$')
);
CREATE TABLE IF NOT EXISTS x_rewards.ingestion_events (
  run_id text NOT NULL REFERENCES x_rewards.ingestion_runs(id),
  event_id text NOT NULL, disposition text NOT NULL CHECK(disposition IN ('candidate','conflict','needs-proof','approved','rejected')),
  creator text NOT NULL CHECK (creator ~ '^[a-z0-9_]{1,15}$'), cycle date,
  payout_status_id text, payout_url text, impressions_status_id text, impressions_url text,
  metric text CHECK(metric IN ('verified','total','premium')), amount_cents bigint CHECK (amount_cents>0),
  impression_count bigint CHECK(impression_count>0), window_start date, window_end date,
  missing_fields text[] NOT NULL DEFAULT '{}', reason text, reviewer text NOT NULL,
  PRIMARY KEY(run_id,event_id)
);
REVOKE ALL ON x_rewards.ingestion_runs, x_rewards.ingestion_events FROM PUBLIC;
