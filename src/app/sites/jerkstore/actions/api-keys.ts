'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from 'crypto';

export async function getApiKeys() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  // Only add the organization clause when there IS an active
  // organization. With activeOrganizationId null, Prisma matches rows
  // where organizationId IS NULL — and org-less keys are stored with a
  // null organizationId — so the old OR returned every org-less user's
  // key metadata to anyone with no active org.
  const orgId = session.session.activeOrganizationId;
  const keys = await prisma.apiKey.findMany({
    where: {
      AND: [
        {
          OR: orgId
            ? [
                { userId: session.user.id },
                { organizationId: orgId },
              ]
            : [{ userId: session.user.id }],
        },
        // Only usable keys are listed as active: revoked keys and expired
        // keys must not be presented as if they still work.
        { revokedAt: null },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      lastUsedAt: true,
      createdAt: true,
      expiresAt: true,
      revokedAt: true,
      organizationId: true,
      // Never return the key/hash
    }
  });

  return keys;
}

export async function createApiKey(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Generate a random key
  const rawKey = `jk_${crypto.randomUUID().replace(/-/g, '')}`;

  // Hash it for storage
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

  await prisma.apiKey.create({
    data: {
      key: hashedKey,
      name: name || "Untitled Token",
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId, // Automatically scope to active organization if present
      // Keys are powerful, permanent-until-now bearer credentials; new
      // keys expire after one year by default (renew by creating a new
      // key). Existing keys keep working until revoked.
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }
  });

  revalidatePath('/sites/jerkstore');
  // We return the RAW key to the user ONE TIME
  return rawKey;
}

export async function revokeApiKey(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Ensure deployment ownership
  const key = await prisma.apiKey.findUnique({
    where: { id },
  });

  if (!key || key.userId !== session.user.id) {
    throw new Error("Unauthorized or key not found");
  }

  // Revocation is a state, not a deletion: the row stays as the audit
  // trail of the key's existence, and every verifier rejects revoked keys.
  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  revalidatePath('/sites/jerkstore');
}
