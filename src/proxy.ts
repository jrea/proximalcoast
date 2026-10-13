import { NextRequest, NextResponse } from "next/server";

const ACTIVE_SUBSITES = new Set([
  "backlinks",
  "bkd",
  "jerkstore",
  "overmake",
  "slice",
]);

export const config = {
  // Validate hosts before handling shared assets, APIs or redirects.
  matcher: "/:path*",
};

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  let hostname = (req.headers.get("host") || "").toLowerCase();

  // Remove port if present
  hostname = hostname.split(":")[0].replace(/\.$/, "");

  // Remove www. if present
  if (hostname.startsWith("www.")) {
    hostname = hostname.replace("www.", "");
  }

  const rootDomain = (process.env.ROOT_DOMAIN || "proximalcoast.com")
    .toLowerCase().split(":")[0].replace(/^www\./, "").replace(/\.$/, "");
  // Only Vercel's declared preview URLs may serve a review build directly.
  // Production and unrelated *.vercel.app hosts retain normal isolation.
  const isPreviewHost = process.env.VERCEL_ENV === "preview" &&
    [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
      .some(host => host?.toLowerCase() === hostname);
  const isRootHost = hostname === rootDomain || isPreviewHost;
  const currentHost = hostname.endsWith(`.${rootDomain}`)
    ? hostname.slice(0, -(rootDomain.length + 1))
    : "";

  if (!isRootHost && !ACTIVE_SUBSITES.has(currentHost)) {
    return new NextResponse(req.method === "HEAD" ? null : "Not Found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      },
    });
  }

  // Keep the public shortcut behind host validation, rather than in the
  // earlier next.config redirect layer where unknown hosts could reach it.
  if (/^\/jerkstore(?:\/|$)/i.test(url.pathname)) {
    const destination = new URL("https://jerkstore.proximalcoast.com");
    destination.pathname = url.pathname.slice("/jerkstore".length) || "/";
    destination.search = url.search;
    return NextResponse.redirect(destination, 308);
  }

  // Preserve the previous matcher exclusions for every active site, while
  // still letting their sitemap and robots handlers use subdomain routing.
  if (
    url.pathname !== "/sitemap.xml" &&
    url.pathname !== "/robots.txt" &&
    /^\/(?:_next\/|_static\/|[\w-]+\.\w+)/.test(url.pathname)
  ) {
    return NextResponse.next();
  }

  // If it's the root domain (e.g. proximalcoast.com or lvh.me) or www, show the main site
  if (isRootHost) {
    return NextResponse.next();
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // Routes that should be served from the main app even on subdomains.
  // Matching is on the pathname with a path-segment boundary: the old
  // prefix match ran against pathname+query with no boundary, so
  // /api/subscriptionXYZ, /api/portal-foo and /blogger were all treated
  // as global routes and any future subsite route sharing a prefix would
  // be silently shadowed.
  const GLOBAL_API_ROUTES = ["/api/auth", "/api/portal", "/api/webhooks", "/api/subscription", "/api/subscription-status", "/api/cancel-subscription", "/api/reactivate-subscription", "/api/update-subscription", "/api/cancel-downgrade", "/blog"];
  const isGlobalRoute = GLOBAL_API_ROUTES.some(
    route => url.pathname === route || url.pathname.startsWith(`${route}/`)
  );
  if (isGlobalRoute) {
    return NextResponse.rewrite(new URL(path, req.url));
  }

  // Only rewrite metadata files actually provided by the subsite.
  // Other subsites continue to use the root site's metadata routes.
  if (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
    const siteMetadataPaths: Record<string, string[]> = {
      jerkstore: ["/sitemap.xml", "/robots.txt"],
      slice: ["/sitemap.xml", "/robots.txt"],
    };

    if (siteMetadataPaths[currentHost]?.includes(url.pathname)) {
      return NextResponse.rewrite(new URL(`/sites/${currentHost}${path}`, req.url));
    }

    return NextResponse.next();
  }

  // A trailing slash on the internal site root triggers Next's canonical
  // redirect and exposes /sites/... as the browser's public URL.
  const sitePath = url.pathname === "/" ? path.slice(1) : path;
  return NextResponse.rewrite(new URL(`/sites/${currentHost}${sitePath}`, req.url));
}
