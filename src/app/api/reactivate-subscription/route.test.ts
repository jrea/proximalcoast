import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    update: vi.fn(),
  },
}));

vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@/lib/db');

import { POST } from './route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FIXTURES } from '@/lib/__mocks__/db';

const makeRequest = (body: object = {}) => ({
  json: vi.fn().mockResolvedValue(body),
} as unknown as Request);

const DB_SUB = FIXTURES.subscription;

describe('POST /api/reactivate-subscription', () => {
  beforeEach(() => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: DB_SUB.userId } });

    (prisma.user_subscription.findUnique as any).mockResolvedValue({
      ...DB_SUB,
      cancelAtPeriodEnd: true, // Was scheduled to cancel — now reactivating
    });
    (prisma.user_subscription.update as any).mockResolvedValue({
      ...DB_SUB,
      cancelAtPeriodEnd: false,
      status: 'active',
    });

    mockStripe.subscriptions.update.mockResolvedValue({
      id: DB_SUB.stripeSubscriptionId,
      cancel_at_period_end: false,
    });
  });

  // --- Auth ---

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  // --- No subscription ---

  it('returns 400 when no subscription found', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when subscription has no stripeSubscriptionId', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue({
      ...DB_SUB,
      stripeSubscriptionId: null,
    });
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(400);
  });

  // --- Happy path ---

  it('sets cancel_at_period_end=false in Stripe', async () => {
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(200);
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
      DB_SUB.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );
  });

  it('updates cancelAtPeriodEnd=false in local DB', async () => {
    await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: DB_SUB.stripeSubscriptionId },
      data: { cancelAtPeriodEnd: false },
    }));
  });

  it('returns success:true with message and status', async () => {
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/reactivat/i);
    expect(json.status).toBe('active');
  });

  it('defaults siteSlug to "jerkstore" when not provided', async () => {
    await POST(makeRequest({}));
    expect(prisma.user_subscription.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: DB_SUB.userId, siteSlug: 'jerkstore' } },
    }));
  });

  // --- Stripe failure cases ---

  it('throws if Stripe still returns cancel_at_period_end=true (update failed)', async () => {
    mockStripe.subscriptions.update.mockResolvedValue({
      id: DB_SUB.stripeSubscriptionId,
      cancel_at_period_end: true, // Stripe didn't apply the change
    });
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    // Should catch and return error
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // --- resource_missing error (ghost subscription) ---

  it('returns 404 and marks DB as canceled when Stripe subscription is missing', async () => {
    const stripeError = { code: 'resource_missing' };
    mockStripe.subscriptions.update.mockRejectedValue(stripeError);

    const res = await POST(makeRequest({ siteSlug: 'bkd' }));

    expect(res.status).toBe(404);
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'canceled', cancelAtPeriodEnd: true }),
    }));
  });

  // --- Generic error handling ---

  it('returns 500 on unexpected error', async () => {
    mockStripe.subscriptions.update.mockRejectedValue(new Error('Network error'));
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(500);
  });
});
