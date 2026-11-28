import { handleOg } from "../../_lib/handlers";

export const runtime = "nodejs";

export async function GET() {
  return handleOg(false);
}

export async function HEAD() {
  return handleOg(true);
}
