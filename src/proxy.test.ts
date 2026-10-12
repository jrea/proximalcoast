// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  getRewrittenUrl,
  isRewrite,
  unstable_doesMiddlewareMatch,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";
import proxy, { config } from "./proxy";
import nextConfig from "../next.config";

function requestFor(host: string, path: string, method = "GET") {
  return new NextRequest(`https://${host}${path}`, { method, headers: { host } });
}

beforeEach(() => {
  vi.stubEnv("ROOT_DOMAIN", "proximalcoast.com");
  vi.stubEnv("VERCEL_ENV", "production");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("active subsite proxy", () => {
  it("serves only the declared Vercel preview URLs as portfolio hosts", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "proximalcoast-review-jreas-projects.vercel.app");
    vi.stubEnv("VERCEL_BRANCH_URL", "proximalcoast-git-review-jreas-projects.vercel.app");
    for (const host of [process.env.VERCEL_URL!, process.env.VERCEL_BRANCH_URL!]) {
      const response = await proxy(requestFor(host, "/sites/jerkstore"));
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
    const unrelated = await proxy(requestFor("unrelated.vercel.app", "/"));
    expect(unrelated.status).toBe(404);
  });

  it("does not grant a Vercel URL an exception in production", async () => {
    vi.stubEnv("VERCEL_URL", "proximalcoast-production.vercel.app");
    const response = await proxy(requestFor(process.env.VERCEL_URL!, "/api/auth/get-session"));
    expect(response.status).toBe(404);
  });

  it.each(["backlinks", "bkd", "jerkstore", "overmake", "slice"])(
    "serves the existing %s site root without a trailing-slash redirect",
    async (site) => {
      const host = `${site}.proximalcoast.com`;
      const response = await proxy(requestFor(host, "/"));
      expect(getRewrittenUrl(response)).toBe(`https://${host}/sites/${site}`);
    },
  );

  it("preserves local site routing and root query parameters", async () => {
    vi.stubEnv("ROOT_DOMAIN", "localhost:3106");
    const host = "jerkstore.localhost:3106";
    const response = await proxy(requestFor(host, "/?ref=home&view=examples"));
    expect(getRewrittenUrl(response)).toBe(`https://${host}/sites/jerkstore?ref=home&view=examples`);
  });

  it.each(["/sitemap.xml", "/robots.txt", "/sitemap.xml?version=1"])(
    "runs for metadata path %s",
    (path) => {
      expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(true);
    },
  );

  it.each([
    "/icon.png",
    "/apple-icon.png",
    "/favicon.ico",
    "/og-slice.png",
    "/proximal-coast-logo-final.svg",
    "/_next/static/chunks/app.js",
    "/_static/shared.css",
  ])("preserves shared asset %s on active sites", async (path) => {
    expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(true);
    for (const host of ["proximalcoast.com", "jerkstore.proximalcoast.com", "slice.proximalcoast.com", "bkd.proximalcoast.com"]) {
      const response = await proxy(requestFor(host, path));
      expect(isRewrite(response)).toBe(false);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
  });

  it.each([
    ["jerkstore", "/sitemap.xml"],
    ["jerkstore", "/robots.txt"],
    ["slice", "/sitemap.xml"],
    ["slice", "/robots.txt"],
  ])("serves %s's existing %s route", async (site, path) => {
    const host = `${site}.proximalcoast.com`;
    const response = await proxy(requestFor(host, path));
    expect(getRewrittenUrl(response)).toBe(`https://${host}/sites/${site}${path}`);
  });

  it("preserves metadata query parameters", async () => {
    const response = await proxy(requestFor("slice.proximalcoast.com", "/sitemap.xml?version=1"));
    expect(getRewrittenUrl(response)).toBe("https://slice.proximalcoast.com/sites/slice/sitemap.xml?version=1");
  });

  it.each([
    ["bkd", "/sitemap.xml"],
    ["bkd", "/robots.txt"],
    ["overmake", "/sitemap.xml"],
    ["backlinks", "/robots.txt"],
  ])("keeps the root metadata fallback when %s has no %s", async (site, path) => {
    const response = await proxy(requestFor(`${site}.proximalcoast.com`, path));
    expect(isRewrite(response)).toBe(false);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["proximalcoast.com", "www.proximalcoast.com", "PROXIMALCOAST.COM", "proximalcoast.com."])(
    "keeps the portfolio and its metadata on %s",
    async (host) => {
      for (const path of ["/", "/sitemap.xml"]) {
        const response = await proxy(requestFor(host, path));
        expect(isRewrite(response)).toBe(false);
        expect(response.headers.get("x-middleware-next")).toBe("1");
      }
    },
  );

  it.each([
    ["jerkstore", "/app?tab=roasts", "/sites/jerkstore/app?tab=roasts"],
    ["overmake", "/api/generate-estimate", "/sites/overmake/api/generate-estimate"],
    ["jerkstore", "/api/auth/get-session", "/api/auth/get-session"],
    ["jerkstore", "/api/webhooks/stripe", "/api/webhooks/stripe"],
    ["bkd", "/api/complete-account", "/sites/bkd/api/complete-account"],
    ["bkd", "/api/checkout", "/sites/bkd/api/checkout"],
    ["slice", "/blog/archive/slice-launch", "/blog/archive/slice-launch"],
  ])("preserves %s routing for %s", async (site, path, destination) => {
    const host = `${site}.proximalcoast.com`;
    const response = await proxy(requestFor(host, path));
    expect(getRewrittenUrl(response)).toBe(`https://${host}${destination}`);
  });

  it.each(["proximalcoast.com", "www.proximalcoast.com", "bkd.proximalcoast.com"])(
    "preserves the public Jerkstore shortcut on %s",
    async (host) => {
      for (const [path, destination] of [
        ["/jerkstore", "https://jerkstore.proximalcoast.com/"],
        ["/jerkstore/funny-insults?source=portfolio", "https://jerkstore.proximalcoast.com/funny-insults?source=portfolio"],
      ]) {
        const response = await proxy(requestFor(host, path));
        expect(response.status).toBe(308);
        expect(response.headers.get("location")).toBe(destination);
      }
    },
  );
});

describe("unknown host isolation", () => {
  async function expectNotFound(host: string, path: string, method = "GET") {
    expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(true);
    const response = await proxy(requestFor(host, path, method));
    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.has("location")).toBe(false);
    expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    expect(response.headers.has("x-middleware-next")).toBe(false);
    expect(response.headers.has("set-cookie")).toBe(false);
    expect(await response.text()).toBe(method === "HEAD" ? "" : "Not Found\n");
  }

  it.each([
    "/",
    "/app",
    "/sign/private-document-id?token=private-access-token",
    "/api/auth/get-session",
    "/api/webhooks/stripe",
    "/api/documents/private-document-id/download",
    "/blog/archive/a-post",
    "/sites/bkd/api/documents/private-document-id",
    "/jerkstore",
    "/jerkstore/private-document-id?token=private-access-token",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.ico",
    "/_next/static/chunks/app.js",
    "/_next/image?url=%2Fprivate-document-id",
    "/_static/shared.css",
    "/document.pdf",
  ])("does not expose any shared route to an unknown site: %s", async (path) => {
    await expectNotFound("unknown.proximalcoast.com", path);
  });

  it.each([
    "unknown.proximalcoast.com",
    "www.unknown.proximalcoast.com",
    "UNKNOWN.PROXIMALCOAST.COM",
    "unknown.proximalcoast.com.",
    "jerkstore.example.com",
    "jerkstore.proximalcoast.com.example.com",
    "nested.jerkstore.proximalcoast.com",
  ])("requires an exact active subdomain of the configured domain: %s", async (host) => {
    await expectNotFound(host, "/api/auth/get-session");
  });

  it("applies the same isolation to local preview hosts", async () => {
    vi.stubEnv("ROOT_DOMAIN", "localhost:3106");
    await expectNotFound("unknown.localhost:3106", "/favicon.ico");
    await expectNotFound("jerkstore.example.com", "/blog");
  });

  it.each(["HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])(
    "keeps unknown-host %s requests inert",
    async (method) => {
      await expectNotFound("unknown.proximalcoast.com", "/api/auth/get-session", method);
    },
  );

  it("has no earlier config redirect that can forward unknown hosts", async () => {
    for (const path of ["/jerkstore", "/jerkstore/private-document-id?token=private-access-token"]) {
      const response = await unstable_getResponseFromNextConfig({
        url: `https://unknown.proximalcoast.com${path}`,
        headers: { host: "unknown.proximalcoast.com" },
        nextConfig,
      });
      expect(response.headers.has("location")).toBe(false);
      await expectNotFound("unknown.proximalcoast.com", path);
    }
  });
});
