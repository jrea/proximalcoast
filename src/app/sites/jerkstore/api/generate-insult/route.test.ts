import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/__mocks__/db";
import { auth } from "@/lib/auth";
import { generateText, streamText } from "ai";
import { moderateText } from "../../_lib/openai";
import { GenerationLimitError, reserveGeneration, refundGeneration } from "../../_lib/generation-quota";
import { guestCookieValue } from "../../_lib/guest-identity";

const { tasks, cookieGet } = vi.hoisted(() => ({ tasks: [] as Array<() => Promise<void>>, cookieGet: vi.fn() }));
vi.mock("@/lib/db");
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: cookieGet })) }));
vi.mock("next/server", () => ({ after: (task: () => Promise<void>) => tasks.push(task) }));
vi.mock("ai", async (original) => ({ ...await original<typeof import("ai")>(), generateText: vi.fn(), streamText: vi.fn() }));
vi.mock("../../_lib/ai", () => ({ deepseekV3: { modelId: "deepseek-chat" }, deepseekR1: { modelId: "deepseek-reasoner" } }));
vi.mock("../../_lib/openai", () => ({ moderateText: vi.fn() }));
vi.mock("../../_lib/generation-quota", async (original) => ({ ...await original<typeof import("../../_lib/generation-quota")>(), reserveGeneration: vi.fn(), refundGeneration: vi.fn() }));

function request(body: unknown = { topic: "My browser tabs" }, options: { stream?: boolean; authorization?: string } = {}) {
  return new Request(`http://jerkstore.localhost/api/generate-insult?stream=${options.stream !== false}`, { method: "POST", headers: { "Content-Type": "application/json", ...(options.authorization ? { authorization: options.authorization } : {}) }, body: JSON.stringify(body) });
}
function resultFor(options: { system?: unknown }) {
  const count = Number(/Generate exactly (\d+)/.exec(typeof options.system === "string" ? options.system : "")?.[1] ?? 5);
  return { output: { roasts: Array.from({ length: count }, (_, i) => `Roast ${i + 1}`) }, usage: { inputTokens: 10, outputTokens: 12 } };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("BETTER_AUTH_SECRET", "unit-test-only-guest-cookie-secret");
  tasks.length = 0;
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "owner" } } as never);
  vi.mocked(moderateText).mockResolvedValue(false);
  prisma.jerkstore_insult.findMany.mockResolvedValue([]);
  prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
  cookieGet.mockReturnValue(undefined);
  vi.mocked(reserveGeneration).mockImplementation(async ({ userId, isGuest, isEmail }) => ({ userId, windows: [], resultCount: isEmail ? 1 : isGuest ? 3 : 5, freeResults: isGuest ? 3 : 0, paidCredits: isGuest ? 0 : isEmail ? 2 : 5 }));
  vi.mocked(refundGeneration).mockResolvedValue(undefined);
  vi.mocked(generateText).mockImplementation(async (options) => resultFor(options) as never);
  vi.mocked(streamText).mockImplementation((options) => {
    const result = resultFor(options);
    return { output: Promise.resolve(result.output), totalUsage: Promise.resolve(result.usage), textStream: (async function* () { const text = JSON.stringify(result.output); yield text.slice(0, -1); yield text.slice(-1); })() } as never;
  });
});

describe("Jerkstore generation boundary", () => {
  it.each([null, [], {}, { topic: "  " }, { topic: 23 }, { topic: "x".repeat(1001) }, { topic: "test", isEmail: "true" }, { topic: "test", heatLevel: "typo" }, { topic: "test", language: "not-a-language" }, { topic: "test", username: "bad;handle" }])("rejects invalid input before auth, DB, quotas or AI: %j", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(auth.api.getSession).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(reserveGeneration).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });
  it("returns400 for malformed JSON", async () => {
    expect((await POST(new Request("http://local/api", { method: "POST", body: "{" }))).status).toBe(400);
  });
  it("accepts the legacy object/prompt body without changing the user's choices", async () => {
    const response = await POST(request({ object: { prompt: "My 47 tabs", heatLevel: "spicy", language: "Spanish" } }, { stream: false }));
    expect(response.status).toBe(200);
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ prompt: "<user_input>My 47 tabs</user_input>" }));
  });
  it("reads current SDK output, returns JSON and persists the bot's five results", async () => {
    const response = await POST(request(undefined, { stream: false }));
    expect(await response.json()).toEqual({ roasts: ["Roast 1", "Roast 2", "Roast 3", "Roast 4", "Roast 5"] });
    expect(prisma.jerkstore_insult.create).toHaveBeenCalledTimes(5);
    expect(tasks).toHaveLength(0);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("keeps streaming persistence alive using after", async () => {
    const response = await POST(request());
    expect(await response.json()).toHaveProperty("roasts");
    expect(prisma.jerkstore_insult.create).toHaveBeenCalledTimes(5);
    expect(tasks).toHaveLength(1);
    await tasks[0]();
    expect(prisma.jerkstore_insult.create).toHaveBeenCalledTimes(5);
    expect(refundGeneration).not.toHaveBeenCalled();
  });
  it("returns exactly one extended roast without charging a second time during save", async () => {
    const response = await POST(request({ topic: "My coffee order", isEmail: true }, { stream: false }));
    expect(await response.json()).toEqual({ roasts: ["Roast 1"] });
    expect(reserveGeneration).toHaveBeenCalledWith(expect.objectContaining({ isEmail: true }));
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
  it("uses the reasoning model only when explicitly requested", async () => {
    await POST(request({ topic: "My meetings", useReasoning: true }));
    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({ model: { modelId: "deepseek-reasoner" } }));
  });
  it("does not downgrade an invalid API key into a guest request", async () => {
    prisma.apiKey.findUnique.mockResolvedValue(null);
    expect((await POST(request(undefined, { authorization: "Bearer invalid" }))).status).toBe(401);
    expect(auth.api.getSession).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
  it("accepts a valid key and uses its owner", async () => {
    prisma.apiKey.findUnique.mockResolvedValue({ id: "key", userId: "bot-owner" });
    expect((await POST(request(undefined, { authorization: "Bearer valid" }))).status).toBe(200);
    expect(reserveGeneration).toHaveBeenCalledWith(expect.objectContaining({ userId: "bot-owner", isGuest: false }));
  });
  it("issues a signed HttpOnly guest cookie for both streaming and JSON responses", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const response = await POST(request(undefined, { stream: false }));
    expect((await response.json()).roasts).toHaveLength(3);
    expect(response.headers.get("set-cookie")).toMatch(/x-jerkstore-guest-id=[\w-]+\.[\w-]+; Path=\/; HttpOnly/);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ isGuest: true }) }));
  });
  it("reuses only a verified guest row", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    cookieGet.mockReturnValue({ value: guestCookieValue("guest-owner") });
    prisma.user.findUnique.mockResolvedValue({ id: "guest-owner", isGuest: true });
    await POST(request());
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(reserveGeneration).toHaveBeenCalledWith(expect.objectContaining({ userId: "guest-owner" }));
  });
  it("does not let a guest cookie claim a registered user's identity", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    cookieGet.mockReturnValue({ value: guestCookieValue("registered-owner") });
    prisma.user.findUnique.mockResolvedValue({ id: "registered-owner", isGuest: false });
    await POST(request());
    expect(reserveGeneration).toHaveBeenCalledWith(expect.objectContaining({ userId: expect.not.stringMatching(/^registered-owner$/), isGuest: true }));
    expect(prisma.user.create).toHaveBeenCalled();
  });
  it.each([{ heatLevel: "nuclear" }, { isEmail: true }, { language: "Pirate" }, { useReasoning: true }])("enforces guest feature locks at the API: %j", async (options) => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    expect((await POST(request({ topic: "My tabs", ...options }))).status).toBe(403);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });
  it("rejects flagged input without reserving anything", async () => {
    vi.mocked(moderateText).mockResolvedValue(true);
    expect((await POST(request())).status).toBe(400);
    expect(reserveGeneration).not.toHaveBeenCalled();
  });
  it("returns503 on moderation/provider setup failures and refunds a reservation only if one exists", async () => {
    vi.mocked(moderateText).mockRejectedValueOnce(new Error("offline"));
    expect((await POST(request())).status).toBe(503);
    expect(refundGeneration).not.toHaveBeenCalled();
    vi.mocked(generateText).mockRejectedValueOnce(new Error("provider offline"));
    expect((await POST(request(undefined, { stream: false }))).status).toBe(503);
    expect(refundGeneration).toHaveBeenCalledTimes(1);
  });
  it("refunds failed/invalid output and failed persistence", async () => {
    vi.mocked(generateText).mockResolvedValueOnce({ output: { roasts: [] }, usage: {} } as never);
    expect((await POST(request(undefined, { stream: false }))).status).toBe(503);
    expect(refundGeneration).toHaveBeenCalledTimes(1);
    prisma.jerkstore_insult.create.mockRejectedValueOnce(new Error("db offline"));
    expect((await POST(request(undefined, { stream: false }))).status).toBe(503);
    expect(refundGeneration).toHaveBeenCalledTimes(2);
  });
  it("refunds a rejected stream in the retained completion task", async () => {
    const rejected = Promise.reject(new Error("provider interrupted"));
    rejected.catch(() => {});
    vi.mocked(streamText).mockReturnValueOnce({ output: rejected, totalUsage: Promise.resolve({}), textStream: (async function* () { yield "partial"; })() } as never);
    await POST(request());
    await tasks[0]();
    expect(refundGeneration).toHaveBeenCalledTimes(1);
  });
  it("returns rate-limit status and retry header without invoking a model", async () => {
    vi.mocked(reserveGeneration).mockRejectedValueOnce(new GenerationLimitError("Free allowance used", 429, 120));
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
    expect(streamText).not.toHaveBeenCalled();
  });
});
