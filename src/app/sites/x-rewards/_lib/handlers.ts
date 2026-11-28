import { readFile } from "node:fs/promises";
import path from "node:path";
import type React from "react";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { csvText, loadData } from "../../../../../sideprojects/x-rewards/lib/data.mjs";
import { allPublicProofs, csvLeaderboard, leaderboard } from "../../../../../sideprojects/x-rewards/lib/leaderboard.mjs";
import { verifiedRateLabel } from "../../../../../sideprojects/x-rewards/public/public-proof.mjs";
import { benchmarkObservations, rangeFor } from "../../../../../sideprojects/x-rewards/public/metrics.mjs";

export async function handleLeaderboard(req: NextRequest, isHead: boolean, forceCsv = false) {
  const url = req.nextUrl;
  const cycle = url.searchParams.get("cycle") || "";
  const csv = forceCsv || url.pathname.endsWith(".csv") || url.searchParams.get("format") === "csv";

  if (cycle && !/^\d{4}-\d{2}-\d{2}$/.test(cycle)) {
    return NextResponse.json({ error: "Use YYYY-MM-DD for cycle." }, { status: 400 });
  }

  try {
    const result = await leaderboard(cycle);
    if (cycle && !result.cycles.includes(cycle)) {
      return NextResponse.json({ error: "Unknown payout cycle." }, { status: 404 });
    }
    const headers: Record<string, string> = {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      "Content-Type": csv ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
    };
    if (csv) {
      headers["Content-Disposition"] = 'attachment; filename="x-rewards-leaderboard.csv"';
    }
    if (isHead) return new NextResponse(null, { status: 200, headers });
    if (csv) return new NextResponse(csvLeaderboard(result.rows), { status: 200, headers });
    return NextResponse.json(result, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Leaderboard temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function handlePayouts(isHead: boolean) {
  try {
    const data = await loadData();
    const headers = {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="x-original-content-rewards-payouts.csv"',
    };
    return new NextResponse(isHead ? null : csvText(data.payouts), { status: 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Payout data is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

const logo = {
  type: "svg",
  props: {
    width: 45,
    height: 46,
    viewBox: "0 0 1200 1227",
    children: {
      type: "path",
      props: {
        d: "M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z",
        fill: "#fff",
      },
    },
  },
};

const el = (type: string, style: Record<string, unknown>, children: unknown) => ({
  type,
  props: { style, children },
});

export async function handleOg(isHead: boolean) {
  try {
    const data = await loadData();
    const { rows } = await allPublicProofs(data);
    const { observations, payouts } = data;
    const range = rangeFor(benchmarkObservations(observations, payouts, rows), "verified");
    if (!range) {
      return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const value = verifiedRateLabel(range);
    if (!value) {
      return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const fontPath = path.join(process.cwd(), "sideprojects/x-rewards/data/fonts/inter-latin-900-normal.woff");
    const font = await readFile(fontPath);
    const art = el(
      "div",
      {
        display: "flex",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        padding: "62px 72px",
        background: "#040608",
        color: "#f2f8ff",
      },
      [
        el(
          "div",
          {
            display: "flex",
            position: "absolute",
            width: 950,
            height: 770,
            right: -225,
            top: -52,
            backgroundImage: "radial-gradient(ellipse at center, #0a3457 0%, #081b2b 43%, #040608 72%)",
          },
          "",
        ),
        ...[590, 470, 350].map((size) =>
          el(
            "div",
            {
              position: "absolute",
              display: "flex",
              width: size,
              height: size,
              top: 316 - size / 2,
              right: 215 - size / 2,
              border: "1px solid #16314a",
              borderRadius: "50%",
            },
            "",
          ),
        ),
        el("div", { display: "flex", alignItems: "center", gap: 19, marginBottom: 27 }, [
          logo,
          el("span", { fontSize: 43, fontFamily: "Inter", fontWeight: 900 }, "X actually pays."),
        ]),
        el(
          "span",
          {
            fontFamily: "Inter",
            fontSize: value.length > 14 ? 110 : 154,
            fontWeight: 900,
            color: "#55bdff",
            letterSpacing: -8,
            whiteSpace: "nowrap",
            lineHeight: 1.04,
          },
          value,
        ),
        el("span", { fontSize: 40, color: "#eff7ff", marginTop: 26 }, "per 1,000 verified impressions"),
      ],
    );

    const img = new ImageResponse(art as unknown as React.ReactElement, {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: font, weight: 900, style: "normal" }],
    });
    const buffer = Buffer.from(await img.arrayBuffer());
    return new NextResponse(isHead ? null : buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
