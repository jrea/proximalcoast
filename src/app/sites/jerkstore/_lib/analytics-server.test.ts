import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { capturePurchaseConversion } from "./analytics-server";

const { callbacks, capture, shutdown } = vi.hoisted(() => ({ callbacks: [] as Array<() => Promise<void>>, capture: vi.fn(), shutdown: vi.fn(async () => {}) }));
vi.mock("next/server", () => ({ after: (callback: () => Promise<void>) => callbacks.push(callback) }));
vi.mock("posthog-node", () => ({ PostHog: class { capture = capture; shutdown = shutdown; } }));

const paid = { id: "pi_paid", created: 1700000000, livemode: true, status: "succeeded", amount_received: 500, currency: "usd", metadata: { siteSlug: "jerkstore", type: "credits_purchase", userId: "user-id", packageId: "pkg_pro", creditsAmount: "275" } } as unknown as Stripe.PaymentIntent;
beforeEach(() => { callbacks.length = 0; vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "test-only-not-a-real-key"); shutdown.mockResolvedValue(undefined); });
afterEach(() => vi.unstubAllEnvs());

describe("server-confirmed purchase conversion", () => {
  it("records paid revenue after the response and flushes before shutdown", async () => {
    capturePurchaseConversion(paid, 1700000001);
    expect(capture).not.toHaveBeenCalled();
    await callbacks[0]();
    expect(capture).toHaveBeenCalledWith(expect.objectContaining({ distinctId: "user-id", event: "credit_purchase_completed", timestamp: new Date(1700000001000), properties: { site: "jerkstore", currency: "USD", $revenue: 5, value: 5, credits: 275, packageId: "pkg_pro", source: "stripe_webhook" } }));
    expect(shutdown).toHaveBeenCalledOnce();
  });
  it("uses the same event UUID for webhook replays", async () => {
    capturePurchaseConversion(paid, 1700000001); capturePurchaseConversion(paid, 1700000001);
    await Promise.all(callbacks.map(callback => callback()));
    expect(capture.mock.calls[0][0].uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(capture.mock.calls[0][0].uuid).toBe(capture.mock.calls[1][0].uuid);
  });
  it.each([{ livemode: false }, { status: "processing" }, { amount_received: 0 }, { metadata: { ...paid.metadata, siteSlug: "bkd" } }])("excludes test, unpaid or unrelated transactions: %s", changes => {
    capturePurchaseConversion({ ...paid, ...changes } as Stripe.PaymentIntent, 1700000001);
    expect(callbacks).toHaveLength(0);
  });
  it("does not make a network request when no tracker is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    capturePurchaseConversion(paid, 1700000001);
    expect(callbacks).toHaveLength(0);
  });
  it("does not fail fulfillment when analytics fails", async () => {
    shutdown.mockRejectedValueOnce(new Error("Analytics unavailable"));
    capturePurchaseConversion(paid, 1700000001);
    await expect(callbacks[0]()).resolves.toBeUndefined();
  });
});
