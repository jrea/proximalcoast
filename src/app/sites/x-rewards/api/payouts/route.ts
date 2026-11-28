import { handlePayouts } from "../../_lib/handlers";

export const runtime = "nodejs";

export async function GET() {
  return handlePayouts(false);
}

export async function HEAD() {
  return handlePayouts(true);
}
