import { NextResponse } from "next/server";
import { loadData } from "../../../../../../sideprojects/x-rewards/lib/data.mjs";
import { allPublicProofs } from "../../../../../../sideprojects/x-rewards/lib/leaderboard.mjs";

export const runtime = "nodejs";

async function handle(isHead: boolean) {
  try {
    const loaded = await loadData();
    const { approvals, ...data } = loaded as Record<string, unknown>;
    const proofs = await allPublicProofs({ ...data, approvals });
    const headers = {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      "Content-Type": "application/json; charset=utf-8",
    };
    if (isHead) return new NextResponse(null, { status: 200, headers });
    return NextResponse.json({ ...data, proofs }, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Payout data is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function GET() {
  return handle(false);
}

export async function HEAD() {
  return handle(true);
}
