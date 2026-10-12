import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/__mocks__/db";
import { grantPurchasedCredits } from "./credit-purchases";
vi.mock("@/lib/db");
beforeEach(() => { vi.resetAllMocks(); prisma.$transaction.mockImplementation(async callback => callback(prisma)); });
describe("credit purchase receipts", () => {
  it("records the payment and adds credits in the same transaction", async () => {
    expect(await grantPurchasedCredits("pi_paid", "owner", 275)).toBe(true);
    expect(prisma.jerkstore_credit_purchase.create).toHaveBeenCalledWith({ data: { paymentIntentId: "pi_paid", userId: "owner", credits: 275 } });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: "owner" }, data: { credits: { increment: 275 } } });
  });
  it("does not add credits when the same receipt already exists", async () => {
    prisma.jerkstore_credit_purchase.create.mockRejectedValueOnce({ code: "P2002" });
    expect(await grantPurchasedCredits("pi_paid", "owner", 275)).toBe(false);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
  it("propagates persistence failure instead of reporting a fulfilled purchase", async () => {
    prisma.user.update.mockRejectedValueOnce(new Error("offline"));
    await expect(grantPurchasedCredits("pi_paid", "owner", 50)).rejects.toThrow("offline");
  });
  it.each([0, -50, 1.5, NaN, 100001])("rejects invalid credit grants: %s", async credits => {
    await expect(grantPurchasedCredits("pi_paid", "owner", credits)).rejects.toThrow("Invalid credit");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
