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
  let hostname = req.headers.get("host") || "";

  // Remove port if present
  hostname = hostname.split(":")[0];

  const rootDomain = process.env.ROOT_DOMAIN?.split(":")[0];

  console.log(rootDomain, 'wtf?', hostname)
  // If it's the root domain (e.g. proximalcoast.com or lvh.me) or www, show the main site
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return NextResponse.next();
  }

  const currentHost = hostname.replace(`.${rootDomain}`, "");

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // Routes that should be served from the main app even on subdomains
  const GLOBAL_API_ROUTES = ["/api/auth", "/api/checkout", "/api/portal", "/api/webhooks", "/api/subscription", "/api/cancel-subscription", "/api/reactivate-subscription", "/api/update-subscription", "/api/cancel-downgrade"];
  if (GLOBAL_API_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.rewrite(new URL(path, req.url));
  }

  // Rewrite to /sites/${currentHost}${path}
  return NextResponse.rewrite(new URL(`/sites/${currentHost}${path}`, req.url));
}
