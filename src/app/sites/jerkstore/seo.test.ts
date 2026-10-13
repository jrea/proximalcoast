// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GET as jerkstoreRobots } from "./robots.txt/route";
import { GET as sliceRobots } from "../slice/robots.txt/route";
import sitemap from "./sitemap";
import { LANGUAGE_PAGES } from "./_lib/language-pages";
import { languagePath } from "./_lib/language-seo";
import { PREMIUM_LANGUAGES } from "./constants";

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
      "https://jerkstore.proximalcoast.com/languages",
      "https://jerkstore.proximalcoast.com/privacy",
      "https://jerkstore.proximalcoast.com/terms",
      ...LANGUAGE_PAGES.map(language => `https://jerkstore.proximalcoast.com${languagePath(language)}`),
    ].sort());
    expect(pages.every((page) => page.lastModified === undefined)).toBe(true);
    expect(new Set(pages.map(page => page.url)).size).toBe(pages.length);
  });

  it("includes a discoverable page for every supported language and creative mode", () => {
    const languagePages = LANGUAGE_PAGES.map(language => language.value).sort();
    const supportedLanguages = [...new Set(PREMIUM_LANGUAGES.map(language => language.value))].sort();

    expect(languagePages).toEqual(supportedLanguages);
    expect(LANGUAGE_PAGES.every(language => /^\/ai-insults\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(languagePath(language)))).toBe(true);
  });
});
