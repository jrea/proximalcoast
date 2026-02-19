import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { cookies, headers } from 'next/headers';
import * as crypto from 'crypto';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    apiKey: { findUnique: vi.fn(), update: vi.fn() },
    user_subscription: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    jerkstore_insult: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    jerkstore_ip_tracking: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

// Mock AI SDK
vi.mock('ai', async (importOriginal) => {
  return {
    ...await importOriginal<typeof import('ai')>(),
    generateText: vi.fn().mockResolvedValue({
      text: "Mocked Roast",
      usage: { inputTokens: 10, outputTokens: 10 },
      object: { roasts: ["Roast 1", "Roast 2", "Roast 3", "Roast 4", "Roast 5"] },
      // Mocking experimental_output for compatibility with code
      experimental_output: { roasts: ["Roast 1", "Roast 2", "Roast 3", "Roast 4", "Roast 5"] }
    }),
    streamText: vi.fn().mockReturnValue({
      toTextStreamResponse: vi.fn().mockReturnValue(new Response("Streamed Response")),
      output: Promise.resolve({ roasts: ["Roast 1", "Roast 2", "Roast 3", "Roast 4", "Roast 5"] }),
      totalUsage: Promise.resolve({ inputTokens: 10, outputTokens: 10 })
    })
  }
});

// Mock deepseek libs
vi.mock('../../_lib/ai', () => ({
  deepseekV3: { modelId: 'deepseek-v3' },
  deepseekR1: { modelId: 'deepseek-r1' }
}));

import { FREE_ROAST_LIMIT, CREDIT_COSTS } from '../../constants';

// Mock OpenAI moderation
vi.mock('../../_lib/openai', () => ({
  moderateText: vi.fn().mockResolvedValue(false)
}));

describe('POST /api/generate-insult', () => {
  const reqMock = (body = {}, headersMap: Record<string, string> = {}) => ({
    json: vi.fn().mockResolvedValue(body),
    headers: {
      get: (key: string) => headersMap[key.toLowerCase()] || null
    },
    url: 'http://localhost/api/generate-insult?stream=true'
  } as unknown as Request);

  const mockHeaders = new Headers();
  const mockCookies = { get: vi.fn() };

  // ... (unchanged lines)

  it('Modes: Reasoning Mode should use R1 model', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    // Must be savage to use reasoning
    (prisma.user_subscription.findUnique as any).mockResolvedValue({
      plan: 'savage',
      status: 'active',
      expiresAt: new Date(Date.now() + 10000000)
    });

    const { streamText, generateText } = await import('ai');

    const req = reqMock({ topic: 't', useReasoning: true });

    await POST(req);

    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({
      model: expect.objectContaining({ modelId: 'deepseek-r1' })
    }));
    expect(generateText).not.toHaveBeenCalled();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    (headers as any).mockReturnValue(mockHeaders);
    (cookies as any).mockResolvedValue(mockCookies);

    // Reset moderation to false
    const { moderateText } = await import('../../_lib/openai');
    (moderateText as any).mockResolvedValue(false);

    // Default mock returns to prevent crashes
    (prisma.user.create as any).mockResolvedValue({ id: 'guest_created', username: 'guest_created' });
    (prisma.jerkstore_insult.findMany as any).mockResolvedValue([]);
    (prisma.jerkstore_insult.count as any).mockResolvedValue(0);
    (prisma.jerkstore_ip_tracking.findUnique as any).mockResolvedValue(null);
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);

    // Default to plenty of credits to pass rate limits for logic tests
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 100 });
  });

  // --- Authentication Tests ---

  it('Auth: Should authenticate via API Key', async () => {
    // Mock API Key lookup
    (prisma.apiKey.findUnique as any).mockResolvedValue({
      userId: 'api_user',
      user: { name: 'Bot', email: 'bot@p.com', image: null },
      id: 'key_id'
    });

    // Auth via header
    const req = reqMock({ topic: 'test' }, { 'authorization': 'Bearer valid_key' });
    const res = await POST(req);

    expect(prisma.apiKey.findUnique).toHaveBeenCalled();
    expect(prisma.apiKey.update).toHaveBeenCalledWith({ where: { id: 'key_id' }, data: expect.anything() });
    expect(res.status).toBe(200);
  });

  it('Auth: Should handle missing API Key and fallback to Session', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'session_user' } });

    const req = reqMock({ topic: 'test' });
    const res = await POST(req);

    expect(prisma.apiKey.findUnique).not.toHaveBeenCalled();
    expect(auth.api.getSession).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('Auth: Should create new Guest if no Auth', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    mockCookies.get.mockReturnValue(null); // No guest cookie

    // Mock user creation success
    (prisma.user.create as any).mockResolvedValue({ id: 'new_guest_id', username: 'NewGuest' });

    const req = reqMock({ topic: 'test' });
    const res = await POST(req);

    expect(prisma.user.create).toHaveBeenCalled();
    expect(res.status).toBe(200);
    // Check for Set-Cookie header implies we sent back the guest ID
    // Note: in NextJS route handlers we manipulate response headers. 
    // The test mock for streamText helper returns a Response, we'd need to verify it was called with headers.
    // However, our mock of streamText returns a simple Response object.
  });

  it('Auth: Should reuse existing Guest Cookie', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    mockCookies.get.mockReturnValue({ value: 'existing_guest_id' });
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing_guest_id', username: 'OldGuest' });

    const req = reqMock({ topic: 'test' });
    await POST(req);

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'existing_guest_id' } });
  });

  it('Auth: Should fail if Guest creation fails (Handle taken)', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    mockCookies.get.mockReturnValue(null);

    // Mock Create fail P2002
    (prisma.user.create as any).mockRejectedValue({ code: 'P2002' });

    const req = reqMock({ topic: 'test' });
    const res = await POST(req);

    expect(res.status).toBe(409);
    expect(await res.text()).toContain("already taken");
  });

  it('Auth: Should fail 500 on generic Guest creation error', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    mockCookies.get.mockReturnValue(null);
    (prisma.user.create as any).mockRejectedValue(new Error("DB Dead"));

    const req = reqMock({ topic: 'test' });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });

  it('Auth: Should return 401 if UserId cannot be resolved (Paranoia check)', async () => {
    // This covers lines 141-143. Hard to reach given logic, but if Guest Logic failed silently or somehow didn't return ID.
    // We can simulate by having guest cookie exist but DB return null (deleted user), AND create logic skipped? 
    // Actually logic is: if cookie, try find. If no user, it falls through to 'if (!userId) create'. 
    // To trigger 401, we need !session AND !userId after guest logic.
    // Currently guest logic always creates unless error.
    // So this might be unreachable unless we mock `generateJerkName` to empty or something weird?
    // Actually, if we just FORCE `userId` to remain null effectively. 
    // Let's assume auth returns null, cookie is null, and user.create returns null/undefined (violates types but logic handles it?).
    // Wait, user.create throws on fail. 
    // So logical 401 is only if variable is somehow null.
    // Maybe if guest cookie exists but findUnique returns null...
    // The code:
    // if (guestUser) { userId = ... }
    // if (!userId) { create... }
    // So it self-heals. It's really hard to hit 401 unless Create returns success but no ID? 
    // Let's mock create returning empty object?
    (auth.api.getSession as any).mockResolvedValue(null);
    mockCookies.get.mockReturnValue(null);
    (prisma.user.create as any).mockResolvedValue({}); // No ID

    const req = reqMock({ topic: 'test' });
    const res = await POST(req);
    // userId will be undefined
    expect(res.status).toBe(401);
  });


  // --- Logic & Validation Tests ---

  it('Validation: Should flag moderated content', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    const { moderateText } = await import('../../_lib/openai');
    (moderateText as any).mockResolvedValue(true); // Flagged

    const req = reqMock({ topic: 'bad stuff' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.text()).toContain("pathetic");
  });

  // --- Credit & Feature Logic Tests ---

  it('Long Roast: Should FAIL if user has insufficient credits (< 2)', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 1 }); // Less than 2

    const req = reqMock({ topic: 'test', isEmail: true });
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(await res.text()).toContain("requires 2 credits");
  });

  it('Long Roast: Should SUCCEED if user has sufficient credits (>= 2)', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 2 }); // Exactly 2

    const req = reqMock({ topic: 'test', isEmail: true });
    const res = await POST(req);

    expect(res.status).toBe(200);
    // Wait for async operations (fire-and-forget DB update)
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'u1' },
      data: { credits: { decrement: 2 } }
    }));
  });

  it('Standard Roast: Should FAIL if usage < FREE_ROAST_LIMIT but user has 0 credits', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    const usage = FREE_ROAST_LIMIT - 1;
    (prisma.jerkstore_insult.count as any).mockResolvedValue(usage); // 1 free slot left
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 0 });

    const req = reqMock({ topic: 'test', isEmail: false });
    const res = await POST(req);

    expect(res.status).toBe(429);
    const expectedPaid = 5 - (FREE_ROAST_LIMIT - usage);
    expect(await res.text()).toContain(`requires ${expectedPaid} credits`);
  });

  it('Standard Roast: Should SUCCEED if usage < FREE_ROAST_LIMIT and user has sufficient credits', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.jerkstore_insult.count as any).mockResolvedValue(0); // Usage 0
    const expectedPaid = 5 - FREE_ROAST_LIMIT;
    (prisma.user.findUnique as any).mockResolvedValue({ credits: expectedPaid });

    const req = reqMock({ topic: 'test', isEmail: false });
    const res = await POST(req);

    expect(res.status).toBe(200);
    // Paid = 5 - FREE_ROAST_LIMIT
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'u1' },
      data: { credits: { decrement: expectedPaid } }
    }));
  });

  it(`Standard Roast: Should FAIL if usage >= FREE_ROAST_LIMIT and insufficient credits (< 5)`, async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.jerkstore_insult.count as any).mockResolvedValue(FREE_ROAST_LIMIT); // Free limit reached
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 4 }); // Need 5, have 4

    const req = reqMock({ topic: 'test', isEmail: false });
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(await res.text()).toContain("requires 5 credits");
  });

  it(`Standard Roast: Should SUCCEED if usage >= FREE_ROAST_LIMIT and sufficient credits (>= 5)`, async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.jerkstore_insult.count as any).mockResolvedValue(FREE_ROAST_LIMIT); // Free limit reached
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 10 }); // Have enough

    const req = reqMock({ topic: 'test', isEmail: false });
    const res = await POST(req);

    expect(res.status).toBe(200);
    // Usage FREE_ROAST_LIMIT (0 free slots). Pack 5. Paid = 5.
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'u1' },
      data: { credits: { decrement: 5 } }
    }));
  });

  // --- Modes & Models ---

  it('Modes: Streaming Mode should call streamText', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 100 });
    const { streamText, generateText } = await import('ai');

    const req = {
      json: vi.fn().mockResolvedValue({ topic: 't' }),
      headers: { get: vi.fn() },
      url: 'http://loc/api?stream=true'
    } as unknown as Request;

    await POST(req);
    expect(streamText).toHaveBeenCalled();
    expect(generateText).not.toHaveBeenCalled();
  });

  it('Modes: Reasoning Mode should use R1 model (Allowed for everyone)', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.user.findUnique as any).mockResolvedValue({ credits: 100 });

    // Reasoning allowed for everyone now
    const { streamText, generateText } = await import('ai');

    const req = reqMock({ topic: 't', useReasoning: true });

    await POST(req);

    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({
      model: expect.objectContaining({ modelId: 'deepseek-r1' })
    }));
  });

  it(`Rate Limit: Guest < FREE_ROAST_LIMIT (Lifetime) -> OK`, async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    (prisma.jerkstore_ip_tracking.findUnique as any).mockResolvedValue({ count: FREE_ROAST_LIMIT - 1, updatedAt: new Date() });
    const res = await POST(reqMock({ topic: 'test' }));
    expect(res.status).toBe(200);

    // Guest usage should be incremented
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(prisma.jerkstore_ip_tracking.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { count: { increment: 5 } }
    }));
  });

  it(`Rate Limit: Guest >= FREE_ROAST_LIMIT (Lifetime) -> BLOCK`, async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    (prisma.jerkstore_ip_tracking.findUnique as any).mockResolvedValue({ count: FREE_ROAST_LIMIT, updatedAt: new Date() });
    const res = await POST(reqMock({ topic: 'test' }));
    expect(res.status).toBe(429);
  });
});
