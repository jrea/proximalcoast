import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { handleLeaderboard, handleOg, handlePayouts } from "../_lib/handlers";

export const runtime = "nodejs";

const PUBLIC_ROOT = path.join(process.cwd(), "sideprojects/x-rewards/public");

const STATIC_ASSETS: Record<string, [string, string]> = {
  "": ["index.html", "text/html; charset=utf-8"],
  "index.html": ["index.html", "text/html; charset=utf-8"],
  leaderboard: ["index.html", "text/html; charset=utf-8"],
  receipts: ["receipts.html", "text/html; charset=utf-8"],
  "receipts.html": ["receipts.html", "text/html; charset=utf-8"],
  "app.mjs": ["app.mjs", "text/javascript; charset=utf-8"],
  "metrics.mjs": ["metrics.mjs", "text/javascript; charset=utf-8"],
  "public-proof.mjs": ["public-proof.mjs", "text/javascript; charset=utf-8"],
  "submit.mjs": ["submit.mjs", "text/javascript; charset=utf-8"],
  "submit.css": ["submit.css", "text/css; charset=utf-8"],
  "methodology.txt": ["methodology.txt", "text/plain; charset=utf-8"],
  "favicon.svg": ["favicon.svg", "image/svg+xml"],
  "proximal-coast-favicon.ico": ["proximal-coast-favicon.ico", "image/x-icon"],
  "proximal-coast-icon-v2.svg": ["proximal-coast-icon-v2.svg", "image/svg+xml"],
  "proximal-coast-icon-v3.svg": ["proximal-coast-icon-v3.svg", "image/svg+xml"],
  "proximal-coast-mark.svg": ["proximal-coast-mark.svg", "image/svg+xml"],
};

async function handle(
  req: NextRequest,
  paramsPromise: Promise<{ slug?: string[] }>,
  isHead: boolean,
) {
  const { slug } = await paramsPromise;
  const relPath = (slug ?? []).join("/");

  if (relPath === "payouts.csv") return handlePayouts(isHead);
  if (relPath === "leaderboard.csv") return handleLeaderboard(req, isHead, true);
  if (relPath === "og.png") return handleOg(isHead);

  const asset = STATIC_ASSETS[relPath];
  if (!asset) {
    return new NextResponse(isHead ? null : "Not Found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const [filename, contentType] = asset;
    const bytes = await readFile(path.join(PUBLIC_ROOT, filename));
    return new NextResponse(isHead ? null : bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": contentType.startsWith("text/html")
          ? "public, s-maxage=60, stale-while-revalidate=300"
          : "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  return handle(req, context.params, false);
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  return handle(req, context.params, true);
}
