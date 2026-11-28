import { NextRequest } from "next/server";
import { handleLeaderboard } from "../../_lib/handlers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return handleLeaderboard(req, false);
}

export async function HEAD(req: NextRequest) {
  return handleLeaderboard(req, true);
}
