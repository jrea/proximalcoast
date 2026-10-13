# Database migrations

This repo now carries its Prisma migration history in `prisma/migrations/`
(it previously had none — schema changes reached databases via `db push` or
manual DDL, if at all). The history starts with:

- `20261013000000_baseline_original_schema` — the schema as it existed before
  the 2026-10-13 audit fixes. This describes a database that **already
  exists**; it must never be *applied* to a populated database (it would try
  to create tables that are already there and fail).
- `20261013000100_audit_fixes_issues_5_44` — the audit-fix changes (new
  `stripe_session_claim` table, `ApiKey` lifecycle columns, delete-policy and
  index changes, CHECK constraints). This one **must** be applied: code in
  that release reads and writes the new table/columns and will fail without
  it.

## Rollout

### Existing (populated) databases — production, staging

Run these **once, before** the first deploy that ships `prisma/migrations/`:

```bash
# Mark the baseline as already applied WITHOUT running it — the database
# already matches the baseline schema by definition.
pnpm db:baseline
# (equivalently: prisma migrate resolve --applied 20261013000000_baseline_original_schema)

# Then apply everything after the baseline (the change migration).
pnpm db:migrate:deploy
# (equivalently: prisma migrate deploy)
```

Skipping the baseline step makes `migrate deploy` attempt the baseline's
`CREATE TABLE` statements against the live database and fail.

### Fresh databases (new environments, scratch/review DBs)

Just run:

```bash
pnpm db:migrate:deploy
```

Both migrations apply in order and the database reaches the current schema.

## Where migration fits in a release

The Vercel build is intentionally **not** a migration step:

```json
"build": "prisma generate && next build"
```

`prisma generate` only builds the client. Applying migrations is an explicit
release step: run `pnpm db:migrate:deploy` (with the baseline step above,
once, for pre-existing databases) as part of deploying a release that adds
migrations, before or alongside the new build going live.

## Future migrations

Generate new migrations against a development database with
`prisma migrate dev --name <change>`, commit the generated folder under
`prisma/migrations/`, and ship them with the same deploy step. CHECK
constraints and other raw-SQL changes Prisma cannot express belong in the
migration SQL by hand, as the audit-fixes migration does.
