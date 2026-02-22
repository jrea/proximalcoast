import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
  subscriptionSchedules: {
    release: vi.fn(),
  },
  invoices: {
    list: vi.fn(),
    voidInvoice: vi.fn(),
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

// Real sub shape from bkd@bkd.com snapshot
const DB_SUB = FIXTURES.subscription;

describe('POST /api/cancel-subscription', () => {
  beforeEach(() => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: DB_SUB.userId } });

    // DB finds the real subscription
    (prisma.user_subscription.findUnique as any).mockResolvedValue(DB_SUB);
    (prisma.user_subscription.update as any).mockResolvedValue({ ...DB_SUB, cancelAtPeriodEnd: true });

    // Stripe: no schedule, update succeeds, no open invoices
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: DB_SUB.stripeSubscriptionId,
      schedule: null,
      cancel_at_period_end: false,
    });
    mockStripe.subscriptions.update.mockResolvedValue({
      id: DB_SUB.stripeSubscriptionId,
      cancel_at_period_end: true,
    });
    mockStripe.invoices.list.mockResolvedValue({ data: [] });
  });

  // --- Auth ---

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  // --- No subscription ---

  it('returns 400 when no subscription found for site', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when subscription has no stripeSubscriptionId', async () => {
    (prisma.user_subscription.findUnique as any).mockResolvedValue({ ...DB_SUB, stripeSubscriptionId: null });
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(400);
  });

  // --- Happy path ---

  it('sets cancel_at_period_end=true in Stripe', async () => {
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(res.status).toBe(200);
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
      DB_SUB.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
  });

  it('updates cancelAtPeriodEnd=true in local DB', async () => {
    await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: DB_SUB.stripeSubscriptionId },
      data: { cancelAtPeriodEnd: true },
    }));
  });

  it('returns success with status in response', async () => {
    const res = await POST(makeRequest({ siteSlug: 'bkd' }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/cancellation/i);
  });

  it('defaults siteSlug to "jerkstore" when not provided', async () => {
    await POST(makeRequest({}));
    expect(prisma.user_subscription.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: DB_SUB.userId, siteSlug: 'jerkstore' } },
    }));
  });

  // --- Schedule release ---

  it('releases subscription schedule before cancellation when one exists', async () => {
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: DB_SUB.stripeSubscriptionId,
      schedule: 'sub_sched_abc',
      cancel_at_period_end: false,
    });

    await POST(makeRequest({ siteSlug: 'bkd' }));

    expect(mockStripe.subscriptionSchedules.release).toHaveBeenCalledWith('sub_sched_abc');
    expect(mockStripe.subscriptions.update).toHaveBeenCalled(); // Still calls update after release
  });

  it('does NOT release schedule when none exists', async () => {
    await POST(makeRequest({ siteSlug: 'bkd' }));
    expect(mockStripe.subscriptionSchedules.release).not.toHaveBeenCalled();
  });

  // --- Open invoice voiding ---

  it('voids open invoices on cancellation', async () => {
    mockStripe.invoices.list.mockResolvedValue({
      data: [{ id: 'inv_open_123' }],
    });

    await POST(makeRequest({ siteSlug: 'bkd' }));

    expect(mockStripe.invoices.voidInvoice).toHaveBeenCalledWith('inv_open_123');
  });

  // --- resource_missing error (ghost subscription) ---

  it('returns 404 and marks DB as canceled when Stripe subscription is missing', async () => {
    const stripeError = { code: 'resource_missing', message: 'No such subscription' };
    mockStripe.subscriptions.retrieve.mockRejectedValue(stripeError);

    const res = await POST(makeRequest({ siteSlug: 'bkd' }));

    expect(res.status).toBe(404);
    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'canceled', cancelAtPeriodEnd: true }),
    }));
  });
});
