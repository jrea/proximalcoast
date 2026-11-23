# X Creator Rewards Observatory

Dedicated site: https://x-rewards.proximalcoast.com. It runs independently of the apex app. The original public release remains at https://x-creator-rewards-data.proximalcoast.chatgpt.site.

## Local

Use Node 22; run `npm ci`, `npm test`, then `npm run dev`. Open the loopback address printed by the dev server. No database is required to preview a snapshot.

- `data/payouts.csv`: 464 public disclosure rows in the original public CSV structure.
- `data/observations.json`: 19 cited impression observations with a strict classification; 8 verified and 2 total have dated matching windows and feed the estimator. Others are context only.
- `data/historical.json`: the explicitly out-of-sample earlier Denche receipt. Never pair its denominator with the November payout.
- `public/methodology.txt`: original payout-sample methodology. The page adds details on metric and exact-window rules.
- The disclosure-post view count is not an impression denominator. An optional creator handle selects a creator rate only with at least two same-metric exact payout windows; otherwise the page labels the overall fallback.

## Rebuild or sync

Set `X_REWARDS_ADMIN_DATABASE_URL` in the shell from a password manager or protected secret injection (not in command history, browser, Git, or Vercel). Run `npm run db:sync` from this directory. The initial migration creates only `x_rewards` and its three tables. The same command rebuilds a fresh local test database or adds missing seed rows to the approved remote database. It is transactional and insert-only; conflicting records fail the entire transaction, and re-running an identical seed changes no rows. Reconcile any conflict against the published source before changing a row through a reviewed, targeted migration. If the live database disappears, repeat the sync into the restored isolated schema from these local source files. Back up only `x_rewards` before any production correction; restore to a separate test database first. Never roll back by dropping another schema.

Configure only `X_REWARDS_DATABASE_URL` in the dedicated Vercel project's server environment after the live role is proven to authenticate directly, read these three tables, and have no other application table or DDL privileges. Check with `node db/verify-reader.mjs`. The plain PostgreSQL role helper is `db/provision-reader.mjs`; it needs the admin URL and a fresh private `X_REWARDS_READER_FILE` output path. The current Nile gateway rejects the SQL PASSWORD option; do not pass the writer URL as a substitute. Without the reader URL the site explicitly shows a bundled archive snapshot. With a reader it serves live data (no silent fallback): verify the `dataSource` field at `/api/data`, and confirm `/payouts.csv` and the calculator on the exact domain. Remove the runtime env var and redeploy an approved snapshot build if the database reader needs to be taken offline. The deployed project was claimed into the personal Hobby scope through Vercel's flow and does not require a public Git remote.

## Updating the dataset

Add sourced public payouts and reviewed, same-cycle observations to the local seed. Keep exact verified, exact total, approximate windows, and disclosure-post views separate. Run tests and update pinned corpus totals when deliberately expanding the sample; sync the seed, then publish the app from this directory (not the repository root). The dedicated Vercel project owns only the requested subdomain. Rebuild snapshots after updates until the scoped database runtime is configured.

## Git deployments

The dedicated Vercel project is linked to the existing `jrea/proximalcoast` repository. Production tracks `codex/x-creator-rewards-2026-11-23` with root directory `sideprojects/x-rewards`. Push the reviewed app or data change to that branch; do not push to the apex's production branch. Vercel deploys the version-controlled archive snapshot automatically. Refresh the Nile backup separately with the local sync command above. This design keeps the website publishing even when the database is unavailable and never gives Vercel the Nile writer secret.
