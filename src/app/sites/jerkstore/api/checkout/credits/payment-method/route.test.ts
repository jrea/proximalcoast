import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStripe = vi.hoisted(() => ({
  paymentIntents: { retrieve: vi.fn() },
  paymentMethods: { retrieve: vi.fn() },
  customers: { update: vi.fn() },
}));

vi.mock("@/lib/stripe", () => ({ stripe: mockStripe }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock("@/lib/db");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { POST } from "./route";

const USER = { id: "user_1", stripeCustomerId: "cus_1" };
const request = (paymentIntentId?: string) => ({
  json: vi.fn().mockResolvedValue(paymentIntentId ? { paymentIntentId } : {}),
} as unknown as Request);

describe("POST /api/checkout/credits/payment-method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: USER.id } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(USER as never);
    mockStripe.paymentIntents.retrieve.mockResolvedValue({
      status: "succeeded",
      customer: USER.stripeCustomerId,
      payment_method: "pm_1",
      metadata: { userId: USER.id },
    });
    mockStripe.paymentMethods.retrieve.mockResolvedValue({
      id: "pm_1",
      type: "card",
      customer: USER.stripeCustomerId,
      card: { brand: "visa", last4: "4242" },
    });
    mockStripe.customers.update.mockResolvedValue({});
  });

  it("requires an authenticated user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

    expect((await POST(request("pi_1"))).status).toBe(401);
  });

  it("verifies the completed payment and saves its card as the default", async () => {
    const response = await POST(request("pi_1"));

    expect(response.status).toBe(200);
    expect(mockStripe.customers.update).toHaveBeenCalledWith(USER.stripeCustomerId, {
      invoice_settings: { default_payment_method: "pm_1" },
    });
    await expect(response.json()).resolves.toEqual({
      paymentMethod: { brand: "visa", last4: "4242" },
    });
  });

  it("does not save a payment method owned by someone else", async () => {
    mockStripe.paymentIntents.retrieve.mockResolvedValue({
      status: "succeeded",
      customer: "cus_other",
      payment_method: "pm_1",
      metadata: { userId: USER.id },
    });

    expect((await POST(request("pi_1"))).status).toBe(400);
    expect(mockStripe.customers.update).not.toHaveBeenCalled();
  });
});
