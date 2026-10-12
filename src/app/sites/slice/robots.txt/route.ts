import robots from "../robots";

export const dynamic = "force-static";

// Next only discovers robots.ts at the app root. The subdomain proxy needs
// this explicit route, with policy kept in the existing robots helper.
export function GET() {
  const { rules, sitemap } = robots();
  const body = [
    `User-agent: ${rules.userAgent}`,
    `Allow: ${rules.allow}`,
    ...rules.disallow.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
