CREATE TABLE IF NOT EXISTS x_rewards.public_proofs (
  creator_key text NOT NULL, payout_cycle date NOT NULL,
  payout_proof text NOT NULL, impressions_proof text NOT NULL UNIQUE,
  published_on date NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY(creator_key,payout_cycle),
  FOREIGN KEY (creator_key,payout_cycle) REFERENCES x_rewards.payouts(creator_key,payout_cycle),
  CHECK (payout_proof<>impressions_proof)
);
REVOKE ALL ON x_rewards.public_proofs FROM PUBLIC;
