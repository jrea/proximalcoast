import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const GUEST_COOKIE = "x-jerkstore-guest-id";

export function guestCookieValue(id: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Guest authentication is unavailable");
  const signature = createHmac("sha256", secret).update(`jerkstore-guest:${id}`).digest("base64url");
  return `${id}.${signature}`;
}

export function readGuestCookie(value: string | undefined) {
  if (!value || value.length > 200) return null;
  // The legacy bare-UUID bearer format is NO LONGER accepted. It was kept
  // "only during transition", but the UUID is the guest row's primary key
  // (stored as userId on the guest's insults), so it was never a secret —
  // anyone who learned one could impersonate that guest, burn their free
  // quota and rate their insults. Only HMAC-signed cookies are valid now;
  // guests holding an old cookie get a fresh signed identity next visit.
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const id = value.slice(0, dot);
  try {
    const expected = Buffer.from(guestCookieValue(id));
    const actual = Buffer.from(value);
    return expected.length === actual.length && timingSafeEqual(expected, actual) ? id : null;
  } catch {
    return null;
  }
}
