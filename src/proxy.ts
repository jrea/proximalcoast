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
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.${rootDomain}`, "")
      : hostname.replace(`.${rootDomain}`, "");

  // If it's the root domain (e.g. proximalcoast.com or lvh.me), show the App Factory implementation/admin
  if (hostname === rootDomain) {
    return NextResponse.next();
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
    }`;
  const GLOBAL_API_ROUTES = ["/api/auth", "/api/checkout", "/api/portal", "/api/webhooks"];
  if (GLOBAL_API_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.rewrite(new URL(path, req.url));
  }

  // Rewrite to /sites/[currentHost]/[path]
  return NextResponse.rewrite(new URL(`/sites/${currentHost}${path}`, req.url));
}
