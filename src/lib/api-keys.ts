import "server-only";
import { prisma } from "./db";
import crypto from "crypto";

/**
 * THE way to verify a Jerkstore API key. Every consumer (generation
 * routes, Discord, getAuthContext) goes through here so the rules can
 * never drift apart again — previously each entry point implemented its
 * own lookup: one demanded an organizationId (so org-less keys could
 * never work), none checked expiry or revocation, and none updated
 * lastUsedAt.
 *
 * Rules:
 * - keys are stored as SHA-256 hashes; the raw key is shown once at
 *   creation and never stored
 * - a revoked key (revokedAt set) is rejected
 * - an expired key (expiresAt in the past) is rejected; keys created
 *   before expiry existed have expiresAt null and do not expire
 * - org-less keys are valid: organizationId is data, not a requirement
 * - successful verification stamps lastUsedAt
 */
export async function verifyApiKey(rawKey: string) {
  if (!rawKey) return null;
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  const record = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) return null;

  // Best-effort usage stamp; never fail auth on a stamp error.
  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return record;
}
