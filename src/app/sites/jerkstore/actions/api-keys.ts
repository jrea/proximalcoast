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

  const keys = await prisma.apiKey.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { organizationId: session.session.activeOrganizationId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      lastUsedAt: true,
      createdAt: true,
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

  await prisma.apiKey.delete({
    where: { id },
  });

  revalidatePath('/sites/jerkstore');
}
