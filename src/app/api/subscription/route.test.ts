import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must be declared with vi.hoisted so they are available inside vi.mock factories
const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    retrieve: vi.fn(),
  },
}));

// --- Mocks ---

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/db');
vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
}));

import { GET } from './route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// --- Helpers ---

const makeRequest = (url = 'http://localhost/api/subscription?siteSlug=jerkstore') =>
  ({ url } as unknown as Request);

const makeStripeSub = (overrides: object = {}) => ({
  id: 'sub_stripe_123',
  status: 'active',
  cancel_at_period_end: false,
  current_period_end: Math.floor(Date.now() / 1000) + 86400,
  ...overrides,
});

const makeDbSub = (overrides: object = {}) => ({
  id: 'db_sub_1',
  stripeSubscriptionId: 'sub_stripe_123',
  status: 'active',
  cancelAtPeriodEnd: false,
  expiresAt: new Date(Date.now() + 86400000),
  user: { id: 'user_1', name: 'Joe' },
  ...overrides,
});

describe('GET /api/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user_1' } });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    (prisma.user_subscription.update as any).mockResolvedValue({});
    mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub());
  });

  // --- Auth ---

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const req = makeRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  // --- No subscription ---

  it('returns { subscription: null } when no subscription found', async () => {
    const req = makeRequest();
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.subscription).toBeNull();
  });

  // --- Stripe sync: data matches ---

  it('does NOT update DB when Stripe data matches', async () => {
    // Use a whole-second aligned timestamp so that `expiresAt.getTime()` exactly
    // equals `current_period_end * 1000` — avoids millisecond drift in the route's comparison.
    const periodEndUnix = Math.floor(Date.now() / 1000) + 86400;
    const expiresAt = new Date(periodEndUnix * 1000); // exactly aligned, 0 ms remainder

    const dbSub = makeDbSub({ expiresAt });
    const stripeSub = makeStripeSub({
      status: dbSub.status,
      cancel_at_period_end: dbSub.cancelAtPeriodEnd,
      current_period_end: periodEndUnix,
    });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(dbSub);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub);

    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(prisma.user_subscription.update).not.toHaveBeenCalled();
  });

  // --- Stripe sync: status mismatch ---

  it('syncs subscription status from Stripe when status differs', async () => {
    const dbSub = makeDbSub({ status: 'incomplete' });
    const stripeSub = makeStripeSub({ status: 'active' });
    const updatedSub = { ...dbSub, status: 'active' };

    (prisma.user_subscription.findUnique as any).mockResolvedValue(dbSub);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub);
    (prisma.user_subscription.update as any).mockResolvedValue(updatedSub);

    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: dbSub.id },
      data: expect.objectContaining({ status: 'active' }),
    }));
  });

  // --- Stripe sync: cancelAtPeriodEnd mismatch ---

  it('syncs cancelAtPeriodEnd from Stripe when it differs', async () => {
    const dbSub = makeDbSub({ cancelAtPeriodEnd: false });
    const stripeSub = makeStripeSub({ cancel_at_period_end: true });
    const updatedSub = { ...dbSub, cancelAtPeriodEnd: true };

    (prisma.user_subscription.findUnique as any).mockResolvedValue(dbSub);
    mockStripe.subscriptions.retrieve.mockResolvedValue(stripeSub);
    (prisma.user_subscription.update as any).mockResolvedValue(updatedSub);

    const req = makeRequest();
    await GET(req);

    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ cancelAtPeriodEnd: true }),
    }));
  });

  // --- Stripe sync: skip canceled subs ---

  it('does NOT call Stripe for canceled subscriptions', async () => {
    const dbSub = makeDbSub({ status: 'canceled', stripeSubscriptionId: 'sub_stripe_123' });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(dbSub);

    const req = makeRequest();
    await GET(req);

    expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  // --- Stripe sync: skip when no stripeSubscriptionId ---

  it('does NOT call Stripe when stripeSubscriptionId is null', async () => {
    const dbSub = makeDbSub({ stripeSubscriptionId: null });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(dbSub);

    const req = makeRequest();
    await GET(req);

    expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  // --- Stripe error: graceful degradation ---

  it('returns the DB subscription even if Stripe sync fails', async () => {
    const dbSub = makeDbSub();
    (prisma.user_subscription.findUnique as any).mockResolvedValue(dbSub);
    mockStripe.subscriptions.retrieve.mockRejectedValue(new Error('Stripe API down'));

    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.subscription).toBeTruthy();
  });

  // --- siteSlug defaulting ---

  it('defaults to siteSlug=jerkstore when not provided in query', async () => {
    const req = makeRequest('http://localhost/api/subscription');
    await GET(req);

    expect(prisma.user_subscription.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        userId_siteSlug: {
          userId: 'user_1',
          siteSlug: 'jerkstore',
        },
      },
    }));
  });

  it('uses provided siteSlug from query param', async () => {
    const req = makeRequest('http://localhost/api/subscription?siteSlug=bkd');
    await GET(req);

    expect(prisma.user_subscription.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        userId_siteSlug: {
          userId: 'user_1',
          siteSlug: 'bkd',
        },
      },
    }));
  });

  // --- Internal errors ---

  it('returns 500 on unhandled DB errors', async () => {
    (prisma.user_subscription.findUnique as any).mockRejectedValue(new Error('DB crash'));

    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Internal Server Error');
  });
});
