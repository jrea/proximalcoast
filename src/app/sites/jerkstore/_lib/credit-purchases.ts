import "server-only";
import { prisma } from "@/lib/db";

export const CREDIT_FULFILLMENT_VERSION = "ledger-v1";

export async function grantPurchasedCredits(paymentIntentId: string, userId: string, credits: number) {
  if (!paymentIntentId.startsWith("pi_") || !userId || !Number.isSafeInteger(credits) || credits < 1 || credits > 100000) throw new Error("Invalid credit purchase receipt");
  try {
    await prisma.$transaction(async (tx) => {
      await tx.jerkstore_credit_purchase.create({ data: { paymentIntentId, userId, credits } });
      await tx.user.update({ where: { id: userId }, data: { credits: { increment: credits } } });
    });
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return false;
    throw error;
  }
}
