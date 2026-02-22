import { describe, it, expect, vi, beforeEach } from 'vitest';

// syncUserSubscription is the core function under test — mock its dep
const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    list: vi.fn(),
  },
  customers: {
    list: vi.fn(),
  },
}));

vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@/lib/db');

import { GET } from './route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FIXTURES } from '@/lib/__mocks__/db';

const makeRequest = (url = 'http://localhost/api/subscription-status?siteSlug=bkd') =>
  ({ url } as unknown as Request);

const DB_SUB = FIXTURES.subscription;

// A fresh sub (updatedAt just now) → not stale
const freshSub = {
  ...DB_SUB,
  updatedAt: new Date(), // just updated
};

// A stale sub (updatedAt > 10 minutes ago)
const staleSub = {
  ...DB_SUB,
  updatedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
};

describe('GET /api/subscription-status', () => {
  beforeEach(() => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: DB_SUB.userId, email: 'bkd@bkd.com' } });

    // Default: fresh sub found, no sync needed
    (prisma.user_subscription.findUnique as any).mockResolvedValue(freshSub);
    (prisma.user_subscription.upsert as any).mockResolvedValue(freshSub);
    (prisma.user.findUnique as any).mockResolvedValue(FIXTURES.user);
    (prisma.user.update as any).mockResolvedValue(FIXTURES.user);

    // Stripe subs list (used by syncUserSubscription)
    mockStripe.subscriptions.list.mockResolvedValue({
      data: [{
        id: DB_SUB.stripeSubscriptionId,
        status: 'active',
        cancel_at_period_end: false,
        current_period_end: Math.floor(DB_SUB.expiresAt.getTime() / 1000),
        metadata: { siteSlug: 'bkd', userId: DB_SUB.userId },
        items: { data: [{ price: { id: 'price_bkd', unit_amount: 7000, currency: 'usd' } }] },
      }],
    });
  });

  // --- Auth ---

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  // --- No subscription ---

  it('returns { subscription: null } when no subscription and sync finds nothing', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    // Sync: user has customerId but no matching Stripe sub
    mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null); // local check in sync

    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.subscription).toBeNull();
  });

  // --- Fresh sub (no sync needed) ---

  it('returns fresh subscription without calling Stripe', async () => {
    const res = await GET(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.subscription).toBeTruthy();
    // Stripe subscriptions.list should NOT have been called (sub is fresh)
    expect(mockStripe.subscriptions.list).not.toHaveBeenCalled();
  });

  it('returns subscription with all expected fields', async () => {
    const res = await GET(makeRequest());
    const json = await res.json();
    const sub = json.subscription;

    expect(sub.id).toBe(DB_SUB.id);
    expect(sub.status).toBe('active');
    expect(sub.plan).toBe('standard');
    expect(sub.cancelAtPeriodEnd).toBe(false);
    expect(sub.priceAmount).toBe(7000);
    expect(sub.priceCurrency).toBe('usd');
  });

  // --- Stale sub (auto-sync) ---

  it('auto-syncs stale subscription (> 10 min old)', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue(staleSub);
    (prisma.user_subscription.upsert as any).mockResolvedValue({ ...staleSub, updatedAt: new Date() });

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    // syncUserSubscription should have been called (it calls stripe.subscriptions.list)
    expect(mockStripe.subscriptions.list).toHaveBeenCalled();
  });

  // --- Force sync ---

  it('force syncs when ?sync=true regardless of staleness', async () => {
    // Sub is fresh but force sync requested
    (prisma.user_subscription.findUnique as any).mockResolvedValue(freshSub);
    (prisma.user_subscription.upsert as any).mockResolvedValue(freshSub);

    const res = await GET(makeRequest('http://localhost/api/subscription-status?siteSlug=bkd&sync=true'));

    expect(res.status).toBe(200);
    expect(mockStripe.subscriptions.list).toHaveBeenCalled();
  });

  // --- siteSlug ---

  it('uses siteSlug from query param', async () => {
    await GET(makeRequest('http://localhost/api/subscription-status?siteSlug=jerkstore'));
    expect(prisma.user_subscription.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: DB_SUB.userId, siteSlug: 'jerkstore' } },
    }));
  });

  it('defaults to siteSlug=jerkstore when not provided', async () => {
    await GET(makeRequest('http://localhost/api/subscription-status'));
    expect(prisma.user_subscription.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: DB_SUB.userId, siteSlug: 'jerkstore' } },
    }));
  });

  // --- Error handling ---

  it('returns 500 on DB error', async () => {
    (prisma.user_subscription.findUnique as any).mockRejectedValue(new Error('DB crash'));
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });
});
