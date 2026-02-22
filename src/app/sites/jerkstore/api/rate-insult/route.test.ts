import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn(),
}));

vi.mock('@/lib/db');

import { POST } from './route';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const makeRequest = (body: object = {}) => ({
  json: vi.fn().mockResolvedValue(body),
} as unknown as Request);

describe('POST /api/rate-insult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user_1' } });
    (prisma.jerkstore_insult.findFirst as any).mockResolvedValue({ id: 'insult_1', content: 'You suck' });
    (prisma.jerkstore_insult.update as any).mockResolvedValue({});
  });

  // --- Auth ---

  it('returns 401 when not authenticated and no guest cookie', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    (cookies as any).mockResolvedValue({ get: vi.fn().mockReturnValue(null) });
    const res = await POST(makeRequest({ content: 'You suck', weight: 1 }));
    expect(res.status).toBe(401);
  });

  it('allows guest user authenticated via cookie', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    (cookies as any).mockResolvedValue({ get: vi.fn().mockReturnValue({ value: 'guest_id' }) });
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'guest_id' });
    (prisma.jerkstore_insult.findFirst as any).mockResolvedValue({ id: 'insullt_g', content: 'Guest roast' });

    const res = await POST(makeRequest({ content: 'Guest roast', weight: 1 }));
    expect(res.status).toBe(200);
  });

  // --- Validation ---

  it('returns 400 for invalid weight (> 2)', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: 99 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid weight (< -1)', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: -5 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing content', async () => {
    const res = await POST(makeRequest({ weight: 1 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-integer weight', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: 1.5 }));
    expect(res.status).toBe(400);
  });

  // --- Ownership ---

  it('returns 404 when insult not found for user', async () => {
    (prisma.jerkstore_insult.findFirst as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ content: 'Not mine', weight: 1 }));
    expect(res.status).toBe(404);
  });

  it('queries insult by userId to enforce ownership', async () => {
    await POST(makeRequest({ content: 'You suck', weight: 1 }));
    expect(prisma.jerkstore_insult.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: 'user_1' }),
    }));
  });

  // --- Weight values ---

  it('saves weight=2 (double thumbs up / legendary)', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: 2 }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.newWeight).toBe(2);
    expect(prisma.jerkstore_insult.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { weight: 2 },
    }));
  });

  it('saves weight=1 (thumbs up)', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: 1 }));
    expect(prisma.jerkstore_insult.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { weight: 1 },
    }));
  });

  it('saves weight=0 (neutral/undo)', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: 0 }));
    expect(res.status).toBe(200);
    expect(prisma.jerkstore_insult.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { weight: 0 },
    }));
  });

  it('saves weight=-1 (dislike)', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: -1 }));
    expect(res.status).toBe(200);
    expect(prisma.jerkstore_insult.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { weight: -1 },
    }));
  });

  // --- Response shape ---

  it('returns success:true and newWeight in response', async () => {
    const res = await POST(makeRequest({ content: 'You suck', weight: 2 }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.newWeight).toBe(2);
  });

  // --- Error handling ---

  it('returns 500 on unexpected DB error', async () => {
    (prisma.jerkstore_insult.findFirst as any).mockRejectedValue(new Error('DB crash'));
    const res = await POST(makeRequest({ content: 'You suck', weight: 1 }));
    expect(res.status).toBe(500);
  });
});
