import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host");

  // Get the custom domain or subdomain
  // e.g. "jerkstore.localhost:3000" -> "jerkstore"
  // e.g. "jerkstore.proximalcoast.com" -> "jerkstore"
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

  // Simplify for now: Just handle local dev and production
  const rootDomain = process.env.ROOT_DOMAIN;
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname!.replace(`.${rootDomain}`, "")
      : hostname!.replace(".localhost:3000", "").replace(`.${rootDomain}`, "");

  // If it's the root domain (e.g. proximalcoast.com or localhost:3000), show the App Factory implementation/admin
  if (currentHost === rootDomain || currentHost === "localhost:3000") {
    // Rewrite to /home (or whatever the main marketing/admin site is)
    // For now, we'll just keep it as is, or maybe rewrite to /app if we have a dashboard there
    return NextResponse.next();
  }

  // Otherwise, it's a tenant/app subdomain (e.g. "jerkstore")

  // Special case: Auth routes should hit the main app router, not the site router
  if (path.startsWith("/api/auth")) {
    return NextResponse.rewrite(new URL(path, req.url));
  }

  // Rewrite to /sites/[currentHost]/[path]
  return NextResponse.rewrite(new URL(`/sites/${currentHost}${path}`, req.url));
}
