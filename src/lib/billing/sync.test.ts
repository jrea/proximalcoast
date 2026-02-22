import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    list: vi.fn(),
  },
  customers: {
    list: vi.fn(),
  },
}));

vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }));
vi.mock('@/lib/db');

import { syncUserSubscription } from './sync';
import { prisma } from '@/lib/db';
import { FIXTURES } from '@/lib/__mocks__/db';

const DB_SUB = FIXTURES.subscription;
const USER = FIXTURES.user;

// A realistic Stripe subscription object matching our fixture
const makeStripeSub = (overrides: object = {}) => ({
  id: DB_SUB.stripeSubscriptionId,
  status: 'active',
  cancel_at_period_end: false,
  current_period_end: Math.floor(DB_SUB.expiresAt.getTime() / 1000),
  metadata: { siteSlug: 'bkd', userId: DB_SUB.userId },
  items: { data: [{ price: { id: 'price_bkd', unit_amount: 7000, currency: 'usd' } }] },
  ...overrides,
});

describe('syncUserSubscription (billing/sync.ts)', () => {
  beforeEach(() => {
    (prisma.user.findUnique as any).mockResolvedValue(USER);
    (prisma.user.update as any).mockResolvedValue(USER);
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    (prisma.user_subscription.upsert as any).mockResolvedValue(DB_SUB);
    (prisma.user_subscription.update as any).mockResolvedValue({ ...DB_SUB, status: 'canceled' });

    mockStripe.subscriptions.list.mockResolvedValue({
      data: [makeStripeSub()],
    });
    mockStripe.customers.list.mockResolvedValue({ data: [] });
  });

  // --- User not found ---

  it('returns null when user is not in DB', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const result = await syncUserSubscription('ghost_id', 'bkd');
    expect(result).toBeNull();
  });

  // --- No Stripe customer ID ---

  it('returns null when user has no stripeCustomerId and none found by email', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ ...USER, stripeCustomerId: null });
    mockStripe.customers.list.mockResolvedValue({ data: [] });
    const result = await syncUserSubscription(USER.id, 'bkd');
    expect(result).toBeNull();
  });

  it('finds customer by email when no stripeCustomerId on user', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ ...USER, stripeCustomerId: null });
    mockStripe.customers.list.mockResolvedValue({
      data: [{ id: 'cus_found_by_email' }],
    });

    await syncUserSubscription(USER.id, 'bkd');

    // Should save the discovered customerId
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: USER.id },
      data: { stripeCustomerId: 'cus_found_by_email' },
    }));
    // Should then list subscriptions for this customer
    expect(mockStripe.subscriptions.list).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_found_by_email',
    }));
  });

  // --- Subscription matching ---

  it('matches subscription by siteSlug metadata', async () => {
    const result = await syncUserSubscription(USER.id, 'bkd');
    expect(result).toBeTruthy();
    expect(prisma.user_subscription.upsert).toHaveBeenCalled();
  });

  it('prefers active subscription over incomplete when both exist', async () => {
    mockStripe.subscriptions.list.mockResolvedValue({
      data: [
        makeStripeSub({ status: 'incomplete', id: 'sub_incomplete' }),
        makeStripeSub({ status: 'active', id: 'sub_active' }),
      ],
    });

    await syncUserSubscription(USER.id, 'bkd');

    // Should upsert the ACTIVE one
    expect(prisma.user_subscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ stripeSubscriptionId: 'sub_active' }),
    }));
  });

  // --- No active sub in Stripe, has local ---

  it('marks local subscription as canceled when none found in Stripe', async () => {
    mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(DB_SUB); // exists locally

    const result = await syncUserSubscription(USER.id, 'bkd');

    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: DB_SUB.id },
      data: { status: 'canceled' },
    }));
    expect(result?.status).toBe('canceled');
  });

  it('returns null when no sub in Stripe and no local sub either', async () => {
    mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);

    const result = await syncUserSubscription(USER.id, 'bkd');
    expect(result).toBeNull();
  });

  it('does NOT update local as canceled if already canceled', async () => {
    mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
    (prisma.user_subscription.findUnique as any).mockResolvedValue({ ...DB_SUB, status: 'canceled' });

    await syncUserSubscription(USER.id, 'bkd');

    // Should not redundantly re-cancel
    expect(prisma.user_subscription.update).not.toHaveBeenCalled();
  });

  // --- Upsert on match ---

  it('upserts subscription using composite key (userId+siteSlug)', async () => {
    await syncUserSubscription(USER.id, 'bkd');

    expect(prisma.user_subscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: USER.id, siteSlug: 'bkd' } },
    }));
  });

  it('syncs correct price data from Stripe', async () => {
    await syncUserSubscription(USER.id, 'bkd');

    expect(prisma.user_subscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({
        priceAmount: 7000,
        priceCurrency: 'usd',
        status: 'active',
        cancelAtPeriodEnd: false,
      }),
    }));
  });

  // --- Error resilience ---

  it('returns null (does not throw) on Stripe error', async () => {
    mockStripe.subscriptions.list.mockRejectedValue(new Error('Stripe down'));
    const result = await syncUserSubscription(USER.id, 'bkd');
    expect(result).toBeNull();
  });

  it('returns null (does not throw) on DB error', async () => {
    (prisma.user.findUnique as any).mockRejectedValue(new Error('DB crash'));
    const result = await syncUserSubscription(USER.id, 'bkd');
    expect(result).toBeNull();
  });
});
