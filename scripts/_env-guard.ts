/**
 * Shared safety guard for ops/test scripts.
 *
 * These scripts load .env.local, which may point at PRODUCTION. Any
 * script that writes (or prints secrets/PII) must refuse to run unless
 * the database is local, or the operator explicitly opts in with
 * ALLOW_NONLOCAL_DB=1 after checking what they are pointed at.
 */
export function assertLocalDatabase(scriptName: string): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(`[${scriptName}] DATABASE_URL is not set.`);
    process.exit(1);
  }
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    // Unparseable URL — treat as non-local.
  }
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(host) && host !== "";
  if (!isLocal && process.env.ALLOW_NONLOCAL_DB !== "1") {
    console.error(
      `[${scriptName}] Refusing to run: DATABASE_URL points at non-local host "${host || "?"}". ` +
      `If this is really the database you intend, re-run with ALLOW_NONLOCAL_DB=1.`
    );
    process.exit(1);
  }
}
