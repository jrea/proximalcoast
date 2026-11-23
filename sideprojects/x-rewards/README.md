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

## Proof-reviewed leaderboard

The homepage and /leaderboard share one searchable payout-ranked table. It uses the manually reviewed allowlist in `data/leaderboard.json`. For each creator and payout cycle, a reviewer must inspect a payout screenshot and a separate screenshot with labeled Verified impressions, count, and exact matching date window. Confirm account ownership and source linkage. For now the public proof links must be distinct photos on creator-authored public X posts; don't commit private submission material. The public proof-only API defaults to the five largest proof-reviewed payouts across tracked cycles. The website ranks all disclosure rows by payout by default, incorporates exact creator/cycle/amount proof badges, and can filter down to proof-reviewed entries. Every cycle remains selectable.

Public API: `/api/leaderboard?cycle=YYYY-MM-DD`. Download: `/leaderboard.csv?cycle=YYYY-MM-DD`. Public page: `/leaderboard?cycle=YYYY-MM-DD`. No public write endpoint is provided. The submissions section currently explains how to request human review of links already made public; private uploads are not open.

The narrowly guarded `002_rydawg_screenshot_count.sql` corrects only the exactly matching old seeded count from 189,498 to 189,490 when the local operator next runs the database sync.

`/api/submissions` validates two X status URLs (payout and verified impressions, including legacy twitter.com links) and derives a stable canonical pair key. The same post may serve both fields if it contains both screenshots. Public queue intake is **disabled** until there is a durable, access-controlled, rate-limited dedupe store: valid POST requests get 503 with no writes, and GET returns `accepting:false` and `pendingCount:null`, not zero. Do not open intake without those controls. Last leaderboard review is the date of the manual proof audit and should be updated when a new batch is published.

For recurring verification, manually read both original public X screenshot photos. Confirm author/handle, dated payout in the same cycle, verified metric label and exact analytics date range/count; keep same-cycle curated observations and approval records in `data/observations.json` and `data/leaderboard.json`. Do not approve unlabeled/cropped evidence or use a caption as proof; new submissions never enter automatically. Then run `npm run proofs:validate` and `npm test`. The validator checks canonical creator-owned URLs, distinct screenshot roles, analytics image non-reuse, exact matching dates/count and payout, and duplicate creator/cycle. It does not fetch or interpret images.
