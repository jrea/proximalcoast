import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  subscriptionSchedules: {
    retrieve: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  prices: {
    retrieve: vi.fn(),
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

const DB_SUB = FIXTURES.subscription; // status: active, plan: standard, priceAmount: 7000

// A mock Stripe subscription matching the real fixture
const STRIPE_SUB = {
  id: DB_SUB.stripeSubscriptionId,
  status: 'active',
  cancel_at_period_end: false,
  schedule: null as string | null,
  current_period_end: Math.floor(DB_SUB.expiresAt.getTime() / 1000),
  items: {
    data: [{
      id: 'si_item_001',
      price: { id: 'price_bkd', unit_amount: 7000, currency: 'usd' },
    }],
  },
};

describe('POST /api/update-subscription', () => {
  beforeEach(() => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: DB_SUB.userId } });

    (prisma.user_subscription.findUnique as any).mockResolvedValue(DB_SUB);
    (prisma.user_subscription.update as any).mockResolvedValue(DB_SUB);

    mockStripe.subscriptions.retrieve.mockResolvedValue(STRIPE_SUB);
    mockStripe.subscriptions.update.mockResolvedValue({ ...STRIPE_SUB });

    // Default: new price is more expensive (upgrade)
    mockStripe.prices.retrieve.mockResolvedValue({ unit_amount: 9000 });

    mockStripe.subscriptionSchedules.create.mockResolvedValue({
      id: 'sub_sched_001',
      phases: [{
        start_date: Math.floor(Date.now() / 1000),
        end_date: STRIPE_SUB.current_period_end,
        items: [{ price: 'price_bkd', quantity: 1 }],
      }],
    });
    mockStripe.subscriptionSchedules.update.mockResolvedValue({});
  });

  // --- Auth / Validation ---

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ priceId: 'price_new', newPlanName: 'elite' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when priceId is missing', async () => {
    const res = await POST(makeRequest({ newPlanName: 'elite' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when newPlanName is missing', async () => {
    const res = await POST(makeRequest({ priceId: 'price_new' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when no subscription found', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ priceId: 'price_new', newPlanName: 'elite' }));
    expect(res.status).toBe(404);
  });

  it('returns 404 when subscription has no stripeSubscriptionId', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue({
      ...DB_SUB,
      stripeSubscriptionId: null,
    });
    const res = await POST(makeRequest({ priceId: 'price_new', newPlanName: 'elite' }));
    expect(res.status).toBe(404);
  });

  // --- Upgrade path ---

  it('UPGRADE: immediately updates Stripe subscription', async () => {
    // New price (9000) > current price (7000) → upgrade
    const res = await POST(makeRequest({ priceId: 'price_elite', newPlanName: 'elite', siteSlug: 'bkd' }));
    expect(res.status).toBe(200);
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
      DB_SUB.stripeSubscriptionId,
      expect.objectContaining({
        items: [{ id: 'si_item_001', price: 'price_elite' }],
        proration_behavior: 'always_invoice',
        payment_behavior: 'error_if_incomplete',
      })
    );
  });

  it('UPGRADE: updates local DB plan immediately', async () => {
    await POST(makeRequest({ priceId: 'price_elite', newPlanName: 'elite', siteSlug: 'bkd' }));
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: DB_SUB.stripeSubscriptionId },
      data: expect.objectContaining({
        plan: 'elite',
        upcomingPlan: null,
        cancelAtPeriodEnd: false,
      }),
    }));
  });

  // --- Downgrade path ---

  it('DOWNGRADE: creates a subscription schedule instead of updating immediately', async () => {
    // New price (5000) < current price (7000) → downgrade
    mockStripe.prices.retrieve.mockResolvedValue({ unit_amount: 5000 });

    const res = await POST(makeRequest({ priceId: 'price_free', newPlanName: 'free', siteSlug: 'bkd' }));
    expect(res.status).toBe(200);
    expect(mockStripe.subscriptionSchedules.create).toHaveBeenCalledWith(
      expect.objectContaining({ from_subscription: DB_SUB.stripeSubscriptionId })
    );
    expect(mockStripe.subscriptionSchedules.update).toHaveBeenCalled();
  });

  it('DOWNGRADE: sets upcomingPlan in local DB (not plan)', async () => {
    mockStripe.prices.retrieve.mockResolvedValue({ unit_amount: 5000 });

    await POST(makeRequest({ priceId: 'price_free', newPlanName: 'free', siteSlug: 'bkd' }));

    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        upcomingPlan: 'free',
        cancelAtPeriodEnd: false,
      }),
    }));
    // plan should NOT be updated yet on downgrade
    const updateCall = (prisma.user_subscription.update as any).mock.calls[0][0];
    expect(updateCall.data.plan).toBeUndefined();
  });

  it('DOWNGRADE: reuses existing schedule if one already exists', async () => {
    mockStripe.prices.retrieve.mockResolvedValue({ unit_amount: 5000 });
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      ...STRIPE_SUB,
      schedule: 'sub_sched_existing',
    });
    mockStripe.subscriptionSchedules.retrieve.mockResolvedValue({
      id: 'sub_sched_existing',
      phases: [{
        start_date: Math.floor(Date.now() / 1000),
        end_date: STRIPE_SUB.current_period_end,
        items: [{ price: 'price_bkd', quantity: 1 }],
      }],
    });

    await POST(makeRequest({ priceId: 'price_free', newPlanName: 'free', siteSlug: 'bkd' }));

    // Should reuse, not create a new one
    expect(mockStripe.subscriptionSchedules.retrieve).toHaveBeenCalledWith('sub_sched_existing');
    expect(mockStripe.subscriptionSchedules.create).not.toHaveBeenCalled();
  });

  // --- resource_missing error (ghost subscription) ---

  it('returns 404 and marks DB as canceled when Stripe subscription is missing', async () => {
    mockStripe.subscriptions.retrieve.mockRejectedValue({ code: 'resource_missing' });

    const res = await POST(makeRequest({ priceId: 'price_elite', newPlanName: 'elite', siteSlug: 'bkd' }));

    expect(res.status).toBe(404);
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'canceled', cancelAtPeriodEnd: true }),
    }));
  });

  // --- Generic error ---

  it('returns 500 on unexpected error', async () => {
    mockStripe.subscriptions.retrieve.mockRejectedValue(new Error('Stripe timeout'));
    const res = await POST(makeRequest({ priceId: 'price_elite', newPlanName: 'elite', siteSlug: 'bkd' }));
    expect(res.status).toBe(500);
  });
});
