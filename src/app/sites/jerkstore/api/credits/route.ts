import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return Response.json({ error: "Sign in required" }, { status: 401, headers });
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } });
    if (!user) return Response.json({ error: "Account unavailable" }, { status: 404, headers });
    return Response.json({ credits: user.credits }, { headers });
  } catch {
    return Response.json({ error: "Credit balance temporarily unavailable" }, { status: 503, headers });
  }
}
