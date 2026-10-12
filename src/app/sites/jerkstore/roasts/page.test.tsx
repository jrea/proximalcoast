// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const context = vi.hoisted(() => ({ cookie: undefined as string | undefined }));
vi.mock("@/lib/db");
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(), cookies: async () => ({ get: () => context.cookie ? { value: context.cookie } : undefined }) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
import RoastHistory, { metadata } from "./page";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { guestCookieValue } from "../_lib/guest-identity";

const guestId = "5e14b960-8c16-4b7f-a3d6-321655ab3380";
const cursorId = "da9ca071-425a-41be-b49b-a5a82c516172";
const renderPage = async (before?: string) => renderToStaticMarkup(await RoastHistory({ searchParams: Promise.resolve({ before }) }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("BETTER_AUTH_SECRET", "local-test-secret-only");
  context.cookie = undefined;
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
  vi.mocked(prisma.jerkstore_insult.findMany).mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe("private roast history", () => {
  it("gives a new visitor a useful destination without querying the DB or forcing login", async () => {
    expect(await renderPage()).toContain("No roasts here yet.");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.jerkstore_insult.findMany).not.toHaveBeenCalled();
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("limits account history to the signed-in owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "owner_1" } } as never);
    await renderPage();
    expect(prisma.jerkstore_insult.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "owner_1" }, take: 21 }));
  });

  it("keeps signed guest history tied to its verified guest row", async () => {
    context.cookie = guestCookieValue(guestId);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: guestId, isGuest: true } as never);
    await renderPage();
    expect(prisma.jerkstore_insult.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: guestId } }));
  });

  it("preserves an existing guest UUID cookie's history", async () => {
    context.cookie = guestId;
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: guestId, isGuest: true } as never);
    await renderPage();
    expect(prisma.jerkstore_insult.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: guestId } }));
  });

  it("does not expose a registered account through a guest cookie", async () => {
    context.cookie = guestId;
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: guestId, isGuest: false } as never);
    expect(await renderPage()).toContain("No roasts here yet.");
    expect(prisma.jerkstore_insult.findMany).not.toHaveBeenCalled();
  });

  it("rejects a tampered signed cookie without looking up another user", async () => {
    context.cookie = guestCookieValue(guestId).replace(guestId, cursorId);
    expect(await renderPage()).toContain("No roasts here yet.");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.jerkstore_insult.findMany).not.toHaveBeenCalled();
  });

  it("rejects pagination cursors belonging to another owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "owner_1" } } as never);
    vi.mocked(prisma.jerkstore_insult.findFirst).mockResolvedValue(null);
    await expect(renderPage(cursorId)).rejects.toThrow("NOT_FOUND");
    expect(prisma.jerkstore_insult.findFirst).toHaveBeenCalledWith({ where: { id: cursorId, userId: "owner_1" }, select: { id: true } });
    expect(prisma.jerkstore_insult.findMany).not.toHaveBeenCalled();
  });

  it("paginates twenty results without repeating the cursor", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "owner_1" } } as never);
    vi.mocked(prisma.jerkstore_insult.findFirst).mockResolvedValue({ id: cursorId } as never);
    vi.mocked(prisma.jerkstore_insult.findMany).mockResolvedValue(Array.from({ length: 21 }, (_, i) => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, topic: `Topic ${i}`, content: `Saved result ${i}`, heatLevel: "spicy", createdAt: new Date("2026-10-12T12:00:00Z") })) as never);
    const html = await renderPage(cursorId);
    expect(html).toContain("Saved result 19");
    expect(html).not.toContain("Saved result 20");
    expect(html).toContain("/roasts?before=00000000-0000-4000-8000-000000000019");
    expect(prisma.jerkstore_insult.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "owner_1" }, cursor: { id: cursorId }, skip: 1 }));
  });
  it("rejects malformed UUID cursors before Prisma sees them", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "owner_1" } } as never);
    await expect(renderPage("------------------------------------")).rejects.toThrow("NOT_FOUND");
    expect(prisma.jerkstore_insult.findFirst).not.toHaveBeenCalled();
  });
});
