import { NextRequest } from "next/server";
import { auth } from "./auth";
import { headers } from "next/headers";
import { verifyApiKey } from "./api-keys";

export interface AuthContext {
  userId: string;
  organizationId: string | null;
  isApiKey: boolean;
}

/**
 * Unified helper to get auth context from either a browser session or an API key.
 * Prioritizes API keys if present in Authorization header.
 *
 * API-key verification is delegated to verifyApiKey (src/lib/api-keys.ts),
 * the single implementation every consumer shares: org-less keys work,
 * revoked/expired keys are rejected, lastUsedAt is stamped.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  // 1. Check API Key
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const apiKeyRaw = authHeader.split(" ")[1];
    const keyRecord = await verifyApiKey(apiKeyRaw);

    if (keyRecord) {
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
