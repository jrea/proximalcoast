CREATE SCHEMA IF NOT EXISTS x_rewards;
CREATE TABLE IF NOT EXISTS x_rewards.submission_queue (
  payout_status text NOT NULL CHECK (payout_status ~ '^[1-9][0-9]{9,24}$'),
  impressions_status text NOT NULL CHECK (impressions_status ~ '^[1-9][0-9]{9,24}$'),
  opt_in_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  processed_at timestamptz,
  reviewer text,
  PRIMARY KEY(payout_status,impressions_status),
  CHECK ((status='pending' AND processed_at IS NULL AND reviewer IS NULL) OR (status<>'pending' AND processed_at IS NOT NULL AND reviewer IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS submission_pending_idx ON x_rewards.submission_queue (opt_in_at) WHERE status='pending';

CREATE TABLE IF NOT EXISTS x_rewards.submission_limits (
  day date NOT NULL,
  scope_key text NOT NULL,
  attempts int NOT NULL CHECK(attempts>0),
  PRIMARY KEY(day,scope_key)
);
REVOKE ALL ON x_rewards.submission_queue,x_rewards.submission_limits FROM PUBLIC;

CREATE OR REPLACE FUNCTION x_rewards.submission_queue_stats()
RETURNS TABLE(pending_count integer,last_processed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT count(*) FILTER (WHERE status='pending')::int,max(processed_at) FROM x_rewards.submission_queue
$$;

CREATE OR REPLACE FUNCTION x_rewards.enqueue_submission(payout text, impressions text, visitor text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 utc_day date := pg_catalog.timezone('UTC',now())::date;
 allowed int;
BEGIN
 IF payout !~ '^[1-9][0-9]{9,24}$' OR impressions !~ '^[1-9][0-9]{9,24}$' OR visitor !~ '^[a-f0-9]{64}$' THEN
  RETURN 'invalid';
 END IF;
 DELETE FROM x_rewards.submission_limits WHERE day < utc_day-2;
 INSERT INTO x_rewards.submission_limits AS l VALUES(utc_day,visitor,1)
 ON CONFLICT(day,scope_key) DO UPDATE SET attempts=l.attempts+1 WHERE l.attempts<4 RETURNING attempts INTO allowed;
 IF NOT FOUND THEN RETURN 'rate-limited'; END IF;
 INSERT INTO x_rewards.submission_limits AS l VALUES(utc_day,'global',1)
 ON CONFLICT(day,scope_key) DO UPDATE SET attempts=l.attempts+1 WHERE l.attempts<120 RETURNING attempts INTO allowed;
 IF NOT FOUND THEN RETURN 'rate-limited'; END IF;
 INSERT INTO x_rewards.submission_queue(payout_status,impressions_status) VALUES(payout,impressions) ON CONFLICT DO NOTHING;
 -- Identical response regardless of existing pending or reviewed state.
 RETURN 'accepted';
END;
$$;

REVOKE ALL ON FUNCTION x_rewards.submission_queue_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION x_rewards.enqueue_submission(text,text,text) FROM PUBLIC;
