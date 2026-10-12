// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GET as jerkstoreRobots } from "./robots.txt/route";
import { GET as sliceRobots } from "../slice/robots.txt/route";
import sitemap from "./sitemap";

describe("subsite crawler routes", () => {
  it.each([
    { site: "jerkstore", getRobots: jerkstoreRobots },
    { site: "slice", getRobots: sliceRobots },
  ])("serves $site robots as text with its own sitemap and renderable assets", async ({ site, getRobots }) => {
    const response = getRobots();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(body).toContain("User-agent: *\nAllow: /\n");
    expect(body).toContain("Disallow: /api/\n");
    expect(body).toContain(`Sitemap: https://${site}.proximalcoast.com/sitemap.xml\n`);
    // Crawlers must load assets and read the noindex on account/utility HTML.
    expect(body).not.toMatch(/^Disallow: \/(?:_next|app|billing|sign-in|access|debug-cards)/m);
  });

  it("lists only Jerkstore's canonical public pages without fabricated revision dates", () => {
    const pages = sitemap();

    expect(pages.map((page) => page.url).sort()).toEqual([
      "https://jerkstore.proximalcoast.com",
      "https://jerkstore.proximalcoast.com/privacy",
      "https://jerkstore.proximalcoast.com/terms",
    ]);
    expect(pages.every((page) => page.lastModified === undefined)).toBe(true);
  });
});
