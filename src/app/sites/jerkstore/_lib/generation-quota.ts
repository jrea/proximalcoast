import "server-only";
import { prisma } from "@/lib/db";
import { CREDIT_COSTS, FREE_ROAST_LIMIT } from "../constants";

const WINDOW_MS = 24 * 60 * 60 * 1000;

export class GenerationLimitError extends Error {
  constructor(message: string, public status = 429, public retryAfter = 0) {
    super(message);
  }
}

// Reservations share the existing quota table. Namespaced account/browser
// keys prevent concurrent requests from spending the same free allowance.
export async function reserveGeneration({ userId, isGuest, ip, isEmail }: {
  userId: string; isGuest: boolean; ip: string; isEmail: boolean;
}) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const keys = isGuest ? [`network:${ip}`, `guest:${userId}`] : [`account:${userId}`];
  return prisma.$transaction(async (tx) => {
    const rows = [];
    for (const key of keys) {
      await tx.jerkstore_ip_tracking.upsert({ where: { ip: key }, update: {}, create: { ip: key, count: 0 } });
      await tx.jerkstore_ip_tracking.updateMany({
        where: { ip: key, createdAt: { lte: cutoff } },
        data: { count: 0, createdAt: now },
      });
      const row = await tx.jerkstore_ip_tracking.findUniqueOrThrow({ where: { ip: key } });
      rows.push(row);
    }
    const freeRemaining = Math.max(0, Math.min(...rows.map((row) => FREE_ROAST_LIMIT - row.count)));
    const exhausted = rows.filter(row => row.count >= FREE_ROAST_LIMIT);
    const resetAt = Math.max(...exhausted.map((row) => row.createdAt.getTime() + WINDOW_MS));
    let resultCount = isEmail ? 1 : CREDIT_COSTS.STANDARD_PACK;
    let paidCredits = isEmail ? CREDIT_COSTS.LONG_ROAST : Math.max(0, resultCount - freeRemaining);
    if (isGuest) {
      resultCount = Math.min(resultCount, freeRemaining);
      paidCredits = 0;
    } else {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } });
      // A visitor can always use their remaining free results. Never require
      // a purchase just to receive the advertised free allowance.
      if (!isEmail && user.credits < paidCredits) { resultCount = Math.min(resultCount, freeRemaining); paidCredits = 0; }
      if (isEmail && user.credits < paidCredits) throw new GenerationLimitError("Max Effort requires 2 credits. Visit /billing to get more.");
    }
    if (resultCount === 0) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000));
      throw new GenerationLimitError("Your free roast allowance is used. Sign in for credits or try again after the 24-hour window resets.", 429, retryAfter);
    }
    const freeResults = isEmail ? 0 : Math.min(resultCount, freeRemaining);
    for (const key of keys) {
      if (freeResults > 0) {
        const reserved = await tx.jerkstore_ip_tracking.updateMany({
          where: { ip: key, count: { lte: FREE_ROAST_LIMIT - freeResults } },
          data: { count: { increment: freeResults } },
        });
        if (reserved.count !== 1) throw new GenerationLimitError("Another roast is using your allowance. Wait for it to finish, then try again.");
      }
    }
    if (paidCredits > 0) {
      const charged = await tx.user.updateMany({
        where: { id: userId, credits: { gte: paidCredits } },
        data: { credits: { decrement: paidCredits } },
      });
      if (charged.count !== 1) throw new GenerationLimitError("Your credits changed while this request was starting. Refresh and try again.");
    }
    return { userId, windows: rows.map((row) => ({ key: row.ip, startedAt: row.createdAt })), freeResults, paidCredits, resultCount };
  });
}

export type GenerationReservation = Awaited<ReturnType<typeof reserveGeneration>>;

export async function refundGeneration(reservation: GenerationReservation) {
  await prisma.$transaction(async (tx) => {
    for (const { key, startedAt } of reservation.windows) {
      if (reservation.freeResults > 0) await tx.jerkstore_ip_tracking.updateMany({
        where: { ip: key, createdAt: startedAt, count: { gte: reservation.freeResults } },
        data: { count: { decrement: reservation.freeResults } },
      });
    }
    if (reservation.paidCredits > 0) await tx.user.update({
      where: { id: reservation.userId }, data: { credits: { increment: reservation.paidCredits } },
    });
  });
}
