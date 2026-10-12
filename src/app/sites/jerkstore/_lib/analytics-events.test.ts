import { describe, expect, it } from "vitest";
import { analyticsUrl, googleAnalyticsEvent, safeAnalyticsProperties } from "./analytics-events";

describe("Jerkstore conversion events", () => {
  it("excludes topic, result text, email, card fields and raw errors", () => {
    expect(safeAnalyticsProperties({ topic: "private", roast: "private", email: "private@example.com", card: "private", error: "private", word: "private", language: "English", isEmail: false })).toEqual({ site: "jerkstore", language: "English", isEmail: false });
  });
  it("separates attempted generation from completed generation", () => {
    expect(googleAnalyticsEvent("insult_generation_started")?.name).toBe("roast_started");
    expect(googleAnalyticsEvent("insult_generation_completed", { resultCount: 3 })?.name).toBe("roast_generated");
  });
  it("counts successful signup separately from attempts and returning logins", () => {
    expect(googleAnalyticsEvent("auth_attempt", { type: "signup" })?.name).toBe("auth_attempt");
    expect(googleAnalyticsEvent("auth_completed", { type: "signup", provider: "google" })).toMatchObject({ name: "sign_up", params: { method: "google" } });
    expect(googleAnalyticsEvent("auth_completed", { type: "login" })?.name).toBe("login");
  });
  it("uses GA4 transaction IDs and actual pack dollars, not credits or cents", () => {
    expect(googleAnalyticsEvent("checkout_payment_completed", { packageId: "pkg_pro", transactionId: "pi_paid", value: 275 })).toMatchObject({ name: "purchase", params: { transaction_id: "pi_paid", value: 5, currency: "USD", items: [{ item_id: "pkg_pro", price: 5, quantity: 1 }] } });
    expect(googleAnalyticsEvent("checkout_started", { packageId: "pkg_basic" })?.name).toBe("begin_checkout");
  });
  it.each([{ packageId: "pkg_unknown", transactionId: "pi_paid" }, { packageId: "pkg_pro" }, { packageId: "pkg_pro", transactionId: "invalid" }])("does not emit a purchase with invalid confirmation: %s", properties => {
    expect(googleAnalyticsEvent("checkout_payment_completed", properties)).toBeNull();
  });
  it("keeps campaign attribution and removes auth, payment and topic URL parameters", () => {
    expect(analyticsUrl("https://jerkstore.proximalcoast.com/billing?payment_intent_client_secret=private&topic=private&auth_result=signup&utm_source=google&utm_medium=organic#private")).toBe("https://jerkstore.proximalcoast.com/billing?utm_source=google&utm_medium=organic");
    expect(analyticsUrl("invalid")).toBe("");
  });
});
