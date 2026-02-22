import { NextRequest } from "next/server";
import { auth } from "./auth";
import { prisma } from "./db";
import { headers } from "next/headers";
import crypto from "crypto";

export interface AuthContext {
  userId: string;
  organizationId: string;
  isApiKey: boolean;
}

/**
 * Unified helper to get auth context from either a browser session or an API key.
 * Prioritizes API keys if present in Authorization header.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  // 1. Check API Key
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const apiKeyRaw = authHeader.split(" ")[1];
    const hashedKey = crypto.createHash('sha256').update(apiKeyRaw).digest('hex');

    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      select: {
        userId: true,
        organizationId: true
      }
    });

    if (keyRecord && keyRecord.organizationId) {
      return {
        userId: keyRecord.userId,
        organizationId: keyRecord.organizationId,
        isApiKey: true
      };
    }
  }

  // 2. Check Browser Session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user && session.session.activeOrganizationId) {
    return {
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId,
      isApiKey: false
    };
  }

  return null;
}
