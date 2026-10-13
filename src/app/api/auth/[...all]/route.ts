import { authConfig } from "@/lib/auth";
import { betterAuth } from "better-auth";
import { NextRequest } from "next/server";

/**
 * The auth handler needs a per-subdomain baseURL so social callbacks use
 * the current site. Two hardening rules apply:
 *  1. The Host header is only trusted when it is on the same allowlist
 *     the proxy enforces (the root domain, its subsites, or local dev
 *     hosts). Previously ANY Host value flowed into OAuth base-URL
 *     construction — the proxy was the only thing standing in the way.
 *  2. Auth instances are memoized per baseURL instead of rebuilding the
 *     whole Better Auth instance (adapter + plugins) on every request.
 */
const SUBSITE_LABELS = new Set([
  "jerkstore",
  "bkd",
  "backlinks",
  "overmake",
  "slice",
  "www",
]);

function isAllowedHost(host: string): boolean {
  const hostname = host.split(":")[0].toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "lvh.me" ||
    hostname.endsWith(".lvh.me")
  ) {
    return process.env.NODE_ENV !== "production";
  }
  const rootDomain = (process.env.ROOT_DOMAIN || "proximalcoast.com")
    .split(":")[0]
    .toLowerCase();
  if (hostname === rootDomain) return true;
  if (hostname.endsWith(`.${rootDomain}`)) {
    const label = hostname.slice(0, -(rootDomain.length + 1));
    return SUBSITE_LABELS.has(label);
  }
  return false;
}

function resolveBaseURL(req: NextRequest): string {
  const host = req.headers.get("host");
  if (host && isAllowedHost(host)) {
    return `${new URL(req.url).protocol}//${host}`;
  }
  if (host) {
    console.warn(`[Auth] Ignoring non-allowlisted Host header: ${host}`);
  }
  return process.env.BETTER_AUTH_URL || new URL(req.url).origin;
}

function createAuth(baseURL: string) {
  return betterAuth({ ...authConfig, baseURL });
}

type AuthInstance = ReturnType<typeof createAuth>;

const instances = new Map<string, AuthInstance>();

function authForBaseURL(baseURL: string): AuthInstance {
  let instance = instances.get(baseURL);
  if (!instance) {
    instance = createAuth(baseURL);
    instances.set(baseURL, instance);
  }
  return instance;
}

const handle = async (req: NextRequest) =>
  authForBaseURL(resolveBaseURL(req)).handler(req);

export const GET = handle;
export const POST = handle;
