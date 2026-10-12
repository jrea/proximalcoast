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
  // Existing guests received random UUID bearer cookies. Accept those only
  // during transition; callers must still verify that the row is a guest.
  // All newly issued cookies are signed, and account IDs are never guests.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return value;
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
