import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/__mocks__/db";
import { reserveGeneration, refundGeneration } from "./generation-quota";
vi.mock("@/lib/db");

type QuotaRow = { ip: string; count: number; createdAt: Date };
const rows = new Map<string, QuotaRow>();
let credits = 100;
const input = { userId: "owner", ip: "127.0.0.1", isGuest: false, isEmail: false };
beforeEach(() => {
  vi.resetAllMocks(); rows.clear(); credits = 100;
  prisma.$transaction.mockImplementation(async callback => callback(prisma));
  prisma.jerkstore_ip_tracking.upsert.mockImplementation(async ({ where, create }) => {
    if (!rows.has(where.ip)) rows.set(where.ip, { ...create, createdAt: new Date() });
    return rows.get(where.ip);
  });
  prisma.jerkstore_ip_tracking.findUniqueOrThrow.mockImplementation(async ({ where }) => ({ ...rows.get(where.ip)! }));
  prisma.jerkstore_ip_tracking.updateMany.mockImplementation(async ({ where, data }) => {
    const row = rows.get(where.ip);
    if (!row || (where.createdAt?.lte && row.createdAt > where.createdAt.lte) || (where.createdAt instanceof Date && row.createdAt.getTime() !== where.createdAt.getTime()) || (where.count?.lte !== undefined && row.count > where.count.lte) || (where.count?.gte !== undefined && row.count < where.count.gte)) return { count: 0 };
    if (typeof data.count === "number") row.count = data.count;
    else row.count += (data.count?.increment ?? 0) - (data.count?.decrement ?? 0);
    if (data.createdAt) row.createdAt = data.createdAt;
    return { count: 1 };
  });
  prisma.user.findUniqueOrThrow.mockImplementation(async () => ({ credits }));
  prisma.user.updateMany.mockImplementation(async ({ where, data }) => {
    if (credits < where.credits.gte) return { count: 0 };
    credits -= data.credits.decrement; return { count: 1 };
  });
  prisma.user.update.mockImplementation(async ({ data }) => { credits += data.credits.increment; return { credits }; });
});

describe("generation reservations", () => {
  it("uses the free3 first, then reserves exactly2 credits for five results", async () => {
    const reservation = await reserveGeneration(input);
    expect(reservation).toMatchObject({ resultCount: 5, freeResults: 3, paidCredits: 2 });
    expect(credits).toBe(98);
    expect(rows.get("account:owner")?.count).toBe(3);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({ where: { id: "owner", credits: { gte: 2 } }, data: { credits: { decrement: 2 } } });
  });
  it("lets a signed-in visitor with no credits use their3 free results", async () => {
    credits = 0;
    expect(await reserveGeneration(input)).toMatchObject({ resultCount: 3, freeResults: 3, paidCredits: 0 });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
  it("charges five credits after the free allowance is reserved", async () => {
    await reserveGeneration(input);
    expect(await reserveGeneration(input)).toMatchObject({ resultCount: 5, freeResults: 0, paidCredits: 5 });
    expect(credits).toBe(93);
  });
  it("reserves only remaining guest results from both browser and network", async () => {
    rows.set("network:127.0.0.1", { ip: "network:127.0.0.1", count: 2, createdAt: new Date() });
    const result = await reserveGeneration({ ...input, isGuest: true });
    expect(result).toMatchObject({ resultCount: 1, freeResults: 1, paidCredits: 0 });
    expect(rows.get("network:127.0.0.1")?.count).toBe(3);
    expect(rows.get("guest:owner")?.count).toBe(1);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
  it("does not exceed either guest quota under concurrent requests", async () => {
    const results = await Promise.allSettled([reserveGeneration({ ...input, isGuest: true }), reserveGeneration({ ...input, isGuest: true })]);
    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
    expect(rows.get("network:127.0.0.1")?.count).toBe(3);
    expect(rows.get("guest:owner")?.count).toBe(3);
  });
  it("keeps the guest's browser limit when its network changes", async () => {
    await reserveGeneration({ ...input, isGuest: true });
    await expect(reserveGeneration({ ...input, isGuest: true, ip: "127.0.0.2" })).rejects.toThrow("free roast allowance");
  });
  it("uses the exhausted window's reset time rather than an unused new network's window", async () => {
    rows.set("guest:owner", { ip: "guest:owner", count: 3, createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000) });
    try {
      await reserveGeneration({ ...input, isGuest: true, ip: "127.0.0.2" });
      expect.fail("Exhausted guest allowance should be rejected");
    } catch (error) {
      expect(error).toMatchObject({ status: 429, retryAfter: 3600 });
    }
  });
  it("resets an expired24-hour window", async () => {
    credits = 0;
    rows.set("account:owner", { ip: "account:owner", count: 3, createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) });
    expect(await reserveGeneration(input)).toMatchObject({ resultCount: 3, paidCredits: 0 });
  });
  it("charges exactly2 credits for Max Effort and leaves free quota unused", async () => {
    expect(await reserveGeneration({ ...input, isEmail: true })).toMatchObject({ resultCount: 1, freeResults: 0, paidCredits: 2 });
    expect(rows.get("account:owner")?.count).toBe(0); expect(credits).toBe(98);
  });
  it("rejects Max Effort without enough credits", async () => {
    credits = 1;
    await expect(reserveGeneration({ ...input, isEmail: true })).rejects.toThrow("requires 2 credits");
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
  it("returns reserved credits and free results after failure", async () => {
    const reservation = await reserveGeneration(input);
    await refundGeneration(reservation);
    expect(credits).toBe(100); expect(rows.get("account:owner")?.count).toBe(0);
  });
  it("does not refund an old reservation into a new quota window", async () => {
    const reservation = await reserveGeneration({ ...input, isGuest: true });
    for (const row of rows.values()) row.createdAt = new Date(row.createdAt.getTime() + 1000);
    await refundGeneration(reservation);
    expect(rows.get("network:127.0.0.1")?.count).toBe(3);
  });
  it("requires a successful conditional credit debit to start generation", async () => {
    prisma.user.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(reserveGeneration(input)).rejects.toThrow("credits changed");
  });
});
